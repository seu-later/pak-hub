/* Pack-dump credits: map each dump file back to the Discord message that
 * posted it, recording the author's username and (public servers only) the
 * message URL. Two source modes:
 *
 * API walk (servers the bot can read, e.g. PDRG):
 *   node tools/dump-credit.mjs --manifest "C:\Users\seu\Desktop\pak-dump\PDRG-878318716801155233\_manifest.json" --guild 878318716801155233 --public --apply
 *
 * Export JSON (private servers the bot cannot join: re-export the channels
 * with DiscordChatExporter as JSON, then run locally, no token needed):
 *   node tools/dump-credit.mjs --export eu-mods.json nads-paklist.json --apply
 *
 * The CDN manifest maps attachment URLs to local paths; the channel id in
 * each URL scopes the history walk. Usernames are raw Discord usernames, not
 * display names. Message URLs are stored ONLY with --public (PDRG); private
 * rows keep the handle with no link, and /api/dump only emits sourceUrl for
 * allowlisted public guilds as a second layer of protection.
 *
 * Auth: DISCORD_BOT_TOKEN env (API mode). Never commit tokens; bot/.env is
 * gitignored. Default is a dry run printing matches; --apply executes the
 * SQL via wrangler. Channel walks resume from --progress.
 */

import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const WRANGLER = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
const SHELL = process.platform === "win32";
const REMOTE = ["--remote"];
const quote = (value) => (SHELL ? `"${value}"` : value);
const API = "https://discord.com/api/v10";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeFilename(value) {
  return String(value || "").replace(/\s*\(\d+\)(?=\.[^.]+$)/, "").toLowerCase();
}

async function discordFetch(token, url, params) {
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(url, { headers: { Authorization: `Bot ${token}` } });
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") || 1);
      await sleep(Math.min(30000, retryAfter * 1000 + 250));
      continue;
    }
    if (!response.ok) throw new Error(`Discord API ${response.status} for ${url}`);
    return response.json();
  }
}

/* Walk a channel's full history, newest first. Returns attachment records
 * oldest-first so the earliest post of a file wins. */
export async function walkChannelAttachments(token, channelId, onPage = async () => {}) {
  const seen = [];
  let before = null;
  for (;;) {
    const url = new URL(`${API}/channels/${channelId}/messages`);
    url.searchParams.set("limit", "100");
    if (before) url.searchParams.set("before", before);
    const page = await discordFetch(token, url);
    if (!Array.isArray(page) || !page.length) break;
    seen.push(...page);
    await onPage(page.length);
    if (page.length < 100) break;
    before = page[page.length - 1].id;
    await sleep(300);
  }
  return seen.reverse();
}

function recordFromMessage(guildId, channelId, message, makeUrl) {
  const username = message?.author?.username || "Unknown";
  const records = [];
  for (const attachment of message?.attachments || []) {
    const filename = attachment?.filename;
    if (!filename) continue;
    records.push({
      filename,
      key: normalizeFilename(filename),
      size: Number(attachment.size || 0),
      username,
      messageId: message.id,
      channelId,
      url: makeUrl ? `https://discord.com/channels/${guildId}/${channelId}/${message.id}` : null,
    });
  }
  return records;
}

/* Parse DiscordChatExporter JSON exports. Expected shape per file:
 * { channel: { id }, messages: [{ id, author: { username }, attachments: [{ filename, fileSizeBytes }] }] }
 * Author/attachment keys fall back across exporter versions. */
export function recordsFromExport(payload, guildId, makeUrl) {
  const channelId = String(payload?.channel?.id || payload?.guild?.id || "");
  const records = [];
  for (const message of payload?.messages || []) {
    const author = message?.author || {};
    const username = author.username || author.name || "Unknown";
    const attachments = message?.attachments || [];
    for (const attachment of attachments) {
      const filename = attachment?.filename || attachment?.fileName;
      if (!filename) continue;
      records.push({
        filename,
        key: normalizeFilename(filename),
        size: Number(attachment.fileSizeBytes || attachment.size || 0),
        username,
        messageId: String(message.id || ""),
        channelId,
        url: makeUrl && message.id && channelId
          ? `https://discord.com/channels/${guildId}/${channelId}/${message.id}`
          : null,
      });
    }
  }
  return { channelId, records };
}

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function toStatements(credits) {
  return [...credits.values()].map((credit) => (
    "UPDATE dump_files SET " +
    `posted_by = '${sqlEscape(credit.username)}', ` +
    `source_message_url = ${credit.url ? `'${sqlEscape(credit.url)}'` : "NULL"}, ` +
    `source_guild = '${sqlEscape(credit.guildId)}' ` +
    `WHERE filename = '${sqlEscape(credit.filename)}';`
  ));
}

async function main() {
  const args = process.argv.slice(2);
  const flagValue = (name, fallback) => {
    const index = args.indexOf(name);
    if (index === -1) return fallback;
    const next = args[index + 1];
    return next && !next.startsWith("--") ? next : true;
  };
  const manifestPath = flagValue("--manifest");
  const exportPaths = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--export") {
      while (args[index + 1] && !args[index + 1].startsWith("--")) exportPaths.push(args[++index]);
    }
  }
  const guildId = String(flagValue("--guild", "") || "");
  const isPublic = args.includes("--public");
  const sqlPath = flagValue("--sql", "pak-dump-credits.sql");
  const progressPath = flagValue("--progress", "pak-dump-credits-progress.txt");
  const apply = args.includes("--apply");
  const token = process.env.DISCORD_BOT_TOKEN || "";

  if (!manifestPath && !exportPaths.length) {
    console.error("Provide --manifest <cdn-manifest.json> and/or --export <chat-export.json> ...");
    process.exit(1);
  }

  /* filename key -> credit. Snowflakes are time-ordered: smallest message id
   * (oldest post) wins across channels and reposts. */
  const credits = new Map();
  const claim = (record) => {
    if (!record.messageId) return;
    const previous = credits.get(record.key);
    if (!previous) {
      credits.set(record.key, { ...record, guildId });
      return;
    }
    try {
      if (BigInt(record.messageId) < BigInt(previous.messageId)) credits.set(record.key, { ...record, guildId });
    } catch { /* non-snowflake ids: keep the first claim */ }
  };

  if (manifestPath) {
    if (!token) {
      console.error("API mode needs DISCORD_BOT_TOKEN in the environment.");
      process.exit(1);
    }
    if (!guildId) {
      console.error("API mode needs --guild <server id> to verify channels before walking.");
      process.exit(1);
    }
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    const channels = new Map();
    for (const url of Object.keys(manifest)) {
      const match = String(url).match(/attachments\/(\d+)\/\d+\//);
      if (match) {
        if (!channels.has(match[1])) channels.set(match[1], []);
        channels.get(match[1]).push(decodeURIComponent(String(url).split("/").pop().split("?")[0]));
      }
    }
    let done = new Set();
    try {
      done = new Set((await fs.readFile(progressPath, "utf8")).split(/\r?\n/).filter(Boolean));
    } catch { /* first run */ }
    console.log(`Walking ${channels.size} channels${done.size ? ` (${done.size} done)` : ""}.`);
    for (const [channelId, files] of channels) {
      if (done.has(channelId)) continue;
      const info = await discordFetch(token, `${API}/channels/${channelId}`);
      if (String(info?.guild_id || "") !== guildId) {
        throw new Error(`Channel ${channelId} is not in guild ${guildId}; refusing to walk.`);
      }
      const wanted = new Set(files.map(normalizeFilename));
      const messages = await walkChannelAttachments(token, channelId);
      for (const message of messages) {
        for (const record of recordFromMessage(guildId, channelId, message, isPublic)) {
          if (wanted.has(record.key)) claim(record);
        }
      }
      await fs.appendFile(progressPath, `${channelId}\n`);
      const hit = [...wanted].filter((key) => credits.has(key)).length;
      console.log(`channel ${channelId}: ${messages.length} messages, ${hit}/${wanted.size} files credited.`);
    }
  }

  for (const exportPath of exportPaths) {
    const payload = JSON.parse(await fs.readFile(exportPath, "utf8"));
    const { records } = recordsFromExport(payload, guildId, isPublic);
    for (const record of records) claim(record);
    console.log(`${exportPath}: ${records.length} attachment records.`);
  }

  const statements = toStatements(credits);
  await fs.writeFile(sqlPath, `${statements.join("\n")}\n`);
  const linked = [...credits.values()].filter((credit) => credit.url).length;
  console.log(`Credited ${credits.size} files (${linked} with message links). Wrote ${sqlPath}.`);

  if (apply) {
    await execFileAsync(WRANGLER, ["d1", "execute", "pak-hub", ...REMOTE, "--file", quote(sqlPath)],
      { maxBuffer: 64 * 1024 * 1024, shell: SHELL });
    console.log("Credit updates applied.");
  } else {
    console.log("Dry run: pass --apply to update D1.");
  }
}

if (String(process.argv[1] || "").endsWith("dump-credit.mjs")) await main();

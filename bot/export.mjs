import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable, Transform } from "node:stream";
import { ChannelType, Client, GatewayIntentBits } from "discord.js";

const OUTPUT_DIR = join(process.cwd(), "EU-pak-mods");
const token = required("DISCORD_BOT_TOKEN");
const guildId = required("DISCORD_GUILD_ID");
if (!/^\d{16,22}$/.test(guildId)) throw new Error("DISCORD_GUILD_ID must be a Discord ID.");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});
const seenMessages = new Set();
const usedPaths = new Set();
const manifest = {
  guildId,
  exportedAt: new Date().toISOString(),
  files: [],
  errors: [],
};

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Set ${name} before starting the export.`);
  return value;
}

function safeName(value, fallback = "untitled") {
  const cleaned = String(value || fallback)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/[. ]+$/g, "")
    .trim();
  return cleaned || fallback;
}

function channelLabel(channel) {
  const category = channel.parent?.name || "uncategorized";
  return join(safeName(category), `${safeName(channel.name)} [${channel.id}]`);
}

function threadLabel(thread, parent) {
  return join(channelLabel(parent), `${safeName(thread.name)} [${thread.id}]`);
}

function uniqueRelativePath(path) {
  const extension = path.includes(".") ? `.${path.split(".").pop()}` : "";
  const stem = extension ? path.slice(0, -extension.length) : path;
  let candidate = path;
  let index = 2;
  while (usedPaths.has(candidate.toLowerCase())) {
    candidate = `${stem} (${index})${extension}`;
    index += 1;
  }
  usedPaths.add(candidate.toLowerCase());
  return candidate;
}

function sourceUrl(message) {
  return `https://discord.com/channels/${guildId}/${message.channelId}/${message.id}`;
}

function packAttachments(message) {
  return [...(message.attachments?.values?.() || [])].filter((attachment) =>
    typeof attachment.name === "string" && /\.(?:pak|zip)$/i.test(attachment.name));
}

async function downloadAttachment(attachment, relativePath) {
  const url = new URL(attachment.url);
  if (url.protocol !== "https:" || !["cdn.discordapp.com", "media.discordapp.net"].includes(url.hostname)) {
    throw new Error(`Unexpected attachment host for ${attachment.name}.`);
  }
  const outputPath = join(OUTPUT_DIR, relativePath);
  await mkdir(join(outputPath, ".."), { recursive: true });
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`Discord returned ${response.status} for ${attachment.name}.`);

  const hash = createHash("sha256");
  const meter = new Transform({
    transform(chunk, encoding, callback) {
      hash.update(chunk);
      callback(null, chunk);
    },
  });
  await pipeline(Readable.fromWeb(response.body), meter, createWriteStream(outputPath, { flags: "wx" }));
  return { outputPath, sha256: hash.digest("hex") };
}

async function recordMessage(message, folder) {
  if (!message || seenMessages.has(message.id)) return;
  seenMessages.add(message.id);
  const attachments = packAttachments(message);
  for (const attachment of attachments) {
    const filename = safeName(attachment.name, "pak-file");
    const relativePath = uniqueRelativePath(join(folder, filename));
    try {
      const downloaded = await downloadAttachment(attachment, relativePath);
      manifest.files.push({
        filename: attachment.name,
        sizeBytes: attachment.size,
        sha256: downloaded.sha256,
        path: relative(downloaded.outputPath, OUTPUT_DIR),
        messageId: message.id,
        channelId: message.channelId,
        messageUrl: sourceUrl(message),
        postedBy: message.author?.globalName || message.author?.username || "Unknown",
        postedAt: message.createdAt?.toISOString?.() || null,
      });
      console.log(`Downloaded ${attachment.name} from ${sourceUrl(message)}`);
    } catch (error) {
      manifest.errors.push({
        filename: attachment.name,
        messageId: message.id,
        messageUrl: sourceUrl(message),
        error: error.message || String(error),
      });
      console.warn(`Skipped ${attachment.name}: ${error.message || error}`);
    }
  }
}

async function scanMessages(channel, folder) {
  let before;
  while (true) {
    const page = await channel.messages.fetch({ limit: 100, ...(before ? { before } : {}) });
    if (!page.size) break;
    for (const message of page.values()) await recordMessage(message, folder);
    if (page.size < 100) break;
    before = page.last()?.id;
    if (!before) break;
  }
}

async function fetchArchivedThreads(channel, type) {
  if (!channel.threads?.fetchArchived) return [];
  const threads = [];
  let before;
  while (true) {
    let page;
    try {
      page = await channel.threads.fetchArchived({ type, limit: 100, ...(before ? { before } : {}) });
    } catch (error) {
      console.warn(`Could not read ${type} archived threads in #${channel.name}: ${error.message || error}`);
      break;
    }
    threads.push(...page.threads.values());
    if (!page.hasMore || page.threads.size < 100) break;
    before = page.last()?.id;
    if (!before) break;
  }
  return threads;
}

async function scanThreads(channel) {
  if (!channel.threads) return;
  const threads = new Map();
  try {
    const active = await channel.threads.fetchActive();
    for (const thread of active.threads.values()) threads.set(thread.id, thread);
  } catch (error) {
    console.warn(`Could not read active threads in #${channel.name}: ${error.message || error}`);
  }
  for (const type of ["public", "private"]) {
    for (const thread of await fetchArchivedThreads(channel, type)) threads.set(thread.id, thread);
  }
  for (const thread of threads.values()) await scanMessages(thread, threadLabel(thread, channel));
}

function isScannable(channel) {
  return [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(channel.type);
}

async function run() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
  const guild = await client.guilds.fetch(guildId);
  const channels = [...(await guild.channels.fetch()).values()]
    .filter((channel) => channel && !channel.isThread?.() && isScannable(channel));
  console.log(`Scanning ${channels.length} channels in ${guild.name}.`);
  for (const channel of channels) {
    const folder = channelLabel(channel);
    console.log(`Scanning #${channel.name} (${channel.id}).`);
    try {
      if (channel.messages?.fetch) await scanMessages(channel, folder);
      await scanThreads(channel);
    } catch (error) {
      manifest.errors.push({ channelId: channel.id, channel: channel.name, error: error.message || String(error) });
      console.warn(`Skipped #${channel.name}: ${error.message || error}`);
    }
  }
  manifest.exportedAt = new Date().toISOString();
  await writeFile(join(OUTPUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`Export complete: ${manifest.files.length} files, ${manifest.errors.length} errors.`);
}

client.once("ready", async () => {
  try {
    await run();
  } finally {
    await client.destroy();
  }
});

await client.login(token);

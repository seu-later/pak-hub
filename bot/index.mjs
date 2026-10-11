import { createHash } from "node:crypto";
import { createWriteStream, createReadStream } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { request as httpsRequest } from "node:https";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { ChannelType, Client, Events, GatewayIntentBits } from "discord.js";
import { ignoreUnknownMessage } from "./discord-errors.mjs";
import { messagesSince } from "./history.mjs";
import { pakAttachments, parsePostMetadata, selectReleaseAsset, slugify } from "./metadata.mjs";

const MAX_FILE_SIZE = 2147483647;
const MAX_FILES_PER_MESSAGE = 10;
const BOT_DIR = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(BOT_DIR, "state.json");
const TEMP_DIR = join(tmpdir(), "pak-hub-discord-ingest");

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Set ${name} in bot/.env before starting the importer.`);
  return value;
}

function snowflake(name) {
  const value = required(name);
  if (!/^\d{16,22}$/.test(value)) throw new Error(`${name} must be a Discord ID.`);
  return value;
}

const token = required("DISCORD_BOT_TOKEN");
const guildId = snowflake("DISCORD_GUILD_ID");
const pakChannelId = snowflake("DISCORD_PAK_CHANNEL_ID");
const githubToken = required("GITHUB_TOKEN");
const importToken = required("PAK_HUB_IMPORT_TOKEN");
const importUrl = new URL(required("PAK_HUB_IMPORT_URL"));
const stateUrl = process.env.PAK_HUB_STATE_URL ? new URL(process.env.PAK_HUB_STATE_URL) : null;
const runOnce = process.env.PAK_HUB_RUN_ONCE === "1";
const replayThreadId = process.env.PAK_HUB_REPLAY_THREAD_ID?.trim() || null;
const releaseRepo = required("GITHUB_RELEASE_REPO");
const [releaseOwner, releaseName] = releaseRepo.split("/");

if (importUrl.protocol !== "https:" || importUrl.pathname !== "/api/import" || !/^\w[\w.-]*\/\w[\w.-]*$/.test(releaseRepo)) {
  throw new Error("PAK_HUB_IMPORT_URL must be an HTTPS /api/import URL and GITHUB_RELEASE_REPO must be owner/repository.");
}
if (stateUrl && (stateUrl.protocol !== "https:" || stateUrl.pathname !== "/api/import-state")) {
  throw new Error("PAK_HUB_STATE_URL must be an HTTPS /api/import-state URL.");
}
if (runOnce && !stateUrl) throw new Error("Set PAK_HUB_STATE_URL when PAK_HUB_RUN_ONCE=1 so scheduled runs can resume.");
if (replayThreadId && !/^\d{16,22}$/.test(replayThreadId)) throw new Error("PAK_HUB_REPLAY_THREAD_ID must be a Discord thread ID.");

const githubBase = `https://api.github.com/repos/${encodeURIComponent(releaseOwner)}/${encodeURIComponent(releaseName)}`;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const rootMessages = new Map();
let state = { channelCursor: null, threadCursors: {} };
let queue = Promise.resolve();
let halted = false;

if (stateUrl) {
  const response = await fetch(stateUrl, { headers: { Authorization: `Bearer ${importToken}` } });
  if (!response.ok) throw new Error(`Could not load import state (${response.status}).`);
  state = { ...state, ...(await response.json()).state };
} else {
  try {
    state = { ...state, ...JSON.parse(await readFile(STATE_PATH, "utf8")) };
  } catch (error) {
    if (error.code !== "ENOENT") throw new Error("bot/state.json is unreadable; fix or remove that local checkpoint before starting.");
  }
}
if (replayThreadId) delete state.threadCursors[replayThreadId];

await mkdir(TEMP_DIR, { recursive: true });

async function saveState() {
  if (stateUrl) {
    const response = await fetch(stateUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${importToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (!response.ok) throw new Error(`Could not save import state (${response.status}).`);
    return;
  }
  const tempPath = `${STATE_PATH}.tmp`;
  await writeFile(tempPath, JSON.stringify(state, null, 2));
  await rename(tempPath, STATE_PATH);
}

function updateCursor(message, thread) {
  const id = message.id;
  const target = thread ? state.threadCursors : state;
  const key = thread ? thread.id : "channelCursor";
  const current = target[key];
  if (!current || BigInt(id) > BigInt(current)) target[key] = id;
}

function isSourceMessage(message) {
  return message.guildId === guildId && !message.author?.bot && (
    message.channelId === pakChannelId ||
    (message.channel?.isThread?.() && message.channel.parentId === pakChannelId)
  );
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function githubJson(path, options = {}) {
  const { allow404, ...fetchOptions } = options;
  const response = await fetch(`${githubBase}${path}`, {
    ...fetchOptions,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubToken}`,
      "X-GitHub-Api-Version": "2026-03-10",
      "User-Agent": "PakHub-Discord-Ingest",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 404 && allow404) return null;
  if (!response.ok) throw new Error(`GitHub returned ${response.status}: ${payload.message || "request failed"}`);
  return payload;
}

async function githubReleaseFor(message) {
  const tag = `pakhub-discord-${message.id}`;
  const path = `/releases/tags/${encodeURIComponent(tag)}`;
  const existing = await githubJson(path, { allow404: true });
  if (existing) return { release: existing, tag };

  const release = await githubJson("/releases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tag_name: tag,
      name: `Pak Hub import ${message.id}`,
      body: `Imported from the Pak Hub source channel.\n\nSource post: ${message.url}`,
      draft: false,
      prerelease: false,
      generate_release_notes: false,
    }),
  });
  return { release, tag };
}

async function downloadAttachment(attachment) {
  const url = new URL(attachment.url);
  if (url.protocol !== "https:" || !["cdn.discordapp.com", "media.discordapp.net"].includes(url.hostname)) {
    throw new Error(`Discord returned an unexpected attachment host for ${attachment.name}.`);
  }
  if (!Number.isSafeInteger(attachment.size) || attachment.size < 1 || attachment.size > MAX_FILE_SIZE) {
    throw new Error(`${attachment.name} exceeds the supported GitHub release asset size.`);
  }

  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`Could not download ${attachment.name} from Discord (${response.status}).`);

  const path = join(TEMP_DIR, `${messageSafeId(attachment.id)}-${Date.now()}.download`);
  const hash = createHash("sha256");
  let size = 0;
  const meter = new Transform({
    transform(chunk, encoding, callback) {
      size += chunk.length;
      if (size > MAX_FILE_SIZE) return callback(new Error(`${attachment.name} exceeds the supported file size.`));
      hash.update(chunk);
      callback(null, chunk);
    },
  });

  try {
    await pipeline(response.body, meter, createWriteStream(path, { flags: "wx" }));
    if (size !== attachment.size) throw new Error(`${attachment.name} changed size while it was being downloaded.`);
    return { path, size, sha256: hash.digest("hex") };
  } catch (error) {
    await rm(path, { force: true });
    throw error;
  }
}

function messageSafeId(value) {
  return String(value || "file").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "file";
}

async function uploadAsset(release, filePath, uploadName, size) {
  const uploadTemplate = String(release.upload_url || "").replace(/\{\?.*$/, "");
  const url = new URL(uploadTemplate);
  if (url.protocol !== "https:" || url.hostname !== "uploads.github.com") throw new Error("GitHub returned an unexpected release upload URL.");
  url.searchParams.set("name", uploadName);

  return new Promise((resolve, reject) => {
    const request = httpsRequest(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`,
        "Content-Type": "application/octet-stream",
        "Content-Length": String(size),
        "User-Agent": "PakHub-Discord-Ingest",
        "X-GitHub-Api-Version": "2026-03-10",
      },
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        let payload = {};
        try { payload = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch {}
        if (response.statusCode !== 201) return reject(new Error(`GitHub asset upload returned ${response.statusCode}: ${payload.message || "upload failed"}`));
        resolve(payload);
      });
    });

    request.on("error", reject);
    createReadStream(filePath).on("error", reject).pipe(request);
  });
}

async function assetsFor(release) {
  return githubJson(`/releases/${release.id}/assets?per_page=100`);
}

async function releaseAssets(message, attachments, release) {
  const existingAssets = await assetsFor(release);
  const files = [];

  for (const [index, attachment] of attachments.entries()) {
    const downloaded = await downloadAttachment(attachment);
    try {
      const { uploadName, asset: existingAsset } = selectReleaseAsset(
        attachment.name, index, downloaded.sha256, existingAssets,
      );
      let asset = existingAsset;
      if (!asset) {
        asset = await uploadAsset(release, downloaded.path, uploadName, downloaded.size);
        existingAssets.push(asset);
      }
      files.push({
        filename: attachment.name,
        variant: attachment.name,
        size_bytes: downloaded.size,
        sha256: downloaded.sha256,
        github_asset_id: String(asset.id),
        github_tag: `pakhub-discord-${message.id}`,
        download_url: asset.browser_download_url,
      });
    } finally {
      await rm(downloaded.path, { force: true });
    }
  }

  return files;
}

async function importMetadata(payload) {
  const response = await fetch(importUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${importToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Pak Hub import returned ${response.status}: ${result.error || "request failed"}`);
}

async function rootFor(message, thread) {
  if (thread) {
    if (!rootMessages.has(thread.id)) rootMessages.set(thread.id, await thread.fetchStarterMessage());
    return rootMessages.get(thread.id);
  }
  if (message.channel?.isThread?.()) {
    const channel = message.channel;
    if (!rootMessages.has(channel.id)) rootMessages.set(channel.id, await channel.fetchStarterMessage());
    return rootMessages.get(channel.id);
  }
  return message;
}

async function threadForRoot(message) {
  if (!message.hasThread || !message.channel?.threads) return null;
  return message.thread || await message.channel.threads.fetch(message.id);
}

async function processMessage(message, thread = null) {
  const isThread = thread || message.channel?.isThread?.();
  const threadChannel = thread || (message.channel?.isThread?.() ? message.channel : await threadForRoot(message));
  if (!isSourceMessage(message)) return;

  const attachments = pakAttachments(message);
  if (!message.author?.bot && attachments.length) {
    if (attachments.length > MAX_FILES_PER_MESSAGE) throw new Error(`Message ${message.id} has more than ${MAX_FILES_PER_MESSAGE} pack files; split it into separate posts.`);

    const rootMessage = await rootFor(message, threadChannel);
    const metadata = parsePostMetadata(rootMessage, threadChannel?.name || "");
    const modSourceId = rootMessage.id;
    const { release, tag } = await githubReleaseFor(message);
    const files = await releaseAssets(message, attachments, release);
    /* Raw Discord usernames, not display names, so credits stay stable. */
    const discordName = (author) => author?.author?.username || author?.member?.displayName || author?.author?.globalName || "Unknown";
    const payload = {
      slug: slugify(metadata.name, modSourceId),
      mod_source_id: modSourceId,
      root_message_id: rootMessage.id,
      root_uploader: discordName(rootMessage),
      root_posted_at: rootMessage.createdAt.toISOString(),
      root_message_url: rootMessage.url,
      root_post_content: rootMessage.content || "",
      name: metadata.name,
      summary: metadata.summary,
      uploader: discordName(message),
      post_content: message.content || "",
      published_at: message.createdAt.toISOString(),
      source_channel_id: pakChannelId,
      source_message_id: message.id,
      source_message_url: message.url,
      source_thread_id: threadChannel?.id || null,
      source_thread_url: threadChannel ? `https://discord.com/channels/${guildId}/${threadChannel.id}` : null,
      files,
      github_tag: tag,
    };
    await importMetadata(payload);
    console.log(`Imported ${metadata.name} from Discord message ${message.id}.`);
  }

  updateCursor(message, isThread ? threadChannel : null);
  await saveState();
}

function reportUnknownMessage(error, label) {
  console.warn(`Skipping ${label}: ${error.message || "Unknown Message"}.`);
}

async function processMessageSafely(message, thread = null) {
  return ignoreUnknownMessage(
    `Discord message ${message.id}${thread ? ` in thread ${thread.id}` : ` in channel ${message.channelId}`}`,
    () => processMessage(message, thread),
    async (error, label) => {
      reportUnknownMessage(error, label);
      const cursorThread = thread || (message.channel?.isThread?.() ? message.channel : null);
      updateCursor(message, cursorThread);
      await saveState();
    },
  );
}

function enqueue(task) {
  if (halted) return Promise.resolve();
  const result = queue.then(() => halted ? undefined : task());
  queue = result.catch((error) => {
    halted = true;
    process.exitCode = 1;
    console.error(`Importer paused safely: ${error.message}`);
    client.destroy();
  });
  return queue;
}

async function scanMessages(channel, thread = null) {
  const cursor = thread ? state.threadCursors[thread.id] : state.channelCursor;
  for (const message of await messagesSince(channel, cursor, () => delay(250))) {
    if (halted) return;
    await processMessageSafely(message, thread);
  }
}

async function archivedThreads(channel) {
  let before;
  const threads = new Map();
  while (!halted) {
    const page = await channel.threads.fetchArchived({ type: "public", limit: 100, ...(before ? { before } : {}) });
    for (const thread of page.threads.values()) threads.set(thread.id, thread);
    if (!page.hasMore || !page.threads.size) break;
    before = [...page.threads.values()].reduce((oldest, thread) =>
      !oldest || BigInt(thread.id) < BigInt(oldest) ? thread.id : oldest, null);
    await delay(250);
  }
  return threads;
}

async function backfill() {
  const guild = await client.guilds.fetch(guildId);
  const channel = await guild.channels.fetch(pakChannelId);
  if (!channel || channel.type !== ChannelType.GuildText) throw new Error("DISCORD_PAK_CHANNEL_ID must point to a normal text channel the bot can read.");

  console.log("Backfilling the pak channel and its public threads. This importer only reads Discord.");
  await scanMessages(channel);
  const active = await channel.threads.fetchActive();
  const threads = new Map(active.threads.map((thread) => [thread.id, thread]));
  for (const [id, thread] of (await archivedThreads(channel)).entries()) threads.set(id, thread);
  for (const thread of threads.values()) {
    if (halted) return;
    rootMessages.delete(thread.id);
    const root = await ignoreUnknownMessage(
      `starter message for thread ${thread.id}`,
      () => thread.fetchStarterMessage(),
      reportUnknownMessage,
    );
    if (!root) continue;
    rootMessages.set(thread.id, root);
    if (!state.threadCursors[thread.id]) await processMessageSafely(root, thread);
    await scanMessages(thread, thread);
  }
  if (runOnce) {
    console.log("Backfill complete. Scheduled importer is exiting.");
    await client.destroy();
  } else {
    console.log(`Backfill complete. Watching #${channel.name} for pak attachments.`);
  }
}

if (!runOnce) {
  client.on(Events.MessageCreate, (message) => {
    if (isSourceMessage(message)) void enqueue(() => processMessageSafely(message));
  });
}

client.once(Events.ClientReady, () => {
  void enqueue(backfill);
});

await client.login(token);

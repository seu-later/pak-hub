import { equalSecret, json, unavailable } from "../_lib/http.js";

const MAX_BODY_BYTES = 64000;
const MAX_FILE_SIZE = 2147483647;

function text(value, maxLength, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, maxLength);
}

function validSnowflake(value) {
  return typeof value === "string" && /^\d{16,22}$/.test(value);
}

function validDiscordUrl(value, allowThreadUrl = false) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    return url.protocol === "https:" && url.hostname === "discord.com" &&
      !url.username && !url.password && !url.search && !url.hash &&
      segments[0] === "channels" && segments.slice(1).every(validSnowflake) &&
      (allowThreadUrl ? segments.length === 3 : segments.length === 4);
  } catch {
    return false;
  }
}

function slugify(name, rootId) {
  const base = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "pak-mod";
  return `${base}-${BigInt(rootId).toString(36)}`;
}

function validGithubUrl(value, repository) {
  if (typeof value !== "string" || !repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) return false;
  try {
    const url = new URL(value);
    const [owner, repo] = repository.split("/");
    const prefix = `/${owner}/${repo}/releases/download/`;
    const remainder = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : "";
    const filename = remainder.slice(remainder.lastIndexOf("/") + 1);
    return url.protocol === "https:" && url.hostname === "github.com" && !url.port &&
      !url.username && !url.password && !url.search && !url.hash &&
      remainder.includes("/") && filename.toLowerCase().endsWith(".pak");
  } catch {
    return false;
  }
}

async function readPayload(request) {
  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (declaredLength > MAX_BODY_BYTES) return null;
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_BODY_BYTES) return null;
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return undefined;
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return unavailable();
  if (!env.PAK_HUB_IMPORT_TOKEN) return json({ error: "The import endpoint is not configured." }, 503);

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!equalSecret(token, env.PAK_HUB_IMPORT_TOKEN)) return json({ error: "Unauthorized." }, 401);

  const payload = await readPayload(request);
  if (payload === null) return json({ error: "Import body is larger than 64 KB." }, 413);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return json({ error: "Send a JSON import object." }, 400);

  const name = text(payload.name, 100);
  const sourceChannelId = text(payload.source_channel_id, 22);
  const sourceMessageId = text(payload.source_message_id, 22);
  const modSourceId = text(payload.mod_source_id, 22);
  const rootMessageId = text(payload.root_message_id, 22) || modSourceId;
  const sourceMessageUrl = text(payload.source_message_url, 300);
  const rootMessageUrl = text(payload.root_message_url, 300) || sourceMessageUrl;
  const sourceThreadId = text(payload.source_thread_id, 22) || null;
  const sourceThreadUrl = payload.source_thread_url ? text(payload.source_thread_url, 300) : null;
  const summary = text(payload.summary, 500);
  const uploader = text(payload.uploader, 80, "Unknown") || "Unknown";
  const rootUploader = text(payload.root_uploader, 80, uploader) || uploader;
  const postContent = text(payload.post_content, 1500);
  const rootPostContent = text(payload.root_post_content, 1500);
  const publishedAtInput = text(payload.published_at, 40);
  const publishedAt = publishedAtInput && Number.isFinite(Date.parse(publishedAtInput))
    ? new Date(publishedAtInput).toISOString()
    : new Date().toISOString();
  const rootPostedAtInput = text(payload.root_posted_at, 40);
  const rootPostedAt = rootPostedAtInput && Number.isFinite(Date.parse(rootPostedAtInput))
    ? new Date(rootPostedAtInput).toISOString()
    : publishedAt;
  const files = Array.isArray(payload.files) ? payload.files : [];

  if (!name || !validSnowflake(sourceChannelId) || !validSnowflake(sourceMessageId) ||
      !validSnowflake(modSourceId) || !validSnowflake(rootMessageId) || !validDiscordUrl(sourceMessageUrl) ||
      !validDiscordUrl(rootMessageUrl) ||
      (sourceThreadId && !validSnowflake(sourceThreadId)) ||
      (sourceThreadUrl && !validDiscordUrl(sourceThreadUrl, true))) {
    return json({ error: "Required mod or Discord source fields are missing or invalid." }, 400);
  }
  if (!files.length || files.length > 10) return json({ error: "Provide between 1 and 10 pak files for this post." }, 400);

  const normalizedFiles = [];
  for (const file of files) {
    const filename = text(file?.filename, 180);
    const variant = text(file?.variant, 100, "Default build") || "Default build";
    const size = Number(file?.size_bytes);
    const sha256 = text(file?.sha256, 64).toLowerCase();
    const assetId = text(String(file?.github_asset_id ?? ""), 32);
    const tag = text(file?.github_tag, 100);
    const downloadUrl = text(file?.download_url, 500);

    if (!filename || filename.includes("/") || !filename.toLowerCase().endsWith(".pak") ||
        !Number.isSafeInteger(size) || size < 1 || size > MAX_FILE_SIZE ||
        !/^[a-f0-9]{64}$/.test(sha256) || !assetId || !tag ||
        !validGithubUrl(downloadUrl, env.GITHUB_RELEASE_REPO)) {
      return json({ error: `Invalid pak file metadata: ${filename || "unnamed file"}.` }, 400);
    }
    normalizedFiles.push({ filename, variant, size, sha256, assetId, tag, downloadUrl });
  }

  const slugInput = text(payload.slug, 80).toLowerCase();
  const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugInput)
    ? slugInput
    : slugify(name, modSourceId);

  try {
    await env.DB.prepare(`
      INSERT INTO mods (
        slug, name, summary, creator_name, uploader_name, root_message_id, root_posted_at,
        root_message_url, root_post_content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        name = excluded.name,
        summary = excluded.summary,
        creator_name = excluded.creator_name,
        uploader_name = excluded.uploader_name,
        root_message_id = excluded.root_message_id,
        root_posted_at = excluded.root_posted_at,
        root_message_url = excluded.root_message_url,
        root_post_content = excluded.root_post_content,
        updated_at = CURRENT_TIMESTAMP
    `).bind(slug, name, summary, rootUploader, rootUploader, rootMessageId, rootPostedAt, rootMessageUrl, rootPostContent).run();

    const mod = await env.DB.prepare("SELECT id FROM mods WHERE slug = ?").bind(slug).first();
    if (!mod) throw new Error("Mod row was not available after import.");
    const previousRelease = await env.DB.prepare("SELECT mod_id FROM releases WHERE source_message_id = ?")
      .bind(sourceMessageId).first();

    const releaseValues = [
      mod.id, "Unversioned", "unknown", postContent, publishedAt, 0,
      sourceChannelId, sourceMessageId, sourceMessageUrl, sourceThreadId, sourceThreadUrl,
      uploader, postContent,
    ];
    await env.DB.prepare(`
      INSERT INTO releases (
        mod_id, version_label, channel, changelog, published_at, is_recommended,
        source_channel_id, source_message_id, source_message_url, source_thread_id, source_thread_url,
        posted_by, post_content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_message_id) DO UPDATE SET
        mod_id = excluded.mod_id,
        version_label = excluded.version_label,
        channel = excluded.channel,
        changelog = excluded.changelog,
        published_at = excluded.published_at,
        is_recommended = excluded.is_recommended,
        source_channel_id = excluded.source_channel_id,
        source_message_url = excluded.source_message_url,
        source_thread_id = excluded.source_thread_id,
        source_thread_url = excluded.source_thread_url,
        posted_by = excluded.posted_by,
        post_content = excluded.post_content
    `).bind(...releaseValues).run();

    const release = await env.DB.prepare("SELECT id FROM releases WHERE source_message_id = ?").bind(sourceMessageId).first();
    if (!release) throw new Error("Release row was not available after import.");

    const statements = [env.DB.prepare("DELETE FROM pak_files WHERE release_id = ?").bind(release.id)];
    for (const file of normalizedFiles) {
      statements.push(env.DB.prepare(`
        INSERT INTO pak_files (
          release_id, original_filename, variant_label, size_bytes, sha256,
          github_asset_id, github_tag, download_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(release.id, file.filename, file.variant, file.size, file.sha256, file.assetId, file.tag, file.downloadUrl));
    }
    await env.DB.batch(statements);
    if (previousRelease && previousRelease.mod_id !== mod.id) {
      await env.DB.prepare("DELETE FROM mods WHERE id = ? AND NOT EXISTS (SELECT 1 FROM releases WHERE mod_id = ?)")
        .bind(previousRelease.mod_id, previousRelease.mod_id).run();
    }

    return json({ ok: true, slug, post_id: release.id, file_count: normalizedFiles.length }, 201, { "cache-control": "no-store" });
  } catch (error) {
    console.error("Pak Hub import failed", error);
    return json({ error: "The pak post could not be saved. Retry the same import after checking the GitHub asset metadata." }, 500);
  }
}

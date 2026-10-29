import { groupDumpFiles } from "./dump-group.js";

const PUBLIC_DUMP_GUILD = "878318716801155233";
const EXCLUDED_FILENAMES = new Set(["gaswarning.pak"]);

function sqlEscape(value) {
  return String(value ?? "").replace(/'/g, "''");
}

function humanize(value) {
  return value
    .replace(/\.(?:pak|zip)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function generatedDescription(name) {
  const lowerName = name.toLowerCase();
  if (/^no/.test(lowerName) || /^no_/.test(lowerName)) {
    return `Removes or disables ${humanize(name.replace(/^No[_-]?/i, "")).toLowerCase()}.`;
  }
  if (/^remove/.test(lowerName)) {
    return `Removes ${humanize(name.replace(/^Remove[_-]?/i, "")).toLowerCase()}.`;
  }
  if (/^less/.test(lowerName)) {
    return `Reduces ${humanize(name.replace(/^Less/i, "")).toLowerCase()}.`;
  }
  if (/^more/.test(lowerName)) {
    return `Adds or increases ${humanize(name.replace(/^More/i, "")).toLowerCase()}.`;
  }
  if (/crosshair|hud|icon|indicator/i.test(name)) return `Changes HUD or UI assets for ${humanize(name)}.`;
  if (/sound|audio/i.test(name)) return `Changes audio cues for ${humanize(name)}.`;
  if (/biome|cave|room|terrain/i.test(name)) return `Changes cave, terrain, or biome content for ${humanize(name)}.`;
  if (/enemy|spider|mactera|praet|stinger|glyphid|dread|caretaker/i.test(name)) return `Changes enemy definitions or variants for ${humanize(name)}.`;
  if (/weapon|gun|pistol|rifle|cannon|drill|grenade|overclock|upgrade|recoil|spread/i.test(name)) return `Changes weapon, upgrade, or overclock data for ${humanize(name)}.`;
  return `Adds custom assets for ${humanize(name)}.`;
}

function descriptionFor(name, summary) {
  const cleaned = String(summary || "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/<@!?(\d+)>|@everyone|@here/g, "")
    .replace(/[\u0000-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?]+$/, "");
  if (cleaned.length >= 8 && cleaned.length <= 220 && !/^(?:none|n\/a|unknown|todo)$/i.test(cleaned)) {
    return `${cleaned}.`;
  }
  return generatedDescription(name);
}

function sourceFields(sourceMessageUrl) {
  if (typeof sourceMessageUrl !== "string" || !sourceMessageUrl) {
    return { guild: null, publicUrl: null };
  }
  try {
    const url = new URL(sourceMessageUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const guild = segments[1] || null;
    return { guild, publicUrl: guild === PUBLIC_DUMP_GUILD ? sourceMessageUrl : null };
  } catch {
    return { guild: null, publicUrl: null };
  }
}

function extension(filename) {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

function fileRecord(file, grouped) {
  const stem = file.filename.replace(/\.[^.]+$/, "");
  const info = grouped.get(stem) || { base: stem, version: "", prerelease: 0 };
  const sha256 = String(file.sha256).toLowerCase();
  return {
    base: info.base,
    baseKey: info.base.toLowerCase(),
    version: info.version,
    prerelease: info.prerelease,
    filename: file.filename,
    size: file.size,
    sha256,
    r2Key: `${sha256}${extension(file.filename)}`,
  };
}

async function existingBaseNames(env) {
  try {
    const result = await env.DB.prepare("SELECT DISTINCT base_name FROM dump_files").all();
    return (result.results || []).map((row) => row.base_name).filter(Boolean);
  } catch (error) {
    console.warn("Could not read existing dump names; using new Pak List names only.", error);
    return [];
  }
}

async function uploadToDump(env, file, record) {
  const response = await fetch(file.downloadUrl, {
    headers: { Accept: "application/octet-stream", "User-Agent": "PakHub-PakList-Sync" },
  });
  if (!response.ok || !response.body) throw new Error(`${file.filename} download failed (${response.status}).`);
  const contentLength = Number(response.headers.get("content-length") || "0");
  if (contentLength && contentLength !== record.size) {
    throw new Error(`${file.filename} size changed during download.`);
  }
  await env.DUMP.put(record.r2Key, response.body, {
    httpMetadata: { contentType: file.filename.toLowerCase().endsWith(".zip") ? "application/zip" : "application/octet-stream" },
    customMetadata: { filename: record.filename, sha256: record.sha256 },
  });
}

function insertFileSql(record, uploader, source) {
  return `INSERT INTO dump_files (base_key, base_name, version, prerelease, filename, size_bytes, sha256, r2_key, posted_by, source_message_url, source_guild)
SELECT '${sqlEscape(record.baseKey)}', '${sqlEscape(record.base)}', '${sqlEscape(record.version)}', ${record.prerelease}, '${sqlEscape(record.filename)}', ${record.size}, '${sqlEscape(record.sha256)}', '${sqlEscape(record.r2Key)}', '${sqlEscape(uploader || "Unknown")}', ${source.publicUrl ? `'${sqlEscape(source.publicUrl)}'` : "NULL"}, ${source.guild ? `'${sqlEscape(source.guild)}'` : "NULL"}
WHERE NOT EXISTS (SELECT 1 FROM dump_files WHERE sha256 = '${sqlEscape(record.sha256)}');`;
}

function insertDescriptionSql(record, summary) {
  return `INSERT INTO dump_descriptions (base_key, description) VALUES ('${sqlEscape(record.baseKey)}', '${sqlEscape(descriptionFor(record.base, summary))}') ON CONFLICT(base_key) DO NOTHING;`;
}

export async function syncPakListFiles({ env, files, uploader, sourceMessageUrl, summary }) {
  if (!env.DUMP || !files?.length) return { imported: 0, skipped: 0 };

  const candidates = files.filter((file) => !EXCLUDED_FILENAMES.has(file.filename.toLowerCase()));
  const existingNames = await existingBaseNames(env);
  const grouped = groupDumpFiles([
    ...existingNames,
    ...candidates.map((file) => file.filename.replace(/\.[^.]+$/, "")),
  ]);
  const source = sourceFields(sourceMessageUrl);
  const records = candidates.map((file) => ({ file, record: fileRecord(file, grouped) }));
  let imported = 0;
  let skipped = 0;

  for (const { file, record } of records) {
    const existing = await env.DB.prepare("SELECT id FROM dump_files WHERE sha256 = ? LIMIT 1").bind(record.sha256).first();
    if (existing) {
      skipped += 1;
      continue;
    }
    await uploadToDump(env, file, record);
    await env.DB.batch([
      env.DB.prepare(insertFileSql(record, uploader, source)),
      env.DB.prepare(insertDescriptionSql(record, summary)),
    ]);
    imported += 1;
  }

  return { imported, skipped };
}

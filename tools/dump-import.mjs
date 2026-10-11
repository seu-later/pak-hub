/* Pack-dump importer: scan a loose folder of .pak/.zip files, derive a base
 * mod name plus version from each filename, dedupe copies, upload the files
 * to the R2 dump bucket, and emit the D1 inserts for /api/dump.
 *
 * Usage (run from the repo root):
 *   node tools/dump-import.mjs --dir "C:\Users\seu\Desktop\pak-dump"
 *   node tools/dump-import.mjs --dir <path> --upload --apply
 *
 * Default is a dry run: scans, parses, dedupes, writes the manifest and SQL,
 * uploads nothing. --upload runs `wrangler r2 object put` per file (needs
 * `wrangler login` first). --apply runs `wrangler d1 execute` with the SQL.
 */

import { createHash } from "node:crypto";
import { createReadStream, promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const SERIES_MIN_SIBLINGS = 3;
/* Node cannot spawn .cmd shims without a shell on Windows. Arguments here
 * are generated (hex keys) or point at the user's own files, so shell use
 * is safe. */
const WRANGLER = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
const SHELL = process.platform === "win32";

function trimSeparators(value) {
  return value.replace(/^[-_. ]+|[-_. ]+$/g, "");
}

/* Match a version token at the end of the stem. `cut` is the index where the
 * base name ends. Explicit markers (prerelease tags, v-prefix, dates,
 * dotted numbers) are trusted outright; `bare` trailing numbers need sibling
 * evidence before groupDumpFiles accepts them. */
function parseVersionToken(stem) {
  let match = stem.match(/[-_ ]?((?:beta|alpha|rc)[-_. ]?\d*[a-z]?)$/i);
  if (match) {
    const version = match[1].replace(/[-_. ]+/g, "-").replace(/^([a-z]+)(\d+)$/i, "$1-$2");
    return { version, prerelease: 1, cut: match.index };
  }

  match = stem.match(/[-_ ]+[vV](\d[\d.]*)$/) || stem.match(/([A-Za-z])[vV](\d[\d.]*)$/);
  if (match) {
    const version = match[match.length - 1];
    const cut = match.index + (match.length === 3 ? 1 : 0);
    return { version, prerelease: 0, cut };
  }

  match = stem.match(/[-_ ]v?(\d+(?:[._]\d+)+)$/i);
  if (match) return { version: match[1], prerelease: 0, cut: match.index };

  match = stem.match(/(\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{2})$/);
  if (match) return { version: match[1], prerelease: 0, cut: match.index };

  match = stem.match(/[-_ ](\d+(?:\.\d+)*)$/) || stem.match(/([A-Za-z_])(\d+(?:\.\d+)*)$/);
  if (match) {
    const version = match[match.length - 1];
    const cut = match.index + (match[0].startsWith(version) ? 0 : 1);
    return { version, prerelease: 0, cut, bare: true };
  }

  return null;
}

/* `_P` is a pak marker, not a version: it is only peeled to look for an
 * explicit version token in front of it (BetterRevolverV2.5_P). A trailing
 * `_patch` is dropped the same way (clutterbegone_23.01.30_patch). */
function parseExplicit(name) {
  const stem = name.replace(/\s*\(\d+\)$/, "").replace(/_patch$/i, "");
  if (/_P$/i.test(stem)) {
    const inner = trimSeparators(stem.replace(/_P$/i, ""));
    const probe = parseVersionToken(inner);
    if (probe && !probe.bare) {
      return { base: trimSeparators(inner.slice(0, probe.cut)), version: probe.version, prerelease: probe.prerelease };
    }
  }
  const found = parseVersionToken(stem);
  if (found && !found.bare) {
    return { base: trimSeparators(stem.slice(0, found.cut)), version: found.version, prerelease: found.prerelease };
  }
  if (found) {
    return { base: trimSeparators(stem.slice(0, found.cut)), version: found.version, prerelease: 0, bare: true };
  }
  return { base: stem, version: "", prerelease: 0 };
}

/* Resolve bare trailing numbers ("balance171", "AlwaysSprint_P_2") into
 * versions only with sibling evidence: another file already maps to the same
 * base, or 3+ files share an alpha prefix with distinct numeric suffixes.
 * Anything else (Cull4, A1toB7) stays a whole name. */
export function groupDumpFiles(names) {
  const parsed = new Map();
  for (const name of names) {
    const explicit = parseExplicit(name);
    if (!explicit.bare) {
      parsed.set(name, { base: explicit.base, version: explicit.version, prerelease: explicit.prerelease });
    } else {
      parsed.set(name, { base: name, version: "", prerelease: 0, candidate: explicit });
    }
  }

  const baseKeys = new Set();
  for (const { base } of parsed.values()) baseKeys.add(base.toLowerCase());

  const series = new Map();
  for (const entry of parsed.values()) {
    if (!entry.candidate?.version) continue;
    const prefix = entry.candidate.base.toLowerCase();
    if (!series.has(prefix)) series.set(prefix, 0);
    series.set(prefix, series.get(prefix) + 1);
  }

  for (const [name, entry] of parsed) {
    if (!entry.candidate?.version) continue;
    const base = entry.candidate.base;
    const siblings = series.get(base.toLowerCase()) || 0;
    if (baseKeys.has(base.toLowerCase()) || siblings >= SERIES_MIN_SIBLINGS) {
      parsed.set(name, { base, version: entry.candidate.version, prerelease: 0 });
      baseKeys.add(base.toLowerCase());
    }
  }

  return parsed;
}

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

async function sha256File(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest("hex");
}

async function collectFiles(root) {
  const found = [];
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\.(pak|zip)$/i.test(entry.name)) found.push(full);
    }
  }
  await walk(root);
  return found.sort();
}

async function main() {
  const args = process.argv.slice(2);
  const flagValue = (name, fallback) => {
    const index = args.indexOf(name);
    if (index === -1) return fallback;
    const next = args[index + 1];
    return next && !next.startsWith("--") ? next : true;
  };
  const dir = flagValue("--dir");
  if (!dir) {
    console.error('Missing --dir. Example: node tools/dump-import.mjs --dir "C:\\Users\\seu\\Desktop\\pak-dump"');
    process.exit(1);
  }
  const bucket = flagValue("--bucket", "pak-dump");
  const manifestPath = flagValue("--manifest", "pak-dump-manifest.json");
  const sqlPath = flagValue("--sql", "pak-dump-import.sql");
  const upload = args.includes("--upload");
  const apply = args.includes("--apply");

  const paths = await collectFiles(dir);
  console.log(`Scanned ${paths.length} files.`);

  const byName = new Map();
  for (const full of paths) {
    const filename = path.basename(full).replace(/\s*\(\d+\)(?=\.[^.]+$)/, "");
    const stat = await fs.stat(full);
    const key = filename.toLowerCase();
    if (!byName.has(key)) byName.set(key, { filename, size: 0, paths: [] });
    const entry = byName.get(key);
    entry.paths.push(full);
    if (stat.size >= entry.size) {
      entry.filename = filename;
      entry.size = stat.size;
      entry.representative = full;
    }
  }
  console.log(`Deduped to ${byName.size} unique filenames (${paths.length - byName.size} copies dropped).`);

  const entries = [...byName.values()];
  const parsed = groupDumpFiles(entries.map((entry) => entry.filename.replace(/\.[^.]+$/, "")));
  const records = [];
  for (const entry of entries) {
    const stem = entry.filename.replace(/\.[^.]+$/, "");
    const ext = entry.filename.slice(entry.filename.lastIndexOf(".")).toLowerCase();
    const info = parsed.get(stem) || { base: stem, version: "", prerelease: 0 };
    const sha = await sha256File(entry.representative);
    records.push({
      base: info.base,
      baseKey: info.base.toLowerCase(),
      version: info.version,
      prerelease: info.prerelease,
      filename: entry.filename,
      size: entry.size,
      sha,
      r2Key: `${sha}${ext}`,
      representative: entry.representative,
      sources: entry.paths,
    });
  }

  const groups = new Map();
  for (const record of records) {
    if (!groups.has(record.baseKey)) groups.set(record.baseKey, []);
    groups.get(record.baseKey).push(record);
  }
  console.log(`Grouped into ${groups.size} base names.`);

  await fs.writeFile(manifestPath, `${JSON.stringify({ bucket, records }, null, 2)}\n`);
  const statements = records.map((record) => (
    "INSERT OR IGNORE INTO dump_files (base_key, base_name, version, prerelease, filename, size_bytes, sha256, r2_key) VALUES (" +
    `'${sqlEscape(record.baseKey)}', '${sqlEscape(record.base)}', '${sqlEscape(record.version)}', ${record.prerelease}, ` +
    `'${sqlEscape(record.filename)}', ${record.size}, '${record.sha}', '${record.r2Key}');`
  ));
  await fs.writeFile(sqlPath, `${statements.join("\n")}\n`);
  console.log(`Wrote ${manifestPath} and ${sqlPath} (${records.length} rows).`);

  if (upload) {
    for (const [index, record] of records.entries()) {
      process.stdout.write(`[${index + 1}/${records.length}] ${record.r2Key} ... `);
      await execFileAsync(WRANGLER, ["r2", "object", "put", `${bucket}/${record.r2Key}`, "--file", record.representative], { shell: SHELL });
      console.log("ok");
    }
  } else {
    console.log("Dry run: pass --upload to push files to R2.");
  }

  if (apply) {
    await execFileAsync(WRANGLER, ["d1", "execute", "pak-hub", "--file", sqlPath], { maxBuffer: 64 * 1024 * 1024, shell: SHELL });
    console.log("D1 inserts applied.");
  } else {
    console.log("Dry run: pass --apply to insert rows into D1.");
  }
}

if (String(process.argv[1] || "").endsWith("dump-import.mjs")) await main();

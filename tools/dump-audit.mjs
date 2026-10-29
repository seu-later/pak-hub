/* Freeze public catalog and exact-hash source context. All working evidence is
 * private and resumable under .dump-audit; no descriptions are auto-approved.
 * node tools/dump-audit.mjs <D1-export.sql> [local-package-directory ...] */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import snapshot from "../functions/_data/catalog-snapshot.js";

const work = path.resolve(".dump-audit");
await fs.mkdir(work, { recursive: true });
const write = (name, value) => fs.writeFile(path.join(work, name), JSON.stringify(value, null, 2));
try {
  await fs.access(path.join(work, "ledger.json"));
  throw new Error("Audit ledger already exists. Resume downloads/extraction; do not overwrite accumulated reviews.");
} catch (error) { if (error.code !== "ENOENT") throw error; }
let catalog;
try { catalog = JSON.parse(await fs.readFile(path.join(work, "catalog.json"), "utf8")); }
catch (error) {
  if (error.code !== "ENOENT") throw error;
  const groups = [];
  let expected;
  let source;
  for (let page = 1; ; page += 1) {
    const response = await fetch(`https://pak-hub.pages.dev/api/dump?sort=name&page=${page}`);
    if (!response.ok) throw new Error(`Catalog page ${page}: ${response.status}`);
    const data = await response.json();
    expected ??= data.total;
    source ??= response.headers.get("x-pakhub-catalog-source") || "database";
    if (expected !== data.total) throw new Error("Catalog changed during inventory; retry the capture.");
    if (!data.groups.length) break;
    groups.push(...data.groups);
  }
  if (groups.length !== expected || new Set(groups.map((g) => g.name)).size !== expected) throw new Error("Incomplete catalog capture.");
  catalog = { capturedAt: new Date().toISOString(), source, groups };
  await write("catalog.json", catalog);
}

const database = new DatabaseSync(":memory:");
if (!process.argv[2]) throw new Error("Provide the D1 SQL export for exact-hash post matching.");
database.exec(await fs.readFile(process.argv[2], "utf8"));
const contexts = database.prepare(`SELECT f.sha256, f.original_filename, m.slug, r.source_message_id
  FROM pak_files f JOIN releases r ON r.id=f.release_id JOIN mods m ON m.id=r.mod_id`).all();
database.close();
const byHash = new Map();
const groups = catalog.groups.map((group) => ({
  name: group.name, originalDescription: group.description, status: "unreviewed", candidateDescription: "",
  files: group.files.map((file) => {
    const key = file.downloadUrl.split("/").at(-1);
    const hash = key.split(".")[0];
    if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error(`Invalid package identity: ${key}`);
    if (!byHash.has(hash)) byHash.set(hash, {
      sha256: hash, key, filename: file.filename, sizeBytes: file.sizeBytes,
      groups: [], packagePath: "", status: "unreviewed", evidence: [], questions: [],
      sourcePosts: contexts.filter((row) => row.sha256 === hash).map((row) => {
        const detail = snapshot.details[row.slug];
        const posts = detail ? [detail.initialPost, ...detail.threadPosts] : [];
        return { slug: row.slug, messageId: row.source_message_id,
          post: posts.find((post) => post.sourceUrl?.endsWith(`/${row.source_message_id}`)) || null,
          // Keep the complete thread for interpretation; linkage itself is the database hash join.
          detail: detail || null };
      }),
    });
    byHash.get(hash).groups.push(group.name);
    return { filename: file.filename, sha256: hash, version: file.version };
  }),
}));

// Locate by candidate size, then verify SHA-256. Never trust a matching filename.
const sizes = new Set([...byHash.values()].map((file) => file.sizeBytes));
const hashFile = async (filename) => {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filename)) hash.update(chunk);
  return hash.digest("hex");
};
let checked = 0;
async function visit(directory, recursive = true) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory() && recursive) await visit(filename);
    if (!entry.isFile() || !/\.(pak|zip)$/i.test(entry.name)) continue;
    const stat = await fs.stat(filename);
    if (!sizes.has(stat.size)) continue;
    const hash = await hashFile(filename);
    checked += 1;
    if (byHash.has(hash) && !byHash.get(hash).packagePath) byHash.get(hash).packagePath = filename;
  }
}
for (const root of process.argv.slice(3)) await visit(path.resolve(root));
// Root-level authored packages, without recursively traversing the whole modding workspace.
await visit(path.resolve(".."), false);
const records = [...byHash.values()];
await write("ledger.json", { capturedAt: catalog.capturedAt, groups, records });
await write("packages.json", { records: records.filter((record) => record.packagePath).map((record) => ({
  ...record, group: record.groups[0], downloadUrl: `/api/dump-file/${record.key}`,
})) });
console.log(JSON.stringify({ groups: groups.length, uniqueFiles: records.length,
  located: records.filter((record) => record.packagePath).length,
  linkedFiles: records.filter((record) => record.sourcePosts.length).length, candidatesHashed: checked }));

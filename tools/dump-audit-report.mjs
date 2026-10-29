/* Reconcile all frozen groups against reviewed files. Publishes status and
 * descriptions only; private source threads and extracted assets remain local. */
import { promises as fs } from "node:fs";
import path from "node:path";
import { reviewedUpdates } from "./dump-descriptions.mjs";

const read = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const listAssetJson = async (directory) => {
  const files = [];
  let entries;
  try { entries = await fs.readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error.code === "ENOENT") return files; throw error; }
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listAssetJson(fullPath));
    else if (entry.name.endsWith(".uasset.json") || entry.name.endsWith(".umap.json")) files.push(fullPath);
  }
  return files;
};
const catalog = await read(".dump-audit/catalog.json");
const ledger = await read(".dump-audit/ledger.json");
const inventory = await read(".dump-audit/inventory.json");
const { reviews } = await read("docs/dump-descriptions-reviewed.json");
reviewedUpdates(catalog.groups, reviews);
const reviewed = new Map(reviews.map((review) => [review.name, review]));
const packages = new Map(inventory.records.map((record) => [record.sha256, record]));
let parsedFiles = 0;
let parsedAssets = 0;
const groups = [];
const fileStatus = new Map();
const useExportedJson = async (record) => {
  const exportedAssets = await listAssetJson(path.join(".dump-audit/extracted", record.sha256));
  if (!exportedAssets.length) return false;
  let unparsedExports = 0;
  for (const file of exportedAssets) {
    const asset = await read(file);
    unparsedExports += (asset.Exports || []).filter((item) => item.$type?.includes("RawExport")).length;
  }
  parsedFiles += 1;
  parsedAssets += exportedAssets.length;
  fileStatus.set(record.sha256, { sha256: record.sha256, extractedAssets: exportedAssets.length,
    unparsedExports, packageReadError: packages.get(record.sha256)?.error || "" });
  return true;
};
for (const record of ledger.records) {
  let assets = [];
  const summaryPath = path.join(".dump-audit/summaries", `${record.sha256}.json`);
  try {
    const { size } = await fs.stat(summaryPath);
    if (size < 400_000_000) assets = await read(summaryPath);
    if (size >= 400_000_000 || !assets.length) { await useExportedJson(record); continue; }
  }
  catch (error) { if (error.code !== "ENOENT") throw error; await useExportedJson(record); continue; }
  if (assets.length) parsedFiles += 1;
  parsedAssets += assets.length;
  const raw = assets.reduce((count, asset) => count + asset.exports.filter((item) => item.unparsed).length, 0);
  fileStatus.set(record.sha256, { sha256: record.sha256, extractedAssets: assets.length,
    unparsedExports: raw, packageReadError: packages.get(record.sha256)?.error || "" });
}
for (const group of ledger.groups) {
  const review = reviewed.get(group.name);
  groups.push({ name: group.name, status: review ? "reviewed-static" : "pending",
    originalDescription: group.originalDescription,
    reviewedDescription: review?.description || null,
    files: group.files.map((file) => ({ filename: file.filename, ...fileStatus.get(file.sha256) })) });
}
const summary = { capturedAt: catalog.capturedAt, catalogSource: catalog.source,
  groups: groups.length, uniqueFiles: ledger.records.length,
  acquiredFiles: ledger.records.filter((record) => record.packagePath).length,
  exportedFiles: parsedFiles, exportedAssets: parsedAssets,
  reviewedGroups: reviewed.size, pendingGroups: groups.length - reviewed.size, runtimeVerifiedGroups: 0 };
await fs.writeFile("docs/dump-description-audit-status.json", JSON.stringify({ summary, groups }, null, 2) + "\n");
const escape = (value) => value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
let held = { held: [] };
try { held = JSON.parse(await fs.readFile(".dump-audit/held.json", "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
const heldNames = new Set(held.held.flatMap((entry) => entry.names));
const report = ["# Pak Dump description audit progress", "",
  `Catalog: ${summary.groups} groups / ${summary.uniqueFiles} unique files. All packages acquired and hash-checked.`, "",
  `Reviewed through static analysis: **${summary.reviewedGroups}**. Pending: **${summary.pendingGroups}**. Runtime verified: **0**.`, "",
  `Cooked JSON exported for ${summary.exportedFiles} packages (${summary.exportedAssets} assets). Extraction and automated comparison do not count as semantic review.`, "",
  "## Reviewed corrections", "", "| Group | Previous description | Reviewed description |", "| --- | --- | --- |",
  ...groups.filter((group) => group.reviewedDescription).map((group) => `| ${escape(group.name)} | ${escape(group.originalDescription)} | ${escape(group.reviewedDescription)} |`), "",
  "## Held for missing evidence (not publishable yet)", "",
  ...held.held.flatMap((entry) => [`- Needs ${entry.needs}: ${entry.names.join(", ")}`, `  ${entry.reason}`, ""]),
  "## Remaining work", "",
  "Continue the pending queue with package-specific property, bytecode, media and source-context review. Establish historical baselines where the current game differs. Resolve raw exports using a compatible parser or mappings. Review large multi-feature bundles and every distinct version before accepting group-level text.", "",
  "No production descriptions have been updated by this audit. The pending migration and local recovery snapshot carry the reviewed text; publication requires a live-update request.", "",
  "## Evidence", "",
  "Reviewed claims and exact package hashes: `docs/dump-descriptions-reviewed.json`. Complete queue: `docs/dump-description-audit-status.json`. Private raw context, packages, exports and vanilla comparisons: `.dump-audit/` (ignored by Git).", "",
];
await fs.writeFile("docs/dump-description-audit-progress.md", report.join("\n"));
console.log(JSON.stringify(summary));

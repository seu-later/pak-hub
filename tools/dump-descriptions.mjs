/* Emit targeted updates only from reviewed, exact-file evidence.
 * node tools/dump-descriptions.mjs --live .dump-audit/catalog.json --reviews docs/dump-descriptions-reviewed.json --output migrations/<next>.sql
 * Unreviewed groups are preserved; names and archive listings never authorize text.
 */
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export function describeGroup(name, assets = [], files = [], reviews = []) {
  const review = reviews.find((row) => row.name === name);
  if (!review) return null;
  return reviewedUpdates([{ name, files }], [review])[0].description;
}

export function reviewedUpdates(groups, reviews) {
  const catalog = new Map(groups.map((group) => [group.name, group]));
  const keys = new Set();
  return reviews.map((review) => {
    const key = review.name === "NoCrawlerPuddles" ? "no_crawler_puddles" : review.name.toLowerCase();
    if (keys.has(key)) throw new Error(`Duplicate review: ${review.name}`);
    keys.add(key);
    const group = catalog.get(review.name);
    if (!group) throw new Error(`Reviewed group not in catalog: ${review.name}`);
    if (!["static", "runtime"].includes(review.verification)) throw new Error(`Missing verification: ${review.name}`);
    if (typeof review.description !== "string" || !review.description.trim() || review.description.length > 240) throw new Error(`Description must contain 1–240 characters: ${review.name}`);
    const actual = new Set(group.files.map((file) => file.sha256 || file.downloadUrl?.match(/\/([a-f0-9]{64})\.(?:pak|zip)$/)?.[1]));
    const covered = new Set(review.files.map((file) => file.sha256));
    if (actual.has(undefined) || actual.size !== covered.size || [...actual].some((hash) => !covered.has(hash))) throw new Error(`Incomplete exact file coverage: ${review.name}`);
    for (const file of review.files) {
      if (!/^[a-f0-9]{64}$/.test(file.sha256) || !file.evidence?.length || file.evidence.some((item) => !item.kind || !item.asset || !item.finding)) throw new Error(`Missing file evidence: ${review.name}`);
    }
    return { baseKey: key, description: review.description };
  });
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? "" : process.argv[index + 1] || "";
}
async function main() {
  const livePath = argument("--live");
  const reviewsPath = argument("--reviews");
  const outputPath = argument("--output");
  if (!livePath || !reviewsPath || !outputPath) throw new Error("Required: --live <catalog.json> --reviews <reviewed.json> --output <new.sql>");
  const live = JSON.parse(await readFile(livePath, "utf8"));
  const { reviews } = JSON.parse(await readFile(reviewsPath, "utf8"));
  const rows = reviewedUpdates(live.groups, reviews);
  if (!rows.length) throw new Error("No reviewed descriptions; no migration written.");
  const escape = (value) => value.replace(/'/g, "''");
  const sql = rows.map((row) => `INSERT INTO dump_descriptions (base_key, description) VALUES ('${escape(row.baseKey)}', '${escape(row.description)}') ON CONFLICT(base_key) DO UPDATE SET description=excluded.description, updated_at=CURRENT_TIMESTAMP;`).join("\n");
  // Never overwrite an applied migration or a previous review artifact.
  await writeFile(outputPath, sql + "\n", { flag: "wx" });
  console.log(`Wrote ${rows.length} reviewed descriptions; preserved ${live.groups.length - rows.length} pending groups.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

/* Create a public-only recovery snapshot from a D1 SQL export:
 * node tools/catalog-snapshot.mjs <export.sql>
 * Uses the public API serializers so private dump message links stay excluded. */
import { DatabaseSync } from "node:sqlite";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { onRequestGet as getMods } from "../functions/api/mods.js";
import { onRequestGet as getMod } from "../functions/api/mods/[slug].js";
import { onRequestGet as getDump } from "../functions/api/dump.js";

if (!process.argv[2]) throw new Error("Provide the D1 SQL export path.");
const database = new DatabaseSync(":memory:");
database.exec(readFileSync(process.argv[2], "utf8"));
const DB = {
  prepare(sql) {
    const statement = database.prepare(sql);
    return { bind: (...values) => ({
      first: async () => statement.get(...values) || null,
      all: async () => ({ results: statement.all(...values) }),
    }) };
  },
};
async function payload(handler, path, params = {}) {
  const response = await handler({ env: { DB }, request: new Request(`https://pak-hub.pages.dev${path}`), params });
  if (!response.ok) throw new Error(`Snapshot query failed: ${path} (${response.status})`);
  return response.json();
}
async function pages(handler, path, field) {
  const rows = [];
  for (let page = 1; ; page += 1) {
    const data = await payload(handler, `${path}?page=${page}`);
    rows.push(...data[field]);
    if (rows.length >= data.total) return rows;
  }
}
const mods = await pages(getMods, "/api/mods", "mods");
const details = {};
for (const mod of mods) details[mod.slug] = await payload(getMod, `/api/mods/${mod.slug}`, { slug: mod.slug });
const groups = await pages(getDump, "/api/dump", "groups");
const snapshot = { generatedAt: new Date().toISOString(), mods, details, groups };
const directory = new URL("../functions/_data/", import.meta.url);
mkdirSync(directory, { recursive: true });
writeFileSync(new URL("catalog-snapshot.json", directory), JSON.stringify(snapshot));
database.close();
console.log(`Saved ${mods.length} mods, ${Object.keys(details).length} details, and ${groups.length} dump groups.`);

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import snapshot from "../functions/_data/catalog-snapshot.js";
import { snapshotResponse } from "../functions/_lib/catalog-snapshot.js";
import { describeGroup, reviewedUpdates } from "./dump-descriptions.mjs";

const hash = "a".repeat(64);
const group = { name: "NoSomething", description: "Existing text", files: [{ downloadUrl: `/api/dump-file/${hash}.pak` }] };
const review = { name: group.name, description: "Hides the ammo counter.", verification: "static",
  files: [{ sha256: hash, evidence: [{ kind: "cooked-properties", asset: "HUD.uasset", finding: "Counter visibility is Collapsed." }] }] };

test("names and asset lists cannot generate approved behavioral descriptions", () => {
  assert.equal(describeGroup("NoSomething", ["HUD/Counter.uasset"]), null);
  assert.equal(describeGroup("AudioClarityUninspected", ["Sound_Cue.uasset"]), null);
});

test("only reviewed descriptions covering every current file can be published", () => {
  assert.equal(reviewedUpdates([group], [review])[0].description, review.description);
  assert.equal(reviewedUpdates([{ ...group, name: "NoCrawlerPuddles" }], [{ ...review, name: "NoCrawlerPuddles" }])[0].baseKey, "no_crawler_puddles");
  const changed = { ...group, files: [...group.files, { downloadUrl: `/api/dump-file/${"b".repeat(64)}.pak` }] };
  assert.throws(() => reviewedUpdates([changed], [review]), /file coverage/);
  assert.throws(() => reviewedUpdates([group], [{ ...review, files: [{ sha256: hash, evidence: [] }] }]), /evidence/);
  assert.throws(() => reviewedUpdates([group], [{ ...review, verification: "unreviewed" }]), /verification/);
  assert.equal(reviewedUpdates([group], []).length, 0);
});

test("publication rejects missing groups, duplicate reviews and invalid descriptions", () => {
  assert.throws(() => reviewedUpdates([], [review]), /not in catalog/);
  assert.throws(() => reviewedUpdates([group], [review, review]), /Duplicate/);
  assert.throws(() => reviewedUpdates([group], [{ ...review, description: "x".repeat(241) }]), /240/);
});

test("reviewed text agrees across exact-file registry, targeted migration and fallback API", async () => {
  const { reviews } = JSON.parse(readFileSync(new URL("../docs/dump-descriptions-reviewed.json", import.meta.url), "utf8"));
  const updates = reviewedUpdates(snapshot.groups, reviews);
  const database = new DatabaseSync(":memory:");
  const migrations = readdirSync(new URL("../migrations/", import.meta.url))
    .filter((migration) => /^\d{4}_.+\.sql$/.test(migration))
    .sort();
  for (const migration of migrations) {
    database.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
  }
  database.prepare("INSERT INTO dump_descriptions(base_key, description) VALUES (?, ?)")
    .run("unreviewed-entry", "Preserve this pending description");
  try {
    for (const [index, update] of updates.entries()) {
      assert.equal(database.prepare("SELECT description FROM dump_descriptions WHERE base_key=?").get(update.baseKey).description, update.description);
      const group = snapshot.groups.find((item) => item.name === reviews[index].name);
      const response = await snapshotResponse(new Request(`https://example.com/api/dump?q=${encodeURIComponent(group.name)}`));
      const result = await response.json();
      assert.equal(result.groups.find((item) => item.name === group.name).description, update.description);
    }
    assert.equal(database.prepare("SELECT description FROM dump_descriptions WHERE base_key='unreviewed-entry'").get().description, "Preserve this pending description");
  } finally { database.close(); }
});

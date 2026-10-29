import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestGet as getDump } from "./dump.js";
import { onRequestGet as getMods } from "./mods.js";

function setup() {
  const database = new DatabaseSync(":memory:");
  for (const file of ["0001_initial.sql", "0002_import_state.sql", "0003_discord_posts.sql", "0004_dump.sql", "0005_dump_credits.sql", "0006_dump_descriptions.sql"]) {
    database.exec(readFileSync(new URL(`../../migrations/${file}`, import.meta.url), "utf8"));
  }
  const names = ["Unified Weapon Balance", "Unified_Weapon_Balance", "UnifiedWeaponBalance", "Weapon Balance Unified", "Other Mod", "Weapon Only", "Balance_v1.2", "Balance_v12", "100%_Power", "100X_Power"];
  names.forEach((name, index) => {
    database.prepare("INSERT INTO mods (id, slug, name, summary) VALUES (?, ?, ?, ?)").run(index + 1, `mod-${index}`, name, index === 4 ? "unified weapon balance" : "");
    database.prepare("INSERT INTO dump_files (base_key, base_name, filename, sha256, r2_key) VALUES (?, ?, ?, ?, ?)").run(`mod-${index}`, name, `${name}.pak`, "a".repeat(64), `${index}.pak`);
  });
  database.prepare("INSERT OR REPLACE INTO dump_descriptions (base_key, description) VALUES (?, ?)").run("mod-4", "unified weapon balance");
  const DB = { prepare(sql) {
    const statement = database.prepare(sql);
    return { bind: (...values) => ({ first: async () => statement.get(...values), all: async () => ({ results: statement.all(...values) }) }) };
  } };
  return { database, DB };
}

for (const [path, handler, field] of [["dump", getDump, "groups"], ["mods", getMods, "mods"]]) {
  test(`${path}: readable names, precision, ranking and explicit sorts`, async () => {
    const { database, DB } = setup();
    try {
      async function search(q, sort = "newest") {
        const response = await handler({ env: { DB }, request: new Request(`https://example.com/api/${path}?${new URLSearchParams({ q, sort })}`) });
        assert.equal(response.status, 200);
        return response.json();
      }
      const payload = await search("unified weapon balance");
      assert.equal(payload.total, 5);
      assert.equal(payload[field][0].name, "Unified Weapon Balance");
      assert.equal(payload[field].at(-1).name, "Other Mod");
      assert.ok(payload[field].some((row) => row.name === "Unified_Weapon_Balance"));
      assert.ok(payload[field].some((row) => row.name === "UnifiedWeaponBalance"));
      assert.equal((await search("balance unified weapon")).total, 5);
      assert.equal((await search("unified weapon missingword")).total, 0);
      assert.deepEqual((await search('"Unified_Weapon_Balance"'))[field].map((row) => row.name), ["Unified_Weapon_Balance"]);
      assert.deepEqual((await search('"weapon balance" unified'))[field].map((row) => row.name).sort(), ["Other Mod", "Unified Weapon Balance", "Weapon Balance Unified"]);
      assert.deepEqual((await search("v1.2"))[field].map((row) => row.name), ["Balance_v1.2"]);
      assert.deepEqual((await search("100%"))[field].map((row) => row.name), ["100%_Power"]);
      const sorted = (await search("unified weapon balance", "name"))[field].map((row) => row.name);
      assert.equal(sorted[0], "Other Mod");
      assert.equal((await search("weapon ".repeat(14).trim())).total, 6);
      database.prepare("UPDATE mods SET uploader_name = 'miner_x' WHERE id = 1").run();
      database.prepare("UPDATE dump_files SET posted_by = 'miner_x' WHERE base_key = 'mod-0'").run();
      assert.equal((await search("miner_x")).total, 1);
      assert.equal((await search('"miner x"')).total, 0);
      const typo = await search("unifed weapon balance");
      assert.equal(typo.total, 0);
      assert.equal("suggestions" in typo, false);
    } finally { database.close(); }
  });
}

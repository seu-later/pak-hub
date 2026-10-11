import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { compareDumpFiles, onRequestGet as getDump } from "./dump.js";
import { onRequestGet as getDumpFile } from "./dump-file/[key].js";

function setup() {
  const database = new DatabaseSync(":memory:");
  for (const migration of ["0001_initial.sql", "0002_import_state.sql", "0003_discord_posts.sql", "0004_dump.sql", "0005_dump_credits.sql"]) {
    database.exec(readFileSync(new URL(`../../migrations/${migration}`, import.meta.url), "utf8"));
  }
  const DB = {
    prepare(sql) {
      const statement = database.prepare(sql);
      return {
        all: async (...values) => ({ results: statement.all(...values) }),
        bind(...values) {
          return {
            run: async () => statement.run(...values),
            first: async () => statement.get(...values) || null,
            all: async () => ({ results: statement.all(...values) }),
          };
        },
      };
    },
  };
  const insert = database.prepare(`
    INSERT INTO dump_files (base_key, base_name, version, prerelease, filename, size_bytes, sha256, r2_key,
      posted_by, source_message_url, source_guild)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const rows = [
    ["anti-asthma", "Anti-Asthma", "6", 0, "Anti-Asthma_v6.pak", 2048, "a".repeat(64), `${"a".repeat(64)}.pak`,
      "miner_x", "https://discord.com/channels/878318716801155233/111/100", "878318716801155233"],
    ["anti-asthma", "Anti-Asthma", "2", 0, "Anti-Asthma_v2.pak", 1024, "b".repeat(64), `${"b".repeat(64)}.pak`,
      "quiet_miner", "https://discord.com/channels/658769407241093142/222/300", "658769407241093142"],
    ["blueepc", "blueepc", "", 0, "blueepc.pak", 512, "c".repeat(64), `${"c".repeat(64)}.pak`,
      "Unknown", null, null],
    ["custom-difficulty2", "custom-difficulty2", "beta-13", 1, "custom-difficulty2-beta-13.pak", 768, "d".repeat(64), `${"d".repeat(64)}.pak`,
      "tester", null, null],
    ["custom-difficulty2", "custom-difficulty2", "beta-10", 1, "custom-difficulty2-beta-10.pak", 640, "e".repeat(64), `${"e".repeat(64)}.pak`,
      "tester", null, null],
  ];
  for (const row of rows) insert.run(...row);
  return { database, DB };
}

test("dump groups surface base names with newest versions first", async () => {
  const { database, DB } = setup();
  const payload = await (await getDump({
    env: { DB },
    request: new Request("https://example.com/api/dump"),
  })).json();

  assert.equal(payload.total, 3);
  assert.deepEqual(payload.groups.map((group) => group.name), ["Anti-Asthma", "blueepc", "custom-difficulty2"]);
  assert.deepEqual(
    payload.groups[0].files.map((file) => file.filename),
    ["Anti-Asthma_v6.pak", "Anti-Asthma_v2.pak"],
  );
  assert.equal(payload.groups[0].files[0].downloadUrl, `/api/dump-file/${"a".repeat(64)}.pak`);
  assert.equal(payload.groups[0].files[0].postedBy, "miner_x");
  assert.equal(payload.groups[0].files[0].sourceUrl, "https://discord.com/channels/878318716801155233/111/100");
  assert.equal(payload.groups[0].files[1].postedBy, "quiet_miner");
  assert.equal(payload.groups[0].files[1].sourceUrl, "");
  assert.ok(!("source_guild" in payload.groups[0].files[0]));
  database.close();
});

test("dump search matches filenames inside a group", async () => {
  const { database, DB } = setup();
  const payload = await (await getDump({
    env: { DB },
    request: new Request("https://example.com/api/dump?q=beta-10"),
  })).json();

  assert.equal(payload.total, 1);
  assert.equal(payload.groups[0].name, "custom-difficulty2");
  assert.equal(payload.groups[0].fileCount, 2);
  database.close();
});

test("dump file download rejects bad keys and streams stored objects", async () => {
  const { database, DB } = setup();
  const missing = await getDumpFile({ env: { DB, DUMP: { get: async () => null } }, params: { key: "../mods" } });
  assert.equal(missing.status, 404);

  const absent = await getDumpFile({
    env: { DB, DUMP: { get: async () => null } },
    params: { key: `${"a".repeat(64)}.pak` },
  });
  assert.equal(absent.status, 404);

  const stored = new Uint8Array([1, 2, 3]);
  const response = await getDumpFile({
    env: { DB, DUMP: { get: async () => ({ body: stored, size: 3, httpEtag: '"abc"' }) } },
    params: { key: `${"a".repeat(64)}.pak` },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-disposition"), 'attachment; filename="Anti-Asthma_v6.pak"');
  assert.deepEqual(Array.from(new Uint8Array(await response.arrayBuffer())), [1, 2, 3]);
  database.close();
});

test("dump version comparator orders finals above prereleases and newest first", () => {
  const files = [
    { filename: "m.pak", version: "", prerelease: 0 },
    { filename: "m-beta.pak", version: "beta-13", prerelease: 1 },
    { filename: "m-v2.pak", version: "2", prerelease: 0 },
    { filename: "m-v10.pak", version: "10", prerelease: 0 },
  ];
  assert.deepEqual(
    [...files].sort(compareDumpFiles).map((file) => file.filename),
    ["m-v10.pak", "m-v2.pak", "m-beta.pak", "m.pak"],
  );
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { compareDumpFiles, onRequestGet as getDump } from "./dump.js";
import { onRequestGet as getDumpFile } from "./dump-file/[key].js";

function setup() {
  const database = new DatabaseSync(":memory:");
  for (const migration of ["0001_initial.sql", "0002_import_state.sql", "0003_discord_posts.sql", "0004_dump.sql", "0005_dump_credits.sql", "0006_dump_descriptions.sql", "0007_dump_descriptions_new_entries.sql", "0008_user_facing_dump_descriptions.sql", "0009_dump_descriptions_held_and_fallbacks.sql", "0010_dump_descriptions_mike.sql", "0011_dump_family_merges.sql", "0012_dump_descriptions_arthur_lin.sql", "0013_dump_descriptions_selected_local.sql", "0014_dump_allow_duplicate_filenames.sql", "0015_dump_credits_from_pak_list.sql", "0016_dump_descriptions_pak_list.sql"]) {
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
  database.exec(`
    INSERT INTO mods (id, slug, name, summary, uploader_name) VALUES
      (1, 'anti-asthma-catalog', 'Anti-Asthma', 'Reduces cave particles.', 'miner_x');
    INSERT INTO releases (
      id, mod_id, version_label, source_channel_id, source_message_id, source_message_url,
      posted_by, published_at
    ) VALUES (
      1, 1, 'Unversioned', '878318716801155233', '999999999999999999',
      'https://discord.com/channels/878318716801155233/111/999999999999999999',
      'miner_x', '2026-10-12T00:00:00.000Z'
    );
    INSERT INTO pak_files (
      release_id, original_filename, variant_label, size_bytes, sha256,
      github_asset_id, github_tag, download_url
    ) VALUES (
      1, 'Anti-Asthma_v6.pak', 'Default build', 2048, '${"a".repeat(64)}',
      '999', 'pak-hub-test', 'https://github.com/owner/pak-assets/releases/download/pak-hub-test/Anti-Asthma_v6.pak'
    );
  `);
  return { database, DB };
}

test("dump groups surface base names with newest versions first", async () => {
  const { database, DB } = setup();
  const payload = await (await getDump({
    env: { DB },
    request: new Request("https://example.com/api/dump?sort=name"),
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
  assert.equal(payload.groups[0].description, "Removes or reduces dust, smoke, debris, and other cave particle effects.");
  assert.equal(payload.groups[0].pakListUrl, "/index.html?mod=anti-asthma-catalog");
  assert.equal(payload.groups[1].pakListUrl, "");
  assert.equal(payload.groups[1].description, "Recolors EPC firing, projectile, and heat effects blue.");
  assert.ok(!("source_guild" in payload.groups[0].files[0]));
  database.close();
});

test("newly cataloged dump entries have seeded descriptions", () => {
  const { database } = setup();
  const expected = new Map([
    ["blackgraydarkdescent", "Recolors the Dark Descent global skin material black and gray."],
    ["enemycullnolpe", "Culls common enemy actors without the low-priority-enemy filter."],
    ["noammobar", "Removes the ammo/supply bar HUD element."],
    ["nuke_range_indicator", "Adds a green blast-radius indicator to the Engineer's Mini-Nuke radiation cloud."],
    ["revolversound", "Replaces the Bulldog Revolver's firing sound with FAMAS-style audio."],
    ["sdfandraymarchskins", "Adds custom vanity and weapon-skin assets using SDF/ray-marched materials."],
  ]);
  for (const [baseKey, description] of expected) {
    assert.equal(database.prepare("SELECT description FROM dump_descriptions WHERE base_key = ?").get(baseKey).description, description);
  }
  database.close();
});

test("held dump groups have seeded descriptions", () => {
  const { database } = setup();
  const expected = new Map([
    ["audioclarity-v0.1", "Rebalances enemy and explosion audio for clearer sound cues (v0.1)."],
    ["audioclarity-v0.2", "Rebalances enemy and explosion audio for clearer sound cues (v0.2)."],
    ["ironwillstatus_clientevents", "Adds the client-side Iron Will status HUD and settings UI."],
    ["sbsc_patchedmev", "Patches seasonal event, encounter, and enemy settings for MEV compatibility (v7)."],
    ["custom-difficulty2-beta-rltp4", "Custom Difficulty 2 beta RLTP4 package."],
    ["lederhorsen_unrestricted", "Unlocks the 2023 Oktoberfest armor set for all four classes."],
  ]);
  for (const [baseKey, description] of expected) {
    assert.equal(database.prepare("SELECT description FROM dump_descriptions WHERE base_key = ?").get(baseKey).description, description);
  }
  database.close();
});

test("Mike dump groups have seeded descriptions", () => {
  const { database } = setup();
  const expected = new Map([
    ["cccallmule", "Adds a chat command for calling the M.U.L.E."],
    ["ccstartingnitra", "Adds starting Nitra to missions."],
    ["chatmirror", "Mirrors chat messages through a custom chat UI."],
    ["eventeraser", "Disables selected mission events and saves the setting."],
    ["fpm", "Adds the FPM gameplay package."],
    ["fpsondemand", "Adds an on-demand FPS display with saved settings."],
    ["gfo", "Adds the GFO gameplay package."],
    ["gsm", "Adds the GSM gameplay package."],
    ["infiniteeggs", "Adds infinite-egg gameplay with egg spawners, traps, and a settings GUI."],
    ["mandatorysecondariesalways", "Makes secondary objectives mandatory."],
    ["michwarnings", "Adds mission warnings, including a magnetic-death warning."],
    ["oht", "Adds the OHT gameplay package."],
    ["ui_howfarmule", "Adds a HUD display for the M.U.L.E. distance."],
    ["vcm", "Changes vertical corpse movement behavior."],
    ["windowmarker", "Adds a GUI for marking windows."],
  ]);
  for (const [baseKey, description] of expected) {
    assert.equal(database.prepare("SELECT description FROM dump_descriptions WHERE base_key = ?").get(baseKey).description, description);
  }
  database.close();
});

test("merged dump families have canonical descriptions", () => {
  const { database } = setup();
  const expected = new Map([
    ["betterterminal", "Reworks terminal upgrade and overclock entries and their descriptions."],
    ["deep_dive_carry_x2_enemies", "Changes Deep Dive carry rules and doubles enemy counts."],
    ["mev", "Adds the Mission Event Variants enemy/event pack."],
    ["removeextraneousparticles", "Removes extraneous enemy, fire, gas, and objective particles."],
    ["viewmodeldecoupler", "Decouples selected weapon/projectile effects from the first-person viewmodel."],
  ]);
  for (const [baseKey, description] of expected) {
    assert.equal(database.prepare("SELECT description FROM dump_descriptions WHERE base_key = ?").get(baseKey).description, description);
  }
  database.close();
});

test("Arthur Lin dump groups have seeded descriptions", () => {
  const { database } = setup();
  const expected = new Map([
    ["allyoutlinesplus-0.4.0", "Adds team-outline, ping-icon, and team-tag UI assets for highlighting allies."],
    ["antilag-0.1.0-alpha.5-r9", "Keeps local movement during host corrections, including grapple and movement-base cases; it is client-only."],
    ["cdcompat-0.2.0-alpha.4-drg0923", "Adds a Custom Difficulty engine selector and supporting CD1/CD2 integration for the 2026-09-23 DRG build."],
    ["shieldlinkrange-0.1.0", "Adds Shield Link range UI and shield-ring visual assets."],
  ]);
  for (const [baseKey, description] of expected) {
    assert.equal(database.prepare("SELECT description FROM dump_descriptions WHERE base_key = ?").get(baseKey).description, description);
  }
  database.close();
});

test("selected local dump groups have seeded descriptions", () => {
  const { database } = setup();
  const expected = new Map([
    ["cavegraphicsboost", "Replaces cave terrain materials and decorative foliage with simple flat materials to target lower GPU material cost."],
    ["enemyperfboost", "Throttles distant enemy and animation updates based on distance and visibility to reduce CPU work."],
    ["minimalism", "Provides minimal visual replacements for cave environment, foliage, particles, critters, and room objects."],
    ["nocamerashakecomplete", "Removes cooked camera-shake effects while leaving weapon recoil and weapon Blueprints unchanged."],
    ["reliablelandscape", "Reduces cave rendering cost by disabling nonessential debris and terrain shadows and removing selected ambient effects."],
  ]);
  for (const [baseKey, description] of expected) {
    assert.equal(database.prepare("SELECT description FROM dump_descriptions WHERE base_key = ?").get(baseKey).description, description);
  }
  database.close();
});

test("Pak List-sourced dump groups have seeded descriptions", () => {
  const { database } = setup();
  const expected = new Map([
    ["actormonitor", "Changes cave, terrain, or biome content for Actor Monitor."],
    ["cigargunsling_lowered", "Replaces weapon inspect/gunsling animations with lowered cigar-themed animations."],
    ["customizable_weapon_viewmodel_fov", "Adds custom assets for Customizable Weapon Viewmodel FOV."],
    ["time4tests", "Changes cave, terrain, or biome content for Time4Tests."],
    ["vwa-salvospread", "Changes weapon, upgrade, or overclock data for VWA Salvo Spread."],
  ]);
  for (const [baseKey, description] of expected) {
    assert.equal(database.prepare("SELECT description FROM dump_descriptions WHERE base_key = ?").get(baseKey).description, description);
  }
  database.close();
});

test("dump files retain distinct hashes when filenames match", () => {
  const { database } = setup();
  const insert = database.prepare(`
    INSERT INTO dump_files (base_key, base_name, version, prerelease, filename, size_bytes, sha256, r2_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run("same-name-a", "Same Name A", "", 0, "same-name.pak", 10, "f".repeat(64), `${"f".repeat(64)}.pak`);
  insert.run("same-name-b", "Same Name B", "", 0, "same-name.pak", 20, "e".repeat(64), `${"e".repeat(64)}.pak`);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM dump_files WHERE filename = 'same-name.pak'").get().count, 2);
  database.close();
});

test("dump descriptions do not expose archive-analysis language", () => {
  const { database } = setup();
  const forbidden = /old archive|could not be inspected|archive contents|could not be enumerated|no enumerable|no readable|no game assets|placeholder archive|archive format/i;
  const descriptions = database.prepare("SELECT description FROM dump_descriptions").all();
  assert.ok(descriptions.every(({ description }) => !forbidden.test(description)));
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

test("dump groups support newest and oldest ordering", async () => {
  const { database, DB } = setup();
  const newest = await (await getDump({
    env: { DB },
    request: new Request("https://example.com/api/dump?sort=newest"),
  })).json();
  const oldest = await (await getDump({
    env: { DB },
    request: new Request("https://example.com/api/dump?sort=oldest"),
  })).json();

  assert.deepEqual(newest.groups.map((group) => group.name), ["custom-difficulty2", "blueepc", "Anti-Asthma"]);
  assert.deepEqual(oldest.groups.map((group) => group.name), ["Anti-Asthma", "blueepc", "custom-difficulty2"]);
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

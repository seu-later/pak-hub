import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestPost } from "./import.js";
import { syncPakListFiles } from "../_lib/dump-sync.js";

test("moving a root release into a later thread removes its empty standalone mod", async () => {
  const database = new DatabaseSync(":memory:");
  for (const migration of ["0001_initial.sql", "0002_import_state.sql", "0003_discord_posts.sql"]) {
    database.exec(readFileSync(new URL(`../../migrations/${migration}`, import.meta.url), "utf8"));
  }
  const adapter = {
    prepare(sql) {
      const statement = database.prepare(sql);
      return {
        bind(...values) {
          return {
            run: async () => statement.run(...values),
            first: async () => statement.get(...values) || null,
          };
        },
      };
    },
    async batch(statements) {
      for (const statement of statements) await statement.run();
    },
  };
  const guild = "123456789012345678";
  const channel = "123456789012345679";
  const message = "123456789012345680";
  const thread = "123456789012345681";
  const payload = {
    slug: "sample-mod-standalone",
    mod_source_id: message,
    name: "Sample Mod",
    version: "v1",
    source_channel_id: channel,
    source_message_id: message,
    source_message_url: `https://discord.com/channels/${guild}/${channel}/${message}`,
    files: [{
      filename: "sample.pak",
      variant: "Default build",
      size_bytes: 1024,
      sha256: "a".repeat(64),
      github_asset_id: "123",
      github_tag: `pakhub-discord-${message}`,
      download_url: `https://github.com/owner/pak-assets/releases/download/pakhub-discord-${message}/sample.pak`,
    }],
  };
  const env = { DB: adapter, PAK_HUB_IMPORT_TOKEN: "test-secret", GITHUB_RELEASE_REPO: "owner/pak-assets" };
  const send = (data) => onRequestPost({
    env,
    request: new Request("https://example.com/api/import", {
      method: "POST",
      headers: { authorization: "Bearer test-secret", "content-type": "application/json" },
      body: JSON.stringify(data),
    }),
  });

  assert.equal((await send(payload)).status, 201);
  assert.equal((await send({
    ...payload,
    slug: "sample-mod-thread",
    mod_source_id: thread,
    source_thread_id: thread,
    source_thread_url: `https://discord.com/channels/${guild}/${thread}`,
  })).status, 201);

  assert.deepEqual(database.prepare("SELECT slug FROM mods ORDER BY slug").all().map((row) => row.slug), ["sample-mod-thread"]);
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM releases").get().count, 1);
  database.close();
});

test("accepts zip files as downloadable release assets", async () => {
  const database = new DatabaseSync(":memory:");
  for (const migration of ["0001_initial.sql", "0002_import_state.sql", "0003_discord_posts.sql"]) {
    database.exec(readFileSync(new URL(`../../migrations/${migration}`, import.meta.url), "utf8"));
  }
  const adapter = {
    prepare(sql) {
      const statement = database.prepare(sql);
      return {
        bind(...values) {
          return {
            run: async () => statement.run(...values),
            first: async () => statement.get(...values) || null,
          };
        },
      };
    },
    async batch(statements) {
      for (const statement of statements) await statement.run();
    },
  };
  const guild = "123456789012345678";
  const channel = "123456789012345679";
  const message = "123456789012345680";
  const response = await onRequestPost({
    env: { DB: adapter, PAK_HUB_IMPORT_TOKEN: "test-secret", GITHUB_RELEASE_REPO: "owner/pak-assets" },
    request: new Request("https://example.com/api/import", {
      method: "POST",
      headers: { authorization: "Bearer test-secret", "content-type": "application/json" },
      body: JSON.stringify({
        slug: "skin-pack",
        mod_source_id: message,
        name: "Skin pack",
        source_channel_id: channel,
        source_message_id: message,
        source_message_url: `https://discord.com/channels/${guild}/${channel}/${message}`,
        files: [{
          filename: "skinpack.zip",
          variant: "skinpack.zip",
          size_bytes: 1024,
          sha256: "a".repeat(64),
          github_asset_id: "123",
          github_tag: `pakhub-discord-${message}`,
          download_url: `https://github.com/owner/pak-assets/releases/download/pakhub-discord-${message}/skinpack.zip`,
        }],
      }),
    }),
  });

  assert.equal(response.status, 201);
  assert.equal(database.prepare("SELECT original_filename FROM pak_files").get().original_filename, "skinpack.zip");
  database.close();
});

test("Discord post migration backfills root metadata and sender for existing rows", () => {
  const database = new DatabaseSync(":memory:");
  database.exec(readFileSync(new URL("../../migrations/0001_initial.sql", import.meta.url), "utf8"));
  database.exec(`
    INSERT INTO mods (id, slug, name, uploader_name) VALUES (1, 'sample-mod', 'Sample Mod', 'seu');
    INSERT INTO releases (
      id, mod_id, source_channel_id, source_message_id, source_message_url, published_at, changelog
    ) VALUES (
      1, 1, '123456789012345679', '123456789012345680',
      'https://discord.com/channels/123456789012345678/123456789012345679/123456789012345680',
      '2026-10-08T15:12:00.000Z', 'Sample Mod\nInitial message'
    );
  `);
  database.exec(readFileSync(new URL("../../migrations/0002_import_state.sql", import.meta.url), "utf8"));
  database.prepare("INSERT INTO import_state (id, state_json) VALUES (1, ?)").run('{"channelCursor":"123456789012345680","threadCursors":{}}');
  database.exec(readFileSync(new URL("../../migrations/0003_discord_posts.sql", import.meta.url), "utf8"));

  const root = database.prepare("SELECT root_message_id, root_posted_at, root_post_content FROM mods").get();
  assert.equal(root.root_message_id, "123456789012345680");
  assert.equal(root.root_posted_at, "2026-10-08T15:12:00.000Z");
  assert.equal(root.root_post_content, "Sample Mod\nInitial message");
  const post = database.prepare("SELECT posted_by, post_content FROM releases").get();
  assert.equal(post.posted_by, "seu");
  assert.equal(post.post_content, "Sample Mod\nInitial message");
  assert.equal(database.prepare("SELECT COUNT(*) AS count FROM import_state").get().count, 0);
  database.close();
});

test("Pak List files are copied to the dump with private-source protection and descriptions", async () => {
  const database = new DatabaseSync(":memory:");
  for (const migration of [
    "0001_initial.sql", "0002_import_state.sql", "0003_discord_posts.sql", "0004_dump.sql",
    "0005_dump_credits.sql", "0006_dump_descriptions.sql", "0007_dump_descriptions_new_entries.sql",
    "0008_user_facing_dump_descriptions.sql", "0009_dump_descriptions_held_and_fallbacks.sql",
    "0010_dump_descriptions_mike.sql", "0011_dump_family_merges.sql", "0012_dump_descriptions_arthur_lin.sql",
    "0013_dump_descriptions_selected_local.sql", "0014_dump_allow_duplicate_filenames.sql",
    "0015_dump_credits_from_pak_list.sql", "0016_dump_descriptions_pak_list.sql",
  ]) database.exec(readFileSync(new URL(`../../migrations/${migration}`, import.meta.url), "utf8"));

  const adapter = {
    prepare(sql) {
      const statement = database.prepare(sql);
      return {
        bind(...values) {
          return {
            run: async () => statement.run(...values),
            first: async () => statement.get(...values) || null,
            all: async () => ({ results: statement.all(...values) }),
          };
        },
        run: async () => statement.run(),
        first: async () => statement.get() || null,
        all: async () => ({ results: statement.all() }),
      };
    },
    async batch(statements) {
      for (const statement of statements) await statement.run();
    },
  };
  const uploaded = [];
  const env = {
    DB: adapter,
    DUMP: {
      async put(key, body, options) {
        uploaded.push({ key, body, options });
      },
    },
  };
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(new Uint8Array([1, 2, 3, 4]), {
    status: 200,
    headers: { "content-length": "4" },
  });

  try {
    const hash = "b".repeat(64);
    const result = await syncPakListFiles({
      env,
      uploader: "raw_user",
      sourceMessageUrl: "https://discord.com/channels/123456789012345678/123456789012345679/123456789012345680",
      summary: "Adds a fresh widget to the HUD",
      files: [{
        filename: "NoAmmoBar.pak",
        size: 4,
        sha256: hash,
        downloadUrl: "https://github.com/owner/repo/releases/download/tag/NoAmmoBar.pak",
      }, {
        filename: "FreshWidget.pak",
        size: 4,
        sha256: "c".repeat(64),
        downloadUrl: "https://github.com/owner/repo/releases/download/tag/FreshWidget.pak",
      }],
    });

    assert.deepEqual(result, { imported: 2, skipped: 0 });
    assert.equal(uploaded.length, 2);
    const row = database.prepare("SELECT base_name, filename, posted_by, source_message_url, source_guild FROM dump_files").get();
    assert.deepEqual({ ...row }, {
      base_name: "NoAmmoBar",
      filename: "NoAmmoBar.pak",
      posted_by: "raw_user",
      source_message_url: null,
      source_guild: "123456789012345678",
    });
    assert.equal(database.prepare("SELECT description FROM dump_descriptions WHERE base_key = 'noammobar'").get().description, "Removes the ammo/supply bar HUD element.");

    const second = await syncPakListFiles({
      env,
      uploader: "raw_user",
      sourceMessageUrl: "https://discord.com/channels/878318716801155233/123456789012345679/123456789012345680",
      files: [{
        filename: "NoAmmoBar.pak",
        size: 4,
        sha256: hash,
        downloadUrl: "https://github.com/owner/repo/releases/download/tag/NoAmmoBar.pak",
      }],
    });
    assert.deepEqual(second, { imported: 0, skipped: 1 });
    assert.equal(uploaded.length, 2);
    assert.equal(database.prepare("SELECT description FROM dump_descriptions WHERE base_key = 'freshwidget'").get().description, "Adds a fresh widget to the HUD.");
  } finally {
    globalThis.fetch = oldFetch;
    database.close();
  }
});

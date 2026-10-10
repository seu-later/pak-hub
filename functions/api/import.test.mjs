import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestPost } from "./import.js";

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

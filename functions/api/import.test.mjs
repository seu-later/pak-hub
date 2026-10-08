import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestPost } from "./import.js";

test("moving a root release into a later thread removes its empty standalone mod", async () => {
  const database = new DatabaseSync(":memory:");
  database.exec(readFileSync(new URL("../../migrations/0001_initial.sql", import.meta.url), "utf8"));
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

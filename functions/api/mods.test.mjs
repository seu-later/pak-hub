import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { onRequestPost } from "./import.js";
import { onRequestGet as getMods } from "./mods.js";
import { onRequestGet as getMod } from "./mods/[slug].js";

function setup() {
  const database = new DatabaseSync(":memory:");
  for (const migration of ["0001_initial.sql", "0002_import_state.sql", "0003_discord_posts.sql"]) {
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
    async batch(statements) {
      for (const statement of statements) await statement.run();
    },
  };
  const env = { DB, PAK_HUB_IMPORT_TOKEN: "test-secret", GITHUB_RELEASE_REPO: "owner/pak-assets" };
  const guild = "123456789012345678";
  const channel = "123456789012345679";
  const root = "123456789012345680";
  const reply = "123456789012345681";
  const base = {
    slug: "revolver-sound-replacement",
    mod_source_id: root,
    root_message_id: root,
    root_uploader: "seu",
    root_published_at: "2026-10-08T15:12:00.000Z",
    root_message_url: `https://discord.com/channels/${guild}/${channel}/${root}`,
    root_post_content: "Revolver sound replacement with FAMAS shooting sfx",
    name: "Revolver sound replacement with FAMAS shooting sfx",
    source_channel_id: channel,
    source_thread_id: root,
    source_thread_url: `https://discord.com/channels/${guild}/${root}`,
  };
  const send = async (data) => onRequestPost({
    env,
    request: new Request("https://example.com/api/import", {
      method: "POST",
      headers: { authorization: "Bearer test-secret", "content-type": "application/json" },
      body: JSON.stringify(data),
    }),
  });
  const file = (filename, id, tag) => ({
    filename,
    size_bytes: 1024,
    sha256: id.repeat(64),
    github_asset_id: id,
    github_tag: `pakhub-discord-${tag}`,
    download_url: `https://github.com/owner/pak-assets/releases/download/pakhub-discord-${tag}/${filename}`,
  });
  return { database, env, base, root, reply, send, file, guild, channel };
}

async function importRootAndReply(context) {
  const { base, root, reply, send, file, guild, channel } = context;
  assert.equal((await send({
    ...base,
    source_message_id: root,
    source_message_url: `https://discord.com/channels/${guild}/${channel}/${root}`,
    uploader: "seu",
    post_content: "Revolver sound replacement with FAMAS shooting sfx",
    published_at: "2026-10-08T15:12:00.000Z",
    files: [file("revolverSound.pak", "1", root)],
  })).status, 201);
  assert.equal((await send({
    ...base,
    source_message_id: reply,
    source_message_url: `https://discord.com/channels/${guild}/${root}/${reply}`,
    uploader: "MinerTwo",
    post_content: "Updated sound file",
    published_at: "2026-10-08T15:13:00.000Z",
    files: [file("revolverSoundV2.pak", "2", reply)],
  })).status, 201);
}

test("catalog supports reverse names and file counts across the whole result set", async () => {
  const context = setup();
  await importRootAndReply(context);
  context.database.exec(`INSERT INTO mods (slug, name, root_posted_at) VALUES
    ('alpha', 'Alpha', '2026-10-07T00:00:00.000Z'),
    ('zeta', 'Zeta', '2026-10-09T00:00:00.000Z')`);
  for (const [sort, expected] of [
    ['name-desc', ['zeta', context.base.slug, 'alpha']],
    ['most-files', [context.base.slug, 'alpha', 'zeta']],
    ['fewest-files', ['alpha', 'zeta', context.base.slug]],
  ]) {
    const payload = await (await getMods({ env: context.env,
      request: new Request(`https://example.com/api/mods?sort=${sort}`) })).json();
    assert.deepEqual(payload.mods.map((mod) => mod.slug), expected);
  }
  context.database.close();
});

test("catalog search finds pak filenames and shows the root post sender without release fields", async () => {
  const context = setup();
  await importRootAndReply(context);

  const response = await getMods({
    env: context.env,
    request: new Request("https://example.com/api/mods?q=revolverSoundV2.pak"),
  });
  const payload = await response.json();

  assert.equal(payload.total, 1);
  assert.equal(payload.mods[0].name, "Revolver sound replacement with FAMAS shooting sfx");
  assert.equal(payload.mods[0].postedBy, "seu");
  assert.equal(payload.mods[0].fileCount, 2);
  assert.equal(payload.mods[0].threadFileCount, 1);
  assert.equal("categories" in payload, false);
  assert.equal("latest_version" in payload.mods[0], false);

  const senderResponse = await getMods({
    env: context.env,
    request: new Request("https://example.com/api/mods?q=MinerTwo"),
  });
  assert.equal((await senderResponse.json()).total, 1);

  const linkedResponse = await getMods({
    env: context.env,
    request: new Request("https://example.com/api/mods?slug=revolver-sound-replacement"),
  });
  assert.equal((await linkedResponse.json()).mods[0].slug, "revolver-sound-replacement");
  context.database.close();
});

test("mod details separate initial post files from thread post files and retain each sender", async () => {
  const context = setup();
  await importRootAndReply(context);

  const response = await getMod({ env: context.env, params: { slug: context.base.slug } });
  const payload = await response.json();

  assert.equal(payload.initialPost.postedBy, "seu");
  assert.deepEqual(payload.initialPost.files.map((item) => item.filename), ["revolverSound.pak"]);
  assert.equal(payload.threadPosts.length, 1);
  assert.equal(payload.threadPosts[0].postedBy, "MinerTwo");
  assert.deepEqual(payload.threadPosts[0].files.map((item) => item.filename), ["revolverSoundV2.pak"]);
  assert.equal("releases" in payload, false);
  context.database.close();
});

test("mod details keep the parent post when its first pak appears in a thread", async () => {
  const context = setup();
  const { base, root, reply, send, file, guild, channel } = context;
  assert.equal((await send({
    ...base,
    root_posted_at: "2026-10-08T15:12:00.000Z",
    source_message_id: reply,
    source_message_url: `https://discord.com/channels/${guild}/${root}/${reply}`,
    uploader: "MinerTwo",
    post_content: "First pak upload",
    published_at: "2026-10-08T15:13:00.000Z",
    files: [file("threadOnly.pak", "3", reply)],
  })).status, 201);

  const response = await getMod({ env: context.env, params: { slug: context.base.slug } });
  const payload = await response.json();

  assert.equal(payload.initialPost.postedBy, "seu");
  assert.equal(payload.initialPost.content, "Revolver sound replacement with FAMAS shooting sfx");
  assert.deepEqual(payload.initialPost.files, []);
  assert.equal(payload.threadPosts.length, 1);
  assert.equal(payload.threadPosts[0].postedBy, "MinerTwo");
  assert.deepEqual(payload.threadPosts[0].files.map((item) => item.filename), ["threadOnly.pak"]);
  context.database.close();
});

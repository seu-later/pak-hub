import test from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "./_middleware.js";
import { snapshotResponse } from "../_lib/catalog-snapshot.js";
import { onRequestGet as download } from "./dump-file/[key].js";

const request = (path) => new Request(`https://example.com${path}`);
const quota = () => new Response('{"error":"Unavailable"}', { status: 503 });

test("snapshot honors reverse names and both file-count directions on both catalogs", async () => {
  for (const [path, key] of [["mods", "mods"], ["dump", "groups"]]) {
    const descending = await snapshotResponse(request(`/api/${path}?sort=name-desc`)).json();
    const lower = (name) => name.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
    assert.ok(descending[key].every((row, index, rows) => !index || lower(rows[index - 1].name) >= lower(row.name)));
    for (const sort of ["most-files", "fewest-files"]) {
      const payload = await snapshotResponse(request(`/api/${path}?sort=${sort}`)).json();
      assert.ok(payload[key].every((row, index, rows) => !index ||
        (sort === "most-files" ? rows[index - 1].fileCount >= row.fileCount : rows[index - 1].fileCount <= row.fileCount)));
    }
  }
});

test("database failure preserves public catalog browsing, search and post details", async () => {
  const response = await onRequest({ request: request("/api/mods?q=LootSansSummerName.pak"), next: async () => quota() });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-pakhub-catalog-source"), "snapshot");
  const data = await response.json();
  assert.ok(data.mods.length > 0);
  const detail = await onRequest({ request: request(`/api/mods/${data.mods[0].slug}`), next: async () => quota() });
  const post = await detail.json();
  assert.ok(post.initialPost.content.includes("**Why?**"));
  assert.ok(post.threadPosts.length > 0);
  assert.ok(post.initialPost.files[0].downloadUrl.startsWith("https://github.com/"));
});

test("snapshot paging and sorting retain counts and do not overlap pages", async () => {
  const first = await snapshotResponse(request("/api/mods?sort=name&page=1")).json();
  const second = await snapshotResponse(request("/api/mods?sort=name&page=2")).json();
  assert.equal(first.mods.length, 48);
  assert.equal(first.total, second.total);
  assert.ok(second.mods.every((mod) => !first.mods.some((item) => item.slug === mod.slug)));
  const newest = await snapshotResponse(request("/api/dump?sort=newest")).json();
  const oldest = await snapshotResponse(request("/api/dump?sort=oldest")).json();
  assert.notEqual(newest.groups[0].name, oldest.groups[0].name);
});

test("cached catalog reads avoid querying D1 again; mutations and errors are not cached", async () => {
  const stored = new Map();
  const original = globalThis.caches;
  globalThis.caches = { default: {
    match: async (key) => stored.get(key.url)?.clone(),
    put: async (key, value) => { stored.set(key.url, value); },
  } };
  let reads = 0;
  try {
    const context = { request: request("/api/mods?page=1"), next: async () => { reads += 1; return new Response('{"mods":[]}'); } };
    await onRequest(context);
    await onRequest(context);
    assert.equal(reads, 1);
    assert.equal(stored.size, 1);
    await onRequest({ request: new Request("https://example.com/api/import", { method: "POST" }), next: async () => quota() });
    assert.equal(stored.size, 1);
    const missing = await onRequest({ request: request("/api/mods/not-in-snapshot"), next: async () => quota() });
    assert.equal(missing.status, 503);
    assert.equal(stored.size, 1);
  } finally {
    if (original === undefined) delete globalThis.caches;
    else globalThis.caches = original;
  }
});

test("snapshot dump links expose only the public Discord server and support downloads during quota exhaustion", async () => {
  const data = await snapshotResponse(request("/api/dump?sort=name")).json();
  for (const group of data.groups) for (const file of group.files) {
    assert.ok(!file.sourceUrl || file.sourceUrl.startsWith("https://discord.com/channels/878318716801155233/"));
    assert.equal(file.source_guild, undefined);
  }
  const file = data.groups[0].files[0];
  const key = file.downloadUrl.split("/").at(-1);
  const response = await download({ params: { key }, env: {
    DB: { prepare() { throw new Error("D1 daily read limit exceeded"); } },
    DUMP: { get: async () => ({ body: new Uint8Array([1, 2, 3]), size: 3 }) },
  } });
  assert.equal(response.status, 200);
  assert.ok(response.headers.get("content-disposition").includes(file.filename));
});

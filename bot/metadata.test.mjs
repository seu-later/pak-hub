import test from "node:test";
import assert from "node:assert/strict";
import { pakAttachments, parsePostMetadata, selectReleaseAsset, slugify, uniqueAssetName } from "./metadata.mjs";

test("uses the root post title and summary without interpreting category or version fields", () => {
  const root = { content: "Cool Mod\nCreator: ModMaker\nCategory: Visuals\nSummary: Clear colors" };
  const post = parsePostMetadata(root);

  assert.deepEqual(post, { name: "Cool Mod", summary: "Clear colors" });
});

test("uses a thread name when the root has no title and filters non-pack files", () => {
  const root = { content: "Creator: ModMaker\nCategory: Visuals" };
  const post = parsePostMetadata(root, "Cool Mod thread");
  const attachments = new Map([
    ["a", { name: "mod.PAK" }],
    ["b", { name: "skinpack.zip" }],
    ["c", { name: "readme.txt" }],
  ]);

  assert.equal(post.name, "Cool Mod thread");
  assert.equal("category" in post, false);
  assert.equal("version" in post, false);
  assert.deepEqual(pakAttachments({ attachments }).map((attachment) => attachment.name), ["mod.PAK", "skinpack.zip"]);
});

test("keeps a thread's mod slug stable and disambiguates duplicate release names", () => {
  const rootId = "123456789012345678";
  const first = slugify("Cool Mod", rootId);
  const second = slugify("Cool Mod", rootId);

  assert.equal(first, second);
  assert.equal(uniqueAssetName("same.pak", 0, "a".repeat(64), new Set()), "same.pak");
  assert.equal(uniqueAssetName("same.pak", 1, "b".repeat(64), new Set()), "same-2.pak");
  assert.equal(uniqueAssetName("skinpack.zip", 0, "d".repeat(64), new Set()), "skinpack.zip");
  assert.equal(uniqueAssetName("Café same file?.pak", 0, "c".repeat(64), new Set()), "Cafe-same-file.pak");
  assert.equal(uniqueAssetName("same.pak", 0, "a".repeat(64), new Set(["same.pak"])), `same-${"a".repeat(10)}.pak`);
  assert.equal(uniqueAssetName("same.pak", 0, "a".repeat(64), new Set(["same.pak", `same-${"a".repeat(10)}.pak`])), `same-${"a".repeat(10)}.pak`);
});

test("reuses the same GitHub asset on retry and gives changed bytes a stable name", () => {
  const firstHash = "a".repeat(64);
  const changedHash = "b".repeat(64);
  const firstAsset = { name: "same.pak", digest: `sha256:${firstHash}` };

  assert.equal(selectReleaseAsset("same.pak", 0, firstHash, [firstAsset]).asset, firstAsset);

  const changed = selectReleaseAsset("same.pak", 0, changedHash, [firstAsset]);
  assert.equal(changed.uploadName, `same-${changedHash.slice(0, 10)}.pak`);
  assert.equal(changed.asset, null);
  assert.equal(selectReleaseAsset("same.pak", 0, changedHash, [firstAsset, {
    name: changed.uploadName,
    digest: `sha256:${changedHash}`,
  }]).uploadName, changed.uploadName);
});

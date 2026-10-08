import test from "node:test";
import assert from "node:assert/strict";
import { pakAttachments, parseReleaseMetadata, selectReleaseAsset, slugify, uniqueAssetName } from "./metadata.mjs";

test("uses only explicit version text and keeps exact labels", () => {
  const root = { content: "Cool Mod\nCreator: ModMaker\nCategory: Visuals\nSummary: Clear colors" };
  const release = parseReleaseMetadata({ content: "Version: 1.4 beta" }, root);

  assert.equal(release.version, "1.4 beta");
  assert.equal(release.name, "Cool Mod");
  assert.equal(release.creator, "ModMaker");
  assert.equal(release.category, "Visuals");
  assert.equal(release.summary, "Clear colors");
});

test("keeps unlabeled versions unversioned and filters non-pak files", () => {
  const root = { content: "Cool Mod" };
  const release = parseReleaseMetadata({ content: "Build 7.1 is ready" }, root);
  const attachments = new Map([
    ["a", { name: "mod.PAK" }],
    ["b", { name: "readme.txt" }],
  ]);

  assert.equal(release.version, "Unversioned");
  assert.deepEqual(pakAttachments({ attachments }).map((attachment) => attachment.name), ["mod.PAK"]);
});

test("keeps a thread's mod slug stable and disambiguates duplicate release names", () => {
  const rootId = "123456789012345678";
  const first = slugify("Cool Mod", rootId);
  const second = slugify("Cool Mod", rootId);

  assert.equal(first, second);
  assert.equal(uniqueAssetName("same.pak", 0, "a".repeat(64), new Set()), "same.pak");
  assert.equal(uniqueAssetName("same.pak", 1, "b".repeat(64), new Set()), "same-2.pak");
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

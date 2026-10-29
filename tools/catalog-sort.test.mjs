import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

for (const [file, rows, key, selected, saved] of [
  ["app.js", "mods", "slug", "selectedSlug", "selectedMod"],
  ["dump.js", "groups", "name", "selectedKey", "selectedGroup"],
]) {
  test(`${file} keeps the selected preview when sorting moves it outside the first page`, () => {
    const previous = { [key]: "previous" };
    const detail = { initialPost: { content: "keep this preview" } };
    const state = { [rows]: [{ [key]: "next" }], [selected]: "previous", [saved]: previous,
      detail, detailStatus: "ready", detailRequest: 0 };
    const context = vm.createContext({ state, cancelDetailRequest() {}, groupKey: (group) => group.name.toLowerCase() });
    const source = readFileSync(new URL(`../public/${file}`, import.meta.url), "utf8");
    const start = source.indexOf("function ensureSelection(");
    vm.runInContext(source.slice(start, source.indexOf("\nfunction renderArchiveState", start)), context);
    assert.equal(context.ensureSelection(true), false);
    assert.equal(state[selected], "previous");
    assert.equal(state[saved], previous);
    assert.equal(state.detail, detail);
    assert.equal(context.ensureSelection(), true);
    assert.equal(state[selected], "next");
  });
}

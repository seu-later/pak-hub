import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Execute the shipped selection handlers with their browsing dependencies stubbed.
function setup() {
  let enabled = true;
  const scrolls = [];
  const context = vm.createContext({
    reducedMotion: false,
    window: { PakHubMotion: { motionEnabled: () => enabled }, matchMedia: () => ({ matches: true }) },
    state: { mods: [{ slug: "a", name: "A" }, { slug: "b", name: "B" }], selectedSlug: null, detailStatus: "ready" },
    elements: { detailPanel: { scrollIntoView: (options) => scrolls.push(options.behavior) }, rows: { addEventListener(type, handler) { context.click = handler; } } },
    markSeen() {}, renderSelectionState() {}, loadDetails() {}, announce() {}, previewGroup() {},
  });
  return { context, scrolls, reduce: () => { enabled = false; } };
}

for (const sameSelection of [false, true]) {
  test(`Pak List ${sameSelection ? "same" : "new"} selection reads a changed motion preference`, () => {
    const site = setup();
    const source = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
    const start = source.indexOf("function previewMod(");
    vm.runInContext(source.slice(start, source.indexOf("\nlet loadObserver", start)), site.context);
    site.context.previewMod("a", { scroll: true });
    site.reduce();
    site.context.previewMod(sameSelection ? "a" : "b", { scroll: true });
    assert.deepEqual(site.scrolls, ["smooth", "auto"]);
  });
}

test("Pak Dump mobile selection reads the current motion preference", () => {
  const site = setup();
  const source = readFileSync(new URL("../public/dump.js", import.meta.url), "utf8");
  const start = source.indexOf('elements.rows.addEventListener("click"');
  vm.runInContext(source.slice(start, source.indexOf("\nelements.loadMore", start)), site.context);
  const event = { target: { closest: () => ({ dataset: { action: "select-group", key: "a" } }) } };
  site.context.click(event); site.reduce(); site.context.click(event);
  assert.deepEqual(site.scrolls, ["smooth", "auto"]);
});

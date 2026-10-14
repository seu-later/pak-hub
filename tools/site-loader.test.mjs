import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function setup(loading = false) {
  let now = 0;
  const frames = [];
  const timers = [];
  const classes = () => {
    const values = new Set();
    return { add: (name) => values.add(name), remove: (name) => values.delete(name), contains: (name) => values.has(name) };
  };
  const loader = { isConnected: true, hidden: true, classList: classes(), querySelector: () => null, remove() { this.isConnected = false; } };
  const count = { textContent: "0%" };
  const line = { style: {} };
  const track = { style: { setProperty() {} } };
  const shell = { inert: false };
  const elements = { "site-loader": loader, "site-loader-count": count, "site-loader-line": line, "app-shell": shell };
  const document = { readyState: "complete", images: [], body: { classList: classes() }, getElementById: (id) => elements[id] || null,
    querySelector: (selector) => selector === ".app-shell" ? shell : selector === ".site-loader-track" ? track : selector === "#mod-rows, #dump-rows" && loading ? {} : null, addEventListener() {} };
  const window = { matchMedia: () => ({ matches: false, addEventListener() {} }), addEventListener() {},
    requestAnimationFrame: (fn) => frames.push(fn), setTimeout: (fn, delay) => timers.push({ fn, at: now + delay }) };
  vm.runInNewContext(readFileSync(new URL("../public/site-motion.js", import.meta.url), "utf8"), {
    document, window, performance: { now: () => now }, sessionStorage: { getItem: () => "1", setItem() {} },
  });
  function advance(target, interval = 16) {
    while (now < target) {
      now = Math.min(target, now + interval);
      frames.splice(0).forEach((fn) => fn(now));
      timers.filter((timer) => timer.at <= now).forEach((timer) => { timers.splice(timers.indexOf(timer), 1); timer.fn(); });
    }
  }
  return { loader, shell, document, count, line, advance, motion: window.PakHubMotion };
}

test("full page loads show zero, a readable build, and a gradual exit even after a previous visit", () => {
  const site = setup();
  assert.equal(site.loader.hidden, false);
  assert.equal(site.shell.inert, true);
  site.advance(180, 4);
  assert.equal(site.count.textContent, "0%");
  site.advance(1200, 4);
  assert.ok(parseInt(site.count.textContent) > 30 && parseInt(site.count.textContent) < 65);
  assert.equal(site.loader.isConnected, true);
  site.advance(2600, 4);
  assert.equal(site.count.textContent, "100%");
  assert.equal(site.loader.classList.contains("is-leaving"), true);
  assert.equal(site.loader.isConnected, true);
  site.advance(3100, 4);
  assert.equal(site.loader.isConnected, false);
  assert.equal(site.shell.inert, false);
});

test("ready pages begin their terminal reveal before three seconds", () => {
  const site = setup();
  site.advance(2800, 4);
  assert.equal(site.loader.classList.contains("is-leaving"), true);
});

test("loading progress is consistent across 30 and 240 fps", () => {
  const slow = setup(); const fast = setup();
  slow.advance(1600, 1000 / 30); fast.advance(1600, 1000 / 240);
  assert.ok(Math.abs(parseFloat(slow.line.style.width) - parseFloat(fast.line.style.width)) < 1);
});

test("the loader waits for the catalog and still has a bounded timeout", () => {
  const waiting = setup(true);
  waiting.advance(4000);
  assert.ok(parseInt(waiting.count.textContent) < 100);
  assert.equal(waiting.loader.classList.contains("is-leaving"), false);
  waiting.motion.catalogReady(); waiting.advance(6200);
  assert.equal(waiting.loader.isConnected, false);
  const failed = setup(true);
  failed.advance(8000);
  assert.equal(failed.loader.isConnected, false);
});

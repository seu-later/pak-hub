import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

class Element {
  constructor() {
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.animations = [];
    this.classList = { add() {}, remove() {}, toggle() {} };
    this.scrollTop = 0;
  }
  get parentElement() { return this.parent; }
  get lastElementChild() { return this.children.at(-1); }
  append(child) { child.parent = this; this.children.push(child); }
  replaceChildren(...children) { this.children.forEach((e) => { e.parent = null; }); this.children = []; children.forEach((e) => this.append(e)); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter((e) => e !== this); this.parent = null; }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  contains(target) { return this === target || this.children.some((e) => e.contains(target)); }
  querySelectorAll() { return []; }
  getAnimations() { return this.animations; }
  animate(frames, options) {
    let finish;
    const animation = { frames, options, cancelled: false, finished: new Promise((resolve) => { finish = resolve; }), finish: () => finish(), cancel() { this.cancelled = true; } };
    this.animations.push(animation);
    return animation;
  }
}

function setup(reduced = false, desktop = false, fixtures = {}) {
  const panel = new Element();
  const scrollPanel = new Element(); scrollPanel.append(panel);
  const events = [];
  const document = { documentElement: new Element(), body: new Element(), images: [], activeElement: null, getElementById: () => null, querySelector: (selector) => fixtures[selector] || null, querySelectorAll: () => [], addEventListener() {}, dispatchEvent(event) { events.push(event); } };
  const lenisOptions = [];
  const window = { location: { search: "", protocol: "https:", hostname: "example.com" }, matchMedia: (query) => ({ matches: query.includes("reduce") ? reduced : desktop, addEventListener() {} }), Lenis: class { constructor(options) { lenisOptions.push(options); } }, addEventListener() {}, requestAnimationFrame: (fn) => fn(), setTimeout, clearTimeout };
  const context = vm.createContext({ window, document, URLSearchParams, Promise, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } }, performance, sessionStorage: { getItem: () => "1" } });
  vm.runInContext(readFileSync(new URL("../public/site-motion.js", import.meta.url), "utf8"), context);
  const swap = window.PakHubMotion.swapPreview;
  return { panel, scrollPanel, document, events, lenisOptions, motion: window.PakHubMotion, swap: (next, key) => swap(panel, next, key) };
}

test("sort underline travels on hover and returns to the pressed choice", () => {
  const handlers = {};
  const active = new Element();
  const hovered = new Element();
  const indicator = new Element();
  active.getBoundingClientRect = () => ({ left: 10, width: 36 });
  hovered.getBoundingClientRect = () => ({ left: 76, width: 57 });
  indicator.classList.add = () => {};
  const group = new Element();
  group.getBoundingClientRect = () => ({ left: 0, width: 150 });
  group.querySelector = (selector) => selector === ".sort-indicator" ? indicator : active;
  group.addEventListener = (type, handler) => { handlers[type] = handler; };
  group.contains = (element) => element === active || element === hovered;
  hovered.closest = () => hovered;
  setup(false, false, { ".sort-controls": group });
  handlers.pointerover({ target: hovered });
  assert.equal(indicator.style.transform, "translateX(76px) scaleX(57)");
  handlers.pointerleave();
  assert.equal(indicator.style.transform, "translateX(10px) scaleX(36)");
});

test("outgoing preview stays hidden and cannot receive interaction while the slice opens", () => {
  const { panel, swap } = setup();
  const old = new Element();
  swap(old, "a");
  swap(new Element(), "b");
  assert.equal(old.inert, true);
  assert.equal(old.attributes["aria-hidden"], "true");
  assert.equal(old.animations[0].options.fill, "forwards");
  assert.equal(panel.children.length, 2);
});

test("rapid preview changes discard older layers and stale completion cannot remove the latest", async () => {
  const { panel, swap } = setup();
  const first = new Element(); const second = new Element(); const last = new Element();
  swap(first, "a"); swap(second, "b"); swap(last, "c");
  assert.equal(panel.children.length, 2);
  assert.equal(panel.lastElementChild, last);
  first.animations.forEach((a) => a.finish());
  second.animations.forEach((a) => a.finish());
  await Promise.resolve(); await Promise.resolve();
  assert.equal(panel.lastElementChild, last);
  last.animations.forEach((a) => a.finish());
  await Promise.resolve(); await Promise.resolve();
  assert.equal(panel.children.length, 1);
});

test("same selection updates content without replaying or resetting the panel scroll", () => {
  const { panel, scrollPanel, swap } = setup();
  swap(new Element(), "a"); scrollPanel.scrollTop = 140;
  const updated = new Element(); swap(updated, "a");
  assert.equal(panel.lastElementChild, updated);
  assert.equal(updated.animations.length, 0);
  assert.equal(scrollPanel.scrollTop, 140);
});

test("browser reduced motion preserves the animated preview reveal", () => {
  const { panel, swap, motion } = setup(true);
  swap(new Element(), "a"); const next = new Element(); swap(next, "b");
  assert.equal(motion.motionEnabled(), true);
  assert.equal(panel.children.length, 2);
  assert.equal(panel.lastElementChild, next);
  assert.equal(next.animations[0].options.duration, 360);
});

test("desktop smooth scrolling overrides the browser reduced-motion preference", () => {
  const { lenisOptions } = setup(true, true);
  assert.equal(lenisOptions.length, 1);
  assert.equal(lenisOptions[0].respectReducedMotion, false);
});

test("accepted initial selection notifies the city even without a preview transition", () => {
  const { motion, events } = setup();
  motion.select("first");
  assert.equal(motion.selectionKey, "first");
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "pakhub:selection");
  assert.equal(events[0].detail.key, "first");
});

test("same-item refresh does not pulse the city again; clearing allows reselection", () => {
  const { motion, events } = setup();
  motion.select("first"); motion.select("first"); motion.select(null); motion.select("first");
  assert.equal(events.length, 3);
  assert.equal(events[1].detail.key, null);
});

test("accepted selection remains current while animating under browser reduced motion", () => {
  const { motion, events, swap, panel } = setup(true);
  motion.select("a"); swap(new Element(), "a");
  motion.select("b"); swap(new Element(), "b");
  assert.equal(events.length, 2);
  assert.equal(motion.selectionKey, "b");
  assert.equal(panel.children.length, 2);
  assert.equal(panel.lastElementChild.animations.length, 1);
});

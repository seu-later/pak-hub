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
  replaceWith(next) { const index = this.parent.children.indexOf(this); this.parent.children[index] = next; next.parent = this.parent; this.parent = null; }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  contains(target) { return this === target || this.children.some((e) => e.contains(target)); }
  addEventListener(type, handler) { (this.handlers ||= {})[type] ||= []; this.handlers[type].push(handler); }
  dispatchEvent(event) { this.handlers?.[event.type]?.forEach((handler) => handler(event)); }
  querySelectorAll() { return []; }
  getAnimations() { return this.animations; }
  animate(frames, options) {
    let finish;
    const animation = { frames, options, cancelled: false, finished: new Promise((resolve) => { finish = resolve; }), finish: () => finish(), cancel() { this.cancelled = true; } };
    this.animations.push(animation);
    return animation;
  }
}

function setup(reduced = false, desktop = false, fixtures = {}, options = {}) {
  const panel = new Element();
  const scrollPanel = new Element(); scrollPanel.append(panel);
  const events = [];
  const document = { documentElement: new Element(), body: new Element(), images: [], activeElement: null, getElementById: () => null, createElement: () => new Element(), querySelector: (selector) => fixtures[selector] || null, querySelectorAll: () => [], addEventListener() {}, dispatchEvent(event) { events.push(event); } };
  const lenisOptions = [];
  const window = { location: options.location || { search: "", protocol: "https:", hostname: "example.com" }, gsap: options.gsap, matchMedia: (query) => ({ matches: query.includes("reduce") ? reduced : desktop, addEventListener() {} }), Lenis: class { constructor(options) { lenisOptions.push(options); } }, addEventListener() {}, requestAnimationFrame: (fn) => fn(), setTimeout, clearTimeout };
  Object.assign(window, { fetch: options.fetch, DOMParser: options.DOMParser, history: options.history });
  const context = vm.createContext({ window, document, URL, URLSearchParams, Promise, CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } }, performance, sessionStorage: options.storage || { getItem: () => "1" } });
  vm.runInContext(readFileSync(new URL("../public/site-motion.js", import.meta.url), "utf8"), context);
  const swap = window.PakHubMotion.swapPreview;
  return { panel, scrollPanel, document, window, events, lenisOptions, motion: window.PakHubMotion, swap: (next, key) => swap(panel, next, key) };
}

test("row reordering uses prior positions and cancels interrupted motion", async () => {
  const { motion } = setup();
  const row = (slug, top) => {
    const button = new Element();
    button.dataset.slug = slug;
    button.getBoundingClientRect = () => ({ left: 0, top });
    return button;
  };
  const container = new Element();
  const classes = new Set();
  container.classList = { add: (name) => classes.add(name), remove: (name) => classes.delete(name) };
  container.buttons = [row("a", 0), row("b", 50)];
  container.querySelectorAll = () => container.buttons;
  container.replaceChildren = (buttons) => { container.buttons = buttons; };
  const first = [row("b", 0), row("a", 50)];
  motion.replaceRows(container, first, true);
  assert.equal(first[0].animations[0].frames[0].transform, "translate(0px, 50px)");
  assert.equal(first[1].animations[0].options.duration, 240);
  const latest = [row("a", 0), row("b", 50)];
  motion.replaceRows(container, latest, true);
  assert.ok(first.every((button) => button.animations[0].cancelled));
  first.forEach((button) => button.animations[0].finish());
  await Promise.resolve();
  assert.ok(classes.has("rows-reordering"));
  latest.forEach((button) => button.animations[0].finish());
  await Promise.resolve();
  assert.ok(!classes.has("rows-reordering"));
});

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

test("page reveal survives Cloudflare's .html to extensionless redirect", () => {
  const revealCalls = [];
  const nav = new Element(); nav.addEventListener = () => {}; nav.querySelector = () => null;
  const main = new Element();
  const { document } = setup(false, false, { ".primary-nav": nav, main }, {
    location: { href: "https://example.com/about", origin: "https://example.com", search: "" },
    storage: { getItem: (key) => key === "pak-hub-route-target" ? "https://example.com/about.html" : "1", removeItem() {} },
    gsap: { fromTo(...args) { revealCalls.push(args); } },
  });
  assert.equal(revealCalls.length, 2);
  assert.equal(document.body.children[0].className, "route-signal");
  assert.ok(revealCalls.every(([, , end]) => end.duration <= 0.25));
  const [, start, end] = revealCalls.find(([target]) => target === main);
  assert.equal(start.filter, undefined);
  assert.equal(end.filter, undefined);
});

test("nav starts the next page within one short signal beat", () => {
  const handlers = {};
  const tweens = [];
  const nav = new Element(); nav.addEventListener = (type, handler) => { handlers[type] = handler; }; nav.querySelector = () => null;
  const main = new Element();
  const link = new Element();
  link.href = "https://example.com/about.html";
  link.closest = () => link;
  link.hasAttribute = () => false;
  link.getBoundingClientRect = () => ({ left: 100, width: 40 });
  nav.contains = (element) => element === link;
  const timeline = {
    fromTo(target, start, end, at = 0) { tweens.push({ target, start, end, duration: end.duration, at }); return this; },
    to(target, end, at = 0) { tweens.push({ target, end, duration: end.duration, at }); return this; },
  };
  setup(false, false, { ".primary-nav": nav, main }, {
    location: { href: "https://example.com/", origin: "https://example.com", assign() {} },
    storage: { getItem: () => null, removeItem() {}, setItem() {} },
    gsap: { timeline: () => timeline },
  });
  handlers.click({ target: link, button: 0, preventDefault() {} });
  assert.ok(Math.max(...tweens.map(({ duration, at }) => duration + at)) <= 0.22);
  assert.ok(tweens.filter(({ target }) => target === main).every(({ end }) => end.filter === undefined));
});

test("clicked nav target stays selected through pointer and focus changes during exit", () => {
  const nav = new Element();
  const indicator = new Element();
  const current = new Element();
  const destination = new Element();
  nav.append(current); nav.append(destination);
  nav.getBoundingClientRect = () => ({ left: 0, width: 240 });
  current.getBoundingClientRect = () => ({ left: 10, width: 60 });
  destination.getBoundingClientRect = () => ({ left: 150, width: 50 });
  current.closest = () => current; destination.closest = () => destination;
  destination.href = "https://example.com/about.html";
  destination.hasAttribute = () => false;
  nav.querySelector = (selector) => selector === ".nav-indicator" ? indicator : current;
  const calls = [];
  const timeline = { fromTo() { return this; }, to() { return this; } };
  setup(false, false, { ".primary-nav": nav, main: new Element() }, {
    location: { href: "https://example.com/", origin: "https://example.com", assign() {} },
    storage: { getItem: () => null, removeItem() {}, setItem() {} },
    gsap: { killTweensOf() {}, to(target, vars) { if (target === indicator) calls.push(vars); }, timeline: () => timeline },
  });
  nav.dispatchEvent({ type: "pointerover", target: destination });
  nav.dispatchEvent({ type: "click", target: destination, button: 0, preventDefault() {} });
  const committedCalls = calls.length;
  nav.dispatchEvent({ type: "pointerleave" });
  nav.dispatchEvent({ type: "focusout", relatedTarget: null });
  nav.dispatchEvent({ type: "pointerover", target: current });
  nav.dispatchEvent({ type: "focusin", target: current });
  assert.equal(calls.length, committedCalls);
  assert.equal(calls.at(-1).x, 150);
  assert.ok(calls.at(-1).duration <= 0.2);
});

test("navigation swaps only page content and reuses cached pages without a document load", async () => {
  const shell = new Element();
  const scene = new Element();
  const main = new Element(); main.id = "catalog";
  const next = new Element(); next.id = "about";
  const nav = new Element(); nav.querySelector = () => null;
  const link = new Element(); link.href = "https://example.com/about.html"; link.closest = () => link; link.hasAttribute = () => false;
  nav.append(link); shell.append(scene); shell.append(nav); shell.append(main);
  let complete;
  let requests = 0;
  let documentLoads = 0;
  const routes = [];
  const timeline = { fromTo() { return this; }, to() { return this; } };
  setup(false, false, { ".primary-nav": nav, main }, {
    location: { href: "https://example.com/", origin: "https://example.com", assign() { documentLoads += 1; } },
    fetch: async () => { requests += 1; return { ok: true, text: async () => "about" }; },
    DOMParser: class { parseFromString() { return { title: "About", body: { className: "view-about" }, querySelector: (selector) => selector === "main" ? next : nav, querySelectorAll: () => [] }; } },
    history: { pushState(state, title, url) { routes.push(url); } },
    storage: { getItem: () => null, removeItem() {} },
    gsap: { timeline(options) { complete = options.onComplete; return timeline; }, fromTo() {} },
  });
  nav.dispatchEvent({ type: "click", target: link, button: 0, preventDefault() {} });
  await complete();
  assert.equal(documentLoads, 0);
  assert.equal(requests, 1);
  assert.equal(shell.children[0], scene);
  assert.equal(shell.children[1], nav);
  assert.equal(shell.lastElementChild, next);
  assert.equal(routes.at(-1), link.href);
  link.href = "https://example.com/index.html";
  nav.dispatchEvent({ type: "click", target: link, button: 0, preventDefault() {} });
  await complete();
  assert.equal(requests, 1);
  assert.equal(shell.lastElementChild, main);
  assert.equal(shell.children[0], scene);
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

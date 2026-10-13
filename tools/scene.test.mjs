import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  emit(type, event = {}) { this.listeners.get(type)?.forEach((fn) => fn(event)); }
  count() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
}

async function setup() {
  const window = new Events();
  window.devicePixelRatio = 2;
  window.scrollY = 0;
  window.matchMedia = () => ({ matches: true });
  const document = new Events();
  document.hidden = false;
  document.documentElement = { scrollHeight: 2400 };
  document.getElementById = () => null;
  const classes = new Set();
  const host = { clientWidth: 1440, clientHeight: 900, dataset: {}, children: [], append(el) { this.children.push(el); }, parentElement: { classList: { add: (x) => classes.add(x), remove: (x) => classes.delete(x) } } };
  const resources = [];
  class Resource { constructor(values = {}) { Object.assign(this, values); resources.push(this); } dispose() { this.disposed = true; } }
  const vector = () => ({ set(...values) { this.values = values; } });
  class Mesh { constructor(geometry, material) { this.geometry = geometry; this.material = material; this.position = vector(); this.scale = vector(); } }
  let renderer;
  class Renderer extends Resource {
    constructor() {
      super(); renderer = this; this.renders = 0; this.domElement = new Events();
      this.domElement.remove = () => { host.children = host.children.filter((x) => x !== this.domElement); };
    }
    setClearColor() {}
    setPixelRatio(value) { this.ratio = value; }
    setSize(width, height) { this.size = [width, height]; }
    render() { this.renders += 1; }
  }
  class BufferGeometry extends Resource {
    constructor() { super(); this.attributes = {}; }
    setAttribute(name, value) { this.attributes[name] = value; }
  }
  const THREE = {
    WebGLRenderer: Renderer, SRGBColorSpace: "srgb", Scene: class { add() {} },
    OrthographicCamera: class { constructor() { this.position = {}; } updateProjectionMatrix() {} },
    PlaneGeometry: Resource, ShaderMaterial: Resource, MeshBasicMaterial: Resource, Mesh,
    BufferGeometry, BufferAttribute: class { constructor(array) { this.array = array; } },
    LineBasicMaterial: Resource, LineSegments: Mesh,
    TextureLoader: class { async loadAsync() { return new Resource(); } },
  };
  let time = 0;
  let enabled = true;
  let id = 0;
  const frames = new Map();
  const context = vm.createContext({ THREE, window, document, Float32Array, performance: { now: () => time }, requestAnimationFrame: (fn) => { frames.set(++id, fn); return id; }, cancelAnimationFrame: (key) => frames.delete(key) });
  const source = readFileSync(new URL("../public/scene.js", import.meta.url), "utf8").replace(/^import .*;\r?\n/, "").replace("export function", "function");
  vm.runInContext(source, context);
  const controller = context.initializeScene(host, () => enabled);
  for (let i = 0; i < 6; i += 1) await Promise.resolve();
  const step = () => { time += 16; const work = [...frames.values()]; frames.clear(); work.forEach((fn) => fn(time)); };
  return { host, window, document, resources, renderer, controller, classes, frames, step, disable: () => { enabled = false; } };
}

test("city settles to zero pending frames and obeys the drawing-buffer cap", async () => {
  const site = await setup();
  for (let i = 0; i < 150; i += 1) site.step();
  assert.equal(site.host.dataset.sceneState, "idle");
  assert.equal(site.frames.size, 0);
  assert.ok(site.renderer.ratio ** 2 * 1440 * 900 <= 2400001);
  assert.ok(site.renderer.renders > 0);
});

test("hidden city does not render; reduced motion prevents pointer wakeups", async () => {
  const site = await setup();
  site.document.hidden = true;
  site.document.emit("visibilitychange");
  const rendered = site.renderer.renders;
  site.window.emit("pointermove", { clientX: 900, clientY: 300 });
  site.step();
  assert.equal(site.renderer.renders, rendered);
  assert.equal(site.frames.size, 0);
  site.document.hidden = false; site.disable();
  site.window.emit("pointermove", { clientX: 100, clientY: 100 });
  site.step();
  assert.equal(site.renderer.renders, rendered);
});

test("scene disposal removes canvas, listeners, observer resources and late wakeups", async () => {
  const site = await setup();
  site.controller.stop(); site.controller.stop();
  assert.equal(site.host.children.length, 0);
  assert.equal(site.window.count(), 0);
  assert.equal(site.document.count(), 0);
  assert.equal(site.frames.size, 0);
  assert.equal(site.classes.has("scene-ready"), false);
  assert.ok(site.resources.every((resource) => resource.disposed));
  site.window.emit("pointermove", { clientX: 1, clientY: 1 });
  assert.equal(site.frames.size, 0);
});

test("context loss restores the static city fallback without another render", async () => {
  const site = await setup();
  let prevented = false;
  site.renderer.domElement.emit("webglcontextlost", { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(site.host.dataset.sceneState, "static");
  assert.equal(site.host.children.length, 0);
  assert.equal(site.frames.size, 0);
});

test("bfcache page suspension resumes one scene without duplicating the canvas", async () => {
  const site = await setup();
  site.window.emit("pagehide", { persisted: true });
  const rendered = site.renderer.renders;
  site.step(); assert.equal(site.renderer.renders, rendered);
  site.window.emit("pageshow"); site.step();
  assert.ok(site.renderer.renders > rendered);
  assert.equal(site.host.children.length, 1);
});

test("navigation preserves the last painted city until the document is replaced", async () => {
  const site = await setup();
  site.step();
  site.window.emit("pagehide", { persisted: false });
  const rendered = site.renderer.renders;
  site.step();
  assert.equal(site.host.children.length, 1);
  assert.equal(site.classes.has("scene-ready"), true);
  assert.equal(site.renderer.disposed, undefined);
  assert.equal(site.renderer.renders, rendered);
});

test("the static city stays visible until the first WebGL frame is painted", async () => {
  const site = await setup();
  assert.equal(site.classes.has("scene-ready"), false);
  site.step();
  assert.equal(site.classes.has("scene-ready"), true);
  assert.ok(site.renderer.renders > 0);
});

test("losing motion during a pending frame disposes the active scene", async () => {
  const site = await setup();
  site.disable(); site.step();
  assert.equal(site.host.children.length, 0);
  assert.equal(site.host.dataset.sceneState, "static");
  assert.equal(site.window.count(), 0);
});

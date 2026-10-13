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

async function setup(savedPosition = null) {
  const window = new Events();
  window.devicePixelRatio = 2;
  window.scrollY = 0;
  window.innerWidth = 1440; window.innerHeight = 900;
  window.matchMedia = () => ({ matches: true });
  const document = new Events();
  document.hidden = false;
  const properties = new Map();
  document.documentElement = { scrollHeight: 2400, style: { setProperty: (key, value) => properties.set(key, value), getPropertyValue: (key) => properties.get(key) || "" } };
  document.getElementById = () => null;
  const classes = new Set();
  const meshes = [];
  const host = { clientWidth: 1440, clientHeight: 900, dataset: {}, children: [], append(el) { this.children.push(el); }, parentElement: { classList: { add: (x) => classes.add(x), remove: (x) => classes.delete(x) } } };
  const resources = [];
  class Resource { constructor(values = {}) { Object.assign(this, values); resources.push(this); } dispose() { this.disposed = true; } }
  const vector = () => ({ set(...values) { this.values = values; [this.x, this.y, this.z] = values; } });
  class Mesh { constructor(geometry, material) { this.geometry = geometry; this.material = material; this.position = vector(); this.scale = vector(); meshes.push(this); } }
  let renderer;
  class Renderer extends Resource {
    constructor() {
      super(); renderer = this; this.renders = 0; this.domElement = new Events();
      this.domElement.remove = () => { host.children = host.children.filter((x) => x !== this.domElement); };
      this.domElement.toDataURL = () => "data:image/png;base64,c2NlbmU=";
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
    Vector2: class { set(x, y) { this.x = x; this.y = y; } },
    Color: class {},
  };
  let time = 0;
  let enabled = true;
  let id = 0;
  const frames = new Map();
  const storage = new Map(savedPosition ? [["pak-hub-city-position", JSON.stringify(savedPosition)]] : []);
  const sessionStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
  const context = vm.createContext({ THREE, window, document, sessionStorage, Float32Array, performance: { now: () => time }, requestAnimationFrame: (fn) => { frames.set(++id, fn); return id; }, cancelAnimationFrame: (key) => frames.delete(key) });
  vm.runInContext(readFileSync(new URL("../public/scene-position.js", import.meta.url), "utf8"), context);
  const source = readFileSync(new URL("../public/scene.js", import.meta.url), "utf8").replace(/^import .*;\r?\n/, "").replace("export function", "function");
  vm.runInContext(source, context);
  const controller = context.initializeScene(host, () => enabled);
  for (let i = 0; i < 6; i += 1) await Promise.resolve();
  const step = () => { time += 16; const work = [...frames.values()]; frames.clear(); work.forEach((fn) => fn(time)); };
  return { host, window, document, resources, renderer, controller, classes, frames, meshes, properties, storage, step, disable: () => { enabled = false; } };
}

test("rain keeps falling without input and obeys the drawing-buffer cap", async () => {
  const site = await setup();
  for (let i = 0; i < 150; i += 1) site.step();
  const rain = site.meshes[2];
  const previous = [...rain.geometry.attributes.position.array];
  for (let i = 0; i < 10; i += 1) site.step();
  assert.notDeepEqual([...rain.geometry.attributes.position.array], previous);
  assert.equal(site.host.dataset.sceneState, "active");
  assert.equal(site.frames.size, 1);
  assert.ok(rain.position.z < site.meshes[1].position.z);
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

test("explicit transition suspension freezes the city without disposing it", async () => {
  const site = await setup();
  site.step();
  site.window.emit("pointermove", { clientX: 1300, clientY: 240 });
  const rendered = site.renderer.renders;
  site.controller.suspend();
  site.window.emit("pointermove", { clientX: 300, clientY: 700 });
  site.step();
  assert.equal(site.host.children.length, 1);
  assert.equal(site.renderer.renders, rendered + 1);
  assert.equal(site.host.dataset.sceneState, "paused");
});

test("navigation carries a full rendered frame before the incoming scene is ready", async () => {
  const site = await setup();
  site.step();
  site.controller.suspend();
  const snapshot = JSON.parse(site.storage.get("pak-hub-city-frame"));
  assert.equal(snapshot.image, "data:image/png;base64,c2NlbmU=");
  assert.equal(snapshot.width, site.window.innerWidth);
  assert.equal(snapshot.height, site.window.innerHeight);
  const source = readFileSync(new URL("../public/scene-position.js", import.meta.url), "utf8");
  const properties = new Map();
  const document = { documentElement: { style: { setProperty: (key, value) => properties.set(key, value) } } };
  vm.runInNewContext(source, { window: site.window, document, sessionStorage: { getItem: (key) => site.storage.get(key) || null, removeItem: (key) => site.storage.delete(key) } });
  assert.equal(properties.get("--scene-frame-visible"), "1");
  assert.ok(properties.get("--scene-frame").includes(snapshot.image));
  assert.equal(site.storage.has("pak-hub-city-frame"), false);
});

test("city responds smoothly to pointer movement while scroll leaves its offset stable", async () => {
  const site = await setup();
  for (let i = 0; i < 120; i += 1) site.step();
  const neutral = site.meshes.slice(0, 2).map((mesh) => [...mesh.position.values]);
  site.window.emit("pointermove", { clientX: 1300, clientY: 240 });
  site.step();
  const firstOffset = parseFloat(site.properties.get("--scene-x"));
  assert.ok(firstOffset > 0 && firstOffset < 6);
  for (let i = 0; i < 80; i += 1) site.step();
  assert.ok(parseFloat(site.properties.get("--scene-x")) > 6);
  assert.ok(parseFloat(site.properties.get("--scene-y")) < -2);
  const positions = site.meshes.slice(0, 2).map((mesh) => [...mesh.position.values]);
  const distantMove = positions[0][0] - neutral[0][0];
  const wallMove = positions[1][0] - neutral[1][0];
  assert.ok(distantMove > 3);
  assert.ok(wallMove > distantMove * 2);
  const offset = parseFloat(site.properties.get("--scene-x"));
  site.window.scrollY = 1200;
  site.window.emit("scroll");
  for (let i = 0; i < 80; i += 1) site.step();
  assert.ok(Math.abs(parseFloat(site.properties.get("--scene-x")) - offset) < 0.005);
  assert.ok(Math.abs(site.meshes[1].position.values[1] - positions[1][1]) < 0.005);
});

test("navigation restores the painted pointer offset before the new scene renders", async () => {
  const outgoing = await setup();
  outgoing.window.emit("pointermove", { clientX: 1300, clientY: 240 });
  for (let i = 0; i < 80; i += 1) outgoing.step();
  outgoing.controller.suspend();
  const saved = JSON.parse(outgoing.storage.get("pak-hub-city-position"));
  const incoming = await setup(saved);
  assert.deepEqual([...incoming.properties], [...outgoing.properties]);
  incoming.step();
  assert.deepEqual([...incoming.properties], [...outgoing.properties]);
  assert.deepEqual(incoming.meshes.slice(0, 2).map((mesh) => [...mesh.position.values]), outgoing.meshes.slice(0, 2).map((mesh) => [...mesh.position.values]));
  incoming.window.emit("pointermove", { clientX: 100, clientY: 800 });
  for (let i = 0; i < 80; i += 1) incoming.step();
  assert.ok(parseFloat(incoming.properties.get("--scene-x")) < -6);
  assert.ok(parseFloat(incoming.properties.get("--scene-y")) > 4);
});

test("mist and wall lighting share a continuous clock across navigation", async () => {
  const outgoing = await setup();
  for (let i = 0; i < 100; i += 1) outgoing.step();
  const mist = outgoing.meshes[3];
  const wall = outgoing.meshes[1];
  assert.ok(mist.position.z < wall.position.z);
  assert.equal(mist.material.uniforms.clock.value, wall.material.uniforms.clock.value);
  outgoing.controller.suspend();
  const saved = JSON.parse(outgoing.storage.get("pak-hub-city-position"));
  assert.ok(saved.clock > 1);
  const incoming = await setup(saved);
  incoming.step();
  const resumedClock = incoming.meshes[3].material.uniforms.clock.value;
  assert.ok(resumedClock >= saved.clock && resumedClock - saved.clock < 0.05);
  const before = outgoing.meshes[2].geometry.attributes.position.array;
  const after = incoming.meshes[2].geometry.attributes.position.array;
  assert.equal(after[0], before[0]);
  assert.ok(Math.abs(after[1] - before[1]) < 6);
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

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import * as THREE from "three";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");

// Execute the real TS classes/component effects with controlled browser boundaries.
// This tests ownership and scheduling, not actual WebGL output or React DOM focus.
function loadTs(relative, overrides = {}, globals = {}) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const source = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    const localRequire = name => {
      if (name in overrides) return overrides[name];
      if (name === "three") return THREE;
      if (name.endsWith(".css")) return {};
      if (name.startsWith(".")) return load(path.resolve(path.dirname(filename), `${name}.ts`));
      return require(name);
    };
    vm.runInNewContext(source, { module: loaded, exports: loaded.exports, require: localRequire, console, ...globals }, { filename });
    return loaded.exports;
  }
  return load(path.join(root, relative));
}

function scheduler() {
  let next = 0;
  const pending = new Map();
  return {
    pending,
    request: callback => { pending.set(++next, callback); return next; },
    cancel: id => pending.delete(id),
    tick(time) { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(callback => callback(time)); },
  };
}

test("fixed loop bounds catch-up, pauses completely, resumes without elapsed-time jumps", () => {
  const { FrameLoop } = loadTs("lib/game/core/FrameLoop.ts");
  const frames = scheduler();
  let updates = 0, renders = 0;
  const loop = new FrameLoop(frames, () => updates++, () => renders++, assert.fail);
  loop.start(); loop.start();
  assert.equal(frames.pending.size, 1);
  frames.tick(0); frames.tick(1000);
  assert.equal(updates, 6);
  loop.stop();
  assert.equal(frames.pending.size, 0);
  frames.tick(5000);
  assert.equal(renders, 2);
  loop.start(); frames.tick(6000);
  assert.equal(updates, 6);
  frames.tick(6000 + 1000 / 60);
  assert.equal(updates, 7);
  loop.stop();
});

test("loop stops scheduling after a render failure", () => {
  const { FrameLoop } = loadTs("lib/game/core/FrameLoop.ts");
  const frames = scheduler();
  let failures = 0;
  const loop = new FrameLoop(frames, () => {}, () => { throw new Error("GPU lost"); }, () => failures++);
  loop.start(); frames.tick(0);
  assert.equal(failures, 1);
  assert.equal(frames.pending.size, 0);
});

test("resource scope releases in reverse order, once, and survives a cleanup failure", () => {
  const errors = [];
  const { ResourceScope } = loadTs("lib/game/core/ResourceScope.ts", {}, { console: { error: (...args) => errors.push(args) } });
  const scope = new ResourceScope(), calls = [];
  scope.defer(() => calls.push("renderer"));
  scope.defer(() => { calls.push("bad"); throw new Error("cleanup"); });
  scope.own({ dispose: () => calls.push("geometry") });
  scope.dispose(); scope.dispose();
  scope.defer(() => calls.push("late"));
  assert.deepEqual(calls, ["geometry", "bad", "renderer", "late"]);
  assert.equal(errors.length, 1);
});

test("arena disposes each shared geometry and material once", () => {
  const { BreachArena } = loadTs("lib/game/world/BreachArena.ts");
  const arena = new BreachArena(), resources = new Map();
  arena.root.traverse(node => {
    if (!node.isMesh) return;
    for (const resource of [node.geometry, ...[node.material].flat()]) resources.set(resource, 0);
  });
  for (const resource of resources.keys()) resource.addEventListener("dispose", () => resources.set(resource, resources.get(resource) + 1));
  const parent = new THREE.Group();
  parent.add(arena.root);
  arena.dispose(); arena.dispose();
  assert.equal(parent.children.length, 0);
  assert.equal(arena.root.children.length, 0);
  assert.ok(resources.size > 5);
  for (const count of resources.values()) assert.equal(count, 1);
});

function engineHarness({ webgl = true, compileFailure = false, rendererFailure = false } = {}) {
  const frames = scheduler();
  const counters = { dispose: 0, lost: 0, observers: 0, renders: 0, paused: 0, sizes: [], errors: [] };
  class TrackedTarget extends EventTarget {
    listeners = new Set();
    addEventListener(name, fn) { super.addEventListener(name, fn); this.listeners.add(fn); }
    removeEventListener(name, fn) { super.removeEventListener(name, fn); this.listeners.delete(fn); }
  }
  const context = { getExtension: () => ({ loseContext: () => counters.lost++ }) };
  const canvas = Object.assign(new TrackedTarget(), {
    style: {}, setAttribute() {}, getContext: () => webgl ? context : null,
    focus() {}, remove() { container.children = container.children.filter(child => child !== canvas); },
  });
  const container = { children: [], appendChild(child) { this.children.push(child); }, getBoundingClientRect: () => ({ width: 1200, height: 700 }) };
  const document = Object.assign(new TrackedTarget(), { hidden: false, createElement: () => canvas });
  const window = Object.assign(new TrackedTarget(), {
    devicePixelRatio: 3, requestAnimationFrame: frames.request, cancelAnimationFrame: frames.cancel,
    matchMedia: () => ({ matches: false }),
  });
  class Renderer {
    constructor() { if (rendererFailure) throw new Error("constructor failure"); this.domElement = canvas; }
    shadowMap = {};
    setPixelRatio(value) { assert.ok(value <= 1.5); }
    setSize(w, h) { counters.sizes.push([w, h]); }
    compile() { if (compileFailure) throw new Error("shader failure"); }
    render() { counters.renders++; }
    dispose() { counters.dispose++; }
  }
  class ResizeObserver {
    constructor(callback) { this.callback = callback; }
    observe() { counters.observers++; }
    disconnect() { counters.observers--; }
  }
  const { GameEngine } = loadTs("lib/game/GameEngine.ts", { three: { ...THREE, WebGLRenderer: Renderer } }, { document, window, ResizeObserver });
  const create = () => new GameEngine(container, { onPause: () => counters.paused++, onError: message => counters.errors.push(message) });
  return { create, counters, container, document, window, canvas, frames };
}

test("repeated engine sessions release canvas, RAF, listeners, observers and graphics context", () => {
  const h = engineHarness();
  for (let i = 0; i < 5; i++) {
    const engine = h.create();
    assert.equal(h.container.children.length, 1);
    assert.equal(engine.start(), true);
    h.frames.tick(i * 1000);
    h.window.dispatchEvent(new Event("blur"));
    assert.equal(h.frames.pending.size, 0);
    engine.start();
    engine.dispose(); engine.dispose();
    assert.equal(h.frames.pending.size, 0);
    assert.equal(h.container.children.length, 0);
    assert.equal(h.counters.observers, 0);
    for (const target of [h.window, h.document, h.canvas]) assert.equal(target.listeners.size, 0);
    assert.equal(engine.start(), false);
  }
  assert.equal(h.counters.dispose, 5);
  assert.equal(h.counters.lost, 5);
});

test("unsupported WebGL and failures during construction leave no owned resources", () => {
  for (const options of [{ webgl: false }, { compileFailure: true }, { rendererFailure: true }]) {
    const h = engineHarness(options);
    assert.throws(h.create);
    assert.equal(h.container.children.length, 0);
    assert.equal(h.counters.observers, 0);
    assert.equal(h.frames.pending.size, 0);
    for (const target of [h.window, h.document, h.canvas]) assert.equal(target.listeners.size, 0);
    if (options.webgl !== false) assert.equal(h.counters.lost, 1);
  }
});

test("context loss reports once, stops rendering and requires a fresh engine", () => {
  const h = engineHarness(), engine = h.create();
  engine.start();
  h.canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  h.canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  assert.equal(h.counters.errors.length, 1);
  assert.equal(h.frames.pending.size, 0);
  assert.equal(engine.start(), false);
  engine.dispose();
});

test("resize handles zero dimensions and hidden startup does not run the loop", () => {
  const h = engineHarness(), engine = h.create();
  h.container.getBoundingClientRect = () => ({ width: 0, height: 0 });
  h.window.dispatchEvent(new Event("resize"));
  assert.deepEqual(h.counters.sizes.at(-1), [1, 1]);
  h.document.hidden = true;
  assert.equal(engine.start(), false);
  assert.equal(h.frames.pending.size, 0);
  assert.equal(h.counters.paused, 1);
  engine.dispose();
});

function hostHarness() {
  const frames = scheduler(), effects = [], states = [], timers = new Map();
  const counts = { created: 0, disposed: 0 };
  let stateIndex = 0;
  const fakeReact = {
    useState(initial) { const i = stateIndex++; return [i === 0 ? "LOADING" : i === 1 ? 1 : initial, value => states.push(value)]; },
    useRef: () => ({ current: {} }),
    useEffect: effect => effects.push(effect),
  };
  class GameEngine {
    constructor() { counts.created++; }
    start() { return true; }
    dispose() { counts.disposed++; }
  }
  const window = {
    requestAnimationFrame: frames.request, cancelAnimationFrame: frames.cancel,
    setTimeout: callback => { timers.set(1, callback); return 1; }, clearTimeout: id => timers.delete(id),
  };
  const { default: Host } = loadTs("app/play/breach/BreachHost.tsx", { react: fakeReact, "../../../lib/game/GameEngine": { GameEngine } }, { window });
  Host();
  const cleanup = effects[0]();
  return { frames, counts, states, cleanup, timers };
}

test("host ignores late module resolution after navigation", async () => {
  const h = hostHarness();
  h.cleanup();
  await new Promise(setImmediate);
  h.frames.tick(0);
  assert.equal(h.counts.created, 0);
  assert.equal(h.timers.size, 0);
  assert.equal(h.states.includes("PLAYING"), false);
});

test("host cancels scheduled startup and timeout cannot resurrect a session", async () => {
  const h = hostHarness();
  await new Promise(setImmediate);
  assert.equal(h.frames.pending.size, 1);
  [...h.timers.values()][0]();
  h.frames.tick(0);
  assert.equal(h.counts.created, 0);
  assert.equal(h.states.includes("ERROR"), true);
  h.cleanup();
});

test("host releases its running engine on unmount", async () => {
  const h = hostHarness();
  await new Promise(setImmediate);
  h.frames.tick(0);
  assert.equal(h.counts.created, 1);
  assert.equal(h.states.includes("PLAYING"), true);
  assert.equal(h.timers.size, 0);
  h.cleanup(); h.cleanup();
  assert.equal(h.counts.disposed, 1);
});

test("preview SSR is inert and existing arcade remains independently available", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  for (const route of ["/play/breach", "/play", "/"]) {
    const response = await worker.fetch(new Request(`http://localhost${route}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
    assert.equal(response.status, 200);
    const html = await response.text();
    if (route === "/play/breach") {
      assert.match(html, /Launch arena preview/);
      assert.match(html, /Player movement and combat arrive in later phases/);
      assert.doesNotMatch(html, /<canvas|<iframe/);
    }
    if (route === "/play") { assert.match(html, /<canvas/); assert.match(html, /href="\/play\/breach"/); }
    // No engine script/preload should run merely by requesting any of these pages.
    assert.doesNotMatch(html, /<(?:script|link)[^>]*(?:src|href)="[^"]*GameEngine/);
  }
});

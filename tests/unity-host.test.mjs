import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

test("homepage and game host SSR do not start a Unity runtime", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  for (const route of ["/", "/play"]) {
    const response = await worker.fetch(new Request(`http://localhost${route}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.doesNotMatch(html, /<iframe|<canvas|<script[^>]*src="[^"]*(?:\.loader\.js|\.wasm)/);
    if (route === "/play") {
      assert.match(html, /Launch Unity demo/);
      assert.match(html, /Return home/);
    }
  }
});

async function templateHarness(createUnityInstance) {
  const template = await readFile(new URL("../unity/ClashOfErrors/Assets/WebGLTemplates/ClashHost/index.html", import.meta.url), "utf8");
  let source = template.match(/<script>([\s\S]*?)<\/script>/)[1];
  // Compile the disabled-progressive branch and Unity's template substitutions for
  // a unit test only. Production loader and build assets always come from Unity.
  source = source.replace(/#if PROGRESSIVE_ASSET_LOADING[\s\S]*?#else\n([\s\S]*?)#endif/g, "$1")
    .replace(/\{\{\{ JSON.stringify\(\w+\) \}\}\}/g, '"Test"')
    .replace(/\{\{\{ \w+ \}\}\}/g, "test");
  const messages = [];
  const listeners = {};
  const canvas = { addEventListener() {}, focus() {} };
  const error = { textContent: "" };
  let script;
  const context = vm.createContext({
    URL, Math, location: { origin: "https://example.test" },
    document: { referrer: "https://example.test/play", getElementById: id => id === "unity-canvas" ? canvas : error, createElement: () => (script = {}), body: { appendChild() {} } },
    window: { devicePixelRatio: 1, addEventListener: (name, fn) => { listeners[name] = fn; } },
    parent: { postMessage: (data, origin) => messages.push({ data, origin }) },
    createUnityInstance,
  });
  vm.runInContext(source, context);
  return { script, messages, listeners, error };
}

test("template forwards real loader progress and releases a late instance after navigation", async () => {
  let resolve;
  let quits = 0;
  const harness = await templateHarness((_canvas, _config, progress) => { progress(.42); return new Promise(done => { resolve = done; }); });
  harness.script.onload();
  assert.equal(harness.messages[0].data.value, .42);
  assert.equal(harness.messages[0].origin, "https://example.test");
  harness.listeners.pagehide();
  resolve({ Quit: async () => { quits++; } });
  await new Promise(setImmediate);
  assert.equal(quits, 1);
  assert.equal(harness.messages.some(message => message.data.type === "ready"), false);
});

test("template reports loader and initialization failures without claiming readiness", async () => {
  const harness = await templateHarness(() => Promise.reject(new Error("broken build")));
  harness.script.onload();
  await new Promise(setImmediate);
  assert.match(harness.error.textContent, /broken build/);
  assert.equal(harness.messages.at(-1).data.type, "error");
  harness.script.onerror();
  assert.match(harness.error.textContent, /loader unavailable/);
  assert.equal(harness.messages.some(message => message.data.type === "ready"), false);
});

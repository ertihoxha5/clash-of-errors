import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import * as THREE from "three";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "../..");

// Execute real TS modules with explicit browser/rendering test boundaries.
export function loadTs(relative, overrides = {}, globals = {}) {
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

export function scheduler() {
  let next = 0;
  const pending = new Map();
  return {
    pending,
    request: callback => { pending.set(++next, callback); return next; },
    cancel: id => pending.delete(id),
    tick(time) { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(callback => callback(time)); },
  };
}

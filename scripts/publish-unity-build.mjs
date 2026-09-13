import { cp, mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../", import.meta.url));
const artifacts = path.join(repo, "artifacts", "unity");
const source = path.resolve((await readFile(path.join(artifacts, "latest-build.txt"), "utf8")).trim());
if (!source.startsWith(artifacts + path.sep)) throw new Error("Build source must be inside artifacts/unity.");
const html = await readFile(path.join(source, "index.html"), "utf8");
if (!html.includes('name="clash-unity-build"') || html.includes("{{{")) throw new Error("Expected a successful Unity-generated ClashHost page.");
const buildFiles = await readdir(path.join(source, "Build"));
for (const suffix of [".loader.js", ".framework.js.unityweb", ".wasm.unityweb", ".data.unityweb"]) {
  const file = buildFiles.find(name => name.endsWith(suffix));
  if (!file || !(await stat(path.join(source, "Build", file))).size) throw new Error(`Missing nonempty Unity ${suffix} asset.`);
}
const destination = path.join(repo, "public", "unity", "clash-of-errors");
await mkdir(destination, { recursive: true });
// Copy generated assets first, HTML last. No recursive delete, no writes to other static assets.
for (const entry of await readdir(source)) if (entry !== "index.html") await cp(path.join(source, entry), path.join(destination, entry), { recursive: true });
await writeFile(path.join(destination, "index.html.next"), html);
await rename(path.join(destination, "index.html.next"), path.join(destination, "index.html"));
console.log(`Unity build copied to ${destination}. Run npm run build before packaging the website.`);

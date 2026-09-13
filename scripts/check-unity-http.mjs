import assert from "node:assert/strict";
import { gunzipSync } from "node:zlib";

const origin = process.argv[2];
if (!origin) throw new Error("Usage: node scripts/check-unity-http.mjs <website-origin> [unity-build-base]");
const base = new URL((process.argv[3] || "/unity/clash-of-errors").replace(/\/$/, "") + "/", origin);
for (const route of ["/", "/play"]) {
  const response = await fetch(new URL(route, origin));
  assert.equal(response.status, 200, route);
  const html = await response.text();
  assert.doesNotMatch(html, /<iframe|<script[^>]*src="[^"]*\.loader\.js/);
  console.log(`${route}: HTTP 200; no Unity runtime in initial HTML`);
}
const response = await fetch(new URL("index.html", base));
assert.equal(response.status, 200);
const html = await response.text();
assert.ok(html.includes('name="clash-unity-build"'));
assert.ok(!html.includes("{{{"));
const assets = [...html.matchAll(/(?:script\.src|(?:data|framework|code)Url)\s*[:=]\s*"([^"]+)"/g)].map(match => match[1]);
assert.equal(assets.length, 4);
for (const asset of assets) {
  const result = await fetch(new URL(asset, base));
  assert.equal(result.status, 200, asset);
  const content = Buffer.from(await result.arrayBuffer());
  assert.ok(content.length > 0);
  const mime = result.headers.get("content-type") || "";
  if (asset.endsWith(".unityweb")) {
    assert.match(mime, /application\/octet-stream/);
    assert.equal(result.headers.get("content-encoding"), null, "Fallback assets must not have an artificial Content-Encoding override");
    const decoded = gunzipSync(content);
    if (asset.endsWith(".wasm.unityweb")) assert.equal(decoded.subarray(0, 4).toString("hex"), "0061736d");
  } else assert.match(mime, /(?:java|ecma)script/);
  console.log(`${asset}: HTTP 200; ${content.length} bytes; ${mime}`);
}
console.log("HTTP asset checks passed. Browser rendering and interaction still require browser verification.");

import assert from "node:assert/strict";
import test from "node:test";

async function render(){
 const workerUrl=new URL("../dist/server/index.js",import.meta.url);
 workerUrl.searchParams.set("test",`${process.pid}-${Date.now()}`);
 const {default:worker}=await import(workerUrl.href);
 return worker.fetch(new Request("http://localhost/",{headers:{accept:"text/html"}}),{ASSETS:{fetch:async()=>new Response("Not found",{status:404})}},{waitUntil(){},passThroughOnException(){}});
}

test("server-renders the Clash of Errors foundation",async()=>{
 const response=await render();
 assert.equal(response.status,200);
 assert.match(response.headers.get("content-type")??"",/^text\/html\b/i);
 const html=await response.text();
 assert.match(html,/<title>Clash of Errors/);
 assert.match(html,/TURN ERRORS INTO/);
 assert.match(html,/Solo Practice/);
 assert.match(html,/Battle Bots/);
 assert.match(html,/Live Arena/);
 assert.match(html,/ADAPTIVE AI COACH/);
 assert.doesNotMatch(html,/codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("includes foundational accessibility hooks",async()=>{
 const html=await (await render()).text();
 assert.match(html,/aria-label="Primary"/);
 assert.match(html,/alt="Clash of Errors"/);
});

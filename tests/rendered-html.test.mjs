import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";

async function render(path="/"){
 const workerUrl=new URL("../dist/server/index.js",import.meta.url);
 workerUrl.searchParams.set("test",`${process.pid}-${Date.now()}`);
 const {default:worker}=await import(workerUrl.href);
 return worker.fetch(new Request(`http://localhost${path}`,{headers:{accept:"text/html"}}),{ASSETS:{fetch:async()=>new Response("Not found",{status:404})}},{waitUntil(){},passThroughOnException(){}});
}

test("server-renders the Clash of Errors foundation",async()=>{
 const response=await render();
 assert.equal(response.status,200);
 assert.match(response.headers.get("content-type")??"",/^text\/html\b/i);
 const html=await response.text();
 assert.match(html,/<title>Clash of Errors/);
 assert.match(html,/a Coding Arena\./);
 assert.match(html,/How It Works/);
 assert.match(html,/1v1 Duel/);
 assert.match(html,/Squad Clash/);
 assert.match(html,/Survival/);
 assert.match(html,/AI Coaching/);
 assert.doesNotMatch(html,/codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("includes foundational accessibility hooks",async()=>{
 const html=await (await render()).text();
 assert.match(html,/aria-label="Primary"/);
 assert.match(html,/alt="Clash of Errors"/);
});

test("implements server-protected identity and profile persistence",async()=>{
 const [login,profile,api,schema]=await Promise.all([
  readFile(new URL("../app/login/page.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/profile/page.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/api/profile/route.ts",import.meta.url),"utf8"),
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),
 ]);
 assert.match(login,/chatGPTSignInPath\("\/profile"\)/);
 assert.match(profile,/requireChatGPTUser\("\/profile"\)/);
 assert.match(api,/getChatGPTUser\(\)/);
 assert.match(api,/Authentication required/);
 assert.match(schema,/sqliteTable\("users"/);
 assert.match(schema,/sqliteTable\("profiles"/);
});

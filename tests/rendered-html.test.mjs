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
 const [login,profile,dashboard,api,schema]=await Promise.all([
  readFile(new URL("../app/login/page.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/profile/page.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/dashboard/page.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/api/profile/route.ts",import.meta.url),"utf8"),
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),
 ]);
 assert.match(login,/chatGPTSignInPath\("\/profile"\)/);
 assert.match(profile,/requireChatGPTUser\("\/profile"\)/);
 assert.match(dashboard,/requireChatGPTUser\("\/dashboard"\)/);
 assert.match(dashboard,/ENTER THE ARENA/);
 assert.match(api,/getChatGPTUser\(\)/);
 assert.match(api,/Authentication required/);
 assert.match(schema,/sqliteTable\("users"/);
 assert.match(schema,/sqliteTable\("profiles"/);
});

test("includes the persistent question bank and protected instructor CRUD",async()=>{
 const [schema,collection,item,page,migration]=await Promise.all([
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/api/questions/route.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/api/questions/[id]/route.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/instructor/questions/page.tsx",import.meta.url),"utf8"),
  readFile(new URL("../drizzle/0001_abandoned_the_twelve.sql",import.meta.url),"utf8"),
 ]);
 for(const table of ["topics","subtopics","questions","question_options","question_sets"])assert.match(schema,new RegExp(`sqliteTable\\("${table}"`));
 assert.match(collection,/export async function POST/);
 assert.match(item,/export async function PATCH/);
 assert.match(item,/export async function DELETE/);
 assert.match(page,/requireChatGPTUser\("\/instructor\/questions"\)/);
 assert.match(migration,/INSERT INTO `questions`/);
});

test("implements persistent server-validated solo practice",async()=>{
 const [schema,start,session,setup,runner,results,migration]=await Promise.all([
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/practice/route.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/practice/session/[id]/route.ts",import.meta.url),"utf8"),readFile(new URL("../app/practice/page.tsx",import.meta.url),"utf8"),readFile(new URL("../app/practice/session/[id]/PracticeRunner.tsx",import.meta.url),"utf8"),readFile(new URL("../app/practice/results/[id]/page.tsx",import.meta.url),"utf8"),readFile(new URL("../drizzle/0003_tired_korvac.sql",import.meta.url),"utf8")
 ]);
 for(const table of ["practice_sessions","practice_answers","topic_mastery"])assert.match(schema,new RegExp(`sqliteTable\\("${table}"`));
 assert.match(start,/crypto\.randomUUID/);assert.match(session,/Question already answered/);assert.match(session,/correctOptionId/);assert.match(setup,/requireChatGPTUser\("\/practice"\)/);assert.match(runner,/Lock answer/);assert.match(results,/XP earned/);assert.match(migration,/idx_practice_answers_session_question/);
});

test("implements variable persistent bot battles with versioned scoring",async()=>{
 const [schema,create,battle,scoring,runner,results,migration]=await Promise.all([
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/bots/route.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/bots/battle/[id]/route.ts",import.meta.url),"utf8"),readFile(new URL("../lib/scoring.ts",import.meta.url),"utf8"),readFile(new URL("../app/bots/battle/[id]/BotBattle.tsx",import.meta.url),"utf8"),readFile(new URL("../app/bots/results/[id]/page.tsx",import.meta.url),"utf8"),readFile(new URL("../drizzle/0004_ambitious_robbie_robertson.sql",import.meta.url),"utf8")
 ]);
 for(const table of ["bot_battles","bot_participants","bot_battle_answers","bot_simulated_answers"])assert.match(schema,new RegExp(`sqliteTable\\("${table}"`));
 assert.match(create,/Math\.min\(5/);assert.match(create,/accuracy/);assert.match(battle,/Math\.random/);assert.match(battle,/Question already answered/);assert.match(scoring,/SCORING_VERSION/);assert.match(scoring,/speed/);assert.match(runner,/LIVE STANDINGS/);assert.match(results,/podium/);assert.match(migration,/idx_bot_answers_battle_question/);
});

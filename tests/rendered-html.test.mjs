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
 assert.match(html,/How it works/);
 assert.match(html,/Three hundred lines/);
 assert.match(html,/Six fields, one bank/);
 assert.match(html,/Bug Hunter/);
 // Each battle-mode card links somewhere real rather than popping a milestone toast.
 assert.match(html,/href="[/]challenges"/);
 assert.match(html,/href="[/]play"/);
 assert.match(html,/href="[/]register"/);
 assert.doesNotMatch(html,/ChatGPT|Milestone 3|Milestone 4/);
 assert.match(html,/Pick who you race/);
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
  readFile(new URL("../app/api/account/route.ts",import.meta.url),"utf8"),
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),
 ]);
 assert.match(login,/AccountForm/);assert.match(login,/safeReturnPath/);
 assert.match(profile,/requirePlayer\("\/profile"\)/);
 assert.match(dashboard,/requirePlayer\("\/dashboard"\)/);
 assert.match(dashboard,/ENTER THE ARENA/);
 assert.match(api,/getPlayer\(\)/);
 assert.match(api,/That username and password do not match/);
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
 assert.match(page,/requirePlayer\("\/instructor\/questions"\)/);
 assert.match(migration,/INSERT INTO `questions`/);
});

test("implements persistent server-validated solo practice",async()=>{
 const [schema,start,session,setup,runner,results,migration]=await Promise.all([
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/practice/route.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/practice/session/[id]/route.ts",import.meta.url),"utf8"),readFile(new URL("../app/practice/page.tsx",import.meta.url),"utf8"),readFile(new URL("../app/practice/session/[id]/PracticeRunner.tsx",import.meta.url),"utf8"),readFile(new URL("../app/practice/results/[id]/page.tsx",import.meta.url),"utf8"),readFile(new URL("../drizzle/0003_tired_korvac.sql",import.meta.url),"utf8")
 ]);
 for(const table of ["practice_sessions","practice_answers","topic_mastery"])assert.match(schema,new RegExp(`sqliteTable\\("${table}"`));
 assert.match(start,/crypto\.randomUUID/);assert.match(session,/Question already answered/);assert.match(session,/correctOptionId/);assert.match(setup,/requirePlayer\("\/practice"\)/);assert.match(runner,/Lock answer/);assert.match(results,/XP earned/);assert.match(migration,/idx_practice_answers_session_question/);
});

test("implements variable persistent bot battles with versioned scoring",async()=>{
 const [schema,create,battle,scoring,runner,results,migration]=await Promise.all([
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/bots/route.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/bots/battle/[id]/route.ts",import.meta.url),"utf8"),readFile(new URL("../lib/scoring.ts",import.meta.url),"utf8"),readFile(new URL("../app/bots/battle/[id]/BotBattle.tsx",import.meta.url),"utf8"),readFile(new URL("../app/bots/results/[id]/page.tsx",import.meta.url),"utf8"),readFile(new URL("../drizzle/0004_ambitious_robbie_robertson.sql",import.meta.url),"utf8")
 ]);
 for(const table of ["bot_battles","bot_participants","bot_battle_answers","bot_simulated_answers"])assert.match(schema,new RegExp(`sqliteTable\\("${table}"`));
 assert.match(create,/Math\.min\(5/);assert.match(create,/accuracy/);assert.match(battle,/Math\.random/);assert.match(battle,/Question already answered/);assert.match(scoring,/SCORING_VERSION/);assert.match(scoring,/speed/);assert.match(runner,/LIVE STANDINGS/);assert.match(results,/podium/);assert.match(migration,/idx_bot_answers_battle_question/);
});

test("implements persistent multiplayer lobbies with presence and host controls",async()=>{
 const [schema,arenaApi,roomApi,setup,lobby,migration]=await Promise.all([
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/arena/route.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/room/[code]/route.ts",import.meta.url),"utf8"),readFile(new URL("../app/arena/ArenaSetup.tsx",import.meta.url),"utf8"),readFile(new URL("../app/room/[code]/Lobby.tsx",import.meta.url),"utf8"),readFile(new URL("../drizzle/0005_robust_sue_storm.sql",import.meta.url),"utf8")
 ]);
 for(const table of ["arenas","arena_participants"])assert.match(schema,new RegExp(`sqliteTable\\("${table}"`));
 assert.match(arenaApi,/export async function POST/);assert.match(arenaApi,/Arena is full/);assert.match(roomApi,/lastSeenAt/);assert.match(roomApi,/Only the host can start/);assert.match(roomApi,/isHost:true/);assert.match(setup,/JOIN ARENA/);assert.match(lobby,/ROOM CODE/);assert.match(lobby,/Start battle/);assert.match(migration,/idx_arena_participants_presence/);
});

test("implements a server-authoritative persistent multiplayer battle engine",async()=>{
 const [schema,lobbyApi,battleApi,battleUi,migration,scoring]=await Promise.all([
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/room/[code]/route.ts",import.meta.url),"utf8"),readFile(new URL("../app/api/battle/[code]/route.ts",import.meta.url),"utf8"),readFile(new URL("../app/battle/[code]/BattleArena.tsx",import.meta.url),"utf8"),readFile(new URL("../drizzle/0006_thankful_lightspeed.sql",import.meta.url),"utf8"),readFile(new URL("../lib/scoring.ts",import.meta.url),"utf8")
 ]);
 for(const table of ["arena_battle_questions","arena_answers"])assert.ok(schema.includes(`sqliteTable("${table}"`));
 assert.match(lobbyApi,/SCORING_VERSION/);assert.match(lobbyApi,/status:"active"/);assert.match(battleApi,/Date\.parse\(startedAt\)/);assert.match(battleApi,/Submission window closed/);assert.match(battleApi,/Question already answered/);assert.match(battleApi,/status:"completed"/);assert.match(battleApi,/scoreAnswer/);assert.match(scoring,/streakBonus/);assert.match(battleUi,/LIVE LEADERBOARD/);assert.match(battleUi,/FINAL/);assert.match(migration,/idx_arena_answers_participant_question/);
});

test("seeds a published question bank deep enough for battles",async()=>{
 const seed=await readFile(new URL("../drizzle/0008_seed_content.sql",import.meta.url),"utf8");
 const buckets=new Map(),options=new Map();
 for(const line of seed.split("--> statement-breakpoint")){
  const question=line.match(/INSERT OR IGNORE INTO questions \((\d+)?[^)]*\) SELECT (\d+),id,[\s\S]*'(easy|medium|hard)','published'[\s\S]*FROM topics WHERE slug='([a-z-]+)'/);
  if(question){buckets.set(`${question[4]}/${question[3]}`,(buckets.get(`${question[4]}/${question[3]}`)||0)+1);continue}
  const option=line.match(/INSERT OR IGNORE INTO question_options \(id,question_id,label,is_correct,position\) VALUES \(\d+,(\d+),[\s\S]*,([01]),\d\)/);
  if(option){const entry=options.get(option[1])||{total:0,correct:0};entry.total+=1;entry.correct+=Number(option[2]);options.set(option[1],entry)}
 }
 assert.equal(buckets.size,12);
 // Bot battles request five questions of one topic and difficulty; live arenas request more.
 for(const [bucket,count] of buckets)assert.ok(count>=6,`${bucket} has only ${count} questions`);
 for(const [questionId,entry] of options)assert.deepEqual(entry,{total:4,correct:1},`question ${questionId} is not single-answer`);
 assert.match(seed,/INSERT OR IGNORE INTO topics \(slug,name,description\)/);
});

test("pays capped, idempotent XP for arcade runs and completed arenas",async()=>{
 const [game,battle,arcade,platform]=await Promise.all([
  readFile(new URL("../app/api/game/route.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/api/battle/[code]/route.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/play/BugHunter.tsx",import.meta.url),"utf8"),
  readFile(new URL("../lib/platform.ts",import.meta.url),"utf8"),
 ]);
 assert.match(game,/MILESTONES/);assert.match(game,/rewardStatements/);assert.match(game,/game:\$\{day\}/);
 assert.match(battle,/awardBattleXp/);assert.match(battle,/arena:\$\{arenaId\}/);
 assert.match(platform,/INSERT OR IGNORE INTO platform_rewards/);assert.match(platform,/changes\(\)=1/);
 assert.match(arcade,/requestAnimationFrame/);assert.match(arcade,/NullPointer/);assert.match(arcade,/StackOverflow/);
 assert.match(arcade,/\/api\/game/);
});

test("challenges are code tasks: find the bug, or write it until the tests pass",async()=>{
 const [schema,api,tasks,ui,snippet,sandbox,content]=await Promise.all([
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/api/tasks/route.ts",import.meta.url),"utf8"),
  readFile(new URL("../lib/code-tasks.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/challenges/Challenges.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/components/BugSnippet.tsx",import.meta.url),"utf8"),
  readFile(new URL("../lib/sandbox.ts",import.meta.url),"utf8"),
  readFile(new URL("../drizzle/0010_code_task_content.sql",import.meta.url),"utf8"),
 ]);
 for(const table of ["code_tasks","code_attempts"])assert.match(schema,new RegExp(`sqliteTable\\("${table}"`));
 // The graded answer never ships to the browser.
 assert.match(tasks,/fixes:fixes\.map\(f=>f\.label\)/);
 assert.doesNotMatch(tasks,/buggyLine:row\.buggyLine[,}]/);
 assert.match(tasks,/export function checkBugAnswer/);
 assert.match(api,/checkBugAnswer/);
 assert.match(api,/testsPassed===testsTotal/);
 assert.match(api,/rewardStatements/);
 assert.match(ui,/FIND THE BUG/);assert.match(ui,/WRITE THE CODE/);
 assert.match(snippet,/aria-pressed/);
 assert.match(sandbox,/new Worker/);assert.match(sandbox,/terminate/);
 const kinds=[...content.matchAll(/,'(bug|write)','/g)].map(match=>match[1]);
 assert.ok(kinds.filter(kind=>kind==="bug").length>=20,`only ${kinds.filter(k=>k==="bug").length} bug tasks`);
 assert.ok(kinds.filter(kind=>kind==="write").length>=10,`only ${kinds.filter(k=>k==="write").length} write tasks`);
});

test("duels race a player against a scheduled NPC rival",async()=>{
 const [schema,create,room,ui,npcs,chooser]=await Promise.all([
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/api/duel/route.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/api/duel/[code]/route.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/duel/[code]/DuelArena.tsx",import.meta.url),"utf8"),
  readFile(new URL("../lib/npcs.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/battles/ChooseRival.tsx",import.meta.url),"utf8"),
 ]);
 assert.match(schema,/sqliteTable\("duels"/);
 // The rival's whole run is decided when the room opens, not while it is polled.
 assert.match(create,/npcSchedule\(npc,testsTotal,timeLimit\)/);
 assert.match(npcs,/export function npcSchedule/);
 assert.match(room,/Math\.max\(ctx\.duel\.userTestsPassed,reported\)/);
 assert.match(room,/eq\(duels\.status,"active"\)/);
 assert.match(room,/duel:\${duel\.id}/);
 for(const piece of [/Room code/,/LIVE LEADERBOARD|Live leaderboard/,/TESTS PASSED/,/VS/])assert.match(ui,piece);
 assert.match(chooser,/Choose your rival/);
 assert.ok(/CodeNinja/.test(npcs)&&/SyntaxStorm/.test(npcs),"the NPC roster is missing its rivals");
});

test("accounts are local: name, surname, username, password",async()=>{
 const [auth,api,form,screen,schema,shell]=await Promise.all([
  readFile(new URL("../app/auth.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/api/account/route.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/login/AccountForm.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/login/AuthScreen.tsx",import.meta.url),"utf8"),
  readFile(new URL("../db/schema.ts",import.meta.url),"utf8"),
  readFile(new URL("../app/PlatformShell.tsx",import.meta.url),"utf8"),
 ]);
 for(const table of ["accounts","sessions"])assert.match(schema,new RegExp(`sqliteTable\\("${table}"`));
 // Passwords are salted, stretched, and compared without leaking timing.
 assert.match(auth,/PBKDF2/);
 assert.match(auth,/iterations/);
 assert.match(auth,/export function sameDigest/);
 assert.match(auth,/HttpOnly/);
 assert.match(api,/action==="register"/);
 assert.match(api,/action==="login"/);
 assert.match(api,/That username and password do not match/);
 // The unknown-username path still hashes, so both answers cost the same.
 assert.match(api,/const salt=account\?\.passwordSalt\?\?newSalt\(\)/);
 for(const field of [/First name/,/Surname/,/Username/,/Password/])assert.match(form,field);
 assert.match(screen,/Create account|CREATE ACCOUNT/);
 assert.doesNotMatch(auth,/ChatGPT/);
 assert.doesNotMatch(shell,/ChatGPT/);
});

test("every signed-in page shares one frame",async()=>{
 const pages=["dashboard","challenges","battles","teams","leaderboards","history","profile","practice","arena","bots"];
 const sources=await Promise.all(pages.map(name=>readFile(new URL(`../app/${name}/page.tsx`,import.meta.url),"utf8")));
 for(const [index,source] of sources.entries()){
  assert.match(source,/PlatformShell/,`${pages[index]} does not use the shared shell`);
 }
 const shell=await readFile(new URL("../app/PlatformShell.tsx",import.meta.url),"utf8");
 assert.match(shell,/className="topbar"/);
 assert.match(shell,/kicker/);
});

test("audit challenges are whole modules with one planted defect",async()=>{
 const [content,viewer,ui,tasks]=await Promise.all([
  readFile(new URL("../drizzle/0013_fields_and_audits.sql",import.meta.url),"utf8"),
  readFile(new URL("../app/components/AuditViewer.tsx",import.meta.url),"utf8"),
  readFile(new URL("../app/challenges/Challenges.tsx",import.meta.url),"utf8"),
  readFile(new URL("../lib/code-tasks.ts",import.meta.url),"utf8"),
 ]);
 const audits=[...content.matchAll(/,'audit','([^']+)'/g)].map(match=>match[1]);
 assert.ok(audits.length>=3,`only ${audits.length} audit tasks`);
 // Each audit ships a real module, not a snippet.
 const bodies=[...content.matchAll(/,'audit',[\s\S]*?,'javascript','[\s\S]*?','([\s\S]*?)',(\d+),'/g)];
 for(const [,body,line] of bodies){
  const lineCount=body.split("\n").length;
  assert.ok(lineCount>=240,`an audit module has only ${lineCount} lines`);
  assert.ok(Number(line)>=1&&Number(line)<=lineCount,"the planted line is outside the module");
 }
 // Reading tools, because the point is reading: search, jump, and a pinned choice.
 assert.match(viewer,/Go to line/);
 assert.match(viewer,/Only matches/);
 assert.match(viewer,/scrollIntoView/);
 assert.match(ui,/CODE AUDIT/);
 assert.match(ui,/Reported symptom/);
 assert.match(tasks,/hint:row\.hint/);
});


import {and,eq} from "drizzle-orm";
import {getPlayer} from "../../auth";
import {getDb,getStore} from "../../../db";
import {codeAttempts,codeTasks,profiles,topics,users} from "../../../db/schema";
import {checkBugAnswer,loadTask,publicTask,randomTasks,taskTestCount} from "../../../lib/code-tasks";
import {rewardStatements} from "../../../lib/platform";

const NEWLINE=/\r?\n/;

async function ensurePlayer(){
 const identity=await getPlayer();
 if(!identity)return null;
 const db=await getDb(),now=new Date().toISOString(),name=identity.displayName;
 await db.insert(users).values({id:identity.userId,email:identity.email,createdAt:now,updatedAt:now})
  .onConflictDoUpdate({target:users.id,set:{email:identity.email,updatedAt:now}});
 await db.insert(profiles).values({userId:identity.userId,displayName:name,avatar:name.slice(0,2).toUpperCase(),updatedAt:now}).onConflictDoNothing();
 return {identity,db};
}

export async function GET(request:Request){try{
 const url=new URL(request.url),id=Number(url.searchParams.get("id"));
 const db=await getDb();
 if(id){
  const row=await loadTask(id);
  if(!row)return Response.json({error:"Challenge not found"},{status:404});
  const [topic]=await db.select({name:topics.name}).from(topics).where(eq(topics.id,row.topicId)).limit(1);
  return Response.json({task:publicTask(row,topic?.name??"General")});
 }
 if(url.searchParams.get("run")){
  const count=Math.min(20,Math.max(4,Number(url.searchParams.get("count"))||12));
  const rows=await randomTasks("bug",count);
  return Response.json({tasks:rows.map(row=>publicTask(row))});
 }
 const kind=url.searchParams.get("kind"),difficulty=url.searchParams.get("difficulty");
 const filters=[eq(codeTasks.status,"published")];
 if(kind==="bug"||kind==="write"||kind==="audit")filters.push(eq(codeTasks.kind,kind));
 if(difficulty==="easy"||difficulty==="medium"||difficulty==="hard")filters.push(eq(codeTasks.difficulty,difficulty));
 const rows=await db.select({id:codeTasks.id,kind:codeTasks.kind,title:codeTasks.title,prompt:codeTasks.prompt,
  difficulty:codeTasks.difficulty,language:codeTasks.language,xp:codeTasks.xp,tests:codeTasks.tests,topic:topics.name,
  symptom:codeTasks.symptom,code:codeTasks.code})
  .from(codeTasks).innerJoin(topics,eq(topics.id,codeTasks.topicId)).where(and(...filters))
  .orderBy(codeTasks.kind,codeTasks.difficulty,codeTasks.id).limit(200);
 const identity=await getPlayer();
 const solved=identity?await db.select({taskId:codeAttempts.taskId}).from(codeAttempts)
  .where(and(eq(codeAttempts.userId,identity.userId),eq(codeAttempts.passed,true))):[];
 const solvedIds=new Set(solved.map(s=>s.taskId));
 return Response.json({tasks:rows.map(r=>{
  let testCount=0;try{testCount=(JSON.parse(r.tests) as unknown[]).length}catch{testCount=0}
  return {id:r.id,kind:r.kind,title:r.title,prompt:r.prompt,difficulty:r.difficulty,language:r.language,
   xp:r.xp,topic:r.topic,testCount,solved:solvedIds.has(r.id),symptom:r.symptom,
   lineCount:r.kind==="audit"?r.code.split(NEWLINE).length:0};
 })});
}catch{return Response.json({error:"Challenge service unavailable"},{status:503})}}

// A bug task is graded here from the stored answer. A write task reports the
// results of tests the browser ran in its sandbox, and is only credited when
// every stored test passed — XP is paid once per task through the ledger.
export async function POST(request:Request){try{
 const body=await request.json() as {taskId?:number;line?:number;fixIndex?:number;testsPassed?:number;durationMs?:number;source?:string};
 const row=await loadTask(Number(body.taskId));
 if(!row)return Response.json({error:"Challenge not found"},{status:404});
 const source=body.source==="game"||body.source==="duel"?body.source:"challenge";
 const player=await ensurePlayer();
 const durationMs=Math.min(3_600_000,Math.max(0,Math.floor(Number(body.durationMs)||0)));

 let correct=false,testsPassed=0,testsTotal=0,detail:Record<string,unknown>={};
 if(row.kind==="bug"||row.kind==="audit"){
  const fixes=JSON.parse(row.fixes) as unknown[];
  if(!Number.isInteger(body.line)||!Number.isInteger(body.fixIndex)||Number(body.line)<1||Number(body.line)>row.code.split(NEWLINE).length||Number(body.fixIndex)<0||Number(body.fixIndex)>=fixes.length)return Response.json({error:"Choose a valid line and repair before submitting."},{status:400});
  const verdict=checkBugAnswer(row,Number(body.line),Number(body.fixIndex));
  correct=verdict.correct;testsTotal=1;testsPassed=correct?1:0;
  detail={lineCorrect:verdict.lineCorrect,fixCorrect:verdict.fixCorrect,buggyLine:verdict.buggyLine};
 }else{
  testsTotal=taskTestCount(row);
  if(!Number.isInteger(body.testsPassed)||Number(body.testsPassed)<0||Number(body.testsPassed)>testsTotal)return Response.json({error:"Submit a valid test result."},{status:400});
  testsPassed=Math.min(testsTotal,Math.max(0,Math.floor(Number(body.testsPassed)||0)));
  correct=testsTotal>0&&testsPassed===testsTotal;
 }

 const solution=correct?row.solution:"";
 if(!player)return Response.json({correct,testsPassed,testsTotal,...detail,explanation:row.explanation,solution,xp:0,guest:true});

 const now=new Date().toISOString();
 const attemptId=crypto.randomUUID();
 await player.db.insert(codeAttempts).values({id:attemptId,userId:player.identity.userId,taskId:row.id,
  source,passed:correct,testsPassed,testsTotal,durationMs,createdAt:now});
 let xp=0;
 if(correct&&source!=="duel"){
  const store=await getStore();
  const results=await store.batch(rewardStatements(store,player.identity.userId,`task:${row.id}`,row.xp));
  // The ledger insert only affects a row the first time this task is solved.
  xp=Number(results[0]?.meta?.changes||0)>0?row.xp:0;
 }
 const penalty=await (await getStore()).prepare("SELECT xp_delta FROM progression_events WHERE user_id=? AND label=?").bind(player.identity.userId,`Failed challenge · ${attemptId}`).first<{xp_delta:number}>();
 return Response.json({correct,testsPassed,testsTotal,...detail,explanation:row.explanation,solution,xp,xpLost:penalty?-penalty.xp_delta:0});
}catch{return Response.json({error:"Could not grade this attempt. Please retry."},{status:500})}}

export const dynamic="force-dynamic";

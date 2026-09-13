import {and,desc,eq,sql} from "drizzle-orm";
import {getPlayer} from "../../../auth";
import {getDb,getStore} from "../../../../db";
import {duels,profiles} from "../../../../db/schema";
import {loadTask,publicTask} from "../../../../lib/code-tasks";
import {npcBySlug,npcTestsPassed} from "../../../../lib/npcs";
import {rewardStatements} from "../../../../lib/platform";

async function context(code:string){
 const identity=await getPlayer();
 if(!identity)return null;
 const db=await getDb();
 const [duel]=await db.select().from(duels).where(and(eq(duels.code,code.toUpperCase()),eq(duels.userId,identity.userId))).limit(1);
 return {identity,db,duel:duel??null};
}

function clock(duel:typeof duels.$inferSelect){
 const elapsedMs=Math.max(0,Date.now()-Date.parse(duel.startedAt));
 const remainingMs=Math.max(0,duel.timeLimit*1000-elapsedMs);
 const schedule=JSON.parse(duel.npcSchedule) as number[];
 return {elapsedMs,remainingMs,npcPassed:Math.min(duel.testsTotal,npcTestsPassed(schedule,elapsedMs))};
}

// Both scoreboards come from the same clock: the rival's from its fixed
// schedule, the player's from the tests their sandbox reported.
export async function GET(_:Request,{params}:{params:Promise<{code:string}>}){try{
 const ctx=await context((await params).code);
 if(!ctx)return Response.json({error:"Start a session to enter this duel."},{status:401});
 if(!ctx.duel)return Response.json({error:"Duel room not found"},{status:404});
 const task=await loadTask(ctx.duel.taskId);
 if(!task)return Response.json({error:"This duel's task is no longer available."},{status:410});
 const npc=npcBySlug(ctx.duel.npcSlug);
 const {remainingMs,npcPassed}=clock(ctx.duel);
 let duel=ctx.duel;

 if(duel.status==="active"&&(remainingMs<=0||npcPassed>=duel.testsTotal)){
  const winner=npcPassed>=duel.testsTotal&&duel.userTestsPassed<duel.testsTotal?"npc":"draw";
  duel=await settle(ctx.db,duel,winner);
 }

 const leaderboard=await ctx.db.select({displayName:profiles.displayName,xp:profiles.xp,userId:profiles.userId})
  .from(profiles).orderBy(desc(profiles.xp)).limit(5);
 const [me]=await ctx.db.select({displayName:profiles.displayName,xp:profiles.xp}).from(profiles).where(eq(profiles.userId,ctx.identity.userId)).limit(1);
 const [{rank}]=await ctx.db.select({rank:sql<number>`count(*)+1`}).from(profiles).where(sql`${profiles.xp} > ${me?.xp??0}`);

 const solutionLines=task.solution.split("\n");
 const revealed=duel.status==="completed"?solutionLines.length:Math.ceil(solutionLines.length*npcPassed/Math.max(1,duel.testsTotal));
 return Response.json({
  code:duel.code,status:duel.status,winner:duel.winner,xpEarned:duel.xpEarned,
  npcCode:solutionLines.slice(0,revealed).join("\n"),npcCodeLines:solutionLines.length,
  remainingMs:duel.status==="active"?remainingMs:0,timeLimit:duel.timeLimit,
  testsTotal:duel.testsTotal,userTestsPassed:duel.userTestsPassed,npcTestsPassed:npcPassed,
  npc,task:publicTask(task),
  you:{displayName:me?.displayName??"You",xp:me?.xp??0,rank:Number(rank)},
  leaderboard:leaderboard.map(row=>({displayName:row.displayName,xp:row.xp,you:row.userId===ctx.identity.userId})),
 });
}catch{return Response.json({error:"Unable to synchronize this duel."},{status:500})}}

export async function POST(request:Request,{params}:{params:Promise<{code:string}>}){try{
 const ctx=await context((await params).code);
 if(!ctx)return Response.json({error:"Start a session to enter this duel."},{status:401});
 if(!ctx.duel)return Response.json({error:"Duel room not found"},{status:404});
 if(ctx.duel.status!=="active")return Response.json({ok:true,status:ctx.duel.status,winner:ctx.duel.winner,xpEarned:ctx.duel.xpEarned});
 const body=await request.json() as {testsPassed?:number;action?:string};
 const {remainingMs,npcPassed}=clock(ctx.duel);

 if(body.action==="forfeit"){
  const duel=await settle(ctx.db,ctx.duel,"npc");
  return Response.json({ok:true,status:duel.status,winner:duel.winner,xpEarned:duel.xpEarned});
 }

 // Progress only ever moves forward, and never past the task's own test count.
 const reported=Math.min(ctx.duel.testsTotal,Math.max(0,Math.floor(Number(body.testsPassed)||0)));
 const testsPassed=Math.max(ctx.duel.userTestsPassed,reported);
 await ctx.db.update(duels).set({userTestsPassed:testsPassed}).where(eq(duels.id,ctx.duel.id));
 const solved=testsPassed>=ctx.duel.testsTotal;

 if(solved||remainingMs<=0||npcPassed>=ctx.duel.testsTotal){
  const winner=solved&&npcPassed<ctx.duel.testsTotal?"you":solved?"draw":npcPassed>=ctx.duel.testsTotal?"npc":"npc";
  const duel=await settle(ctx.db,{...ctx.duel,userTestsPassed:testsPassed},winner);
  return Response.json({ok:true,status:duel.status,winner:duel.winner,xpEarned:duel.xpEarned,userTestsPassed:testsPassed});
 }
 return Response.json({ok:true,status:"active",userTestsPassed:testsPassed,npcTestsPassed:npcPassed});
}catch{return Response.json({error:"Could not record duel progress."},{status:500})}}

// Settling is idempotent: the status guard keeps a second caller from paying twice,
// and the reward ledger refuses a duplicate payout even if one slips through.
async function settle(db:Awaited<ReturnType<typeof getDb>>,duel:typeof duels.$inferSelect,winner:string){
 const now=new Date().toISOString();
 const ratio=duel.testsTotal?duel.userTestsPassed/duel.testsTotal:0;
 const xp=winner==="you"?120:winner==="draw"?70:Math.round(40*ratio);
 const updated=await db.update(duels).set({status:"completed",winner,completedAt:now,xpEarned:xp})
  .where(and(eq(duels.id,duel.id),eq(duels.status,"active"))).returning();
 if(!updated.length){
  const [current]=await db.select().from(duels).where(eq(duels.id,duel.id)).limit(1);
  return current;
 }
 if(xp>0){
  const store=await getStore();
  await store.batch(rewardStatements(store,duel.userId,`duel:${duel.id}`,xp));
 }
 return updated[0];
}

export const dynamic="force-dynamic";

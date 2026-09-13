import {desc,eq} from "drizzle-orm";
import {getPlayer} from "../../auth";
import {getDb} from "../../../db";
import {duels,profiles,users} from "../../../db/schema";
import {loadTask,randomTasks,taskTestCount} from "../../../lib/code-tasks";
import {NPCS,npcBySlug,npcSchedule} from "../../../lib/npcs";

const ROOM_ALPHABET="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function roomCode(db:Awaited<ReturnType<typeof getDb>>){
 for(let attempt=0;attempt<8;attempt++){
  const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>ROOM_ALPHABET[n%ROOM_ALPHABET.length]).join("");
  const [taken]=await db.select({id:duels.id}).from(duels).where(eq(duels.code,code)).limit(1);
  if(!taken)return code;
 }
 throw new Error("Could not allocate a room code");
}

export async function GET(){try{
 const identity=await getPlayer();
 if(!identity)return Response.json({npcs:NPCS,recent:[]});
 const db=await getDb();
 const recent=await db.select({code:duels.code,status:duels.status,winner:duels.winner,npcSlug:duels.npcSlug,
  startedAt:duels.startedAt,xpEarned:duels.xpEarned}).from(duels).where(eq(duels.userId,identity.userId))
  .orderBy(desc(duels.startedAt)).limit(6);
 return Response.json({npcs:NPCS,recent});
}catch{return Response.json({error:"Duel service unavailable"},{status:503})}}

// Creating a duel fixes everything that decides the outcome: the task, the
// rival, and the millisecond at which that rival passes each test.
export async function POST(request:Request){try{
 const identity=await getPlayer();
 if(!identity)return Response.json({error:"Start a session before entering a duel."},{status:401});
 const body=await request.json() as {npc?:string;difficulty?:string;taskId?:number};
 const npc=npcBySlug(String(body.npc||""));
 const difficulty=["easy","medium","hard"].includes(String(body.difficulty))?String(body.difficulty):undefined;
 const row=body.taskId?await loadTask(Number(body.taskId)):(await randomTasks("write",1,difficulty))[0];
 if(!row||row.kind!=="write")return Response.json({error:"No coding task is available for that difficulty yet."},{status:409});
 const testsTotal=taskTestCount(row);
 if(testsTotal<3)return Response.json({error:"That task has too few tests for a duel."},{status:409});

 const db=await getDb(),now=new Date().toISOString();
 await db.insert(users).values({id:identity.userId,email:identity.email,createdAt:now,updatedAt:now})
  .onConflictDoUpdate({target:users.id,set:{email:identity.email,updatedAt:now}});
 const name=identity.displayName;
 await db.insert(profiles).values({userId:identity.userId,displayName:name,avatar:name.slice(0,2).toUpperCase(),updatedAt:now}).onConflictDoNothing();

 const timeLimit=row.difficulty==="hard"?720:row.difficulty==="medium"?600:480;
 const code=await roomCode(db);
 const id=crypto.randomUUID();
 await db.insert(duels).values({id,code,userId:identity.userId,taskId:row.id,npcSlug:npc.slug,npcTier:npc.tier,
  npcSchedule:JSON.stringify(npcSchedule(npc,testsTotal,timeLimit)),timeLimit,testsTotal,startedAt:now});
 return Response.json({code},{status:201});
}catch{return Response.json({error:"Unable to open a duel room."},{status:500})}}

export const dynamic="force-dynamic";

import {and,eq,inArray} from "drizzle-orm";
import {getPlayer} from "../../auth";
import {getDb,getStore} from "../../../db";
import {platformRewards,profiles,users} from "../../../db/schema";
import {rewardStatements} from "../../../lib/platform";

// Bug Hunt scores are reported by the browser, so XP is capped by milestone
// rather than paid per point. Each milestone is claimable once per calendar day
// via the ledger's unique (user_id,source) index, which bounds what a replayed
// or inflated score can ever be worth.
const MILESTONES=[{id:"triage",score:1500,xp:25},{id:"patch",score:6000,xp:50},{id:"refactor",score:15000,xp:100}] as const;

export async function POST(request:Request){try{
 const user=await getPlayer();if(!user)return Response.json({error:"Sign in to bank XP from the arcade."},{status:401});
 const body=await request.json() as {score?:number;wave?:number};
 const score=Math.min(10_000_000,Math.max(0,Math.floor(Number(body.score)||0))),wave=Math.max(1,Math.floor(Number(body.wave)||1));
 const earned=MILESTONES.filter(m=>score>=m.score);
 const day=new Date().toISOString().slice(0,10),db=await getDb(),now=new Date().toISOString();
 await db.insert(users).values({id:user.userId,email:user.email,createdAt:now,updatedAt:now}).onConflictDoUpdate({target:users.id,set:{email:user.email,updatedAt:now}});
 await db.insert(profiles).values({userId:user.userId,displayName:user.displayName,avatar:user.displayName.slice(0,2).toUpperCase(),updatedAt:now}).onConflictDoNothing();
 if(!earned.length)return Response.json({xp:0,wave,score,message:`Reach ${MILESTONES[0].score.toLocaleString()} points to bank XP.`});
 const sources=earned.map(m=>`game:${day}:${m.id}`);
 const claimed=new Set((await db.select({source:platformRewards.source}).from(platformRewards).where(and(eq(platformRewards.userId,user.userId),inArray(platformRewards.source,sources)))).map(r=>r.source));
 const fresh=earned.filter(m=>!claimed.has(`game:${day}:${m.id}`));
 if(!fresh.length)return Response.json({xp:0,wave,score,message:"Today's arcade XP is already banked. Milestones reset tomorrow."});
 const store=await getStore();
 await store.batch(fresh.flatMap(m=>rewardStatements(store,user.userId,`game:${day}:${m.id}`,m.xp)));
 const xp=fresh.reduce((total,m)=>total+m.xp,0);
 return Response.json({xp,wave,score,message:`+${xp} XP banked from ${fresh.map(m=>m.id).join(", ")}.`});
}catch{return Response.json({error:"Could not bank this run. Your score still stands."},{status:500})}}

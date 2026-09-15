import {platformPlayer,apiError} from "../../../lib/platform";
import {rankForXp,nextRank,WHEEL_PRIZES} from "../../../lib/ranks";
import {SPIN_INSERT} from "../../../lib/progression-sql";
export async function GET(){try{const p=await platformPlayer();if(!p)return Response.json({error:"Sign in to view your rewards"},{status:401});const now=new Date().toISOString(),day=now.slice(0,10);
 const profile=await p.db.prepare("SELECT xp,level FROM profiles WHERE user_id=?").bind(p.user.userId).first<{xp:number;level:number}>();
 const activity=await p.db.prepare("SELECT last_participated FROM player_activity WHERE user_id=?").bind(p.user.userId).first<{last_participated:string}>();
 const spin=await p.db.prepare("SELECT prize,label FROM progression_events WHERE user_id=? AND source=?").bind(p.user.userId,`spin:${day}`).first<{prize:number;label:string}>();
 const events=await p.db.prepare("SELECT CASE WHEN label LIKE 'Failed challenge ·%' THEN 'Failed challenge (20%)' WHEN label LIKE 'Failed question ·%' THEN 'Failed question (20%)' ELSE label END label,xp_delta,shards,created_at FROM progression_events WHERE user_id=? ORDER BY created_at DESC LIMIT 20").bind(p.user.userId).all();
 const login=await p.db.prepare("SELECT 1 FROM progression_events WHERE user_id=? AND source=?").bind(p.user.userId,`login:${day}`).first();
 const due=activity?new Date(Date.parse(activity.last_participated)+172800000).toISOString():null;
 return Response.json({xp:profile!.xp,level:profile!.level,rank:rankForXp(profile!.xp),next:nextRank(profile!.xp),spin,events:events.results,loginClaimed:!!login,inactivityDue:due,serverNow:now,resetAt:new Date(`${day}T00:00:00.000Z`).getTime()+86400000});
}catch(e){return apiError(e)}}
export async function POST(){try{const p=await platformPlayer();if(!p)return Response.json({error:"Sign in to spin the wheel"},{status:401});const now=new Date().toISOString(),source=`spin:${now.slice(0,10)}`;
 // Rejection sampling avoids modulo bias; every sector has probability 1/6.
 let roll=crypto.getRandomValues(new Uint8Array(1))[0];while(roll>=252)roll=crypto.getRandomValues(new Uint8Array(1))[0];const prize=roll%6,reward=WHEEL_PRIZES[prize];
 const result=await p.db.prepare(SPIN_INSERT).bind(p.user.userId,source,`Daily wheel · ${reward.label}`,reward.xp,reward.shards,prize,now).run();
 const saved=await p.db.prepare("SELECT prize,label,xp_delta,shards FROM progression_events WHERE user_id=? AND source=?").bind(p.user.userId,source).first();
 return Response.json({reward:saved,alreadyClaimed:!result.meta.changes});
}catch(e){return apiError(e)}}

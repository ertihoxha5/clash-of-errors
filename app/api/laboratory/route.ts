import {platformPlayer,apiError} from "../../../lib/platform";
import {NPCS} from "../../../lib/npcs";
import {LAB_ITEMS,EARNED_SHARDS,SPENT_SHARDS,PURCHASE_SQL} from "../../../lib/laboratory";
export async function GET(){try{const p=await platformPlayer();if(!p)return Response.json({error:"Sign in to open your laboratory"},{status:401});const id=p.user.userId;
 const lab=await p.db.prepare("SELECT character FROM laboratories WHERE user_id=?").bind(id).first<{character:string}>();
 const wallet=await p.db.prepare(`SELECT ${EARNED_SHARDS} earned,${SPENT_SHARDS} spent`).bind(id,id).first<{earned:number;spent:number}>();
 const unlocks=await p.db.prepare("SELECT item FROM lab_unlocks WHERE user_id=?").bind(id).all<{item:string}>();
 return Response.json({character:lab?.character||"nullknight",earned:wallet!.earned,balance:wallet!.earned-wallet!.spent,unlocks:unlocks.results.map(r=>r.item)});
}catch(e){return apiError(e)}}
export async function POST(request:Request){try{const p=await platformPlayer();if(!p)return Response.json({error:"Sign in to save your laboratory"},{status:401});const b=await request.json() as {action?:string;character?:string;item?:string};const id=p.user.userId;
 if(b.action==="character"){
  if(!NPCS.some(n=>n.slug===b.character))return Response.json({error:"Choose a character from the roster"},{status:400});
  await p.db.prepare("INSERT INTO laboratories (user_id,character) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET character=excluded.character").bind(id,b.character).run();
 }else if(b.action==="unlock"){
  const item=LAB_ITEMS.find(i=>i.id===b.item);if(!item)return Response.json({error:"Unknown equipment"},{status:400});
  const result=await p.db.prepare(PURCHASE_SQL).bind(id,item.id,item.cost,new Date().toISOString(),id,id,item.cost).run();
  if(!result.meta.changes)return Response.json({error:"Already unlocked or not enough Aether Shards. Your balance has been refreshed."},{status:409});
 }else return Response.json({error:"Unknown laboratory action"},{status:400});
 return Response.json({ok:true});
}catch(e){return apiError(e)}}

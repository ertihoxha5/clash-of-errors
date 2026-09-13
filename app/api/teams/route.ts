import {apiError,platformPlayer} from "../../../lib/platform";

export async function GET(){
 try{
  const p=await platformPlayer();if(!p)return Response.json({error:"Authentication required"},{status:401});
  const team=await p.db.prepare("SELECT t.* FROM teams t JOIN team_members m ON m.team_id=t.id WHERE m.user_id=?").bind(p.user.userId).first();
  const members=team?await p.db.prepare("SELECT m.user_id,p.display_name,p.avatar,p.xp FROM team_members m JOIN profiles p ON p.user_id=m.user_id WHERE m.team_id=? ORDER BY m.joined_at").bind(team.id).all():{results:[]};
  return Response.json({team,members:members.results,userId:p.user.userId});
 }catch(error){return apiError(error);}
}
export async function POST(request:Request){
 try{
  const p=await platformPlayer();if(!p)return Response.json({error:"Authentication required"},{status:401});
  const body=await request.json() as {action?:string;name?:string;code?:string;userId?:string};
  const member=await p.db.prepare("SELECT t.* FROM teams t JOIN team_members m ON m.team_id=t.id WHERE m.user_id=?").bind(p.user.userId).first<{id:string;captain_id:string}>();
  const now=new Date().toISOString();
  if(body.action==="create"){
   if(member)return Response.json({error:"Leave your current team first"},{status:409});
   const name=typeof body.name==="string"?body.name.trim():"";
   if(name.length<3||name.length>40)return Response.json({error:"Use a team name between 3 and 40 characters"},{status:400});
   const id=crypto.randomUUID(),code=crypto.randomUUID().replaceAll("-","").slice(0,12).toUpperCase();
   await p.db.batch([p.db.prepare("INSERT INTO teams (id,name,invite_code,captain_id,created_at) VALUES (?,?,?,?,?)").bind(id,name,code,p.user.userId,now),p.db.prepare("INSERT INTO team_members (user_id,team_id,joined_at) VALUES (?,?,?)").bind(p.user.userId,id,now)]);
  }else if(body.action==="join"){
   if(member)return Response.json({error:"You already belong to a team"},{status:409});
   const code=typeof body.code==="string"?body.code.trim().toUpperCase():"";
   const result=await p.db.prepare("INSERT INTO team_members (user_id,team_id,joined_at) SELECT ?,t.id,? FROM teams t WHERE t.invite_code=? AND (SELECT count(*) FROM team_members WHERE team_id=t.id)<8").bind(p.user.userId,now,code).run();
   if(!result.meta.changes)return Response.json({error:"Invite code not found or team is full"},{status:409});
  }else if(body.action==="leave"){
   if(!member)return Response.json({ok:true});
   await p.db.batch([
    p.db.prepare("UPDATE teams SET captain_id=COALESCE((SELECT user_id FROM team_members WHERE team_id=? AND user_id<>? ORDER BY joined_at LIMIT 1),captain_id) WHERE id=? AND captain_id=?").bind(member.id,p.user.userId,member.id,p.user.userId),
    p.db.prepare("DELETE FROM team_members WHERE user_id=?").bind(p.user.userId),
    p.db.prepare("DELETE FROM teams WHERE id=? AND NOT EXISTS(SELECT 1 FROM team_members WHERE team_id=?)").bind(member.id,member.id),
   ]);
  }else if(body.action==="remove"||body.action==="captain"){
   if(!member||member.captain_id!==p.user.userId)return Response.json({error:"Only the captain can manage this team"},{status:403});
   if(body.userId===p.user.userId||typeof body.userId!=="string")return Response.json({error:"Select another member"},{status:400});
   if(body.action==="remove")await p.db.prepare("DELETE FROM team_members WHERE team_id=? AND user_id=?").bind(member.id,body.userId).run();
   else await p.db.prepare("UPDATE teams SET captain_id=? WHERE id=? AND EXISTS(SELECT 1 FROM team_members WHERE team_id=? AND user_id=?)").bind(body.userId,member.id,member.id,body.userId).run();
  }else return Response.json({error:"Unknown team action"},{status:400});
  return Response.json({ok:true});
 }catch(error){if(error instanceof Error&&/UNIQUE/i.test(error.message))return Response.json({error:"Your membership changed. Reload and retry."},{status:409});return apiError(error);}
}

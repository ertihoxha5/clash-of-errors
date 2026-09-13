import {eq} from "drizzle-orm";
import {accountEmail,clearedSessionCookie,endSession,getPlayer,hashPassword,newSalt,readSessionToken,
 saltBytes,sameDigest,sessionCookie,startSession,validateRegistration} from "../../auth";
import {getDb} from "../../../db";
import {accounts,profiles,users} from "../../../db/schema";

const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().replace(/[<>]/g,"").slice(0,max):"";

export async function GET(){
 const player=await getPlayer();
 return Response.json({player});
}

export async function POST(request:Request){try{
 const body=await request.json() as Record<string,unknown>;
 const action=clean(body.action,10)||"login";
 const username=clean(body.username,20).toLowerCase();
 const password=typeof body.password==="string"?body.password:"";
 const db=await getDb(),now=new Date().toISOString();

 if(action==="register"){
  const firstName=clean(body.firstName,40),lastName=clean(body.lastName,40);
  const problems=validateRegistration({firstName,lastName,username,password});
  if(problems.length)return Response.json({error:problems[0],problems},{status:400});
  const [taken]=await db.select({username:accounts.username}).from(accounts).where(eq(accounts.username,username)).limit(1);
  if(taken)return Response.json({error:"That username is already taken."},{status:409});

  const salt=newSalt();
  const digest=await hashPassword(password,saltBytes(salt));
  const userId=crypto.randomUUID();
  const displayName=`${firstName} ${lastName}`.trim();
  await db.insert(users).values({id:userId,email:accountEmail(username),createdAt:now,updatedAt:now});
  await db.insert(accounts).values({userId,username,firstName,lastName,passwordHash:digest,passwordSalt:salt,createdAt:now,updatedAt:now});
  await db.insert(profiles).values({userId,displayName,avatar:(firstName[0]+lastName[0]).toUpperCase(),updatedAt:now}).onConflictDoNothing();
  const token=await startSession(userId);
  return Response.json({ok:true,username,displayName},{status:201,headers:{"set-cookie":sessionCookie(token)}});
 }

 if(action==="login"){
  const [account]=await db.select().from(accounts).where(eq(accounts.username,username)).limit(1);
  // Hash even when the username is unknown so both paths cost the same.
  const salt=account?.passwordSalt??newSalt();
  const digest=await hashPassword(password,saltBytes(salt),account?.iterations??150_000);
  if(!account||!sameDigest(digest,account.passwordHash))
   return Response.json({error:"That username and password do not match."},{status:401});
  const token=await startSession(account.userId);
  return Response.json({ok:true,username},{headers:{"set-cookie":sessionCookie(token)}});
 }

 return Response.json({error:"Unknown account action."},{status:400});
}catch{return Response.json({error:"Could not complete that request. Please retry."},{status:500})}}

export async function DELETE(request:Request){try{
 const token=readSessionToken(request.headers.get("cookie"));
 if(token)await endSession(token);
 return Response.json({ok:true},{headers:{"set-cookie":clearedSessionCookie()}});
}catch{return Response.json({ok:true},{headers:{"set-cookie":clearedSessionCookie()}})}}

export const dynamic="force-dynamic";

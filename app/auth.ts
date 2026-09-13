import {and, eq, gt} from "drizzle-orm";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {accounts, profiles, sessions, users} from "../db/schema";

// The database module binds to Cloudflare D1 at import time, so it is pulled in
// on demand: pages that only ask "who is signed in?" — the landing page among
// them — should not drag the binding into their module graph.
const database=()=>import("../db").then(module=>module.getDb());

// Accounts live in this application: a name, a username, and a password hashed
// with PBKDF2-SHA256 through WebCrypto (the Workers runtime has no bcrypt, and
// PBKDF2 with a per-account salt and a high iteration count is the right
// primitive available there). A session is a random token in an http-only
// cookie, backed by a row that can be revoked.

export type Player={userId:string;username:string;displayName:string;firstName:string;lastName:string;email:string};

export const SESSION_COOKIE="coe_session";
const SESSION_DAYS=30;
const ITERATIONS=150_000;
const KEY_BYTES=32;

const encoder=new TextEncoder();
const toBase64=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes));
const fromBase64=(value:string)=>Uint8Array.from(atob(value),character=>character.charCodeAt(0));

export async function hashPassword(password:string,salt:Uint8Array,iterations=ITERATIONS){
 const key=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveBits"]);
 const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:salt as BufferSource,iterations,hash:"SHA-256"},key,KEY_BYTES*8);
 return toBase64(new Uint8Array(bits));
}

// Comparison runs over every byte so a wrong password cannot be narrowed down by timing.
export function sameDigest(left:string,right:string){
 if(left.length!==right.length)return false;
 let difference=0;
 for(let index=0;index<left.length;index+=1)difference|=left.charCodeAt(index)^right.charCodeAt(index);
 return difference===0;
}

export function newSalt(){return toBase64(crypto.getRandomValues(new Uint8Array(16)))}
export function saltBytes(salt:string){return fromBase64(salt)}
export function newToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,"0")).join("")}

export const USERNAME_PATTERN=/^[a-z0-9_]{3,20}$/i;

export function validateRegistration(input:{firstName:string;lastName:string;username:string;password:string}){
 const problems:string[]=[];
 if(input.firstName.trim().length<2)problems.push("Enter your first name.");
 if(input.lastName.trim().length<2)problems.push("Enter your surname.");
 if(!USERNAME_PATTERN.test(input.username))problems.push("Usernames are 3–20 characters: letters, numbers or underscore.");
 if(input.password.length<8)problems.push("Passwords need at least 8 characters.");
 if(input.password.length>200)problems.push("That password is too long.");
 return problems;
}

export function sessionCookie(token:string,maxAgeSeconds=SESSION_DAYS*24*60*60){
 return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax; HttpOnly`;
}
export function clearedSessionCookie(){return `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`}

export function readSessionToken(cookieHeader:string|null){
 if(!cookieHeader)return null;
 for(const part of cookieHeader.split(";")){
  const [name,...rest]=part.trim().split("=");
  if(name!==SESSION_COOKIE)continue;
  const value=rest.join("=");
  return /^[a-f0-9]{64}$/i.test(value)?value:null;
 }
 return null;
}

export async function startSession(userId:string){
 const db=await database();
 const token=newToken(),now=new Date();
 const expires=new Date(now.getTime()+SESSION_DAYS*24*60*60*1000);
 await db.insert(sessions).values({token,userId,createdAt:now.toISOString(),expiresAt:expires.toISOString()});
 return token;
}

export async function endSession(token:string){
 const db=await database();
 await db.delete(sessions).where(eq(sessions.token,token));
}

export async function playerForToken(token:string):Promise<Player|null>{
 const db=await database();
 const [row]=await db.select({
  userId:users.id,email:users.email,username:accounts.username,
  firstName:accounts.firstName,lastName:accounts.lastName,displayName:profiles.displayName,
 })
  .from(sessions)
  .innerJoin(users,eq(users.id,sessions.userId))
  .innerJoin(accounts,eq(accounts.userId,users.id))
  .leftJoin(profiles,eq(profiles.userId,users.id))
  .where(and(eq(sessions.token,token),gt(sessions.expiresAt,new Date().toISOString())))
  .limit(1);
 if(!row)return null;
 return {
  userId:row.userId,username:row.username,firstName:row.firstName,lastName:row.lastName,email:row.email,
  displayName:row.displayName||row.username,
 };
}

export async function getPlayer():Promise<Player|null>{
 const token=readSessionToken((await headers()).get("cookie"));
 if(!token)return null;
 try{return await playerForToken(token)}catch{return null}
}

export async function requirePlayer(returnTo:string):Promise<Player>{
 const player=await getPlayer();
 if(player)return player;
 redirect(`/login?return_to=${encodeURIComponent(safeReturnPath(returnTo))}`);
}

export function safeReturnPath(value:string){
 if(!value.startsWith("/")||value.startsWith("//"))return "/dashboard";
 if(value.startsWith("/login")||value.startsWith("/register"))return "/dashboard";
 return value;
}

// Every other table keys off users.id; the address is internal and never shown.
export const accountEmail=(username:string)=>`${username.toLowerCase()}@players.clash`;

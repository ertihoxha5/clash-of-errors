import { getPlayer } from "../app/auth";
import { getStore } from "../db";

export async function platformPlayer() {
  const user = await getPlayer();
  if (!user) return null;
  const db = await getStore();
  const now = new Date().toISOString();
  const name = user.displayName;
  await db.batch([
    db.prepare("INSERT INTO users (id,email,created_at,updated_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,updated_at=excluded.updated_at").bind(user.userId,user.email,now,now),
    db.prepare("INSERT OR IGNORE INTO profiles (user_id,display_name,avatar,updated_at) VALUES (?,?,?,?)").bind(user.userId,name,name.slice(0,2).toUpperCase(),now),
  ]);
  return { user, db };
}

// The ledger and increment run in one D1 transaction. Duplicate completion
// requests insert zero rows and cannot increment XP twice.
export function rewardStatements(db:D1Database,userId:string,source:string,xp:number) {
  return [
    db.prepare("INSERT OR IGNORE INTO platform_rewards (user_id,source,xp,created_at) VALUES (?,?,?,?)").bind(userId,source,xp,new Date().toISOString()),
    db.prepare("UPDATE profiles SET xp=xp+?, level=1+CAST((xp+?)/500 AS INTEGER), updated_at=? WHERE user_id=? AND changes()=1").bind(xp,xp,new Date().toISOString(),userId),
  ];
}

export function apiError(error:unknown) {
  console.error("Platform operation failed", error instanceof Error ? error.message : "Unknown error");
  return Response.json({error:"This action could not be completed. Please retry."},{status:500});
}

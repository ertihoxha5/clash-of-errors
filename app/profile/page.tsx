import {eq} from "drizzle-orm";
import {requireChatGPTUser} from "../chatgpt-auth";
import {getDb} from "../../db";
import {profiles,users} from "../../db/schema";
import ProfileEditor from "./ProfileEditor";
export const dynamic="force-dynamic";
export default async function ProfilePage(){const identity=await requireChatGPTUser("/profile"),db=getDb(),now=new Date().toISOString();await db.insert(users).values({id:identity.userId,email:identity.email,createdAt:now,updatedAt:now}).onConflictDoUpdate({target:users.id,set:{email:identity.email,updatedAt:now}});await db.insert(profiles).values({userId:identity.userId,displayName:identity.fullName||identity.email.split("@")[0],avatar:(identity.fullName||identity.email).slice(0,2).toUpperCase(),updatedAt:now}).onConflictDoNothing();const [profile]=await db.select().from(profiles).where(eq(profiles.userId,identity.userId)).limit(1);return <main className="account-page"><header className="account-nav"><a className="brand compact" href="/"><img src="/assets/mark.png" alt=""/><span>CLASH OF ERRORS</span></a><a href="/">← Back to arena</a></header><ProfileEditor initial={profile}/></main>}

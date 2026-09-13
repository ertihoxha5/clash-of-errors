import {eq} from "drizzle-orm";
import {requirePlayer} from "../auth";
import {getDb} from "../../db";
import {profiles} from "../../db/schema";
import PlatformShell from "../PlatformShell";
import ProfileEditor from "./ProfileEditor";

export const dynamic="force-dynamic";

export default async function ProfilePage(){
 const player=await requirePlayer("/profile");
 const db=await getDb();
 const [profile]=await db.select().from(profiles).where(eq(profiles.userId,player.userId)).limit(1);
 return <PlatformShell
  title={`${player.firstName} ${player.lastName}`}
  kicker="YOUR ACCOUNT"
  subtitle={`Signed in as @${player.username}. Display name, avatar and bio are what other players see on the leaderboard.`}>
  <ProfileEditor initial={profile} signOutHref="/logout"/>
 </PlatformShell>;
}

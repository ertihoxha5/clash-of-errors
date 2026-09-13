import {requirePlayer} from "../auth";
import {getDb} from "../../db";
import {topics} from "../../db/schema";
import PlatformShell from "../PlatformShell";
import ArenaSetup from "./ArenaSetup";

export const dynamic="force-dynamic";

export default async function Arena(){
 await requirePlayer("/arena");
 const db=await getDb();
 return <PlatformShell kicker="MULTIPLAYER GATEWAY" title="Live rooms"
  subtitle="Host a room for friends or join with a six-character code. Everyone answers the same questions against one clock.">
  <ArenaSetup topics={await db.select().from(topics)}/>
 </PlatformShell>;
}

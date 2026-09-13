import {requirePlayer} from "../auth";
import {getDb} from "../../db";
import {topics} from "../../db/schema";
import PlatformShell from "../PlatformShell";
import BotSetup from "./BotSetup";

export const dynamic="force-dynamic";

export default async function Bots(){
 await requirePlayer("/bots");
 const db=await getDb();
 return <PlatformShell kicker="SIMULATED COMBAT" title="Bot battles"
  subtitle="A scored solo run against simulated opponents with human-like timing. For code duels against a rival, use Battles.">
  <BotSetup topics={await db.select().from(topics)}/>
 </PlatformShell>;
}

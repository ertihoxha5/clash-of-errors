import {requirePlayer} from "../auth";
import PlatformShell from "../PlatformShell";
import Challenges from "./Challenges";

export const dynamic="force-dynamic";

export default async function Page(){
 await requirePlayer("/challenges");
 return <PlatformShell
  kicker="CHALLENGE LAB"
  title="Three ways to practise"
  subtitle="Find the bug in a short snippet, write the function until every test passes, or audit a full 300-line module for the single line that lies. First solve pays XP; battles are where you race someone for it.">
  <Challenges/>
 </PlatformShell>;
}

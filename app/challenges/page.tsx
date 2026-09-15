import {requirePlayer} from "../auth";
import PlatformShell from "../PlatformShell";
import Challenges from "./Challenges";

export const dynamic="force-dynamic";

export default async function Page(){
 await requirePlayer("/challenges");
 return <PlatformShell
  kicker="CHALLENGE LAB"
  title="Three ways to practise"
  subtitle="First-time solves earn XP and Aether Shards. A failed submission costs 20% of the challenge reward, rounded up, once per challenge per UTC day. Further retries that day are free; XP never falls below zero.">
  <Challenges/>
 </PlatformShell>;
}

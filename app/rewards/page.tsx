import {requirePlayer} from "../auth";
import PlatformShell from "../PlatformShell";
import Rewards from "./Rewards";
export const dynamic="force-dynamic";
export default async function Page(){await requirePlayer("/rewards");return <PlatformShell title="The Hall of Ascension" kicker="RANKS & DAILY REWARDS" subtitle="From Bronze I to Masterpiece. Earn your crest, claim your daily spin, and keep your place in the realm."><Rewards/></PlatformShell>}

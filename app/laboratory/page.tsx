import {requirePlayer} from "../auth";
import PlatformShell from "../PlatformShell";
import Laboratory from "./Laboratory";
export const dynamic="force-dynamic";
export default async function Page(){await requirePlayer("/laboratory");return <PlatformShell title="Your laboratory" kicker="THE AETHER KEEP" subtitle="Choose your character. Solve challenges. Build a place worthy of your discoveries."><Laboratory/></PlatformShell>}

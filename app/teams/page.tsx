import {requirePlayer} from "../auth";
import PlatformShell from "../PlatformShell";
import Teams from "./Teams";
export default async function Page(){await requirePlayer("/teams");return <PlatformShell title="Build your squad" subtitle="Create a team of up to eight players. Share your invite code, manage your roster, and grow together."><Teams/></PlatformShell>}

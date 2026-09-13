import {requirePlayer} from "../auth";
import PlatformShell from "../PlatformShell";
import s from "../platform.module.css";
import {platformData} from "../../lib/platform-data";
export const dynamic="force-dynamic";
export default async function Page(){await requirePlayer("/leaderboards");const d=await platformData();return <PlatformShell title="The leaderboard" subtitle="All-time earned XP. Team totals combine the XP of their current members."><div className={s.grid}><section className={s.card}><h2>Players</h2><table className={s.table}><thead><tr><th>Player</th><th>Level</th><th>XP</th></tr></thead><tbody>{d.leaders.map((p,i)=><tr key={i}><td>{p.display_name}</td><td>{p.level}</td><td>{p.xp}</td></tr>)}</tbody></table></section><section className={s.card}><h2>Teams</h2>{d.teams.length?<table className={s.table}><thead><tr><th>Team</th><th>Members</th><th>XP</th></tr></thead><tbody>{d.teams.map((t,i)=><tr key={i}><td>{t.name}</td><td>{t.members}</td><td>{t.xp}</td></tr>)}</tbody></table>:<p>No teams yet. Create the first squad.</p>}</section></div></PlatformShell>}

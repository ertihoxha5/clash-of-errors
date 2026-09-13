import {requirePlayer} from "../auth";
import PlatformShell from "../PlatformShell";
import s from "../platform.module.css";
import {platformData} from "../../lib/platform-data";
export const dynamic="force-dynamic";
export default async function Page(){await requirePlayer("/history");const d=await platformData();return <PlatformShell title="Your journey" subtitle="Your latest 50 challenge attempts, practice sessions, and battles."><div className={s.grid}>{d.history.map((h,i)=><article className={s.card} key={i}><span className={s.badge}>{h.mode} · {h.status}</span><h2>{h.title}</h2><time dateTime={h.date}>{new Date(h.date).toISOString().replace("T"," ").slice(0,19)} UTC</time></article>)}</div>{!d.history.length&&<p>No sessions yet. <a href="/challenges">Start a challenge</a>.</p>}</PlatformShell>}

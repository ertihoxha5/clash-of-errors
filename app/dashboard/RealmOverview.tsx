import {getStore} from "../../db";
import {npcBySlug} from "../../lib/npcs";
import {EARNED_SHARDS,SPENT_SHARDS} from "../../lib/laboratory";
import Avatar from "../components/Avatar";
import s from "./dashboard.module.css";
export default async function RealmOverview({userId,xp}:{userId:string;xp:number}){
 const db=await getStore();
 const [lab,wallet]=await Promise.all([db.prepare("SELECT character FROM laboratories WHERE user_id=?").bind(userId).first<{character:string}>(),db.prepare(`SELECT ${EARNED_SHARDS}-${SPENT_SHARDS} balance`).bind(userId,userId).first<{balance:number}>()]);
 const hero=npcBySlug(lab?.character||"nullknight");
 return <section className={s.overview} aria-label="Character and progression"><div className={s.character}><div className={s.portrait}><Avatar hue={hero.hue} size={100} label={hero.name}/></div><div><span className={s.label}>YOUR CHARACTER</span><h2>{hero.name}</h2><a href="/laboratory">Change character →</a></div></div><div className={s.progress}><div><span className={s.label}>LEVEL {1+Math.floor(xp/500)}</span><span>{xp%500} / 500 XP</span></div><progress value={xp%500} max={500} aria-label="Progress to next level"/><p>{500-xp%500} XP to your next level</p></div><a className={s.wallet} href="/laboratory"><span className={s.label}>AETHER SHARDS</span><strong>◈ {wallet?.balance||0}</strong><span>Build your laboratory →</span></a><div className={s.journey}><a href="/challenges"><b>01 · Learn</b><span>Solve a challenge</span></a><a href="/battles"><b>02 · Compete</b><span>Choose your rival</span></a><a href="/laboratory"><b>03 · Build</b><span>Spend your shards</span></a></div></section>
}

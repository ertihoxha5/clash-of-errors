import {requirePlayer} from "../auth";
import PlatformShell from "../PlatformShell";
import s from "../platform.module.css";
import b from "./battles.module.css";
import {platformData} from "../../lib/platform-data";
import {NPCS} from "../../lib/npcs";
import ChooseRival from "./ChooseRival";
import JoinBattle from "./JoinBattle";

export const dynamic="force-dynamic";

export default async function Page(){
 await requirePlayer("/battles");
 const data=await platformData();
 return <PlatformShell
  title="Battle central"
  subtitle="Challenges are your own practice, at your own pace. Battles are a race: the same task, one clock, and a rival typing on the other side of the screen.">
  <ChooseRival npcs={NPCS}/>

  <h2 className={b.sectionTitle}>Other arenas</h2>
  <div className={s.grid}>
   <article className={s.card}>
    <span className={s.badge}>MULTIPLAYER</span>
    <h2>Live room</h2>
    <p>Host a room for friends and answer the same rapid-fire questions against one clock.</p>
    <a href="/arena">Create or join a room →</a>
   </article>
   <article className={s.card}>
    <span className={s.badge}>ARCADE</span>
    <h2>Bug Hunter</h2>
    <p>Fly your character through a sector of broken code and patch every terminal before the bugs reach you.</p>
    <a href="/play">Play it as Game →</a>
   </article>
   <article className={s.card}>
    <span className={s.badge}>PRACTICE</span>
    <h2>Challenge lab</h2>
    <p>Find the bug or write the function, untimed, with the reference solution waiting at the end.</p>
    <a href="/challenges">Open the lab →</a>
   </article>
  </div>

  <h2 className={b.sectionTitle}>Public rooms</h2>
  {!data.rooms.length&&<p className={s.muted}>No public rooms are waiting. Create one from the live room arena and share the code.</p>}
  <div className={s.grid}>
   {data.rooms.map(room=><article className={s.card} key={room.code}>
    <span className={s.badge}>{room.topic} · {room.difficulty}</span>
    <h2>{room.title}</h2>
    <p>{room.members} / {room.max_participants} players · {room.code}</p>
    <JoinBattle code={room.code}/>
   </article>)}
  </div>
 </PlatformShell>;
}

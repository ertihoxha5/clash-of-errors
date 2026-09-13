"use client";
import {useState} from "react";
import Avatar from "../components/Avatar";
import type {Npc} from "../../lib/npcs";
import b from "./battles.module.css";

const DIFFICULTIES=[{id:"easy",label:"Easy",note:"Short function, 4–5 tests"},{id:"medium",label:"Medium",note:"Real logic, 3–4 tests"},{id:"hard",label:"Hard",note:"Edge cases everywhere"}];

export default function ChooseRival({npcs}:{npcs:Npc[]}){
 const [npc,setNpc]=useState(npcs[3]?.slug??npcs[0].slug);
 const [difficulty,setDifficulty]=useState("easy");
 const [status,setStatus]=useState("");
 const [busy,setBusy]=useState(false);

 async function start(){
  setBusy(true);setStatus("Opening the duel room…");
  try{
   const response=await fetch("/api/duel",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({npc,difficulty})});
   const data=await response.json() as {code?:string;error?:string};
   if(!response.ok||!data.code)throw new Error(data.error||"Could not open a duel.");
   location.href=`/duel/${data.code}`;
  }catch(error){setStatus(error instanceof Error?error.message:"Could not open a duel.");setBusy(false)}
 }

 return <section className={b.chooser}>
  <h2 className={b.sectionTitle}>Choose your rival</h2>
  <div className={b.roster}>
   {npcs.map(rival=><button key={rival.slug} type="button" className={b.rival} data-picked={npc===rival.slug||undefined}
    style={{"--hue":String(rival.hue)} as React.CSSProperties} onClick={()=>setNpc(rival.slug)}>
    <Avatar hue={rival.hue} size={62} label={rival.name}/>
    <b>{rival.name}</b>
    <span>Lv {rival.level} · {rival.tier}</span>
    <em>{rival.rating}</em>
    <p>{rival.taunt}</p>
   </button>)}
  </div>

  <h2 className={b.sectionTitle}>Task difficulty</h2>
  <div className={b.levels}>
   {DIFFICULTIES.map(level=><button key={level.id} type="button" className={b.level} data-picked={difficulty===level.id||undefined}
    onClick={()=>setDifficulty(level.id)}><b>{level.label}</b><span>{level.note}</span></button>)}
  </div>

  <div className={b.launch}>
   <button className="btn pink solid" disabled={busy} onClick={start}>Enter the duel</button>
   <p role="status">{status||"You both get the same task. First to pass every test wins the room."}</p>
  </div>
 </section>;
}

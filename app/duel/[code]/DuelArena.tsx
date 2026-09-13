"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import Avatar from "../../components/Avatar";
import CodeEditor from "../../components/CodeEditor";
import {runTests,type TestOutcome} from "../../../lib/sandbox";
import type {Npc} from "../../../lib/npcs";
import d from "./duel.module.css";

type Task={id:number;title:string;difficulty:string;prompt:string;code:string;tests:{name:string;call:string;expect:unknown}[];testCount:number};
type State={
 code:string;status:string;winner:string|null;xpEarned:number;remainingMs:number;timeLimit:number;
 testsTotal:number;userTestsPassed:number;npcTestsPassed:number;npcCode:string;npcCodeLines:number;
 npc:Npc;task:Task;you:{displayName:string;xp:number;rank:number};
 leaderboard:{displayName:string;xp:number;you:boolean}[];error?:string;
};

const clock=(ms:number)=>{
 const total=Math.max(0,Math.ceil(ms/1000));
 return `${String(Math.floor(total/60)).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`;
};

export default function DuelArena({code}:{code:string}){
 const [state,setState]=useState<State|null>(null);
 const [error,setError]=useState("");
 const [draft,setDraft]=useState("");
 const [outcomes,setOutcomes]=useState<TestOutcome[]>([]);
 const [compileError,setCompileError]=useState("");
 const [running,setRunning]=useState(false);
 const [copied,setCopied]=useState(false);
 const [localRemaining,setLocalRemaining]=useState(0);
 const seeded=useRef(false);

 const sync=useCallback(async()=>{
  const response=await fetch(`/api/duel/${code}`,{cache:"no-store"});
  const body=await response.json() as State;
  if(!response.ok){setError(body.error||"This duel could not be loaded.");return}
  setState(body);
  setLocalRemaining(body.remainingMs);
  if(!seeded.current){setDraft(body.task.code);seeded.current=true}
 },[code]);

 useEffect(()=>{void sync();const timer=setInterval(()=>void sync(),3000);return()=>clearInterval(timer)},[sync]);
 // The countdown ticks locally between syncs so the clock never looks frozen.
 useEffect(()=>{
  if(!state||state.status!=="active")return;
  const timer=setInterval(()=>setLocalRemaining(value=>Math.max(0,value-1000)),1000);
  return()=>clearInterval(timer);
 },[state]);

 async function runAndReport(){
  if(!state||running||state.status!=="active")return;
  setRunning(true);setCompileError("");
  const run=await runTests(draft,state.task.tests);
  setOutcomes(run.results);
  setCompileError(run.compileError||"");
  const passed=run.results.filter(result=>result.passed).length;
  try{
   const response=await fetch(`/api/duel/${code}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({testsPassed:passed})});
   if(response.ok)await sync();
  }catch{/* the next sync picks it up */}
  setRunning(false);
 }

 async function forfeit(){
  await fetch(`/api/duel/${code}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"forfeit"})});
  await sync();
 }

 if(error)return <div className={d.loading} role="alert">{error} <a href="/battles">Back to battles</a></div>;
 if(!state)return <div className={d.loading}>Opening duel room…</div>;

 const {npc,task}=state;
 const youPercent=Math.round(state.userTestsPassed/Math.max(1,state.testsTotal)*100);
 const npcPercent=Math.round(state.npcTestsPassed/Math.max(1,state.testsTotal)*100);
 const finished=state.status==="completed";
 const passing=outcomes.filter(outcome=>outcome.passed).length;

 return <div className={d.arena} style={{"--npc-hue":String(npc.hue)} as React.CSSProperties}>
  <div className={d.liveTag} data-finished={finished||undefined}><i/>{finished?"COMPLETE":"LIVE"}</div>

  <aside className={d.left}>
   <section className={d.panel}>
    <h2 className={d.panelTitle}>Room code</h2>
    <button className={d.roomCode} onClick={async()=>{
     try{await navigator.clipboard.writeText(state.code);setCopied(true)}catch{setCopied(false)}
    }}>{state.code}<span>{copied?"COPIED":"COPY"}</span></button>
    <p>Your duel against {npc.name}. Share the code to let a friend replay the same task.</p>
   </section>

   <section className={d.panel}>
    <h2 className={d.panelTitle}>Players</h2>
    <div className={d.player}>
     <Avatar hue={198} size={52} label={state.you.displayName}/>
     <div><b>{state.you.displayName}</b><span><i className={d.dot}/>Rank #{state.you.rank} · {state.you.xp} XP</span></div>
    </div>
    <div className={d.player}>
     <Avatar hue={npc.hue} size={52} label={npc.name}/>
     <div><b>{npc.name}</b><span><i className={d.dot}/>Level {npc.level} · {npc.tier.toUpperCase()}</span></div>
    </div>
    <p className={d.taunt}>“{npc.taunt}”</p>
   </section>
  </aside>

  <main className={d.stage}>
   <header className={d.stageHead}>
    <span>{task.title.toUpperCase()} · {task.difficulty.toUpperCase()}</span>
    <b data-low={localRemaining<60000||undefined}>{clock(finished?0:localRemaining)}</b>
   </header>
   <p className={d.brief}>{task.prompt}</p>

   <div className={d.duel}>
    <section className={d.side}>
     <header><Avatar hue={198} size={34} label={state.you.displayName}/><b>{state.you.displayName}</b></header>
     <CodeEditor value={draft} onChange={setDraft} readOnly={finished} minRows={12} label="Your solution"/>
    </section>

    <div className={d.versus} aria-hidden="true"><span>VS</span></div>

    <section className={`${d.side} ${d.rival}`}>
     <header><Avatar hue={npc.hue} size={34} label={npc.name}/><b>{npc.name}</b></header>
     <pre className={d.rivalCode}>
      {state.npcCode?<code>{state.npcCode}</code>:<code className={d.waiting}>{"// waiting for the first commit…"}</code>}
      {/* Unwritten lines show as redacted bars: the rival's remaining work is visible without inventing code. */}
      {Array.from({length:Math.max(0,state.npcCodeLines-(state.npcCode?state.npcCode.split(/\n/).length:0))},(_,index)=>
       <span key={index} className={d.ghostLine} style={{width:`${38+((index*37)%52)}%`}}/>)}
     </pre>
    </section>
   </div>

   <div className={d.scores}>
    <div className={d.score}>
     <b>{state.userTestsPassed}</b> <span>/ {state.testsTotal} TESTS PASSED</span>
     <i className={d.bar}><u style={{width:`${youPercent}%`}}/></i>
    </div>
    <button className={d.runButton} onClick={runAndReport} disabled={running||finished}>
     {running?"RUNNING TESTS…":finished?"DUEL OVER":"RUN TESTS"}
    </button>
    <div className={`${d.score} ${d.scoreRight}`}>
     <b>{state.npcTestsPassed}</b> <span>/ {state.testsTotal} TESTS PASSED</span>
     <i className={d.bar}><u className={d.barRival} style={{width:`${npcPercent}%`}}/></i>
    </div>
   </div>

   {compileError&&<p className={d.compileError} role="alert">{compileError}</p>}
   {!!outcomes.length&&<ul className={d.testList}>
    {outcomes.map(outcome=><li key={outcome.call} data-pass={outcome.passed||undefined}>
     <b>{outcome.passed?"✓":"✗"}</b><code>{outcome.call}</code>
     {!outcome.passed&&<span>{outcome.error??`expected ${outcome.expected}, got ${outcome.actual}`}</span>}
    </li>)}
   </ul>}
   {!outcomes.length&&!finished&&<p className={d.tip}>Write the function, then run the tests. {passing>0?"":"Every passing test is one step ahead of your rival."}</p>}

   {finished&&<div className={d.result} data-outcome={state.winner??"npc"}>
    <b>{state.winner==="you"?"You win the duel":state.winner==="draw"?"Dead heat":`${npc.name} takes it`}</b>
    <p>{state.winner==="you"?`You finished ${state.testsTotal} tests before ${npc.name}.`
      :state.winner==="draw"?"Both of you finished. Rematch for the tiebreak."
      :`${npc.name} finished first. Their solution is on the right — read it, then run it back.`}</p>
    {state.xpEarned>0&&<span className={d.xp}>+{state.xpEarned} XP</span>}
    <div className={d.resultActions}>
     <a className="btn cyan solid" href="/battles">New duel</a>
     <a className="btn pink outline" href="/challenges">Challenge lab</a>
    </div>
   </div>}

   {!finished&&<button className={d.forfeit} onClick={forfeit}>Forfeit duel</button>}
  </main>

  <aside className={d.right}>
   <section className={d.panel}>
    <h2 className={d.panelTitle}><span className={d.trophy}>🏆</span> Live leaderboard</h2>
    <ol className={d.board}>
     {state.leaderboard.map((row,index)=><li key={row.displayName+index} data-you={row.you||undefined}>
      <span className={d.place} data-top={index<3||undefined}>{index+1}</span>
      <Avatar hue={[198,288,330,150,38][index%5]} size={34} label={row.displayName} dim={index>2}/>
      <b>{row.displayName}</b>
      <em>{row.xp}</em>
     </li>)}
     {!state.leaderboard.some(row=>row.you)&&<li data-you>
      <span className={d.place}>{state.you.rank}</span>
      <Avatar hue={198} size={34} label={state.you.displayName}/>
      <b>You</b><em>{state.you.xp}</em>
     </li>}
    </ol>
   </section>
  </aside>
 </div>;
}

"use client";
import {useState} from "react";

const paths={
 swords:<><path d="m5 4 15 15M14 4h6v6M10 14l-6 6M4 14l6 6"/><path d="m20 4-6 6"/></>,
 bolt:<path d="m13 2-8 12h7l-1 8 8-12h-7z"/>,
 users:<><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-2a4 4 0 0 0-3-3.9"/></>,
 brain:<><path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v.3A3.6 3.6 0 0 0 4 15a3 3 0 0 0 3 3h2.5M14.5 4.5A3.5 3.5 0 0 1 18 8v.3a3.6 3.6 0 0 1 2 6.7 3 3 0 0 1-3 3h-2.5M12 3v18"/></>,
 shield:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
 trophy:<><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 0-3 3M9 20h6M12 15v5"/></>,
 skull:<><path d="M12 3a8 8 0 0 0-5 14.2V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2.8A8 8 0 0 0 12 3z"/><circle cx="9.2" cy="12" r="1.4"/><circle cx="14.8" cy="12" r="1.4"/><path d="M10.5 17h3"/></>,
 plus:<path d="M12 5v14M5 12h14"/>,
 grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
 play:<path d="M8 5v14l11-7z"/>,
 spark:<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>,
 trend:<path d="M3 17 9 11l4 4 8-8M21 7h-6M21 7v6"/>,
 book:<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 3v18"/>,
 arrow:<path d="M5 12h14M13 6l6 6-6 6"/>,
 code:<path d="m9 8-4 4 4 4M15 8l4 4-4 4"/>
};
type IconName=keyof typeof paths;
function Icon({name}:{name:IconName}){return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>}
function Btn({children,tone="cyan",variant="solid",onClick}:{children:React.ReactNode;tone?:"cyan"|"pink";variant?:"solid"|"outline";onClick?:()=>void}){return <button className={`btn ${tone} ${variant}`} onClick={onClick}>{children}</button>}

const nav=[{icon:"users" as IconName,label:"How It Works",id:"how"},{icon:"swords" as IconName,label:"Arenas",id:"modes"},{icon:"trophy" as IconName,label:"Leaderboards",id:"modes"},{icon:"book" as IconName,label:"For Teachers",id:"coach"}];
const chips=[{icon:"bolt" as IconName,label:"Live Battles"},{icon:"spark" as IconName,label:"Instant Feedback"},{icon:"trend" as IconName,label:"Skill Progression"},{icon:"book" as IconName,label:"Works in Classrooms"}];
const steps=[
 {icon:"users" as IconName,title:"Create or Join",copy:"Spin up an arena or join with a room code."},
 {icon:"swords" as IconName,title:"Battle Live",copy:"Solve challenges in real-time, head-to-head."},
 {icon:"brain" as IconName,title:"Get AI Feedback",copy:"Instant explanations, hints, and suggestions."},
 {icon:"trophy" as IconName,title:"Level Up",copy:"Earn XP, climb rankings, get better."}
];
const modes=[
 {icon:"swords" as IconName,tone:"cyan",title:"1v1 Duel",copy:"Head-to-head coding battles. One winner."},
 {icon:"users" as IconName,tone:"purple",title:"Squad Clash",copy:"Team up with friends in 2v2 battles."},
 {icon:"skull" as IconName,tone:"pink",title:"Survival",copy:"Solve challenges. Don't get eliminated."}
];
const coaching=[
 {icon:"bolt" as IconName,title:"Smart Hints",copy:"Get contextual hints when you're stuck."},
 {icon:"brain" as IconName,title:"Explain Errors",copy:"AI explains bugs and helps you fix them."},
 {icon:"trend" as IconName,title:"Learn & Improve",copy:"Personalized tips to level up your coding skills."}
];

export default function Home(){
 const [toast,setToast]=useState("");
 const ping=(m:string)=>{setToast(m);setTimeout(()=>setToast(""),2200)};
 const go=(id:string)=>document.querySelector("#"+id)?.scrollIntoView();
 return <main>
  <header className="topbar" id="top">
   <a className="brand" href="#top"><img src="/assets/logo.png" alt="Clash of Errors"/></a>
   <nav aria-label="Primary">{nav.map(n=><button key={n.label} onClick={()=>go(n.id)}><Icon name={n.icon}/>{n.label}</button>)}</nav>
   <div className="nav-actions">
    <Btn tone="cyan" variant="outline" onClick={()=>ping("Arena builder ships in Milestone 4")}><Icon name="plus"/> Create Arena</Btn>
   <Btn tone="pink" variant="outline" onClick={()=>ping("Room codes arrive in Milestone 3")}><Icon name="grid"/> Join With Code</Btn>
    <a className="profile-link" href="/login"><Icon name="users"/><span>Sign In</span></a>
   </div>
  </header>

  <section className="hero">
   <div className="hero-copy">
    <div className="eyebrow"><Icon name="code"/> SEASON 01 // ARENA ONLINE</div>
    <h1><span>Turn Learning Into</span><em>a Coding Arena.</em></h1>
    <div className="rule"><i/><i/></div>
    <p>Live multiplayer battles. AI-powered feedback. Real skill progression. Welcome to the arena where only the sharpest code survives.</p>
    <div className="hero-actions">
     <Btn tone="cyan" onClick={()=>go("modes")}><Icon name="swords"/> Start Battle</Btn>
     <Btn tone="pink" variant="outline" onClick={()=>ping("Demo arena queued for Milestone 3")}><Icon name="play"/> Try Demo</Btn>
    </div>
    <ul className="chips">{chips.map(c=><li key={c.label}><Icon name={c.icon}/>{c.label}</li>)}</ul>
   </div>
   <figure className="hero-art"><img src="/assets/hero-battle.png" alt="A live 1v1 coding battle: two players' solutions side by side with a room code, player roster, and live leaderboard"/></figure>
  </section>

  <section className="band">
   <article className="panel" id="how">
    <span className="kicker">How It Works</span>
    <ol className="steps">{steps.map((s,i)=><li key={s.title}><div className="hex"><Icon name={s.icon}/></div><b>{i+1}. {s.title}</b><span>{s.copy}</span>{i<steps.length-1&&<Icon name="arrow"/>}</li>)}</ol>
   </article>

   <article className="panel" id="modes">
    <span className="kicker">Battle Modes</span>
    <div className="modes">{modes.map(m=><div key={m.title} className={`mode ${m.tone}`}><div className="hex"><Icon name={m.icon}/></div><b>{m.title}</b><span>{m.copy}</span></div>)}</div>
   </article>

   <article className="panel" id="coach">
    <span className="kicker">AI Coaching</span>
    <ul className="coaching">{coaching.map(c=><li key={c.title}><div className="sq"><Icon name={c.icon}/></div><div><b>{c.title}</b><span>{c.copy}</span></div></li>)}</ul>
    <button className="link" onClick={()=>ping("AI coaching arrives in Milestone 10")}>See how coaching works <Icon name="arrow"/></button>
   </article>
  </section>

  <footer>
   <a className="brand compact" href="#top"><img src="/assets/mark.png" alt=""/><span>CLASH OF ERRORS</span></a>
   <p>Battle. Code. Conquer.</p>
   <span>© 2026 Clash of Errors</span>
  </footer>

  {toast&&<div className="toast" role="status">{toast}</div>}
 </main>
}

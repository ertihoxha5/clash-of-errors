import Avatar from "./components/Avatar";
import {getPlayer} from "./auth";
import {NPCS} from "../lib/npcs";
import h from "./home.module.css";

export const dynamic="force-dynamic";

const paths={
 swords:<><path d="m5 4 15 15M14 4h6v6M10 14l-6 6M4 14l6 6"/><path d="m20 4-6 6"/></>,
 bolt:<path d="m13 2-8 12h7l-1 8 8-12h-7z"/>,
 users:<><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-2a4 4 0 0 0-3-3.9"/></>,
 shield:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
 trophy:<><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 0-3 3M9 20h6M12 15v5"/></>,
 skull:<><path d="M12 3a8 8 0 0 0-5 14.2V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2.8A8 8 0 0 0 12 3z"/><circle cx="9.2" cy="12" r="1.4"/><circle cx="14.8" cy="12" r="1.4"/><path d="M10.5 17h3"/></>,
 grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
 play:<path d="M8 5v14l11-7z"/>,
 spark:<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>,
 trend:<path d="M3 17 9 11l4 4 8-8M21 7h-6M21 7v6"/>,
 book:<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 3v18"/>,
 code:<path d="m9 8-4 4 4 4M15 8l4 4-4 4"/>
};
type IconName=keyof typeof paths;
function Icon({name}:{name:IconName}){
 return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
  strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const NAV=[["#modes","Modes"],["#fields","Fields"],["#audit","Code audits"],["#rivals","Rivals"],["#how","How it works"]] as const;

const CHIPS=[
 {icon:"bolt" as IconName,label:"Server-graded answers"},
 {icon:"spark" as IconName,label:"Tests run in your browser"},
 {icon:"trend" as IconName,label:"XP, ranks and streaks"},
 {icon:"book" as IconName,label:"Six fields, one bank"},
];



const MODES=[
 {tone:"cyan",icon:"code" as IconName,title:"Challenges",href:"/challenges",link:"Open the lab",
  copy:"Practice at your own pace, in three shapes.",
  points:["Find the bug in a short snippet","Write the function until every test passes","Audit a full 300-line module for one defect"]},
 {tone:"purple",icon:"swords" as IconName,title:"Battles",href:"/battles",link:"Choose a rival",
  copy:"The same task, one clock, someone typing on the other side.",
  points:["1v1 duels against NPC rivals","Live test counters for both sides","Their solution reveals as they pass tests"]},
 {tone:"pink",icon:"play" as IconName,title:"Bug Hunter",href:"/play",link:"Play it as Game",
  copy:"An arcade sector where the puzzles are real bugs.",
  points:["Fly your character between code terminals","Each terminal is a real find-the-bug task","Roaming bugs hunt you while you read"]},
];

const FIELD_BLURBS:Record<string,string>={
 javascript:"Scope, async ordering, coercion and the quirks that survive code review.",
 python:"Mutable defaults, shared references, identity traps and decimal money.",
 algorithms:"Complexity, traversal, sliding windows and the classic interview toolkit.",
 "data-structures":"Arrays, stacks, queues, maps, trees and the shapes behind them.",
 debugging:"Stack traces, flaky tests, race conditions and the discipline of bisecting.",
 cybersecurity:"Injection, weak hashing, broken authorisation, token entropy and leaking secrets.",
 sql:"Queries that quietly lie: filtered outer joins, duplicate counts, unusable indexes.",
 web:"The DOM, storage, requests and everything the browser does behind your back.",
};

// Loaded on demand so the landing page keeps rendering — with the counts
// omitted — if the database is unreachable, and so the marketing route does not
// drag the D1 binding into its module graph.
async function bankSummary(){
 try{
  const [{desc,eq,sql},{getDb},{codeTasks,topics}]=await Promise.all([
   import("drizzle-orm"),import("../db"),import("../db/schema"),
  ]);
  const db=await getDb();
  const rows=await db.select({slug:topics.slug,name:topics.name,count:sql<number>`count(${codeTasks.id})`})
   .from(topics).innerJoin(codeTasks,eq(codeTasks.topicId,topics.id))
   .where(eq(codeTasks.status,"published"))
   .groupBy(topics.id).orderBy(desc(sql`count(${codeTasks.id})`));
  const [{total,audits}]=await db.select({
   total:sql<number>`count(*)`,
   audits:sql<number>`sum(case when ${codeTasks.kind}='audit' then 1 else 0 end)`,
  }).from(codeTasks).where(eq(codeTasks.status,"published"));
  return {
   fields:rows.map(row=>({name:row.name,copy:FIELD_BLURBS[row.slug]??"Hands-on challenges from the shared bank.",count:Number(row.count)})),
   total:Number(total),
   audits:Number(audits),
  };
 }catch{
  return {fields:[] as {name:string;copy:string;count:number}[],total:0,audits:0};
 }
}

// A real excerpt from the checkout audit: the reported symptom is a shipping
// charge, and the defect is one missing factor several screens away.
const SAMPLE=[
 {n:96,code:"function lineSubtotal(line) {"},
 {n:97,code:"  return line.unitPrice * line.quantity;"},
 {n:98,code:"}"},
 {n:99,code:""},
 {n:100,code:"function cartWeight(lines) {"},
 {n:101,code:"  return lines.reduce((total, line) => total + line.weightGrams, 0);",flag:true},
 {n:102,code:"}"},
];

const STEPS=[
 {title:"Create an account",copy:"Name, surname, username, password. Nothing else, no third party."},
 {title:"Pick a field",copy:"Six fields, three challenge shapes, three difficulties."},
 {title:"Solve and submit",copy:"The server grades the answer and explains the defect either way."},
 {title:"Take it to a duel",copy:"Race an NPC rival on the same task and bank the XP."},
];

const FAQ=[
 {q:"How is a solution checked?",
  a:"Find-the-bug and audit answers are graded on the server: the faulty line and the correct fix never reach your browser. Write-the-code tasks run their test list in a sandboxed worker in your tab, and the server credits the solve only when every test passed."},
 {q:"What is a code audit?",
  a:"A complete module of roughly 300 lines with a single planted defect, a reported symptom, and a region to search. You read it like a reviewer: search for a symbol, jump to a line, then commit to one."},
 {q:"Can my code hang the page?",
  a:"No. Tests run inside a Web Worker with a timeout; an endless loop is terminated and reported as a failing test."},
 {q:"What do I earn?",
  a:"XP for a first solve, more for winning duels, and daily milestones in the arcade. XP drives your level and your place on the leaderboard."},
];

export default async function Home(){
 const [player,bank]=await Promise.all([getPlayer(),bankSummary()]);
 const stats=[
  {value:String(bank.total),label:"Published challenges"},
  {value:String(bank.audits),label:"300-line audit modules"},
  {value:String(bank.fields.length),label:"Fields to train"},
  {value:String(NPCS.length),label:"NPC rivals to beat"},
 ];
 return <main>
  <header className="topbar" id="top">
   <a className="brand" href="#top"><img src="/assets/logo.png" alt="Clash of Errors"/></a>
   <nav aria-label="Primary">{NAV.map(([href,label])=><a key={href} href={href}>{label}</a>)}</nav>
   <div className="nav-actions">
    {player
     ?<><a className="btn cyan outline" href="/dashboard"><Icon name="grid"/> Command center</a>
        <a className="profile-link" href="/profile"><Icon name="users"/><span>@{player.username}</span></a></>
     :<><a className="btn cyan outline" href="/register"><Icon name="users"/> Create account</a>
        <a className="profile-link" href="/login"><Icon name="shield"/><span>Sign in</span></a></>}
   </div>
  </header>

  <section className="hero">
   <div className="hero-copy">
    <div className="eyebrow"><Icon name="code"/> SEASON 01 // ARENA ONLINE</div>
    <h1><span>Turn Debugging Into</span><em>a Coding Arena.</em></h1>
    <div className="rule"><i/><i/></div>
    <p>Find the bug in a snippet. Audit a 300-line module for the one line that lies. Write the function until every test goes green — then race a rival through the same task on one clock.</p>
    <div className="hero-actions">
     <a className="btn cyan solid" href={player?"/challenges":"/register"}><Icon name="swords"/> {player?"Start a challenge":"Create your account"}</a>
     <a className="btn pink outline" href="/play"><Icon name="play"/> Play it as Game</a>
    </div>
    <ul className="chips">{CHIPS.map(chip=><li key={chip.label}><Icon name={chip.icon}/>{chip.label}</li>)}</ul>
   </div>
   <figure className="hero-art">
    <img src="/assets/hero-battle.png" alt="A live 1v1 coding duel: two solutions side by side with a room code, the player roster, and a live leaderboard"/>
   </figure>
  </section>

  <div className={h.stats}>
   {stats.map(stat=><div className={h.stat} key={stat.label}><b>{stat.value}</b><span>{stat.label}</span></div>)}
  </div>

  <section className={h.section} id="modes">
   <div className={h.sectionHead}>
    <span className="kicker">Three ways to play</span>
    <h2>Practice, race, or hunt.</h2>
    <p>Challenges are yours alone and untimed. Battles put the same task in front of a rival with a clock running. Bug Hunter turns the whole thing into an arcade run. Same bug bank underneath all three.</p>
   </div>
   <div className={h.modeGrid}>
    {MODES.map(mode=><article key={mode.title} className={h.modeCard} data-tone={mode.tone}>
     <div className="hex"><Icon name={mode.icon}/></div>
     <h3>{mode.title}</h3>
     <p>{mode.copy}</p>
     <ul className={h.modeList}>{mode.points.map(point=><li key={point}>{point}</li>)}</ul>
     <a className={h.modeLink} href={mode.href}>{mode.link} →</a>
    </article>)}
   </div>
  </section>

  <section className={h.section} id="fields">
   <div className={h.sectionHead}>
    <span className="kicker">Fields</span>
    <h2>Six fields, one bank.</h2>
    <p>Every field carries all three challenge shapes at three difficulties, so a weak area can be drilled directly rather than hoped for.</p>
   </div>
   <div className={h.fields}>
    {bank.fields.map(field=><div className={h.field} key={field.name}>
     <b>{field.name}</b><span>{field.copy}</span><em>{field.count} challenge{field.count===1?"":"s"}</em>
    </div>)}
   </div>
  </section>

  <section className={h.section} id="audit">
   <div className={h.sectionHead}>
    <span className="kicker">Code audits</span>
    <h2>Three hundred lines. One wrong.</h2>
    <p>A real module, a reported symptom, and no highlighting to help you. Search it, jump around it, and commit to a line — the same way you would in a review.</p>
   </div>
   <div className={h.sample}>
    <div className={h.sampleCode}>
     {SAMPLE.map(row=><div key={row.n} data-flag={row.flag||undefined}><b>{row.n}</b><code>{row.code||" "}</code></div>)}
    </div>
    <div className={h.sampleCaption}>
     <h3>Symptom: multi-item orders ship at the light-parcel rate</h3>
     <p>Line 97 multiplies price by quantity. Line 101 forgets to. Nothing throws, no test is obviously red, and the bug sits two hundred lines from where the money is calculated.</p>
     <p>That is the shape of an audit challenge: the symptom is a business fact, and the defect is one token.</p>
     <a className="btn cyan outline" href="/challenges">Open a code audit</a>
    </div>
   </div>
  </section>

  <section className={h.section} id="rivals">
   <div className={h.sectionHead}>
    <span className="kicker">Rivals</span>
    <h2>Pick who you race.</h2>
    <p>Each rival solves at its own pace and reveals its solution line by line as its tests pass. Their whole run is fixed when the room opens — you are racing a schedule, not a script that reacts to you.</p>
   </div>
   <div className={h.rivals}>
    {NPCS.map(npc=><div className={h.rival} key={npc.slug}>
     <Avatar hue={npc.hue} size={62} label={npc.name}/>
     <b>{npc.name}</b>
     <span>Lv {npc.level} · {npc.tier}</span>
     <em style={{color:npc.accent}}>{npc.rating}</em>
    </div>)}
   </div>
  </section>

  <section className={h.section} id="how">
   <div className={h.sectionHead}>
    <span className="kicker">How it works</span>
    <h2>From account to first duel.</h2>
    <p>No email verification, no third-party sign-in, no waiting. Four steps from landing here to racing a rival.</p>
   </div>
   <div className={h.steps}>
    {STEPS.map(step=><div className={h.step} key={step.title}><b>{step.title}</b><span>{step.copy}</span></div>)}
   </div>
  </section>

  <section className={h.section}>
   <div className={h.sectionHead}>
    <span className="kicker">Questions</span>
    <h2>How the grading works.</h2>
   </div>
   <div className={h.faq}>
    {FAQ.map(item=><article key={item.q}><b>{item.q}</b><p>{item.a}</p></article>)}
   </div>
  </section>

  <section className={h.cta}>
   <span className="kicker">Ready?</span>
   <h2>{player?"Your arena is waiting.":"Claim your handle."}</h2>
   <p>{player
    ?`Signed in as @${player.username}. Pick a field, solve something, and take it into a duel.`
    :"Name, surname, username, password. That is the whole sign-up, and every mode unlocks immediately."}</p>
   <div className={h.ctaActions}>
    <a className="btn cyan solid" href={player?"/dashboard":"/register"}><Icon name="trophy"/> {player?"Command center":"Create account"}</a>
    <a className="btn pink outline" href={player?"/battles":"/login"}><Icon name="skull"/> {player?"Enter a duel":"Sign in"}</a>
   </div>
  </section>

  <footer>
   <a className="brand compact" href="#top"><img src="/assets/mark.png" alt=""/><span>CLASH OF ERRORS</span></a>
   <p>Battle. Code. Conquer.</p>
   <span>© 2026 Clash of Errors</span>
  </footer>
 </main>;
}

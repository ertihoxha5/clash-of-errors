"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import AuditViewer from "../components/AuditViewer";
import BugSnippet from "../components/BugSnippet";
import CodeEditor from "../components/CodeEditor";
import {runTests,type TestOutcome} from "../../lib/sandbox";
import s from "../platform.module.css";
import c from "./challenges.module.css";

type Kind="bug"|"write"|"audit";
type Summary={id:number;kind:Kind;title:string;prompt:string;difficulty:string;language:string;xp:number;topic:string;testCount:number;solved:boolean;symptom:string;lineCount:number};
type Task={id:number;kind:Kind;title:string;difficulty:string;language:string;prompt:string;code:string;lines:string[];
 fixes:string[];tests:{name:string;call:string;expect:unknown}[];testCount:number;xp:number;topic:string;
 hint:string;symptom:string;region:string;lineCount:number};
type Verdict={correct:boolean;explanation:string;xp:number;buggyLine?:number;lineCorrect?:boolean;fixCorrect?:boolean;
 testsPassed?:number;testsTotal?:number;solution?:string};

const KIND_LABEL:Record<Kind,string>={bug:"FIND THE BUG",write:"WRITE THE CODE",audit:"CODE AUDIT"};
const KIND_FILTERS:[string,string][]=[["","All challenges"],["bug","Find the bug"],["write","Write the code"],["audit","Code audits"]];
const DIFFICULTY=["easy","medium","hard"];

export default function Challenges(){
 const [list,setList]=useState<Summary[]>([]);
 const [kind,setKind]=useState("");
 const [difficulty,setDifficulty]=useState("");
 const [topic,setTopic]=useState("");
 const [search,setSearch]=useState("");
 const [notice,setNotice]=useState("Loading the challenge bank…");
 const [task,setTask]=useState<Task|null>(null);
 const [busy,setBusy]=useState(false);
 const [picked,setPicked]=useState<number|null>(null);
 const [fixIndex,setFixIndex]=useState<number|null>(null);
 const [showHint,setShowHint]=useState(false);
 const [draft,setDraft]=useState("");
 const [outcomes,setOutcomes]=useState<TestOutcome[]>([]);
 const [compileError,setCompileError]=useState("");
 const [verdict,setVerdict]=useState<Verdict|null>(null);
 // The wall clock is read from an effect, never during render.
 const openedAt=useRef(0);

 const load=useCallback(async()=>{
  try{
   const response=await fetch("/api/tasks",{cache:"no-store"});
   const data=await response.json() as {tasks?:Summary[];error?:string};
   if(!response.ok)throw new Error(data.error);
   setList(data.tasks||[]);
   setNotice(data.tasks?.length?"":"No challenges are published yet.");
  }catch{setNotice("Could not load challenges. Reload to retry.")}
 },[]);
 useEffect(()=>{void load()},[load]);
 useEffect(()=>{if(task)openedAt.current=Date.now()},[task]);

 async function open(id:number){
  setBusy(true);setNotice("");
  try{
   const response=await fetch(`/api/tasks?id=${id}`,{cache:"no-store"});
   const data=await response.json() as {task?:Task;error?:string};
   if(!response.ok||!data.task)throw new Error(data.error||"Challenge unavailable");
   setTask(data.task);setPicked(null);setFixIndex(null);setVerdict(null);setShowHint(false);
   setOutcomes([]);setCompileError("");setDraft(data.task.code);
   window.scrollTo({top:0,behavior:"smooth"});
  }catch(error){setNotice(error instanceof Error?error.message:"Challenge unavailable")}
  finally{setBusy(false)}
 }

 function close(){setTask(null);setVerdict(null);setNotice("")}

 const runInSandbox=useCallback(async()=>{
  if(!task)return[];
  setBusy(true);setCompileError("");
  const run=await runTests(draft,task.tests);
  setOutcomes(run.results);
  setCompileError(run.compileError||"");
  setBusy(false);
  return run.results;
 },[draft,task]);

 async function submit(){
  if(!task)return;
  setBusy(true);
  try{
   let payload:Record<string,unknown>={taskId:task.id,durationMs:Math.max(0,Date.now()-openedAt.current)};
   if(task.kind==="write"){
    const results=outcomes.length?outcomes:await runInSandbox();
    payload={...payload,testsPassed:results.filter(result=>result.passed).length};
   }else{
    if(picked===null||fixIndex===null){setNotice("Choose the faulty line and the fix that repairs it.");setBusy(false);return}
    payload={...payload,line:picked,fixIndex};
   }
   const response=await fetch("/api/tasks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
   const data=await response.json() as Verdict&{error?:string};
   if(!response.ok)throw new Error(data.error);
   setVerdict(data);
   if(data.correct){
    setList(items=>items.map(item=>item.id===task.id?{...item,solved:true}:item));
    void load();
   }
  }catch(error){setNotice(error instanceof Error?error.message:"Could not submit this attempt.")}
  finally{setBusy(false)}
 }

 const topics=[...new Set(list.map(item=>item.topic))].sort();
 const visible=list.filter(item=>
  (!kind||item.kind===kind)&&
  (!difficulty||item.difficulty===difficulty)&&
  (!topic||item.topic===topic)&&
  `${item.title} ${item.prompt} ${item.topic} ${item.symptom}`.toLowerCase().includes(search.toLowerCase()));
 const passing=outcomes.filter(outcome=>outcome.passed).length;

 if(task){
  const graded=verdict?verdict.buggyLine??null:null;
  return <section className={c.workspace}>
   <header className={c.taskHead}>
    <div>
     <span className={s.badge} data-kind={task.kind}>{KIND_LABEL[task.kind]} · {task.difficulty.toUpperCase()} · {task.topic}</span>
     <h2>{task.title}</h2>
     <p>{task.prompt}</p>
    </div>
    <button className="btn cyan outline" onClick={close}>← All challenges</button>
   </header>

   {task.kind==="audit"&&<div className={c.brief}>
    <article><b>Reported symptom</b><p>{task.symptom}</p></article>
    <article><b>Where to look</b><p>{task.region||"Anywhere in the file."}</p></article>
    <article>
     <b>Hint</b>
     {showHint?<p>{task.hint}</p>:<button type="button" className={c.hintButton} onClick={()=>setShowHint(true)}>Reveal the hint</button>}
    </article>
   </div>}

   {task.kind==="write"?<div className={c.split}>
    <div>
     <CodeEditor value={draft} onChange={setDraft} onRun={()=>void runInSandbox()} onReset={()=>setDraft(task.code)}
      label={`Solution for ${task.title}`} minRows={14}/>
     <div className={c.runRow}>
      <button className="btn cyan outline" disabled={busy} onClick={()=>void runInSandbox()}>Run tests</button>
      <span>{outcomes.length?`${passing} / ${task.tests.length} passing`:`${task.tests.length} tests ready`}</span>
     </div>
    </div>
    <div className={c.tests}>
     <h3>Tests</h3>
     {compileError&&<p className={c.compileError} role="alert">{compileError}</p>}
     {task.tests.map((test,index)=>{
      const outcome=outcomes[index];
      return <div key={test.call} className={c.test} data-state={outcome?(outcome.passed?"pass":"fail"):"idle"}>
       <b>{outcome?(outcome.passed?"✓":"✗"):"•"} {test.name}</b>
       <code>{test.call}</code>
       {outcome&&!outcome.passed&&<span>{outcome.error?outcome.error:`expected ${outcome.expected}, got ${outcome.actual}`}</span>}
      </div>;
     })}
    </div>
   </div>:task.kind==="audit"?<div className={c.auditLayout}>
    <AuditViewer lines={task.lines} picked={picked} answer={graded} language={task.language}
     onPick={line=>{if(!verdict)setPicked(line)}} disabled={!!verdict}/>
    <aside className={c.fixes}>
     <h3>Which fix repairs it?</h3>
     {task.fixes.map((fix,index)=><button key={fix} type="button" disabled={!!verdict}
      className={`${c.fix} ${fixIndex===index?c.fixPicked:""}`} onClick={()=>setFixIndex(index)}>
      <span>{String.fromCharCode(65+index)}</span><code>{fix}</code>
     </button>)}
     <p className={c.auditNote}>{task.lineCount} lines. One line is wrong.</p>
    </aside>
   </div>:<div className={c.split}>
    <div>
     <BugSnippet lines={task.lines} picked={picked} answer={graded}
      onPick={line=>{if(!verdict)setPicked(line)}} disabled={!!verdict}/>
     <p className={c.hint}>{picked?`Line ${picked} selected.`:"Click the line you believe is wrong."}</p>
    </div>
    <div className={c.fixes}>
     <h3>Which fix repairs it?</h3>
     {task.fixes.map((fix,index)=><button key={fix} type="button" disabled={!!verdict}
      className={`${c.fix} ${fixIndex===index?c.fixPicked:""}`} onClick={()=>setFixIndex(index)}>
      <span>{String.fromCharCode(65+index)}</span><code>{fix}</code>
     </button>)}
    </div>
   </div>}

   {verdict&&<div className={`${c.verdict} ${verdict.correct?c.good:c.bad}`} role="status">
    <b>{verdict.correct?"Solved":task.kind==="write"?"Tests still failing":(verdict.lineCorrect?"Right line, wrong fix":"Not that line")}</b>
    <p>{verdict.explanation}</p>
    {verdict.solution&&<pre className={c.solution}>{verdict.solution}</pre>}
    {verdict.xp>0&&<span className={c.xp}>+{verdict.xp} XP</span>}
   </div>}

   <div className={c.actions}>
    {!verdict&&<button className="btn pink solid" disabled={busy} onClick={submit}>Submit answer</button>}
    {verdict&&!verdict.correct&&<button className="btn cyan solid" onClick={()=>{setVerdict(null);setPicked(null);setFixIndex(null)}}>Try again</button>}
    {verdict&&<button className="btn cyan outline" onClick={close}>Back to the bank</button>}
    <a className="btn pink outline" href="/battles">Take it into a duel →</a>
   </div>
   {notice&&<p className={s.notice} role="status">{notice}</p>}
  </section>;
 }

 return <>
  <div className={c.filters}>
   <label>Search<input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Title, field or symptom"/></label>
   <div className={c.chips} role="group" aria-label="Challenge kind">
    {KIND_FILTERS.map(([value,label])=>
     <button key={label} type="button" className={kind===value?c.chipOn:c.chip} onClick={()=>setKind(value)}>{label}</button>)}
   </div>
   <div className={c.chips} role="group" aria-label="Field">
    <button type="button" className={topic===""?c.chipOn:c.chip} onClick={()=>setTopic("")}>Every field</button>
    {topics.map(name=>
     <button key={name} type="button" className={topic===name?c.chipOn:c.chip} onClick={()=>setTopic(name)}>{name}</button>)}
   </div>
   <div className={c.chips} role="group" aria-label="Difficulty">
    {["",...DIFFICULTY].map(value=>
     <button key={value||"any"} type="button" className={difficulty===value?c.chipOn:c.chip} onClick={()=>setDifficulty(value)}>{value||"Any level"}</button>)}
   </div>
   <span className={c.progress}>{list.filter(item=>item.solved).length} / {list.length} solved</span>
  </div>
  {notice&&<p className={s.notice} role="status">{notice}</p>}
  <div className={c.grid}>
   {visible.map(item=><article key={item.id} className={c.card} data-kind={item.kind}>
    <span className={c.kind}>{KIND_LABEL[item.kind]}</span>
    <h2>{item.title}</h2>
    <p>{item.prompt}</p>
    <footer>
     <span>{item.topic} · {item.difficulty} · {item.kind==="write"?`${item.testCount} tests`:item.kind==="audit"?`${item.lineCount} lines`:"1 line"} · {item.xp} XP</span>
     <button className="btn cyan outline" disabled={busy} onClick={()=>open(item.id)}>{item.solved?"Replay":"Solve"}</button>
    </footer>
    {item.solved&&<i className={c.solved}>SOLVED</i>}
   </article>)}
   {!visible.length&&!notice&&<p className={s.muted}>No challenges match those filters.</p>}
  </div>
 </>;
}

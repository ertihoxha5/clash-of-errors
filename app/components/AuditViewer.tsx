"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import v from "./audit.module.css";

// Reading a 300-line module is the challenge, so the viewer has to work like a
// code reader: jump to a line, filter to the lines that mention a symbol, keep
// the chosen line pinned, and never lose your place when a verdict arrives.
export default function AuditViewer({lines,picked,answer,onPick,disabled,language}:{
 lines:string[];picked:number|null;answer:number|null;onPick:(line:number)=>void;disabled?:boolean;language:string;
}){
 const [query,setQuery]=useState("");
 const [jump,setJump]=useState("");
 const [onlyMatches,setOnlyMatches]=useState(false);
 const listRef=useRef<HTMLDivElement>(null);
 const rowRefs=useRef(new Map<number,HTMLButtonElement>());

 const matches=useMemo(()=>{
  const needle=query.trim().toLowerCase();
  if(!needle)return new Set<number>();
  const found=new Set<number>();
  lines.forEach((line,index)=>{if(line.toLowerCase().includes(needle))found.add(index+1)});
  return found;
 },[lines,query]);

 const scrollToLine=useCallback((line:number)=>{
  const row=rowRefs.current.get(line);
  if(row)row.scrollIntoView({block:"center",behavior:"smooth"});
 },[]);

 // A graded answer scrolls the real faulty line into view, so the lesson lands.
 useEffect(()=>{if(answer)scrollToLine(answer)},[answer,scrollToLine]);

 const visible=onlyMatches&&matches.size?lines.map((line,index)=>({line,number:index+1})).filter(row=>matches.has(row.number))
  :lines.map((line,index)=>({line,number:index+1}));

 return <div className={v.viewer}>
  <div className={v.toolbar}>
   <label className={v.search}>
    <span>Search</span>
    <input value={query} placeholder="function, variable, comment…" onChange={event=>setQuery(event.target.value)}/>
   </label>
   <span className={v.count}>{query.trim()?`${matches.size} matching lines`:`${lines.length} lines`}</span>
   <label className={v.toggle}>
    <input type="checkbox" checked={onlyMatches} disabled={!matches.size} onChange={event=>setOnlyMatches(event.target.checked)}/>
    <span>Only matches</span>
   </label>
   <form className={v.jump} onSubmit={event=>{
    event.preventDefault();
    const line=Number(jump);
    if(Number.isInteger(line)&&line>=1&&line<=lines.length)scrollToLine(line);
   }}>
    <label className={v.search}><span>Go to line</span>
     <input value={jump} inputMode="numeric" placeholder="128" onChange={event=>setJump(event.target.value.replace(/\D/g,""))}/>
    </label>
    <button type="submit" className={v.jumpButton}>Jump</button>
   </form>
   {picked!==null&&<button type="button" className={v.jumpButton} onClick={()=>scrollToLine(picked)}>Back to line {picked}</button>}
  </div>

  <div className={v.file} ref={listRef} data-language={language}>
   {visible.map(row=>{
    const isAnswer=answer!==null&&row.number===answer;
    const isWrongPick=answer!==null&&picked===row.number&&row.number!==answer;
    return <button
     type="button" key={row.number} className={v.row} disabled={disabled}
     ref={element=>{if(element)rowRefs.current.set(row.number,element);else rowRefs.current.delete(row.number)}}
     data-picked={answer===null&&picked===row.number||undefined}
     data-correct={isAnswer||undefined}
     data-wrong={isWrongPick||undefined}
     data-match={matches.has(row.number)||undefined}
     aria-pressed={picked===row.number}
     onClick={()=>onPick(row.number)}
    ><b>{row.number}</b><code>{row.line||" "}</code></button>;
   })}
  </div>

  <p className={v.status} role="status">
   {picked===null?"Click the line you believe is the defect.":`Line ${picked} selected — ${lines[picked-1]?.trim().slice(0,70)||"(blank)"}`}
  </p>
 </div>;
}

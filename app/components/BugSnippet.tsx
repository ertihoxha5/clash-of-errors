"use client";
import styles from "./code.module.css";

// The find-the-bug view: every line is a button. After a verdict arrives the
// server's line is marked, so a wrong pick shows both what was chosen and what
// was actually broken.
export default function BugSnippet({lines,picked,answer,onPick,disabled}:{
 lines:string[];picked:number|null;answer:number|null;onPick:(line:number)=>void;disabled?:boolean;
}){
 return <div className={styles.snippet} role="group" aria-label="Code with one bug. Choose the faulty line.">
  {lines.map((line,index)=>{
   const number=index+1;
   const isAnswer=answer!==null&&number===answer;
   const isWrongPick=answer!==null&&picked===number&&number!==answer;
   return <button
    type="button" key={number} className={styles.line} disabled={disabled}
    data-picked={answer===null&&picked===number||undefined}
    data-correct={isAnswer||undefined}
    data-wrong={isWrongPick||undefined}
    aria-pressed={picked===number}
    onClick={()=>onPick(number)}
   ><b>{number}</b><code>{line||" "}</code></button>;
  })}
 </div>;
}

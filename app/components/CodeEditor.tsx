"use client";
import {useEffect,useRef,useState} from "react";
import styles from "./code.module.css";

// A gutter-numbered editor: a transparent textarea sits exactly on top of a
// highlighted copy of the same text, so selection and caret stay native while
// the colours come from the layer underneath.
//
// Highlighting is one pass over one regex. Running several passes lets a later
// rule rewrite the markup an earlier rule inserted — which is exactly the class
// of bug this app is about.
const TOKEN=/(\/\/[^\n]*)|('[^'\n]*'|"[^"\n]*"|`[^`\n]*`)|\b(\d+(?:\.\d+)?)\b|\b(function|return|const|let|var|if|else|for|while|of|in|new|class|extends|async|await|try|catch|finally|switch|case|break|continue|typeof|throw|do|null|undefined|true|false)\b/g;

function highlight(source:string){
 const escaped=source.replace(/[&<>]/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[character] as string));
 return escaped.replace(TOKEN,(match,comment,text,number,keyword)=>{
  if(comment)return `<i class="cmt">${comment}</i>`;
  if(text)return `<i class="str">${text}</i>`;
  if(number)return `<i class="num">${number}</i>`;
  if(keyword)return `<i class="kw">${keyword}</i>`;
  return match;
 });
}

const indentOf=(line:string)=>/^\s*/.exec(line)?.[0]??"";

export default function CodeEditor({value,onChange,onRun,onReset,readOnly=false,minRows=10,label}:{
 value:string;onChange?:(next:string)=>void;onRun?:()=>void;onReset?:()=>void;
 readOnly?:boolean;minRows?:number;label:string;
}){
 const area=useRef<HTMLTextAreaElement>(null);
 const paint=useRef<HTMLPreElement>(null);
 const [caretLine,setCaretLine]=useState(1);
 const lineCount=Math.max(minRows,value.split("\n").length);

 useEffect(()=>{if(paint.current)paint.current.innerHTML=highlight(value)+"\n"},[value]);

 // Keeping the caret's line in state powers the gutter highlight without
 // re-rendering the painted layer on every keystroke.
 const syncCaret=()=>{
  const element=area.current;
  if(!element)return;
  setCaretLine(element.value.slice(0,element.selectionStart).split("\n").length);
 };

 const replaceSelection=(insert:string,caretOffset:number)=>{
  const element=area.current;
  if(!element||!onChange)return;
  const start=element.selectionStart,end=element.selectionEnd;
  onChange(`${value.slice(0,start)}${insert}${value.slice(end)}`);
  requestAnimationFrame(()=>{
   element.selectionStart=element.selectionEnd=start+caretOffset;
   syncCaret();
  });
 };

 return <div className={styles.editor}>
  <div className={styles.gutter} aria-hidden="true">
   {Array.from({length:lineCount},(_,index)=>
    <span key={index} data-active={index+1===caretLine||undefined}>{index+1}</span>)}
  </div>
  <div className={styles.surface}>
   <pre ref={paint} className={styles.paint} aria-hidden="true"/>
   <textarea
    ref={area} className={styles.input} aria-label={label} value={value} readOnly={readOnly} spellCheck={false}
    rows={lineCount} wrap="off"
    onChange={event=>{onChange?.(event.target.value);syncCaret()}}
    onClick={syncCaret}
    onSelect={syncCaret}
    onScroll={event=>{
     if(!paint.current)return;
     paint.current.scrollTop=event.currentTarget.scrollTop;
     paint.current.scrollLeft=event.currentTarget.scrollLeft;
    }}
    onKeyDown={event=>{
     if(readOnly)return;
     if((event.ctrlKey||event.metaKey)&&event.key==="Enter"&&onRun){event.preventDefault();onRun();return}
     if(event.key==="Tab"){
      // Tab indents instead of leaving the editor, which is what a code box should do.
      event.preventDefault();
      replaceSelection("  ",2);
      return;
     }
     if(event.key==="Enter"){
      // Carry the current indentation onto the new line, and add a level after
      // an opening brace — the two things that make typing a function bearable.
      const element=event.currentTarget;
      const upToCaret=value.slice(0,element.selectionStart);
      const currentLine=upToCaret.slice(upToCaret.lastIndexOf("\n")+1);
      const indent=indentOf(currentLine);
      const deeper=/[{([]\s*$/.test(currentLine)?"  ":"";
      event.preventDefault();
      replaceSelection(`\n${indent}${deeper}`,1+indent.length+deeper.length);
     }
    }}
   />
  </div>
  {(onRun||onReset)&&<div className={styles.editorBar}>
   {onRun&&<span className={styles.shortcut}>Ctrl + Enter runs the tests</span>}
   {onReset&&<button type="button" className={styles.reset} onClick={onReset}>Reset to starter</button>}
  </div>}
 </div>;
}

import {and,eq,sql} from "drizzle-orm";
import {getDb} from "../db";
import {codeTasks} from "../db/schema";

const NEWLINE=/\r?\n/;

export type TaskFix={label:string;correct:boolean};
export type TaskTest={name:string;call:string;expect:unknown};

export type TaskKind="bug"|"write"|"audit";

export type PublicTask={
 id:number;slug:string;kind:TaskKind;title:string;difficulty:string;language:string;
 prompt:string;code:string;lines:string[];fixes:string[];tests:{name:string;call:string;expect:unknown}[];
 testCount:number;xp:number;topic:string;hint:string;symptom:string;region:string;lineCount:number;
};

type TaskRow=typeof codeTasks.$inferSelect;

const parse=<T,>(value:string,fallback:T):T=>{try{return JSON.parse(value) as T}catch{return fallback}};

// A bug task ships its lines and its three candidate fixes but never says which
// line or fix is right — that stays on the server. A write task ships its full
// test list, including expected values, because the browser runs those tests and
// has to be able to show what it got versus what was wanted.
export function publicTask(row:TaskRow,topic="General"):PublicTask{
 const fixes=parse<TaskFix[]>(row.fixes,[]),tests=parse<TaskTest[]>(row.tests,[]);
 return {
  id:row.id,slug:row.slug,kind:row.kind as TaskKind,title:row.title,difficulty:row.difficulty,
  language:row.language,prompt:row.prompt,code:row.code,lines:row.code.split("\n"),
  fixes:fixes.map(f=>f.label),tests:tests.map(t=>({name:t.name,call:t.call,expect:t.expect})),
  testCount:tests.length,xp:row.xp,topic,
  hint:row.hint,symptom:row.symptom,region:row.region,lineCount:row.code.split(NEWLINE).length,
 };
}

export function checkBugAnswer(row:TaskRow,line:number,fixIndex:number){
 const fixes=parse<TaskFix[]>(row.fixes,[]);
 const lineCorrect=row.buggyLine===line;
 const fixCorrect=fixIndex>=0&&fixIndex<fixes.length&&!!fixes[fixIndex]?.correct;
 return {lineCorrect,fixCorrect,correct:lineCorrect&&fixCorrect,buggyLine:row.buggyLine??0,explanation:row.explanation};
}

export function taskTestCount(row:TaskRow){return parse<TaskTest[]>(row.tests,[]).length}

export async function loadTask(id:number){
 const db=await getDb();
 const [row]=await db.select().from(codeTasks).where(and(eq(codeTasks.id,id),eq(codeTasks.status,"published"))).limit(1);
 return row??null;
}

export async function randomTasks(kind:TaskKind,count:number,difficulty?:string){
 const db=await getDb();
 const where=difficulty?and(eq(codeTasks.kind,kind),eq(codeTasks.status,"published"),eq(codeTasks.difficulty,difficulty))
                       :and(eq(codeTasks.kind,kind),eq(codeTasks.status,"published"));
 return db.select().from(codeTasks).where(where).orderBy(sql`random()`).limit(count);
}

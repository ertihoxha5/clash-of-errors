// The duel roster. Every opponent in a battle is one of these NPCs: a name, a
// look, and a solving speed. `pace` is the seconds an NPC spends per test on
// average, `slip` the chance it stalls on a test and has to retry.
export type NpcTier="rookie"|"skilled"|"pro"|"legend";

export type Npc={
 slug:string;
 name:string;
 tier:NpcTier;
 level:number;
 rating:number;
 hue:number;        // drives the generated portrait and panel accent
 accent:string;
 taunt:string;
 pace:number;
 slip:number;
};

export const NPCS:Npc[]=[
 {slug:"codeninja",name:"CodeNinja",tier:"legend",level:24,rating:1950,hue:198,accent:"#2fc8ff",taunt:"I ship before you compile.",pace:16,slip:0.10},
 {slug:"syntaxstorm",name:"SyntaxStorm",tier:"pro",level:21,rating:1820,hue:288,accent:"#c46bff",taunt:"Your semicolons are showing.",pace:21,slip:0.16},
 {slug:"devqueen",name:"DevQueen",tier:"pro",level:19,rating:1740,hue:330,accent:"#f23cd5",taunt:"Elegance beats brute force.",pace:24,slip:0.18},
 {slug:"bugcrusher",name:"BugCrusher",tier:"skilled",level:16,rating:1560,hue:150,accent:"#3ddc97",taunt:"Every bug has a tell.",pace:30,slip:0.24},
 {slug:"logiclord",name:"LogicLord",tier:"skilled",level:14,rating:1480,hue:38,accent:"#ffb03c",taunt:"Proof first, code second.",pace:34,slip:0.26},
 {slug:"nullknight",name:"NullKnight",tier:"rookie",level:9,rating:1180,hue:214,accent:"#7d9bff",taunt:"Still learning. Still winning.",pace:44,slip:0.34},
];

export const npcBySlug=(slug:string)=>NPCS.find(n=>n.slug===slug)??NPCS[NPCS.length-1];

// A duel's rival progress is decided once, at creation: one timestamp per test.
// Both sides then read the same schedule, so nobody can win by polling faster.
export function npcSchedule(npc:Npc,testCount:number,timeLimit:number):number[]{
 const schedule:number[]=[];
 let elapsed=Math.max(4,npc.pace*0.6);
 for(let i=0;i<testCount;i++){
  const variance=0.7+Math.random()*0.7;
  const stalled=Math.random()<npc.slip?npc.pace*(0.8+Math.random()):0;
  elapsed+=npc.pace*variance+stalled;
  schedule.push(Math.round(elapsed*1000));
 }
 // An NPC that would run past the clock simply does not finish in time.
 return schedule.map(ms=>Math.min(ms,(timeLimit+60)*1000));
}

export function npcTestsPassed(schedule:number[],elapsedMs:number){
 let passed=0;
 for(const at of schedule){if(elapsedMs>=at)passed+=1;else break}
 return passed;
}

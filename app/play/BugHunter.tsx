"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import BugSnippet from "../components/BugSnippet";
import styles from "./game.module.css";

// Bug Hunter — the arcade mode behind "Play it as Game".
//
// You fly a debugger through a sector of broken code. Terminals hold real
// find-the-bug tasks from the same bank the challenge lab uses; reaching one
// opens it, and the server grades the answer. Roaming bugs chase you the whole
// time, so the pressure is spatial and the puzzle is real.

const W=1000,H=620;
const STEP=1/120;
const PLAYER_SPEED=300,PLAYER_R=15,FIRE_MS=170,BULLET_SPEED=680,INVULN=0.9;
const SECTOR_SECONDS=95;

type Kind="null"|"leak"|"race"|"overflow";
type Enemy={kind:Kind;x:number;y:number;vx:number;vy:number;hp:number;maxHp:number;r:number;speed:number;damage:number;points:number;phase:number;nextAction:number};
type Bullet={x:number;y:number;vx:number;vy:number;life:number;hostile:boolean;damage:number};
type Particle={x:number;y:number;vx:number;vy:number;life:number;maxLife:number;color:string};
type Terminal={id:number;x:number;y:number;taskIndex:number;state:"live"|"patched"|"locked";lockedUntil:number;pulse:number};
type Task={id:number;title:string;prompt:string;difficulty:string;lines:string[];fixes:string[]};
type Verdict={correct:boolean;explanation:string;buggyLine?:number;lineCorrect?:boolean;xpLost?:number};
type Phase="menu"|"playing"|"terminal"|"paused"|"over";
type Hud={score:number;sector:number;hp:number;seconds:number;patched:number;terminals:number;combo:number};

const SPECIES:Record<Kind,{label:string;color:string;glyph:string;blurb:string}>={
 null:{label:"NullPointer",color:"#2fc8ff",glyph:"∅",blurb:"Homes straight at you. Never travels alone."},
 race:{label:"RaceCondition",color:"#9a6cff",glyph:"⇌",blurb:"Strafes unpredictably and moves fast."},
 leak:{label:"MemoryLeak",color:"#3ddc97",glyph:"◌",blurb:"Splits into two smaller bugs when destroyed."},
 overflow:{label:"StackOverflow",color:"#f23cd5",glyph:"⚠",blurb:"Sector boss. Spawns adds and returns fire."},
};

const rand=(min:number,max:number)=>min+Math.random()*(max-min);
const clamp=(value:number,min:number,max:number)=>value<min?min:value>max?max:value;

function makeEnemy(kind:Kind,sector:number,x:number,y:number,hpScale=1):Enemy{
 const grow=1+sector*0.07;
 const base={null:{hp:2,r:16,speed:74,damage:11,points:60},race:{hp:1,r:13,speed:160,damage:9,points:80},
  leak:{hp:3,r:20,speed:56,damage:10,points:100},overflow:{hp:24,r:36,speed:44,damage:22,points:800}}[kind];
 const hp=Math.max(1,Math.round(base.hp*hpScale*(kind==="overflow"?grow:1)));
 return {kind,x,y,vx:0,vy:0,hp,maxHp:hp,r:base.r*(hpScale<1?0.72:1),
  speed:base.speed*(kind==="overflow"?1:grow*0.84),damage:base.damage,points:base.points,
  phase:rand(0,Math.PI*2),nextAction:rand(1.2,2.4)};
}

function edgeSpawn(){
 const side=Math.floor(rand(0,4));
 if(side===0)return {x:rand(0,W),y:-40};
 if(side===1)return {x:W+40,y:rand(0,H)};
 if(side===2)return {x:rand(0,W),y:H+40};
 return {x:-40,y:rand(0,H)};
}

function sectorRoster(sector:number):Kind[]{
 const roster:Kind[]=[];
 for(let i=0;i<2+Math.floor(sector*1.4);i++)roster.push("null");
 for(let i=0;i<Math.floor(sector/2);i++)roster.push("race");
 for(let i=0;i<Math.floor((sector-1)/3);i++)roster.push("leak");
 if(sector%4===0)roster.push("overflow");
 return roster;
}

// Terminals are spread on a loose ring so none of them sit under the spawn point.
function layoutTerminals(count:number,offset:number):Terminal[]{
 return Array.from({length:count},(_,index)=>{
  const angle=(index/count)*Math.PI*2+rand(-0.25,0.25);
  const radius=Math.min(W,H)*0.36;
  return {id:offset+index,x:clamp(W/2+Math.cos(angle)*radius*1.35,90,W-90),
   y:clamp(H/2+Math.sin(angle)*radius,80,H-80),
   taskIndex:offset+index,state:"live" as const,lockedUntil:0,pulse:rand(0,Math.PI*2)};
 });
}

export default function BugHunter(){
 const canvas=useRef<HTMLCanvasElement>(null);
 const [phase,setPhase]=useState<Phase>("menu");
 const [hud,setHud]=useState<Hud>({score:0,sector:1,hp:100,seconds:SECTOR_SECONDS,patched:0,terminals:3,combo:0});
 const [best,setBest]=useState(0);
 const [tasks,setTasks]=useState<Task[]>([]);
 const [loadError,setLoadError]=useState("");
 const [loading,setLoading]=useState(false);
 const [active,setActive]=useState<{terminalId:number;task:Task}|null>(null);
 const [picked,setPicked]=useState<number|null>(null);
 const [fixIndex,setFixIndex]=useState<number|null>(null);
 const [verdict,setVerdict]=useState<Verdict|null>(null);
 const [grading,setGrading]=useState(false);
 const [result,setResult]=useState<{score:number;sector:number;patched:number;missed:number;kills:number}|null>(null);
 const [bank,setBank]=useState<{state:"idle"|"sending"|"done"|"error";message:string}>({state:"idle",message:""});
 const phaseRef=useRef<Phase>("menu");
 const setPhaseBoth=useCallback((next:Phase)=>{phaseRef.current=next;setPhase(next)},[]);

 const world=useRef({
  px:W/2,py:H/2,pvx:0,pvy:0,hp:100,invuln:0,aimX:W/2,aimY:H/2-120,firing:false,cooldown:0,
  enemies:[] as Enemy[],bullets:[] as Bullet[],particles:[] as Particle[],terminals:[] as Terminal[],
  queue:[] as Kind[],spawnTimer:0,sector:1,seconds:SECTOR_SECONDS,score:0,combo:0,patched:0,missed:0,kills:0,
  taskCursor:0,shake:0,banner:"",bannerTimer:0,time:0,
  keys:new Set<string>(),touch:null as null|{x:number;y:number},
 });

 useEffect(()=>{try{setBest(Number(localStorage.getItem("clash-bughunter-best")||0))}catch{/* storage may be blocked */}},[]);

 const startSector=useCallback((sector:number)=>{
  const w=world.current;
  const count=Math.min(6,2+sector);
  w.sector=sector;
  w.seconds=SECTOR_SECONDS;
  w.terminals=layoutTerminals(count,w.taskCursor);
  w.taskCursor+=count;
  w.queue=sectorRoster(sector);
  w.spawnTimer=1.4;
  w.enemies=[];
  w.bullets=[];
  w.banner=`SECTOR ${sector} · ${count} BROKEN TERMINALS`;
  w.bannerTimer=2.4;
 },[]);

 const beginRun=useCallback(async()=>{
  setLoading(true);setLoadError("");
  try{
   const response=await fetch("/api/tasks?run=1&count=20",{cache:"no-store"});
   const data=await response.json() as {tasks?:Task[];error?:string};
   if(!response.ok||!data.tasks?.length)throw new Error(data.error||"No bug tasks are available yet.");
   setTasks(data.tasks);
   const w=world.current;
   Object.assign(w,{px:W/2,py:H/2,pvx:0,pvy:0,hp:100,invuln:0,aimX:W/2,aimY:H/2-120,firing:false,cooldown:0,
    enemies:[],bullets:[],particles:[],terminals:[],queue:[],spawnTimer:0,score:0,combo:0,patched:0,missed:0,
    kills:0,taskCursor:0,shake:0,time:0});
   w.keys.clear();w.touch=null;
   startSector(1);
   setResult(null);setActive(null);setVerdict(null);setBank({state:"idle",message:""});
   setPhaseBoth("playing");
   canvas.current?.focus({preventScroll:true});
   canvas.current?.scrollIntoView({block:"start",behavior:"smooth"});
  }catch(error){setLoadError(error instanceof Error?error.message:"Could not load bug tasks.")}
  finally{setLoading(false)}
 },[setPhaseBoth,startSector]);

 // ---------- input ----------
 useEffect(()=>{
  const w=world.current;
  const down=(event:KeyboardEvent)=>{
   const key=event.key.toLowerCase();
   if(phaseRef.current==="terminal")return;
   if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(key))event.preventDefault();
   if(key==="p"||key==="escape"){
    if(phaseRef.current==="playing")setPhaseBoth("paused");
    else if(phaseRef.current==="paused")setPhaseBoth("playing");
    return;
   }
   w.keys.add(key);
   if(key===" ")w.firing=true;
  };
  const up=(event:KeyboardEvent)=>{const key=event.key.toLowerCase();w.keys.delete(key);if(key===" ")w.firing=false};
  const blur=()=>{w.keys.clear();w.firing=false;if(phaseRef.current==="playing")setPhaseBoth("paused")};
  window.addEventListener("keydown",down);window.addEventListener("keyup",up);window.addEventListener("blur",blur);
  return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);window.removeEventListener("blur",blur)};
 },[setPhaseBoth]);

 const pointerAt=(event:React.PointerEvent<HTMLCanvasElement>)=>{
  const box=event.currentTarget.getBoundingClientRect();
  return {x:(event.clientX-box.left)/box.width*W,y:(event.clientY-box.top)/box.height*H};
 };

 // The loop reads tasks through a ref so it never has to be rebuilt mid-run.
 const tasksRef=useRef<Task[]>([]);
 useEffect(()=>{tasksRef.current=tasks},[tasks]);

 // ---------- simulation + rendering ----------
 useEffect(()=>{
  const element=canvas.current;if(!element)return;
  const context=element.getContext("2d");if(!context)return;
  let frame=0,last=performance.now(),carry=0;

  const resize=()=>{
   const ratio=Math.min(window.devicePixelRatio||1,2);
   element.width=Math.round(W*ratio);element.height=Math.round(H*ratio);
   context.setTransform(ratio,0,0,ratio,0,0);
  };
  resize();
  window.addEventListener("resize",resize);

  const burst=(x:number,y:number,color:string,count:number,power=190)=>{
   const w=world.current;
   for(let i=0;i<count;i++){
    const angle=rand(0,Math.PI*2),speed=rand(power*0.25,power);
    w.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:rand(0.25,0.6),maxLife:0.6,color});
   }
  };

  const endRun=()=>{
   const w=world.current;
   w.hp=Math.max(0,w.hp);
   setResult({score:Math.round(w.score),sector:w.sector,patched:w.patched,missed:w.missed,kills:w.kills});
   setBest(previous=>{
    const next=Math.max(previous,Math.round(w.score));
    try{localStorage.setItem("clash-bughunter-best",String(next))}catch{/* ignore */}
    return next;
   });
   setPhaseBoth("over");
  };

  const hurtPlayer=(amount:number)=>{
   const w=world.current;
   if(w.invuln>0)return;
   w.hp-=amount;w.invuln=INVULN;w.shake=Math.max(w.shake,12);w.combo=0;
   burst(w.px,w.py,"#ff4d6d",18,240);
   if(w.hp<=0)endRun();
  };

  const killEnemy=(enemy:Enemy,index:number)=>{
   const w=world.current,species=SPECIES[enemy.kind];
   w.enemies.splice(index,1);
   w.kills+=1;w.score+=enemy.points;
   burst(enemy.x,enemy.y,species.color,enemy.kind==="overflow"?60:18,enemy.kind==="overflow"?420:220);
   if(enemy.kind==="overflow")w.shake=Math.max(w.shake,18);
   if(enemy.kind==="leak"&&enemy.maxHp>1){
    for(let i=0;i<2;i++)w.enemies.push(makeEnemy("null",w.sector,enemy.x+rand(-18,18),enemy.y+rand(-18,18),0.5));
   }
  };

  const simulate=(dt:number)=>{
   const w=world.current;
   w.time+=dt;
   w.shake=Math.max(0,w.shake-dt*26);
   w.invuln=Math.max(0,w.invuln-dt);
   w.bannerTimer=Math.max(0,w.bannerTimer-dt);
   w.seconds-=dt;
   if(w.seconds<=0){w.seconds=0;endRun();return}

   let mx=0,my=0;
   if(w.keys.has("a")||w.keys.has("arrowleft"))mx-=1;
   if(w.keys.has("d")||w.keys.has("arrowright"))mx+=1;
   if(w.keys.has("w")||w.keys.has("arrowup"))my-=1;
   if(w.keys.has("s")||w.keys.has("arrowdown"))my+=1;
   if(w.touch){
    const dx=w.touch.x-w.px,dy=w.touch.y-w.py,distance=Math.hypot(dx,dy);
    if(distance>PLAYER_R*1.5){mx=dx/distance;my=dy/distance}
   }
   const length=Math.hypot(mx,my)||1;
   w.pvx+=(mx/length*PLAYER_SPEED-w.pvx)*Math.min(1,dt*14);
   w.pvy+=(my/length*PLAYER_SPEED-w.pvy)*Math.min(1,dt*14);
   w.px=clamp(w.px+w.pvx*dt,PLAYER_R,W-PLAYER_R);
   w.py=clamp(w.py+w.pvy*dt,PLAYER_R,H-PLAYER_R);

   let aimDx=w.aimX-w.px,aimDy=w.aimY-w.py;
   if(w.touch||w.keys.has(" ")){
    let nearest:Enemy|null=null,nearestDistance=Infinity;
    for(const enemy of w.enemies){const distance=Math.hypot(enemy.x-w.px,enemy.y-w.py);if(distance<nearestDistance){nearestDistance=distance;nearest=enemy}}
    if(nearest){aimDx=nearest.x-w.px;aimDy=nearest.y-w.py}
   }

   w.cooldown-=dt;
   if((w.firing||(!!w.touch&&w.enemies.length>0))&&w.cooldown<=0){
    w.cooldown=FIRE_MS/1000;
    const angle=Math.atan2(aimDy,aimDx)+rand(-0.02,0.02);
    w.bullets.push({x:w.px+Math.cos(angle)*PLAYER_R,y:w.py+Math.sin(angle)*PLAYER_R,
     vx:Math.cos(angle)*BULLET_SPEED,vy:Math.sin(angle)*BULLET_SPEED,life:1.1,hostile:false,damage:1});
   }

   // terminals
   for(const terminal of w.terminals){
    terminal.pulse+=dt*2.4;
    if(terminal.state==="locked"&&w.time>=terminal.lockedUntil)terminal.state="live";
    if(terminal.state!=="live")continue;
    if(Math.hypot(terminal.x-w.px,terminal.y-w.py)<PLAYER_R+26){
     const task=tasksRef.current[terminal.taskIndex%Math.max(1,tasksRef.current.length)];
     if(!task)continue;
     setActive({terminalId:terminal.id,task});
     setPicked(null);setFixIndex(null);setVerdict(null);
     setPhaseBoth("terminal");
     return;
    }
   }

   // enemy spawning keeps pace with the sector rather than the clock alone
   if(w.queue.length){
    w.spawnTimer-=dt;
    if(w.spawnTimer<=0){
     w.spawnTimer=Math.max(0.5,1.5-w.sector*0.08);
     const kind=w.queue.shift()!,at=edgeSpawn();
     w.enemies.push(makeEnemy(kind,w.sector,at.x,at.y));
    }
   }

   for(const enemy of w.enemies){
    const dx=w.px-enemy.x,dy=w.py-enemy.y,distance=Math.hypot(dx,dy)||1;
    let ax=dx/distance,ay=dy/distance;
    if(enemy.kind==="race"){
     enemy.phase+=dt*5.5;
     const swing=Math.sin(enemy.phase)*1.1,steerX=ax*0.72-ay*swing,steerY=ay*0.72+ax*swing;
     const norm=Math.hypot(steerX,steerY)||1;ax=steerX/norm;ay=steerY/norm;
    }
    enemy.vx+=(ax*enemy.speed-enemy.vx)*Math.min(1,dt*3.2);
    enemy.vy+=(ay*enemy.speed-enemy.vy)*Math.min(1,dt*3.2);
    enemy.x+=enemy.vx*dt;enemy.y+=enemy.vy*dt;
    if(enemy.kind==="overflow"){
     enemy.nextAction-=dt;
     if(enemy.nextAction<=0){
      enemy.nextAction=rand(1.8,2.8);
      const base=Math.atan2(dy,dx);
      for(let i=-1;i<=1;i++)w.bullets.push({x:enemy.x,y:enemy.y,vx:Math.cos(base+i*0.28)*300,vy:Math.sin(base+i*0.28)*300,life:2.6,hostile:true,damage:9});
     }
    }
    if(distance<enemy.r+PLAYER_R)hurtPlayer(enemy.damage);
   }

   for(let i=w.bullets.length-1;i>=0;i--){
    const bullet=w.bullets[i];
    bullet.x+=bullet.vx*dt;bullet.y+=bullet.vy*dt;bullet.life-=dt;
    if(bullet.life<=0||bullet.x<-30||bullet.x>W+30||bullet.y<-30||bullet.y>H+30){w.bullets.splice(i,1);continue}
    if(bullet.hostile){
     if(Math.hypot(bullet.x-w.px,bullet.y-w.py)<PLAYER_R+4){w.bullets.splice(i,1);hurtPlayer(bullet.damage)}
     continue;
    }
    for(let j=w.enemies.length-1;j>=0;j--){
     const enemy=w.enemies[j];
     if(Math.hypot(bullet.x-enemy.x,bullet.y-enemy.y)>enemy.r+4)continue;
     w.bullets.splice(i,1);enemy.hp-=bullet.damage;
     burst(bullet.x,bullet.y,SPECIES[enemy.kind].color,4,90);
     if(enemy.hp<=0)killEnemy(enemy,j);
     break;
    }
   }

   for(let i=w.particles.length-1;i>=0;i--){
    const particle=w.particles[i];
    particle.life-=dt;
    if(particle.life<=0){w.particles.splice(i,1);continue}
    particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;
    particle.vx*=1-dt*2.4;particle.vy*=1-dt*2.4;
   }
  };

  const drawTerminal=(terminal:Terminal,time:number)=>{
   const patched=terminal.state==="patched",locked=terminal.state==="locked";
   const color=patched?"#3ddc97":locked?"#ff4d6d":"#ffc861";
   const lift=Math.sin(terminal.pulse)*3;
   context.save();
   context.translate(terminal.x,terminal.y+lift);
   if(!patched){
    context.globalAlpha=0.18+Math.abs(Math.sin(time*2+terminal.pulse))*0.12;
    context.fillStyle=color;
    context.beginPath();context.arc(0,0,46,0,Math.PI*2);context.fill();
    context.globalAlpha=1;
   }
   context.strokeStyle=color;context.lineWidth=2;context.fillStyle="#081020";
   context.beginPath();
   context.moveTo(-22,-26);context.lineTo(22,-26);context.lineTo(26,-22);
   context.lineTo(26,22);context.lineTo(22,26);context.lineTo(-22,26);
   context.lineTo(-26,22);context.lineTo(-26,-22);context.closePath();
   context.fill();context.stroke();
   context.fillStyle=color;
   context.font="700 17px ui-monospace,monospace";context.textAlign="center";context.textBaseline="middle";
   context.fillText(patched?"✓":locked?"⏱":"</>",0,1);
   if(!patched){
    context.font="9px ui-monospace,monospace";
    context.fillStyle="#8b9bb7";
    context.fillText(locked?"REBOOTING":"BUG FOUND",0,38);
   }
   context.restore();
  };

  const drawShip=(x:number,y:number,angle:number,invuln:number)=>{
   context.save();
   context.translate(x,y);context.rotate(angle);
   context.globalAlpha=invuln>0&&Math.floor(invuln*18)%2===0?0.4:1;
   context.shadowBlur=18;context.shadowColor="#2fc8ff";context.fillStyle="#2fc8ff";
   context.beginPath();
   context.moveTo(PLAYER_R+5,0);context.lineTo(-PLAYER_R*0.8,PLAYER_R*0.85);
   context.lineTo(-PLAYER_R*0.35,0);context.lineTo(-PLAYER_R*0.8,-PLAYER_R*0.85);
   context.closePath();context.fill();
   context.restore();
  };

  const drawEnemy=(enemy:Enemy)=>{
   const species=SPECIES[enemy.kind];
   context.save();
   context.translate(enemy.x,enemy.y);
   context.shadowBlur=14;context.shadowColor=species.color;
   context.strokeStyle=species.color;context.fillStyle=`${species.color}22`;context.lineWidth=2;
   context.beginPath();
   if(enemy.kind==="race"){
    context.moveTo(enemy.r,0);context.lineTo(-enemy.r*0.6,enemy.r*0.9);
    context.lineTo(-enemy.r*0.2,0);context.lineTo(-enemy.r*0.6,-enemy.r*0.9);context.closePath();
   }else if(enemy.kind==="leak"){context.arc(0,0,enemy.r,0,Math.PI*2);}
   else if(enemy.kind==="overflow"){context.rect(-enemy.r,-enemy.r,enemy.r*2,enemy.r*2);}
   else{
    for(let i=0;i<6;i++){
     const angle=(i/6)*Math.PI*2,px=Math.cos(angle)*enemy.r,py=Math.sin(angle)*enemy.r;
     if(i===0)context.moveTo(px,py);else context.lineTo(px,py);
    }
    context.closePath();
   }
   context.fill();context.stroke();
   context.shadowBlur=0;context.fillStyle=species.color;
   context.font=`${Math.round(enemy.r)}px ui-monospace,monospace`;
   context.textAlign="center";context.textBaseline="middle";
   context.fillText(species.glyph,0,1);
   context.restore();
   if(enemy.maxHp>4){
    context.fillStyle="#0a1120";context.fillRect(enemy.x-enemy.r,enemy.y-enemy.r-12,enemy.r*2,5);
    context.fillStyle=species.color;context.fillRect(enemy.x-enemy.r,enemy.y-enemy.r-12,enemy.r*2*(enemy.hp/enemy.maxHp),5);
   }
  };

  const render=()=>{
   const w=world.current;
   context.save();
   if(w.shake>0)context.translate(rand(-w.shake,w.shake)*0.4,rand(-w.shake,w.shake)*0.4);

   context.fillStyle="#05070f";context.fillRect(-40,-40,W+80,H+80);
   context.strokeStyle="#12233f";context.lineWidth=1;
   const offset=(w.time*14)%50;
   context.beginPath();
   for(let x=-50+offset;x<W+50;x+=50){context.moveTo(x,0);context.lineTo(x,H)}
   for(let y=-50+offset;y<H+50;y+=50){context.moveTo(0,y);context.lineTo(W,y)}
   context.stroke();
   context.strokeStyle="#1b3358";context.lineWidth=2;context.strokeRect(1,1,W-2,H-2);

   // a guide line to the closest unpatched terminal keeps the objective legible
   const target=w.terminals.filter(t=>t.state!=="patched")
    .sort((a,b)=>Math.hypot(a.x-w.px,a.y-w.py)-Math.hypot(b.x-w.px,b.y-w.py))[0];
   if(target){
    context.save();
    context.setLineDash([6,10]);context.strokeStyle="#ffc86133";context.lineWidth=2;
    context.beginPath();context.moveTo(w.px,w.py);context.lineTo(target.x,target.y);context.stroke();
    context.restore();
   }

   for(const terminal of w.terminals)drawTerminal(terminal,w.time);
   for(const particle of w.particles){
    context.globalAlpha=Math.max(0,particle.life/particle.maxLife);
    context.fillStyle=particle.color;
    context.fillRect(particle.x-2,particle.y-2,4,4);
   }
   context.globalAlpha=1;
   for(const enemy of w.enemies)drawEnemy(enemy);
   for(const bullet of w.bullets){
    context.save();
    context.shadowBlur=10;context.shadowColor=bullet.hostile?"#f23cd5":"#8ef1ff";
    context.fillStyle=bullet.hostile?"#f23cd5":"#8ef1ff";
    context.beginPath();context.arc(bullet.x,bullet.y,bullet.hostile?5:3.5,0,Math.PI*2);context.fill();
    context.restore();
   }

   let angle=Math.atan2(w.aimY-w.py,w.aimX-w.px);
   if(w.touch||w.keys.has(" ")){
    let nearest:Enemy|null=null,nearestDistance=Infinity;
    for(const enemy of w.enemies){const distance=Math.hypot(enemy.x-w.px,enemy.y-w.py);if(distance<nearestDistance){nearestDistance=distance;nearest=enemy}}
    if(nearest)angle=Math.atan2(nearest.y-w.py,nearest.x-w.px);
   }
   drawShip(w.px,w.py,angle,w.invuln);

   if(w.bannerTimer>0){
    context.save();
    context.globalAlpha=Math.min(1,w.bannerTimer);
    context.fillStyle="#f4f8ff";context.textAlign="center";
    context.font="700 30px ui-monospace,monospace";
    context.fillText(w.banner,W/2,H/2-10);
    context.restore();
   }
   context.restore();
  };

  const loop=(now:number)=>{
   frame=requestAnimationFrame(loop);
   const elapsed=Math.min(0.25,(now-last)/1000);
   last=now;
   if(phaseRef.current==="playing"){
    carry+=elapsed;
    let guard=0;
    while(carry>=STEP&&guard<12&&phaseRef.current==="playing"){simulate(STEP);carry-=STEP;guard+=1}
    if(guard>=12)carry=0;
   }
   render();
   const w=world.current;
   setHud(previous=>{
    const next={score:Math.round(w.score),sector:w.sector,hp:Math.max(0,Math.round(w.hp)),
     seconds:Math.max(0,Math.ceil(w.seconds)),patched:w.terminals.filter(t=>t.state==="patched").length,
     terminals:w.terminals.length,combo:w.combo};
    return previous.score===next.score&&previous.sector===next.sector&&previous.hp===next.hp
     &&previous.seconds===next.seconds&&previous.patched===next.patched
     &&previous.terminals===next.terminals&&previous.combo===next.combo?previous:next;
   });
  };
  frame=requestAnimationFrame(loop);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",resize)};
 },[setPhaseBoth]);

 async function gradeTerminal(){
  if(!active||picked===null||fixIndex===null||grading)return;
  setGrading(true);
  try{
   const response=await fetch("/api/tasks",{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({taskId:active.task.id,line:picked,fixIndex,source:"game"})});
   const data=await response.json() as Verdict&{error?:string};
   if(!response.ok)throw new Error(data.error);
   setVerdict(data);
   const w=world.current;
   const terminal=w.terminals.find(item=>item.id===active.terminalId);
   if(!terminal)return;
   if(data.correct){
    terminal.state="patched";
    w.combo+=1;w.patched+=1;
    w.score+=500*Math.min(5,w.combo);
    w.seconds=Math.min(SECTOR_SECONDS,w.seconds+10);
    w.hp=Math.min(100,w.hp+8);
   }else{
    terminal.state="locked";
    terminal.lockedUntil=w.time+9;
    w.combo=0;w.missed+=1;w.hp=Math.max(1,w.hp-10);
   }
  }catch(error){setVerdict({correct:false,explanation:error instanceof Error?error.message:"Could not reach the grader."})}
  finally{setGrading(false)}
 }

 function leaveTerminal(){
  const w=world.current;
  // Step the ship clear so the terminal does not immediately re-open.
  const terminal=w.terminals.find(item=>item.id===active?.terminalId);
  if(terminal){
   const dx=w.px-terminal.x||1,dy=w.py-terminal.y||1,distance=Math.hypot(dx,dy)||1;
   w.px=clamp(terminal.x+dx/distance*70,PLAYER_R,W-PLAYER_R);
   w.py=clamp(terminal.y+dy/distance*70,PLAYER_R,H-PLAYER_R);
   w.invuln=Math.max(w.invuln,1.2);
  }
  setActive(null);setVerdict(null);setPicked(null);setFixIndex(null);
  const cleared=w.terminals.every(item=>item.state==="patched");
  if(cleared){
   w.score+=750;
   startSector(w.sector+1);
  }
  setPhaseBoth("playing");
 }

 async function bankRun(){
  if(!result)return;
  setBank({state:"sending",message:"Banking run…"});
  try{
   const response=await fetch("/api/game",{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({score:result.score,wave:result.sector})});
   const data=await response.json() as {xp?:number;message?:string;error?:string};
   if(response.status===401){setBank({state:"error",message:"Sign in to bank arcade XP."});return}
   if(!response.ok)throw new Error(data.error||"Could not bank this run.");
   setBank({state:data.xp?"done":"idle",message:data.message||`+${data.xp} XP banked.`});
  }catch(error){setBank({state:"error",message:error instanceof Error?error.message:"Could not bank this run."})}
 }

 return <section className={styles.game}>
  <header className={styles.head}>
   <div>
    <span className="kicker">ARCADE MODE</span>
    <h1 className={styles.title}>Bug <em>Hunter</em></h1>
    <p className={styles.lede}>Fly the sector, reach a broken terminal, and find the faulty line before the bugs reach you. Same bug bank as the challenge lab — the server grades every patch.</p>
   </div>
   <dl className={styles.hud}>
    <div><dt>Score</dt><dd>{hud.score.toLocaleString()}</dd></div>
    <div><dt>Sector</dt><dd>{hud.sector}</dd></div>
    <div><dt>Patched</dt><dd>{hud.patched}/{hud.terminals}</dd></div>
    <div><dt>Best</dt><dd>{best.toLocaleString()}</dd></div>
   </dl>
  </header>

  <div className={styles.stage}>
   <canvas
    ref={canvas} className={styles.canvas} tabIndex={0} width={W} height={H}
    aria-label="Bug Hunter sector. Move with W A S D, fly into a terminal to open its code."
    onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);const at=pointerAt(event);const w=world.current;w.aimX=at.x;w.aimY=at.y;if(event.pointerType==="touch")w.touch=at;else w.firing=true}}
    onPointerMove={event=>{const at=pointerAt(event);const w=world.current;w.aimX=at.x;w.aimY=at.y;if(w.touch)w.touch=at}}
    onPointerUp={event=>{const w=world.current;w.firing=false;if(event.pointerType==="touch")w.touch=null}}
    onPointerLeave={()=>{const w=world.current;w.firing=false;w.touch=null}}
   />

   <div className={styles.bars} aria-hidden={phase!=="playing"}>
    <div className={styles.health}><i style={{width:`${hud.hp}%`}} data-low={hud.hp<=30||undefined}/><span>{hud.hp} HP</span></div>
    <div className={styles.buffs}>
     <span className={styles.timer} data-low={hud.seconds<=20||undefined}>{hud.seconds}s LEFT</span>
     {hud.combo>1&&<span className={styles.combo}>PATCH STREAK ×{Math.min(5,hud.combo)}</span>}
    </div>
   </div>

   {phase==="terminal"&&active&&<div className={styles.overlay}>
    <div className={`${styles.panel} ${styles.terminalPanel}`}>
     <header className={styles.terminalHead}>
      <span className="kicker">TERMINAL // {active.task.difficulty.toUpperCase()}</span>
      <h2>{active.task.title}</h2>
      <p>{active.task.prompt}</p>
     </header>
     <BugSnippet lines={active.task.lines} picked={picked} answer={verdict?verdict.buggyLine??null:null}
      onPick={line=>{if(!verdict)setPicked(line)}} disabled={!!verdict}/>
     <div className={styles.fixRow}>
      {active.task.fixes.map((fix,index)=><button key={fix} type="button" disabled={!!verdict}
       className={fixIndex===index?styles.fixPicked:styles.fix} onClick={()=>setFixIndex(index)}>
       <b>{String.fromCharCode(65+index)}</b><code>{fix}</code></button>)}
     </div>
     {verdict&&<p className={verdict.correct?styles.patched:styles.failed} role="status">
      <b>{verdict.correct?"Terminal patched":verdict.lineCorrect?"Right line, wrong fix":"Wrong line"}</b>
      {verdict.explanation}
      {!!verdict.xpLost&&<span> −{verdict.xpLost} XP. Further attempts at this challenge today have no XP penalty.</span>}
     </p>}
     <div className={styles.terminalActions}>
      {!verdict&&<button className="btn cyan solid" disabled={grading||picked===null||fixIndex===null} onClick={gradeTerminal}>
       {grading?"Checking…":"Submit patch"}</button>}
      {!verdict&&<small>A failed patch costs 20% of its challenge XP once per day. Your balance cannot fall below zero.</small>}
      {!verdict&&<button className="btn pink outline" onClick={leaveTerminal}>Back off</button>}
      {verdict&&<button className="btn cyan solid" onClick={leaveTerminal}>Return to the sector</button>}
     </div>
    </div>
   </div>}

   {(phase==="menu"||phase==="paused"||phase==="over")&&<div className={styles.overlay}>
    {phase==="menu"&&<div className={styles.panel}>
     <h2>Sector sweep</h2>
     <ul className={styles.controls}>
      <li><b>W A S D</b> or arrows to fly</li>
      <li><b>Pointer</b> to aim, hold to fire</li>
      <li><b>Space</b> auto-targets the nearest bug</li>
      <li><b>Fly into a terminal</b> to open its code</li>
     </ul>
     <p className={styles.objective}>Every terminal holds one broken snippet. Find the faulty line, choose the fix, and the sector opens up. Miss it and the terminal reboots for nine seconds.</p>
     <div className={styles.species}>
      {(Object.keys(SPECIES) as Kind[]).map(kind=><div key={kind} style={{borderColor:SPECIES[kind].color}}>
       <b style={{color:SPECIES[kind].color}}>{SPECIES[kind].glyph} {SPECIES[kind].label}</b>
       <span>{SPECIES[kind].blurb}</span>
      </div>)}
     </div>
     {loadError&&<p className={styles.failed} role="alert">{loadError}</p>}
     <button className="btn cyan solid" disabled={loading} onClick={beginRun}>{loading?"Loading sector…":"Start run"}</button>
    </div>}

    {phase==="paused"&&<div className={styles.panel}>
     <h2>Paused</h2>
     <p>Sector {hud.sector} · {hud.score.toLocaleString()} points · {hud.patched}/{hud.terminals} patched</p>
     <div className={styles.actions}>
      <button className="btn cyan solid" onClick={()=>setPhaseBoth("playing")}>Resume</button>
      <button className="btn pink outline" onClick={beginRun}>Restart</button>
     </div>
    </div>}

    {phase==="over"&&result&&<div className={styles.panel}>
     <h2>Run over</h2>
     <dl className={styles.summary}>
      <div><dt>Score</dt><dd>{result.score.toLocaleString()}</dd></div>
      <div><dt>Sector reached</dt><dd>{result.sector}</dd></div>
      <div><dt>Bugs patched</dt><dd>{result.patched}</dd></div>
      <div><dt>Misdiagnosed</dt><dd>{result.missed}</dd></div>
     </dl>
     {result.score>=best&&result.score>0&&<p className={styles.record}>New personal best.</p>}
     <div className={styles.actions}>
      <button className="btn cyan solid" onClick={beginRun}>Run it again</button>
      <button className="btn pink outline" disabled={bank.state==="sending"||bank.state==="done"} onClick={bankRun}>
       {bank.state==="done"?"XP banked":"Bank XP"}</button>
      <a className="btn cyan outline" href="/challenges">Study the bugs</a>
     </div>
     {bank.message&&<p role="status" className={styles.bankNote}>{bank.message}
      {bank.state==="error"&&bank.message.startsWith("Sign in")&&<> <a href="/login">Sign in →</a></>}</p>}
    </div>}
   </div>}
  </div>

  <footer className={styles.foot}>
   <p>Arcade milestones bank XP into your profile once per day: 1,500 · 6,000 · 15,000 points.</p>
   <div className={styles.links}>
    <a href="/challenges">Challenge lab</a>
    <a href="/battles">Battles</a>
    <a href="/play/unity">Unity foundation preview</a>
   </div>
  </footer>
 </section>;
}

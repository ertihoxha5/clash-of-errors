// Run against a local dev server only. Creates one named QA account and keeps
// its test history so the platform can be inspected; never runs on production.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const origin=process.argv[2]||'http://localhost:3000';
if(!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw Error('Local servers only');
const username=`qa${Date.now()}`;const password=`Aether-${randomUUID()}`;let cookie='';
async function api(path,body){const r=await fetch(origin+path,{method:body===undefined?'GET':'POST',headers:{...(cookie?{cookie}:{}),'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];const data=await r.json();assert.ok(r.ok,`${path}: ${r.status} ${JSON.stringify(data)}`);return data}
assert.equal((await fetch(origin+'/api/progression')).status,401);
const signup=await api('/api/account',{action:'register',username,password,firstName:'Progression',lastName:'QA'});assert.equal(signup.bonusXp,30);
let progress=await api('/api/progression');assert.equal(progress.xp,30);assert.equal(progress.rank.name,'Bronze I');assert.equal(progress.spin,null);
const login=await api('/api/account',{action:'login',username,password});assert.equal(login.bonusXp,0);
const spins=await Promise.all(Array.from({length:5},()=>api('/api/progression',{})));
assert.equal(spins.filter(s=>!s.alreadyClaimed).length,1);
assert.equal(new Set(spins.map(s=>s.reward.prize)).size,1);
const wallet=await api('/api/laboratory');assert.equal(wallet.balance,spins[0].reward.shards);
progress=await api('/api/progression');assert.equal(progress.xp,30+spins[0].reward.xp_delta);
const catalogue=await api('/api/tasks?kind=bug');const summary=catalogue.tasks[0];assert.ok(summary);
const {task}=await api(`/api/tasks?id=${summary.id}`);
const before=progress.xp;
const invalid=await fetch(origin+'/api/tasks',{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify({taskId:task.id})});assert.equal(invalid.status,400);assert.equal((await api('/api/progression')).xp,before,'invalid submissions must not deduct XP');
const answer=await api('/api/tasks',{taskId:task.id,line:task.lines.length,fixIndex:0,source:'challenge'});
assert.equal(answer.correct,false,'QA chose last line, which should not be the planted bug');
assert.equal(answer.xpLost,Math.min(before,Math.ceil(summary.xp/5)));
const again=await api('/api/tasks',{taskId:task.id,line:task.lines.length,fixIndex:0,source:'challenge'});assert.equal(again.xpLost,0);
progress=await api('/api/progression');assert.equal(progress.xp,before-answer.xpLost);assert.ok(Date.parse(progress.inactivityDue)>Date.now()+172790000);
for(const page of ['/rewards','/dashboard','/leaderboards','/teams','/profile']){const r=await fetch(origin+page,{headers:{cookie,accept:'text/html'}});assert.equal(r.status,200,page)}
console.log(`Passed: registration bonus, login replay, concurrent spins, shard wallet, failed challenge, retry cap, activity reset and five rendered routes. Local QA account: ${username}`);

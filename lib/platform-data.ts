import {platformPlayer} from "./platform";

type HistoryRow={mode:string;title:string;status:string;date:string};

// D1 caps how many SELECTs a compound query may union, and the activity feed now
// draws from six modes. Each source is its own small statement, sent in one
// batch and merged here.
const HISTORY_SOURCES=[
 "SELECT 'Challenge' mode,q.prompt title,CASE WHEN a.correct=1 THEN 'Solved' ELSE 'Attempted' END status,a.created_at date FROM challenge_attempts a JOIN questions q ON q.id=a.question_id WHERE a.user_id=? ORDER BY a.created_at DESC LIMIT 50",
 "SELECT 'Practice' mode,t.name title,s.status status,s.started_at date FROM practice_sessions s JOIN topics t ON t.id=s.topic_id WHERE s.user_id=? ORDER BY s.started_at DESC LIMIT 50",
 "SELECT 'Bot battle' mode,t.name title,b.status status,b.started_at date FROM bot_battles b JOIN topics t ON t.id=b.topic_id WHERE b.user_id=? ORDER BY b.started_at DESC LIMIT 50",
 "SELECT 'Live battle' mode,a.title title,a.status status,a.created_at date FROM arenas a JOIN arena_participants m ON m.arena_id=a.id WHERE m.user_id=? ORDER BY a.created_at DESC LIMIT 50",
 "SELECT CASE WHEN t.kind='bug' THEN 'Find the bug' ELSE 'Write the code' END mode,t.title title,CASE WHEN c.passed=1 THEN 'Solved' ELSE 'Attempted' END status,c.created_at date FROM code_attempts c JOIN code_tasks t ON t.id=c.task_id WHERE c.user_id=? ORDER BY c.created_at DESC LIMIT 50",
 "SELECT 'Duel' mode,t.title title,CASE WHEN d.winner='you' THEN 'Won' WHEN d.winner='draw' THEN 'Draw' WHEN d.winner IS NULL THEN 'In progress' ELSE 'Lost' END status,d.started_at date FROM duels d JOIN code_tasks t ON t.id=d.task_id WHERE d.user_id=? ORDER BY d.started_at DESC LIMIT 50",
];

export async function platformData(){
 const p=await platformPlayer();
 if(!p)throw Error("Authentication required");
 const id=p.user.userId;

 const profile=await p.db.prepare("SELECT display_name,xp,level FROM profiles WHERE user_id=?").bind(id)
  .first<{display_name:string;xp:number;level:number}>();

 const stats=await p.db.prepare(
  "SELECT (SELECT count(*) FROM challenge_attempts WHERE user_id=?1)+(SELECT count(*) FROM code_attempts WHERE user_id=?1) attempts,"+
  "(SELECT COALESCE(sum(correct),0) FROM challenge_attempts WHERE user_id=?1)+(SELECT COALESCE(sum(passed),0) FROM code_attempts WHERE user_id=?1) correct,"+
  "(SELECT count(DISTINCT question_id) FROM challenge_attempts WHERE user_id=?1 AND correct=1)+(SELECT count(DISTINCT task_id) FROM code_attempts WHERE user_id=?1 AND passed=1) solved"
 ).bind(id).first<{attempts:number;correct:number;solved:number}>();

 const historyResults=await p.db.batch<HistoryRow>(HISTORY_SOURCES.map(sql=>p.db.prepare(sql).bind(id)));
 const history=historyResults
  .flatMap(result=>result.results??[])
  .sort((a,b)=>b.date.localeCompare(a.date))
  .slice(0,50);

 const leaders=await p.db.prepare("SELECT display_name,xp,level FROM profiles ORDER BY xp DESC,display_name LIMIT 50")
  .all<{display_name:string;xp:number;level:number}>();
 const teams=await p.db.prepare("SELECT t.name,count(m.user_id) members,COALESCE(sum(p.xp),0) xp FROM teams t JOIN team_members m ON m.team_id=t.id JOIN profiles p ON p.user_id=m.user_id GROUP BY t.id ORDER BY xp DESC LIMIT 50")
  .all<{name:string;members:number;xp:number}>();
 const rooms=await p.db.prepare("SELECT a.code,a.title,a.difficulty,a.max_participants,count(m.id) members,t.name topic FROM arenas a JOIN topics t ON t.id=a.topic_id LEFT JOIN arena_participants m ON m.arena_id=a.id WHERE a.visibility='public' AND a.status='lobby' GROUP BY a.id ORDER BY a.created_at DESC LIMIT 30")
  .all<{code:string;title:string;difficulty:string;max_participants:number;members:number;topic:string}>();

 return {profile:profile!,stats:stats!,history,leaders:leaders.results,teams:teams.results,rooms:rooms.results};
}

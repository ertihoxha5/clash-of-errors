// Generates only the new, unreleased 0017 migration. Do not rerun after release.
import {writeFileSync} from 'node:fs';
import {RANKS} from '../lib/ranks.ts';
const now="strftime('%Y-%m-%dT%H:%M:%fZ','now')";
const rankCase=`CASE ${[...RANKS].reverse().map(r=>`WHEN xp >= ${r.xp} THEN '${r.name}'`).join(' ')} ELSE 'Bronze I' END`;
const statements=[
`CREATE TRIGGER IF NOT EXISTS progression_apply AFTER INSERT ON progression_events BEGIN
 UPDATE profiles SET xp=max(0,xp+NEW.xp_delta),updated_at=NEW.created_at WHERE user_id=NEW.user_id;
END;`,
`CREATE TRIGGER IF NOT EXISTS progression_rank AFTER UPDATE OF xp ON profiles BEGIN
 UPDATE profiles SET level=1+CAST(max(0,xp)/500 AS INTEGER),rank=${rankCase} WHERE user_id=NEW.user_id;
END;`,
`CREATE TRIGGER IF NOT EXISTS progression_new_player AFTER INSERT ON profiles BEGIN
 INSERT OR IGNORE INTO player_activity (user_id,last_participated) VALUES (NEW.user_id,${now});
 UPDATE profiles SET level=1+CAST(max(0,xp)/500 AS INTEGER),rank=${rankCase} WHERE user_id=NEW.user_id;
END;`,
`INSERT OR IGNORE INTO player_activity (user_id,last_participated) SELECT user_id,${now} FROM profiles;`,
`UPDATE profiles SET level=1+CAST(max(0,xp)/500 AS INTEGER),rank=${rankCase};`
];
function activity(table,userExpression,extra='',on='INSERT',condition=''){
 statements.push(`CREATE TRIGGER IF NOT EXISTS participation_${table} AFTER ${on} ON ${table} ${condition} BEGIN
 INSERT OR IGNORE INTO progression_events (user_id,source,label,xp_delta,shards,created_at)
 SELECT a.user_id,'idle:'||a.last_participated,'48-hour inactivity',-min(200,p.xp),0,${now}
 FROM player_activity a JOIN profiles p ON p.user_id=a.user_id
 WHERE a.user_id=${userExpression} AND julianday('now')-julianday(a.last_participated)>=2;
 ${extra}
 INSERT INTO player_activity (user_id,last_participated) VALUES (${userExpression},${now}) ON CONFLICT(user_id) DO UPDATE SET last_participated=excluded.last_participated;
END;`);
}
activity('code_attempts','NEW.user_id',`INSERT OR IGNORE INTO progression_events (user_id,source,label,xp_delta,shards,created_at)
 SELECT NEW.user_id,'loss:task:'||NEW.task_id||':'||date('now'),'Failed challenge · '||NEW.id,-min(p.xp,max(1,CAST((t.xp+4)/5 AS INTEGER))),0,${now}
 FROM profiles p JOIN code_tasks t ON t.id=NEW.task_id WHERE p.user_id=NEW.user_id AND NEW.passed=0;`);
activity('challenge_attempts','NEW.user_id',`INSERT OR IGNORE INTO progression_events (user_id,source,label,xp_delta,shards,created_at)
 SELECT NEW.user_id,'loss:question:'||NEW.question_id||':'||date('now'),'Failed question · '||NEW.id,-min(p.xp,5),0,${now}
 FROM profiles p WHERE p.user_id=NEW.user_id AND NEW.correct=0;`);
activity('practice_answers','(SELECT user_id FROM practice_sessions WHERE id=NEW.session_id)');
activity('bot_battle_answers','(SELECT user_id FROM bot_battles WHERE id=NEW.battle_id)');
activity('arena_answers','(SELECT user_id FROM arena_participants WHERE id=NEW.participant_id)');
activity('duels','NEW.user_id','','UPDATE OF user_tests_passed');
writeFileSync(new URL('../drizzle/0017_progression_rules.sql',import.meta.url),'-- Atomic rewards, rank changes and participation. Existing accounts start a fresh 48-hour window.\n'+statements.join('\n--> statement-breakpoint\n')+'\n');

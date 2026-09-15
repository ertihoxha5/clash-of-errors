-- Atomic rewards, rank changes and participation. Existing accounts start a fresh 48-hour window.
CREATE TRIGGER IF NOT EXISTS progression_apply AFTER INSERT ON progression_events BEGIN
 UPDATE profiles SET xp=max(0,xp+NEW.xp_delta),updated_at=NEW.created_at WHERE user_id=NEW.user_id;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS progression_rank AFTER UPDATE OF xp ON profiles BEGIN
 UPDATE profiles SET level=1+CAST(max(0,xp)/500 AS INTEGER),rank=CASE WHEN xp >= 30000 THEN 'MASTERPIECE' WHEN xp >= 26000 THEN 'Master III' WHEN xp >= 22000 THEN 'Master II' WHEN xp >= 18500 THEN 'Master I' WHEN xp >= 15500 THEN 'Diamond III' WHEN xp >= 13000 THEN 'Diamond II' WHEN xp >= 11000 THEN 'Diamond I' WHEN xp >= 9200 THEN 'Platinum III' WHEN xp >= 7500 THEN 'Platinum II' WHEN xp >= 6000 THEN 'Platinum I' WHEN xp >= 4700 THEN 'Gold III' WHEN xp >= 3700 THEN 'Gold II' WHEN xp >= 2800 THEN 'Gold I' WHEN xp >= 2000 THEN 'Silver III' WHEN xp >= 1400 THEN 'Silver II' WHEN xp >= 900 THEN 'Silver I' WHEN xp >= 500 THEN 'Bronze III' WHEN xp >= 250 THEN 'Bronze II' WHEN xp >= 0 THEN 'Bronze I' ELSE 'Bronze I' END WHERE user_id=NEW.user_id;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS progression_new_player AFTER INSERT ON profiles BEGIN
 INSERT OR IGNORE INTO player_activity (user_id,last_participated) VALUES (NEW.user_id,strftime('%Y-%m-%dT%H:%M:%fZ','now'));
 UPDATE profiles SET level=1+CAST(max(0,xp)/500 AS INTEGER),rank=CASE WHEN xp >= 30000 THEN 'MASTERPIECE' WHEN xp >= 26000 THEN 'Master III' WHEN xp >= 22000 THEN 'Master II' WHEN xp >= 18500 THEN 'Master I' WHEN xp >= 15500 THEN 'Diamond III' WHEN xp >= 13000 THEN 'Diamond II' WHEN xp >= 11000 THEN 'Diamond I' WHEN xp >= 9200 THEN 'Platinum III' WHEN xp >= 7500 THEN 'Platinum II' WHEN xp >= 6000 THEN 'Platinum I' WHEN xp >= 4700 THEN 'Gold III' WHEN xp >= 3700 THEN 'Gold II' WHEN xp >= 2800 THEN 'Gold I' WHEN xp >= 2000 THEN 'Silver III' WHEN xp >= 1400 THEN 'Silver II' WHEN xp >= 900 THEN 'Silver I' WHEN xp >= 500 THEN 'Bronze III' WHEN xp >= 250 THEN 'Bronze II' WHEN xp >= 0 THEN 'Bronze I' ELSE 'Bronze I' END WHERE user_id=NEW.user_id;
END;
--> statement-breakpoint
INSERT OR IGNORE INTO player_activity (user_id,last_participated) SELECT user_id,strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM profiles;
--> statement-breakpoint
UPDATE profiles SET level=1+CAST(max(0,xp)/500 AS INTEGER),rank=CASE WHEN xp >= 30000 THEN 'MASTERPIECE' WHEN xp >= 26000 THEN 'Master III' WHEN xp >= 22000 THEN 'Master II' WHEN xp >= 18500 THEN 'Master I' WHEN xp >= 15500 THEN 'Diamond III' WHEN xp >= 13000 THEN 'Diamond II' WHEN xp >= 11000 THEN 'Diamond I' WHEN xp >= 9200 THEN 'Platinum III' WHEN xp >= 7500 THEN 'Platinum II' WHEN xp >= 6000 THEN 'Platinum I' WHEN xp >= 4700 THEN 'Gold III' WHEN xp >= 3700 THEN 'Gold II' WHEN xp >= 2800 THEN 'Gold I' WHEN xp >= 2000 THEN 'Silver III' WHEN xp >= 1400 THEN 'Silver II' WHEN xp >= 900 THEN 'Silver I' WHEN xp >= 500 THEN 'Bronze III' WHEN xp >= 250 THEN 'Bronze II' WHEN xp >= 0 THEN 'Bronze I' ELSE 'Bronze I' END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS participation_code_attempts AFTER INSERT ON code_attempts  BEGIN
 INSERT OR IGNORE INTO progression_events (user_id,source,label,xp_delta,shards,created_at)
 SELECT a.user_id,'idle:'||a.last_participated,'48-hour inactivity',-min(200,p.xp),0,strftime('%Y-%m-%dT%H:%M:%fZ','now')
 FROM player_activity a JOIN profiles p ON p.user_id=a.user_id
 WHERE a.user_id=NEW.user_id AND julianday('now')-julianday(a.last_participated)>=2;
 INSERT OR IGNORE INTO progression_events (user_id,source,label,xp_delta,shards,created_at)
 SELECT NEW.user_id,'loss:task:'||NEW.task_id||':'||date('now'),'Failed challenge · '||NEW.id,-min(p.xp,max(1,CAST((t.xp+4)/5 AS INTEGER))),0,strftime('%Y-%m-%dT%H:%M:%fZ','now')
 FROM profiles p JOIN code_tasks t ON t.id=NEW.task_id WHERE p.user_id=NEW.user_id AND NEW.passed=0;
 INSERT INTO player_activity (user_id,last_participated) VALUES (NEW.user_id,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(user_id) DO UPDATE SET last_participated=excluded.last_participated;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS participation_challenge_attempts AFTER INSERT ON challenge_attempts  BEGIN
 INSERT OR IGNORE INTO progression_events (user_id,source,label,xp_delta,shards,created_at)
 SELECT a.user_id,'idle:'||a.last_participated,'48-hour inactivity',-min(200,p.xp),0,strftime('%Y-%m-%dT%H:%M:%fZ','now')
 FROM player_activity a JOIN profiles p ON p.user_id=a.user_id
 WHERE a.user_id=NEW.user_id AND julianday('now')-julianday(a.last_participated)>=2;
 INSERT OR IGNORE INTO progression_events (user_id,source,label,xp_delta,shards,created_at)
 SELECT NEW.user_id,'loss:question:'||NEW.question_id||':'||date('now'),'Failed question · '||NEW.id,-min(p.xp,5),0,strftime('%Y-%m-%dT%H:%M:%fZ','now')
 FROM profiles p WHERE p.user_id=NEW.user_id AND NEW.correct=0;
 INSERT INTO player_activity (user_id,last_participated) VALUES (NEW.user_id,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(user_id) DO UPDATE SET last_participated=excluded.last_participated;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS participation_practice_answers AFTER INSERT ON practice_answers  BEGIN
 INSERT OR IGNORE INTO progression_events (user_id,source,label,xp_delta,shards,created_at)
 SELECT a.user_id,'idle:'||a.last_participated,'48-hour inactivity',-min(200,p.xp),0,strftime('%Y-%m-%dT%H:%M:%fZ','now')
 FROM player_activity a JOIN profiles p ON p.user_id=a.user_id
 WHERE a.user_id=(SELECT user_id FROM practice_sessions WHERE id=NEW.session_id) AND julianday('now')-julianday(a.last_participated)>=2;
 
 INSERT INTO player_activity (user_id,last_participated) VALUES ((SELECT user_id FROM practice_sessions WHERE id=NEW.session_id),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(user_id) DO UPDATE SET last_participated=excluded.last_participated;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS participation_bot_battle_answers AFTER INSERT ON bot_battle_answers  BEGIN
 INSERT OR IGNORE INTO progression_events (user_id,source,label,xp_delta,shards,created_at)
 SELECT a.user_id,'idle:'||a.last_participated,'48-hour inactivity',-min(200,p.xp),0,strftime('%Y-%m-%dT%H:%M:%fZ','now')
 FROM player_activity a JOIN profiles p ON p.user_id=a.user_id
 WHERE a.user_id=(SELECT user_id FROM bot_battles WHERE id=NEW.battle_id) AND julianday('now')-julianday(a.last_participated)>=2;
 
 INSERT INTO player_activity (user_id,last_participated) VALUES ((SELECT user_id FROM bot_battles WHERE id=NEW.battle_id),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(user_id) DO UPDATE SET last_participated=excluded.last_participated;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS participation_arena_answers AFTER INSERT ON arena_answers  BEGIN
 INSERT OR IGNORE INTO progression_events (user_id,source,label,xp_delta,shards,created_at)
 SELECT a.user_id,'idle:'||a.last_participated,'48-hour inactivity',-min(200,p.xp),0,strftime('%Y-%m-%dT%H:%M:%fZ','now')
 FROM player_activity a JOIN profiles p ON p.user_id=a.user_id
 WHERE a.user_id=(SELECT user_id FROM arena_participants WHERE id=NEW.participant_id) AND julianday('now')-julianday(a.last_participated)>=2;
 
 INSERT INTO player_activity (user_id,last_participated) VALUES ((SELECT user_id FROM arena_participants WHERE id=NEW.participant_id),strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(user_id) DO UPDATE SET last_participated=excluded.last_participated;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS participation_duels AFTER UPDATE OF user_tests_passed ON duels  BEGIN
 INSERT OR IGNORE INTO progression_events (user_id,source,label,xp_delta,shards,created_at)
 SELECT a.user_id,'idle:'||a.last_participated,'48-hour inactivity',-min(200,p.xp),0,strftime('%Y-%m-%dT%H:%M:%fZ','now')
 FROM player_activity a JOIN profiles p ON p.user_id=a.user_id
 WHERE a.user_id=NEW.user_id AND julianday('now')-julianday(a.last_participated)>=2;
 
 INSERT INTO player_activity (user_id,last_participated) VALUES (NEW.user_id,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(user_id) DO UPDATE SET last_participated=excluded.last_participated;
END;

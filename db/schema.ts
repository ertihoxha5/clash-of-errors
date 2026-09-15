import {index,integer,sqliteTable,text,uniqueIndex} from "drizzle-orm/sqlite-core";

export const users=sqliteTable("users",{
 id:text("id").primaryKey(),
 email:text("email").notNull().unique(),
 role:text("role").notNull().default("player"),
 createdAt:text("created_at").notNull(),
 updatedAt:text("updated_at").notNull(),
});

export const topics=sqliteTable("topics",{
 id:integer("id").primaryKey({autoIncrement:true}),
 slug:text("slug").notNull().unique(),
 name:text("name").notNull(),
 description:text("description").notNull().default(""),
});

export const subtopics=sqliteTable("subtopics",{
 id:integer("id").primaryKey({autoIncrement:true}),
 topicId:integer("topic_id").notNull().references(()=>topics.id,{onDelete:"cascade"}),
 slug:text("slug").notNull(),
 name:text("name").notNull(),
},table=>[index("idx_subtopics_topic_id").on(table.topicId)]);

export const questions=sqliteTable("questions",{
 id:integer("id").primaryKey({autoIncrement:true}),
 topicId:integer("topic_id").notNull().references(()=>topics.id),
 subtopicId:integer("subtopic_id").references(()=>subtopics.id),
 authorId:text("author_id").references(()=>users.id),
 prompt:text("prompt").notNull(),
 code:text("code").notNull().default(""),
 explanation:text("explanation").notNull(),
 difficulty:text("difficulty").notNull().default("medium"),
 status:text("status").notNull().default("draft"),
 createdAt:text("created_at").notNull(),
 updatedAt:text("updated_at").notNull(),
},table=>[index("idx_questions_author_created").on(table.authorId,table.createdAt),index("idx_questions_topic_status").on(table.topicId,table.status)]);

export const questionOptions=sqliteTable("question_options",{
 id:integer("id").primaryKey({autoIncrement:true}),
 questionId:integer("question_id").notNull().references(()=>questions.id,{onDelete:"cascade"}),
 label:text("label").notNull(),
 isCorrect:integer("is_correct",{mode:"boolean"}).notNull().default(false),
 position:integer("position").notNull(),
},table=>[index("idx_question_options_question_id").on(table.questionId)]);

export const questionSets=sqliteTable("question_sets",{
 id:integer("id").primaryKey({autoIncrement:true}),
 ownerId:text("owner_id").notNull().references(()=>users.id),
 title:text("title").notNull(),
 description:text("description").notNull().default(""),
 createdAt:text("created_at").notNull(),
 updatedAt:text("updated_at").notNull(),
});

export const questionSetItems=sqliteTable("question_set_items",{
 setId:integer("set_id").notNull().references(()=>questionSets.id,{onDelete:"cascade"}),
 questionId:integer("question_id").notNull().references(()=>questions.id,{onDelete:"cascade"}),
 position:integer("position").notNull(),
});

export const practiceSessions=sqliteTable("practice_sessions",{
 id:text("id").primaryKey(),userId:text("user_id").notNull().references(()=>users.id),topicId:integer("topic_id").notNull().references(()=>topics.id),difficulty:text("difficulty").notNull(),questionCount:integer("question_count").notNull(),status:text("status").notNull().default("active"),correctCount:integer("correct_count").notNull().default(0),totalResponseMs:integer("total_response_ms").notNull().default(0),xpEarned:integer("xp_earned").notNull().default(0),startedAt:text("started_at").notNull(),completedAt:text("completed_at"),
},table=>[index("idx_practice_sessions_user_started").on(table.userId,table.startedAt)]);

export const practiceAnswers=sqliteTable("practice_answers",{
 id:integer("id").primaryKey({autoIncrement:true}),sessionId:text("session_id").notNull().references(()=>practiceSessions.id,{onDelete:"cascade"}),questionId:integer("question_id").notNull().references(()=>questions.id),selectedOptionId:integer("selected_option_id").notNull().references(()=>questionOptions.id),isCorrect:integer("is_correct",{mode:"boolean"}).notNull(),responseMs:integer("response_ms").notNull(),answeredAt:text("answered_at").notNull(),
},table=>[uniqueIndex("idx_practice_answers_session_question").on(table.sessionId,table.questionId)]);

export const topicMastery=sqliteTable("topic_mastery",{
 userId:text("user_id").notNull().references(()=>users.id),topicId:integer("topic_id").notNull().references(()=>topics.id),attempts:integer("attempts").notNull().default(0),correct:integer("correct").notNull().default(0),mastery:integer("mastery").notNull().default(0),updatedAt:text("updated_at").notNull(),
},table=>[uniqueIndex("idx_topic_mastery_user_topic").on(table.userId,table.topicId)]);

export const botBattles=sqliteTable("bot_battles",{
 id:text("id").primaryKey(),userId:text("user_id").notNull().references(()=>users.id),topicId:integer("topic_id").notNull().references(()=>topics.id),difficulty:text("difficulty").notNull(),questionCount:integer("question_count").notNull(),status:text("status").notNull().default("active"),userScore:integer("user_score").notNull().default(0),userCorrect:integer("user_correct").notNull().default(0),xpEarned:integer("xp_earned").notNull().default(0),startedAt:text("started_at").notNull(),completedAt:text("completed_at"),
},table=>[index("idx_bot_battles_user_started").on(table.userId,table.startedAt)]);

export const botParticipants=sqliteTable("bot_participants",{
 id:integer("id").primaryKey({autoIncrement:true}),battleId:text("battle_id").notNull().references(()=>botBattles.id,{onDelete:"cascade"}),persona:text("persona").notNull(),tier:text("tier").notNull(),accuracy:integer("accuracy").notNull(),minResponseMs:integer("min_response_ms").notNull(),maxResponseMs:integer("max_response_ms").notNull(),score:integer("score").notNull().default(0),correct:integer("correct").notNull().default(0),
},table=>[index("idx_bot_participants_battle").on(table.battleId)]);

export const botBattleAnswers=sqliteTable("bot_battle_answers",{
 id:integer("id").primaryKey({autoIncrement:true}),battleId:text("battle_id").notNull().references(()=>botBattles.id,{onDelete:"cascade"}),questionId:integer("question_id").notNull().references(()=>questions.id),selectedOptionId:integer("selected_option_id").notNull().references(()=>questionOptions.id),isCorrect:integer("is_correct",{mode:"boolean"}).notNull(),responseMs:integer("response_ms").notNull(),points:integer("points").notNull(),answeredAt:text("answered_at").notNull(),
},table=>[uniqueIndex("idx_bot_answers_battle_question").on(table.battleId,table.questionId)]);

export const botSimulatedAnswers=sqliteTable("bot_simulated_answers",{
 id:integer("id").primaryKey({autoIncrement:true}),participantId:integer("participant_id").notNull().references(()=>botParticipants.id,{onDelete:"cascade"}),questionId:integer("question_id").notNull().references(()=>questions.id),isCorrect:integer("is_correct",{mode:"boolean"}).notNull(),responseMs:integer("response_ms").notNull(),points:integer("points").notNull(),
},table=>[uniqueIndex("idx_bot_sim_answers_participant_question").on(table.participantId,table.questionId)]);

export const arenas=sqliteTable("arenas",{
 id:text("id").primaryKey(),code:text("code").notNull().unique(),hostId:text("host_id").notNull().references(()=>users.id),title:text("title").notNull(),topicId:integer("topic_id").notNull().references(()=>topics.id),difficulty:text("difficulty").notNull(),questionCount:integer("question_count").notNull(),timeLimit:integer("time_limit").notNull(),visibility:text("visibility").notNull().default("private"),maxParticipants:integer("max_participants").notNull().default(8),status:text("status").notNull().default("lobby"),scoringVersion:text("scoring_version").notNull().default("1.0"),startedAt:text("started_at"),completedAt:text("completed_at"),createdAt:text("created_at").notNull(),updatedAt:text("updated_at").notNull(),
},table=>[index("idx_arenas_status_created").on(table.status,table.createdAt)]);

export const arenaParticipants=sqliteTable("arena_participants",{
 id:integer("id").primaryKey({autoIncrement:true}),arenaId:text("arena_id").notNull().references(()=>arenas.id,{onDelete:"cascade"}),userId:text("user_id").notNull().references(()=>users.id),displayName:text("display_name").notNull(),avatar:text("avatar").notNull(),isHost:integer("is_host",{mode:"boolean"}).notNull().default(false),isReady:integer("is_ready",{mode:"boolean"}).notNull().default(false),status:text("status").notNull().default("online"),score:integer("score").notNull().default(0),correct:integer("correct").notNull().default(0),streak:integer("streak").notNull().default(0),joinedAt:text("joined_at").notNull(),lastSeenAt:text("last_seen_at").notNull(),
},table=>[uniqueIndex("idx_arena_participants_arena_user").on(table.arenaId,table.userId),index("idx_arena_participants_presence").on(table.arenaId,table.lastSeenAt)]);

export const arenaBattleQuestions=sqliteTable("arena_battle_questions",{
 id:integer("id").primaryKey({autoIncrement:true}),arenaId:text("arena_id").notNull().references(()=>arenas.id,{onDelete:"cascade"}),questionId:integer("question_id").notNull().references(()=>questions.id),position:integer("position").notNull(),
},table=>[uniqueIndex("idx_arena_battle_question_position").on(table.arenaId,table.position)]);

export const arenaAnswers=sqliteTable("arena_answers",{
 id:integer("id").primaryKey({autoIncrement:true}),arenaId:text("arena_id").notNull().references(()=>arenas.id,{onDelete:"cascade"}),participantId:integer("participant_id").notNull().references(()=>arenaParticipants.id,{onDelete:"cascade"}),questionId:integer("question_id").notNull().references(()=>questions.id),selectedOptionId:integer("selected_option_id").notNull().references(()=>questionOptions.id),isCorrect:integer("is_correct",{mode:"boolean"}).notNull(),responseMs:integer("response_ms").notNull(),points:integer("points").notNull(),streak:integer("streak").notNull(),answeredAt:text("answered_at").notNull(),
},table=>[uniqueIndex("idx_arena_answers_participant_question").on(table.participantId,table.questionId),index("idx_arena_answers_arena_question").on(table.arenaId,table.questionId)]);

export const profiles=sqliteTable("profiles",{
 userId:text("user_id").primaryKey().references(()=>users.id,{onDelete:"cascade"}),
 displayName:text("display_name").notNull(),
 bio:text("bio").notNull().default(""),
 avatar:text("avatar").notNull().default("CO"),
 level:integer("level").notNull().default(1),
 rank:text("rank").notNull().default("Bronze I"),
 xp:integer("xp").notNull().default(0),
 streak:integer("streak").notNull().default(0),
 updatedAt:text("updated_at").notNull(),
});

export const teams=sqliteTable("teams",{
 id:text("id").primaryKey(),name:text("name").notNull(),inviteCode:text("invite_code").notNull().unique(),captainId:text("captain_id").notNull().references(()=>users.id),createdAt:text("created_at").notNull(),
});
export const teamMembers=sqliteTable("team_members",{
 userId:text("user_id").primaryKey().references(()=>users.id,{onDelete:"cascade"}),teamId:text("team_id").notNull().references(()=>teams.id,{onDelete:"cascade"}),joinedAt:text("joined_at").notNull(),
},t=>[index("idx_team_members_team").on(t.teamId,t.joinedAt)]);
export const challengeAttempts=sqliteTable("challenge_attempts",{
 id:text("id").primaryKey(),userId:text("user_id").notNull().references(()=>users.id),questionId:integer("question_id").notNull().references(()=>questions.id),optionId:integer("option_id").notNull().references(()=>questionOptions.id),correct:integer("correct",{mode:"boolean"}).notNull(),createdAt:text("created_at").notNull(),
},t=>[index("idx_challenge_attempts_user_question").on(t.userId,t.questionId),index("idx_challenge_attempts_user_created").on(t.userId,t.createdAt)]);
export const platformRewards=sqliteTable("platform_rewards",{
 userId:text("user_id").notNull().references(()=>users.id),source:text("source").notNull(),xp:integer("xp").notNull(),createdAt:text("created_at").notNull(),
},t=>[uniqueIndex("idx_platform_rewards_user_source").on(t.userId,t.source)]);

// Code tasks are the real challenge content: "find the bug" tasks are verified
// entirely on the server (a line number plus a fix choice), while "write" tasks
// carry their test list and are executed in the browser's sandboxed worker.
export const codeTasks=sqliteTable("code_tasks",{
 id:integer("id").primaryKey({autoIncrement:true}),
 slug:text("slug").notNull().unique(),
 topicId:integer("topic_id").notNull().references(()=>topics.id),
 kind:text("kind").notNull(),
 title:text("title").notNull(),
 difficulty:text("difficulty").notNull().default("medium"),
 language:text("language").notNull().default("javascript"),
 prompt:text("prompt").notNull(),
 code:text("code").notNull(),
 buggyLine:integer("buggy_line"),
 hint:text("hint").notNull().default(""),
 symptom:text("symptom").notNull().default(""),
 region:text("region").notNull().default(""),
 fixes:text("fixes").notNull().default("[]"),
 tests:text("tests").notNull().default("[]"),
 explanation:text("explanation").notNull(),
 solution:text("solution").notNull().default(""),
 xp:integer("xp").notNull().default(30),
 status:text("status").notNull().default("published"),
 createdAt:text("created_at").notNull(),
 updatedAt:text("updated_at").notNull(),
},t=>[index("idx_code_tasks_kind_difficulty").on(t.kind,t.difficulty),index("idx_code_tasks_topic").on(t.topicId)]);

export const codeAttempts=sqliteTable("code_attempts",{
 id:text("id").primaryKey(),
 userId:text("user_id").notNull().references(()=>users.id,{onDelete:"cascade"}),
 taskId:integer("task_id").notNull().references(()=>codeTasks.id,{onDelete:"cascade"}),
 source:text("source").notNull().default("challenge"),
 passed:integer("passed",{mode:"boolean"}).notNull(),
 testsPassed:integer("tests_passed").notNull().default(0),
 testsTotal:integer("tests_total").notNull().default(0),
 durationMs:integer("duration_ms").notNull().default(0),
 createdAt:text("created_at").notNull(),
},t=>[index("idx_code_attempts_user_task").on(t.userId,t.taskId),index("idx_code_attempts_user_created").on(t.userId,t.createdAt)]);

// One duel row is one 1v1 against an NPC. The rival's progress is a schedule of
// millisecond offsets fixed at creation, so both sides read the same clock and
// the server stays the authority on who won.
export const duels=sqliteTable("duels",{
 id:text("id").primaryKey(),
 code:text("code").notNull().unique(),
 userId:text("user_id").notNull().references(()=>users.id,{onDelete:"cascade"}),
 taskId:integer("task_id").notNull().references(()=>codeTasks.id),
 npcSlug:text("npc_slug").notNull(),
 npcTier:text("npc_tier").notNull(),
 npcSchedule:text("npc_schedule").notNull(),
 timeLimit:integer("time_limit").notNull().default(600),
 testsTotal:integer("tests_total").notNull(),
 userTestsPassed:integer("user_tests_passed").notNull().default(0),
 status:text("status").notNull().default("active"),
 winner:text("winner"),
 xpEarned:integer("xp_earned").notNull().default(0),
 startedAt:text("started_at").notNull(),
 completedAt:text("completed_at"),
},t=>[index("idx_duels_user_started").on(t.userId,t.startedAt)]);

// Local accounts. `users` stays the identity every other table points at; an
// account adds the credentials and the human name behind it.
export const accounts=sqliteTable("accounts",{
 userId:text("user_id").primaryKey().references(()=>users.id,{onDelete:"cascade"}),
 username:text("username").notNull().unique(),
 firstName:text("first_name").notNull(),
 lastName:text("last_name").notNull(),
 passwordHash:text("password_hash").notNull(),
 passwordSalt:text("password_salt").notNull(),
 iterations:integer("iterations").notNull().default(150000),
 createdAt:text("created_at").notNull(),
 updatedAt:text("updated_at").notNull(),
});

export const sessions=sqliteTable("sessions",{
 token:text("token").primaryKey(),
 userId:text("user_id").notNull().references(()=>users.id,{onDelete:"cascade"}),
 createdAt:text("created_at").notNull(),
 expiresAt:text("expires_at").notNull(),
},t=>[index("idx_sessions_user").on(t.userId),index("idx_sessions_expiry").on(t.expiresAt)]);

export const laboratories=sqliteTable("laboratories",{
 userId:text("user_id").primaryKey().references(()=>users.id,{onDelete:"cascade"}),
 character:text("character").notNull().default("nullknight"),
});
export const labUnlocks=sqliteTable("lab_unlocks",{
 userId:text("user_id").notNull().references(()=>users.id,{onDelete:"cascade"}),
 item:text("item").notNull(),cost:integer("cost").notNull(),createdAt:text("created_at").notNull(),
},t=>[uniqueIndex("idx_lab_unlock_user_item").on(t.userId,t.item)]);

export const playerActivity=sqliteTable("player_activity",{
 userId:text("user_id").primaryKey().references(()=>users.id,{onDelete:"cascade"}),
 lastParticipated:text("last_participated").notNull(),
});
export const progressionEvents=sqliteTable("progression_events",{
 userId:text("user_id").notNull().references(()=>users.id,{onDelete:"cascade"}),
 source:text("source").notNull(),label:text("label").notNull(),
 xpDelta:integer("xp_delta").notNull().default(0),shards:integer("shards").notNull().default(0),
 prize:integer("prize"),createdAt:text("created_at").notNull(),
},t=>[uniqueIndex("idx_progression_user_source").on(t.userId,t.source),index("idx_progression_user_created").on(t.userId,t.createdAt)]);

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

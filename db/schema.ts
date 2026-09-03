import {integer,sqliteTable,text} from "drizzle-orm/sqlite-core";

export const users=sqliteTable("users",{
 id:text("id").primaryKey(),
 email:text("email").notNull().unique(),
 createdAt:text("created_at").notNull(),
 updatedAt:text("updated_at").notNull(),
});

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

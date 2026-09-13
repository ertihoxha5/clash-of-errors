CREATE TABLE `arena_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`arena_id` text NOT NULL,
	`participant_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`selected_option_id` integer NOT NULL,
	`is_correct` integer NOT NULL,
	`response_ms` integer NOT NULL,
	`points` integer NOT NULL,
	`streak` integer NOT NULL,
	`answered_at` text NOT NULL,
	FOREIGN KEY (`arena_id`) REFERENCES `arenas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`participant_id`) REFERENCES `arena_participants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`selected_option_id`) REFERENCES `question_options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_arena_answers_participant_question` ON `arena_answers` (`participant_id`,`question_id`);--> statement-breakpoint
CREATE INDEX `idx_arena_answers_arena_question` ON `arena_answers` (`arena_id`,`question_id`);--> statement-breakpoint
CREATE TABLE `arena_battle_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`arena_id` text NOT NULL,
	`question_id` integer NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`arena_id`) REFERENCES `arenas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_arena_battle_question_position` ON `arena_battle_questions` (`arena_id`,`position`);--> statement-breakpoint
ALTER TABLE `arena_participants` ADD `score` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `arena_participants` ADD `correct` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `arena_participants` ADD `streak` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `arenas` ADD `scoring_version` text DEFAULT '1.0' NOT NULL;--> statement-breakpoint
ALTER TABLE `arenas` ADD `started_at` text;--> statement-breakpoint
ALTER TABLE `arenas` ADD `completed_at` text;
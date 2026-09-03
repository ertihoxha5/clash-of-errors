CREATE TABLE `bot_battle_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`battle_id` text NOT NULL,
	`question_id` integer NOT NULL,
	`selected_option_id` integer NOT NULL,
	`is_correct` integer NOT NULL,
	`response_ms` integer NOT NULL,
	`points` integer NOT NULL,
	`answered_at` text NOT NULL,
	FOREIGN KEY (`battle_id`) REFERENCES `bot_battles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`selected_option_id`) REFERENCES `question_options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_bot_answers_battle_question` ON `bot_battle_answers` (`battle_id`,`question_id`);--> statement-breakpoint
CREATE TABLE `bot_battles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic_id` integer NOT NULL,
	`difficulty` text NOT NULL,
	`question_count` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`user_score` integer DEFAULT 0 NOT NULL,
	`user_correct` integer DEFAULT 0 NOT NULL,
	`xp_earned` integer DEFAULT 0 NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_bot_battles_user_started` ON `bot_battles` (`user_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `bot_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`battle_id` text NOT NULL,
	`persona` text NOT NULL,
	`tier` text NOT NULL,
	`accuracy` integer NOT NULL,
	`min_response_ms` integer NOT NULL,
	`max_response_ms` integer NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`battle_id`) REFERENCES `bot_battles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_bot_participants_battle` ON `bot_participants` (`battle_id`);--> statement-breakpoint
CREATE TABLE `bot_simulated_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`is_correct` integer NOT NULL,
	`response_ms` integer NOT NULL,
	`points` integer NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `bot_participants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_bot_sim_answers_participant_question` ON `bot_simulated_answers` (`participant_id`,`question_id`);
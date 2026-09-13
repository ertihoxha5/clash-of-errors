CREATE TABLE `code_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`task_id` integer NOT NULL,
	`source` text DEFAULT 'challenge' NOT NULL,
	`passed` integer NOT NULL,
	`tests_passed` integer DEFAULT 0 NOT NULL,
	`tests_total` integer DEFAULT 0 NOT NULL,
	`duration_ms` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `code_tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_code_attempts_user_task` ON `code_attempts` (`user_id`,`task_id`);--> statement-breakpoint
CREATE INDEX `idx_code_attempts_user_created` ON `code_attempts` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `code_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`topic_id` integer NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`difficulty` text DEFAULT 'medium' NOT NULL,
	`language` text DEFAULT 'javascript' NOT NULL,
	`prompt` text NOT NULL,
	`code` text NOT NULL,
	`buggy_line` integer,
	`fixes` text DEFAULT '[]' NOT NULL,
	`tests` text DEFAULT '[]' NOT NULL,
	`explanation` text NOT NULL,
	`solution` text DEFAULT '' NOT NULL,
	`xp` integer DEFAULT 30 NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `code_tasks_slug_unique` ON `code_tasks` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_code_tasks_kind_difficulty` ON `code_tasks` (`kind`,`difficulty`);--> statement-breakpoint
CREATE INDEX `idx_code_tasks_topic` ON `code_tasks` (`topic_id`);--> statement-breakpoint
CREATE TABLE `duels` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`user_id` text NOT NULL,
	`task_id` integer NOT NULL,
	`npc_slug` text NOT NULL,
	`npc_tier` text NOT NULL,
	`npc_schedule` text NOT NULL,
	`time_limit` integer DEFAULT 600 NOT NULL,
	`tests_total` integer NOT NULL,
	`user_tests_passed` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`winner` text,
	`xp_earned` integer DEFAULT 0 NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `code_tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `duels_code_unique` ON `duels` (`code`);--> statement-breakpoint
CREATE INDEX `idx_duels_user_started` ON `duels` (`user_id`,`started_at`);
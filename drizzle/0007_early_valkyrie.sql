CREATE TABLE `challenge_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_id` integer NOT NULL,
	`option_id` integer NOT NULL,
	`correct` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`option_id`) REFERENCES `question_options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_challenge_attempts_user_question` ON `challenge_attempts` (`user_id`,`question_id`);--> statement-breakpoint
CREATE INDEX `idx_challenge_attempts_user_created` ON `challenge_attempts` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `platform_rewards` (
	`user_id` text NOT NULL,
	`source` text NOT NULL,
	`xp` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_platform_rewards_user_source` ON `platform_rewards` (`user_id`,`source`);--> statement-breakpoint
CREATE TABLE `team_members` (
	`user_id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`joined_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_team_members_team` ON `team_members` (`team_id`,`joined_at`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`invite_code` text NOT NULL,
	`captain_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`captain_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_invite_code_unique` ON `teams` (`invite_code`);
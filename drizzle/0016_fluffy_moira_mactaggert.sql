CREATE TABLE `player_activity` (
	`user_id` text PRIMARY KEY NOT NULL,
	`last_participated` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `progression_events` (
	`user_id` text NOT NULL,
	`source` text NOT NULL,
	`label` text NOT NULL,
	`xp_delta` integer DEFAULT 0 NOT NULL,
	`shards` integer DEFAULT 0 NOT NULL,
	`prize` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_progression_user_source` ON `progression_events` (`user_id`,`source`);--> statement-breakpoint
CREATE INDEX `idx_progression_user_created` ON `progression_events` (`user_id`,`created_at`);
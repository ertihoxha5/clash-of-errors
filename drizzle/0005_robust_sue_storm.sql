CREATE TABLE `arena_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`arena_id` text NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`avatar` text NOT NULL,
	`is_host` integer DEFAULT false NOT NULL,
	`is_ready` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'online' NOT NULL,
	`joined_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	FOREIGN KEY (`arena_id`) REFERENCES `arenas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_arena_participants_arena_user` ON `arena_participants` (`arena_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `idx_arena_participants_presence` ON `arena_participants` (`arena_id`,`last_seen_at`);--> statement-breakpoint
CREATE TABLE `arenas` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`host_id` text NOT NULL,
	`title` text NOT NULL,
	`topic_id` integer NOT NULL,
	`difficulty` text NOT NULL,
	`question_count` integer NOT NULL,
	`time_limit` integer NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`max_participants` integer DEFAULT 8 NOT NULL,
	`status` text DEFAULT 'lobby' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`host_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `arenas_code_unique` ON `arenas` (`code`);--> statement-breakpoint
CREATE INDEX `idx_arenas_status_created` ON `arenas` (`status`,`created_at`);
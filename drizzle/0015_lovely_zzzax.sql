CREATE TABLE `lab_unlocks` (
	`user_id` text NOT NULL,
	`item` text NOT NULL,
	`cost` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lab_unlock_user_item` ON `lab_unlocks` (`user_id`,`item`);--> statement-breakpoint
CREATE TABLE `laboratories` (
	`user_id` text PRIMARY KEY NOT NULL,
	`character` text DEFAULT 'nullknight' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

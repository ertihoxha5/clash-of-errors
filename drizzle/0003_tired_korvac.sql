CREATE TABLE `practice_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`question_id` integer NOT NULL,
	`selected_option_id` integer NOT NULL,
	`is_correct` integer NOT NULL,
	`response_ms` integer NOT NULL,
	`answered_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `practice_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`selected_option_id`) REFERENCES `question_options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_practice_answers_session_question` ON `practice_answers` (`session_id`,`question_id`);--> statement-breakpoint
CREATE TABLE `practice_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic_id` integer NOT NULL,
	`difficulty` text NOT NULL,
	`question_count` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`correct_count` integer DEFAULT 0 NOT NULL,
	`total_response_ms` integer DEFAULT 0 NOT NULL,
	`xp_earned` integer DEFAULT 0 NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_practice_sessions_user_started` ON `practice_sessions` (`user_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `topic_mastery` (
	`user_id` text NOT NULL,
	`topic_id` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`mastery` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_topic_mastery_user_topic` ON `topic_mastery` (`user_id`,`topic_id`);--> statement-breakpoint
INSERT INTO `questions` (`id`,`topic_id`,`subtopic_id`,`author_id`,`prompt`,`code`,`explanation`,`difficulty`,`status`,`created_at`,`updated_at`) VALUES
(5,1,1,NULL,'Which method returns the first array element matching a condition?','const result = items.____(item => item.active);','find returns the first matching element, while filter returns every match.','medium','published','2026-01-02T00:00:00.000Z','2026-01-02T00:00:00.000Z'),
(6,1,1,NULL,'What does reduce return when no initial value is provided?','[2, 3, 4].reduce((sum, n) => sum + n)','The first element becomes the initial accumulator, producing 9 here.','medium','published','2026-01-02T00:00:00.000Z','2026-01-02T00:00:00.000Z'),
(7,1,2,NULL,'Which Promise method waits for every input and rejects on the first rejection?','','Promise.all resolves when all inputs resolve and rejects as soon as one rejects.','medium','published','2026-01-02T00:00:00.000Z','2026-01-02T00:00:00.000Z'),
(8,1,1,NULL,'Which array method removes and returns the final element?','const last = players.____();','pop mutates an array by removing and returning its last element.','medium','published','2026-01-02T00:00:00.000Z','2026-01-02T00:00:00.000Z'),
(9,1,2,NULL,'What value does an async function always return?','','An async function always returns a Promise, wrapping non-Promise return values.','medium','published','2026-01-02T00:00:00.000Z','2026-01-02T00:00:00.000Z');--> statement-breakpoint
INSERT INTO `question_options` (`question_id`,`label`,`is_correct`,`position`) VALUES
(5,'find',1,0),(5,'filter',0,1),(5,'some',0,2),(5,'map',0,3),
(6,'9',1,0),(6,'0',0,1),(6,'2',0,2),(6,'undefined',0,3),
(7,'Promise.all',1,0),(7,'Promise.race',0,1),(7,'Promise.any',0,2),(7,'Promise.resolve',0,3),
(8,'pop',1,0),(8,'shift',0,1),(8,'slice',0,2),(8,'splice',0,3),
(9,'A Promise',1,0),(9,'The raw value',0,1),(9,'undefined',0,2),(9,'An iterator',0,3);

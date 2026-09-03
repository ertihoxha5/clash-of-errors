CREATE TABLE `question_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`label` text NOT NULL,
	`is_correct` integer DEFAULT false NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `question_set_items` (
	`set_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`set_id`) REFERENCES `question_sets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `question_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`topic_id` integer NOT NULL,
	`subtopic_id` integer,
	`author_id` text,
	`prompt` text NOT NULL,
	`code` text DEFAULT '' NOT NULL,
	`explanation` text NOT NULL,
	`difficulty` text DEFAULT 'medium' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subtopic_id`) REFERENCES `subtopics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subtopics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`topic_id` integer NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topics_slug_unique` ON `topics` (`slug`);--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'player' NOT NULL;--> statement-breakpoint
INSERT INTO `topics` (`id`,`slug`,`name`,`description`) VALUES
(1,'javascript','JavaScript','Core language, arrays, functions, async patterns and the DOM'),
(2,'data-structures','Data Structures','Arrays, stacks, queues, maps, trees and graphs'),
(3,'algorithms','Algorithms','Complexity, searching, sorting and problem-solving patterns');--> statement-breakpoint
INSERT INTO `subtopics` (`id`,`topic_id`,`slug`,`name`) VALUES
(1,1,'array-methods','Array Methods'),(2,1,'async-javascript','Async JavaScript'),(3,2,'stacks-queues','Stacks & Queues'),(4,3,'complexity','Time Complexity');--> statement-breakpoint
INSERT INTO `questions` (`id`,`topic_id`,`subtopic_id`,`author_id`,`prompt`,`code`,`explanation`,`difficulty`,`status`,`created_at`,`updated_at`) VALUES
(1,1,1,NULL,'What value is returned by this array expression?','[1, 2, 3].map(n => n * 2)','map creates a new array by applying the callback to every item.','easy','published','2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z'),
(2,1,2,NULL,'Which keyword pauses execution inside an async function?','async function load() { /* keyword */ fetchData(); }','await pauses within an async function until the promise settles.','easy','published','2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z'),
(3,2,3,NULL,'Which data structure follows last-in, first-out ordering?','','A stack removes the most recently added element first, known as LIFO.','medium','published','2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z'),
(4,3,4,NULL,'What is the average time complexity of binary search?','','Binary search halves the remaining search space on every comparison.','medium','published','2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z');--> statement-breakpoint
INSERT INTO `question_options` (`question_id`,`label`,`is_correct`,`position`) VALUES
(1,'[2, 4, 6]',1,0),(1,'[1, 2, 3]',0,1),(1,'6',0,2),(1,'undefined',0,3),
(2,'await',1,0),(2,'yield',0,1),(2,'pause',0,2),(2,'defer',0,3),
(3,'Stack',1,0),(3,'Queue',0,1),(3,'Graph',0,2),(3,'Set',0,3),
(4,'O(log n)',1,0),(4,'O(n)',0,1),(4,'O(n²)',0,2),(4,'O(1)',0,3);

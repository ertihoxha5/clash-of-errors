CREATE INDEX `idx_question_options_question_id` ON `question_options` (`question_id`);--> statement-breakpoint
CREATE INDEX `idx_questions_author_created` ON `questions` (`author_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_questions_topic_status` ON `questions` (`topic_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_subtopics_topic_id` ON `subtopics` (`topic_id`);
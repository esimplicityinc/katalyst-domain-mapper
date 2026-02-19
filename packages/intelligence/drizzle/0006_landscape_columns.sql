ALTER TABLE `bounded_contexts` ADD `context_type` text NOT NULL DEFAULT 'internal';--> statement-breakpoint
ALTER TABLE `bounded_contexts` ADD `taxonomy_node` text;--> statement-breakpoint
ALTER TABLE `domain_workflows` ADD `context_ids` text DEFAULT '[]';

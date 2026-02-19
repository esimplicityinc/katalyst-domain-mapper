ALTER TABLE `domain_events` ADD `source_capability_id` text;--> statement-breakpoint
ALTER TABLE `domain_events` ADD `target_capability_ids` text DEFAULT '[]';

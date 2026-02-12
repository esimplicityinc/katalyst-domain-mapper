CREATE TABLE `domain_workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_model_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`states` text DEFAULT '[]',
	`transitions` text DEFAULT '[]',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`domain_model_id`) REFERENCES `domain_models`(`id`) ON UPDATE no action ON DELETE cascade
);

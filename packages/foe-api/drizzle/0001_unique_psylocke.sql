CREATE TABLE `aggregates` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_model_id` text NOT NULL,
	`context_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`root_entity` text NOT NULL,
	`entities` text DEFAULT '[]',
	`value_objects` text DEFAULT '[]',
	`events` text DEFAULT '[]',
	`commands` text DEFAULT '[]',
	`invariants` text DEFAULT '[]',
	`source_file` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`domain_model_id`) REFERENCES `domain_models`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`context_id`) REFERENCES `bounded_contexts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bounded_contexts` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_model_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`responsibility` text NOT NULL,
	`source_directory` text,
	`team_ownership` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`relationships` text DEFAULT '[]',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`domain_model_id`) REFERENCES `domain_models`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_model_id` text,
	`title` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`domain_model_id`) REFERENCES `domain_models`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `domain_events` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_model_id` text NOT NULL,
	`context_id` text NOT NULL,
	`aggregate_id` text,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`payload` text DEFAULT '[]',
	`consumed_by` text DEFAULT '[]',
	`triggers` text DEFAULT '[]',
	`side_effects` text DEFAULT '[]',
	`source_file` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`domain_model_id`) REFERENCES `domain_models`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`context_id`) REFERENCES `bounded_contexts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`aggregate_id`) REFERENCES `aggregates`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `domain_models` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `glossary_terms` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_model_id` text NOT NULL,
	`context_id` text,
	`term` text NOT NULL,
	`definition` text NOT NULL,
	`aliases` text DEFAULT '[]',
	`examples` text DEFAULT '[]',
	`related_terms` text DEFAULT '[]',
	`source` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`domain_model_id`) REFERENCES `domain_models`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`context_id`) REFERENCES `bounded_contexts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `value_objects` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_model_id` text NOT NULL,
	`context_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`properties` text DEFAULT '[]',
	`validation_rules` text DEFAULT '[]',
	`immutable` integer DEFAULT true,
	`source_file` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`domain_model_id`) REFERENCES `domain_models`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`context_id`) REFERENCES `bounded_contexts`(`id`) ON UPDATE no action ON DELETE cascade
);

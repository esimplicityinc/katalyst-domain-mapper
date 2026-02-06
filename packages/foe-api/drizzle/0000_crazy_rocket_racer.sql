CREATE TABLE `dimensions` (
	`id` text PRIMARY KEY NOT NULL,
	`scan_id` text NOT NULL,
	`name` text NOT NULL,
	`score` real NOT NULL,
	`max` integer DEFAULT 100 NOT NULL,
	`confidence` text NOT NULL,
	`color` text NOT NULL,
	FOREIGN KEY (`scan_id`) REFERENCES `scans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `findings` (
	`id` text PRIMARY KEY NOT NULL,
	`scan_id` text NOT NULL,
	`kind` text NOT NULL,
	`area` text NOT NULL,
	`severity` text NOT NULL,
	`title` text NOT NULL,
	`evidence` text NOT NULL,
	`impact` text NOT NULL,
	`recommendation` text NOT NULL,
	`location` text,
	`methods` text DEFAULT '[]',
	FOREIGN KEY (`scan_id`) REFERENCES `scans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `methodologies` (
	`id` text PRIMARY KEY NOT NULL,
	`scan_id` text NOT NULL,
	`files_analyzed` integer NOT NULL,
	`test_files_analyzed` integer NOT NULL,
	`adrs_analyzed` integer NOT NULL,
	`coverage_report_found` integer,
	`confidence_notes` text DEFAULT '[]',
	FOREIGN KEY (`scan_id`) REFERENCES `scans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` text PRIMARY KEY NOT NULL,
	`scan_id` text NOT NULL,
	`priority` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`impact` text NOT NULL,
	`methods` text DEFAULT '[]',
	`learning_path` text,
	FOREIGN KEY (`scan_id`) REFERENCES `scans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `repositories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text,
	`tech_stack` text DEFAULT '[]',
	`is_monorepo` integer DEFAULT false,
	`created_at` text NOT NULL,
	`last_scanned_at` text
);
--> statement-breakpoint
CREATE TABLE `scan_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`repository_path` text NOT NULL,
	`repository_name` text,
	`status` text NOT NULL,
	`error_message` text,
	`scan_id` text,
	`created_at` text NOT NULL,
	`started_at` text,
	`completed_at` text,
	FOREIGN KEY (`scan_id`) REFERENCES `scans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `scans` (
	`id` text PRIMARY KEY NOT NULL,
	`repository_id` text NOT NULL,
	`overall_score` real NOT NULL,
	`maturity_level` text NOT NULL,
	`assessment_mode` text NOT NULL,
	`executive_summary` text NOT NULL,
	`scan_date` text NOT NULL,
	`scan_duration` integer NOT NULL,
	`scanner_version` text NOT NULL,
	`raw_report` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`repository_id`) REFERENCES `repositories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `strengths` (
	`id` text PRIMARY KEY NOT NULL,
	`scan_id` text NOT NULL,
	`area` text NOT NULL,
	`evidence` text NOT NULL,
	`caveat` text,
	FOREIGN KEY (`scan_id`) REFERENCES `scans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `subscores` (
	`id` text PRIMARY KEY NOT NULL,
	`dimension_id` text NOT NULL,
	`name` text NOT NULL,
	`score` real NOT NULL,
	`max` integer DEFAULT 25 NOT NULL,
	`confidence` text NOT NULL,
	`evidence` text DEFAULT '[]',
	`gaps` text DEFAULT '[]',
	FOREIGN KEY (`dimension_id`) REFERENCES `dimensions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `triangle_diagnoses` (
	`id` text PRIMARY KEY NOT NULL,
	`scan_id` text NOT NULL,
	`cycle_health` text NOT NULL,
	`pattern` text NOT NULL,
	`weakest_principle` text NOT NULL,
	`intervention` text NOT NULL,
	`thresholds` text,
	FOREIGN KEY (`scan_id`) REFERENCES `scans`(`id`) ON UPDATE no action ON DELETE cascade
);

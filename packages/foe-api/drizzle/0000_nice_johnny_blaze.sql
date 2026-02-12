CREATE TABLE `governance_capabilities` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`coverage_score` integer NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `governance_snapshots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `governance_contexts` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	FOREIGN KEY (`snapshot_id`) REFERENCES `governance_snapshots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `governance_road_items` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`phase` integer NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `governance_snapshots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `governance_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`content` text NOT NULL
);

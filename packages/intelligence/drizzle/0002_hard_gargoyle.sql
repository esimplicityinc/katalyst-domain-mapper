CREATE TABLE `governance_capabilities` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`road_count` integer DEFAULT 0 NOT NULL,
	`story_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `governance_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `governance_contexts` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`aggregate_count` integer DEFAULT 0 NOT NULL,
	`event_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `governance_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `governance_road_items` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`road_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`phase` integer DEFAULT 0 NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `governance_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `governance_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`project` text NOT NULL,
	`version` text NOT NULL,
	`generated` text NOT NULL,
	`raw_index` text NOT NULL,
	`created_at` text NOT NULL
);

CREATE TABLE `taxonomy_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`action_type` text NOT NULL,
	`layer_type` text,
	`tags` text DEFAULT '[]',
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taxonomy_capabilities` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`categories` text DEFAULT '[]',
	`depends_on` text DEFAULT '[]',
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taxonomy_capability_rels` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`node` text NOT NULL,
	`relationship_type` text NOT NULL,
	`capabilities` text DEFAULT '[]',
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taxonomy_environments` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`parent_environment` text,
	`promotion_targets` text DEFAULT '[]',
	`template_replacements` text DEFAULT '{}',
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taxonomy_layer_types` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`default_layer_dir` text,
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taxonomy_nodes` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`node_type` text NOT NULL,
	`fqtn` text NOT NULL,
	`description` text,
	`parent_node` text,
	`owners` text DEFAULT '[]',
	`environments` text DEFAULT '[]',
	`labels` text DEFAULT '{}',
	`depends_on` text DEFAULT '[]',
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taxonomy_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`project` text NOT NULL,
	`version` text NOT NULL,
	`generated` text NOT NULL,
	`raw_snapshot` text NOT NULL,
	`node_count` integer NOT NULL,
	`environment_count` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `taxonomy_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`depends_on` text DEFAULT '[]',
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taxonomy_tools` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`actions` text DEFAULT '[]',
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `governance_capabilities` ADD `taxonomy_node` text;--> statement-breakpoint
ALTER TABLE `governance_road_items` ADD `taxonomy_node` text;
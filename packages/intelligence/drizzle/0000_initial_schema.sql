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
	`owner_team` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`subdomain_type` text,
	`context_type` text DEFAULT 'internal' NOT NULL,
	`taxonomy_node` text,
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
CREATE TABLE `competencies` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`labels` text DEFAULT '{}' NOT NULL,
	`owners` text DEFAULT '[]' NOT NULL,
	`depends_on` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`contribution` text DEFAULT '{}' NOT NULL,
	`title` text NOT NULL,
	`practice_area_id` text NOT NULL,
	`competency_type` text NOT NULL,
	`skills` text DEFAULT '[]' NOT NULL,
	`level_definitions` text DEFAULT '[]' NOT NULL,
	`dependencies` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contribution_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`contrib_id` text NOT NULL,
	`action` text NOT NULL,
	`from_status` text NOT NULL,
	`to_status` text NOT NULL,
	`actor` text,
	`feedback` text,
	`timestamp` text NOT NULL,
	FOREIGN KEY (`contrib_id`) REFERENCES `contribution_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `contribution_items` (
	`id` text PRIMARY KEY NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`supersedes` text,
	`superseded_by` text,
	`submitted_by` text,
	`submitted_at` text,
	`reviewed_by` text,
	`reviewed_at` text,
	`review_feedback` text,
	`item_data` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contribution_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`contrib_id` text NOT NULL,
	`version` integer NOT NULL,
	`item_data` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`contrib_id`) REFERENCES `contribution_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
	`source_capability_id` text,
	`target_capability_ids` text DEFAULT '[]',
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
CREATE TABLE `domain_workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_model_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`context_ids` text DEFAULT '[]',
	`states` text DEFAULT '[]',
	`transitions` text DEFAULT '[]',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`domain_model_id`) REFERENCES `domain_models`(`id`) ON UPDATE no action ON DELETE cascade
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
CREATE TABLE `governance_capabilities` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`road_count` integer DEFAULT 0 NOT NULL,
	`story_count` integer DEFAULT 0 NOT NULL,
	`taxonomy_node` text,
	`capability_id` text,
	`description` text,
	`category` text,
	`parent_capability` text,
	`depends_on` text DEFAULT '[]',
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
	`taxonomy_node` text,
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
--> statement-breakpoint
CREATE TABLE `governance_user_stories` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`story_id` text NOT NULL,
	`title` text NOT NULL,
	`user_type` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`capabilities` text DEFAULT '[]',
	`use_cases` text DEFAULT '[]',
	`acceptance_criteria` text DEFAULT '[]',
	`taxonomy_node` text,
	FOREIGN KEY (`snapshot_id`) REFERENCES `governance_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `governance_user_types` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`user_type_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`archetype` text DEFAULT 'consumer' NOT NULL,
	`description` text,
	`goals` text DEFAULT '[]',
	`pain_points` text DEFAULT '[]',
	`behaviors` text DEFAULT '[]',
	`typical_capabilities` text DEFAULT '[]',
	`technical_profile` text,
	`related_stories` text DEFAULT '[]',
	`related_user_types` text DEFAULT '[]',
	`story_count` integer DEFAULT 0 NOT NULL,
	`capability_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `governance_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `individual_adoptions` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`labels` text DEFAULT '{}' NOT NULL,
	`owners` text DEFAULT '[]' NOT NULL,
	`depends_on` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`contribution` text DEFAULT '{}' NOT NULL,
	`person_name` text NOT NULL,
	`practice_area_id` text NOT NULL,
	`role` text NOT NULL,
	`competency_progress` text DEFAULT '[]' NOT NULL,
	`skill_assessments` text DEFAULT '[]' NOT NULL,
	`notes` text,
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
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
CREATE TABLE `practice_areas` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`labels` text DEFAULT '{}' NOT NULL,
	`owners` text DEFAULT '[]' NOT NULL,
	`depends_on` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`contribution` text DEFAULT '{}' NOT NULL,
	`title` text NOT NULL,
	`canonical` integer DEFAULT false NOT NULL,
	`pillars` text DEFAULT '[]' NOT NULL,
	`competencies` text DEFAULT '[]' NOT NULL,
	`methods` text DEFAULT '[]' NOT NULL,
	`tools` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
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
	`parent_capability` text,
	`tag` text,
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
CREATE TABLE `taxonomy_layer_healths` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`layer_node` text NOT NULL,
	`understandability_score` real NOT NULL,
	`understandability_status` text NOT NULL,
	`understandability_metrics` text NOT NULL,
	`understandability_nfr_ids` text DEFAULT '[]',
	`understandability_adr_ids` text DEFAULT '[]',
	`functionality_score` real NOT NULL,
	`functionality_status` text NOT NULL,
	`functionality_metrics` text NOT NULL,
	`functionality_nfr_ids` text DEFAULT '[]',
	`functionality_adr_ids` text DEFAULT '[]',
	`compliance_score` real NOT NULL,
	`compliance_status` text NOT NULL,
	`compliance_metrics` text NOT NULL,
	`compliance_nfr_ids` text DEFAULT '[]',
	`compliance_adr_ids` text DEFAULT '[]',
	`overall_score` real NOT NULL,
	`overall_status` text NOT NULL,
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
CREATE TABLE `taxonomy_persons` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`email` text,
	`role` text,
	`avatar_url` text,
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
CREATE TABLE `taxonomy_team_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`team_name` text NOT NULL,
	`person_name` text NOT NULL,
	`role` text NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taxonomy_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`team_type` text NOT NULL,
	`description` text,
	`focus_area` text,
	`communication_channels` text DEFAULT '[]',
	`owned_nodes` text DEFAULT '[]',
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
CREATE TABLE `team_adoptions` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`labels` text DEFAULT '{}' NOT NULL,
	`owners` text DEFAULT '[]' NOT NULL,
	`depends_on` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`contribution` text DEFAULT '{}' NOT NULL,
	`team_name` text NOT NULL,
	`practice_area_id` text NOT NULL,
	`adoption_level` text NOT NULL,
	`adopted_at` text NOT NULL,
	`last_assessed_at` text,
	`assessed_by` text,
	`competency_progress` text DEFAULT '[]' NOT NULL,
	`scan_evidence` text DEFAULT '[]' NOT NULL,
	`notes` text,
	FOREIGN KEY (`snapshot_id`) REFERENCES `taxonomy_snapshots`(`id`) ON UPDATE no action ON DELETE cascade
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

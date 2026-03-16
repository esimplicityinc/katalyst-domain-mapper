CREATE TABLE `contribution_items` (
  `id` text PRIMARY KEY NOT NULL,
  `item_type` text NOT NULL,
  `item_id` text NOT NULL,
  `version` integer NOT NULL DEFAULT 1,
  `status` text NOT NULL DEFAULT 'draft',
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

CREATE UNIQUE INDEX `idx_contribution_item_version` ON `contribution_items` (`item_type`, `item_id`, `version`);
CREATE INDEX `idx_contribution_status` ON `contribution_items` (`status`);
CREATE INDEX `idx_contribution_type` ON `contribution_items` (`item_type`);
CREATE INDEX `idx_contribution_item` ON `contribution_items` (`item_type`, `item_id`);
CREATE INDEX `idx_contribution_submitted_by` ON `contribution_items` (`submitted_by`);

CREATE TABLE `contribution_audit_log` (
  `id` text PRIMARY KEY NOT NULL,
  `contrib_id` text NOT NULL REFERENCES `contribution_items`(`id`),
  `action` text NOT NULL,
  `from_status` text NOT NULL,
  `to_status` text NOT NULL,
  `actor` text,
  `feedback` text,
  `timestamp` text NOT NULL
);

CREATE INDEX `idx_audit_contrib` ON `contribution_audit_log` (`contrib_id`);

CREATE TABLE `contribution_versions` (
  `id` text PRIMARY KEY NOT NULL,
  `contrib_id` text NOT NULL REFERENCES `contribution_items`(`id`),
  `version` integer NOT NULL,
  `item_data` text NOT NULL,
  `created_at` text NOT NULL
);

CREATE INDEX `idx_version_contrib` ON `contribution_versions` (`contrib_id`);

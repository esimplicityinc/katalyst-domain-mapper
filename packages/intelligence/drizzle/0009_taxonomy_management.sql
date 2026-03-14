ALTER TABLE governance_capabilities ADD COLUMN capability_id TEXT;--> statement-breakpoint
ALTER TABLE governance_capabilities ADD COLUMN description TEXT;--> statement-breakpoint
ALTER TABLE governance_capabilities ADD COLUMN category TEXT;--> statement-breakpoint
ALTER TABLE governance_capabilities ADD COLUMN parent_capability TEXT;--> statement-breakpoint
ALTER TABLE governance_capabilities ADD COLUMN depends_on TEXT;--> statement-breakpoint
CREATE TABLE governance_user_types (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES governance_snapshots(id) ON DELETE CASCADE,
  user_type_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  archetype TEXT NOT NULL DEFAULT 'consumer',
  description TEXT,
  goals TEXT NOT NULL DEFAULT '[]',
  pain_points TEXT NOT NULL DEFAULT '[]',
  behaviors TEXT NOT NULL DEFAULT '[]',
  typical_capabilities TEXT NOT NULL DEFAULT '[]',
  technical_profile TEXT,
  related_stories TEXT NOT NULL DEFAULT '[]',
  related_user_types TEXT NOT NULL DEFAULT '[]',
  story_count INTEGER NOT NULL DEFAULT 0,
  capability_count INTEGER NOT NULL DEFAULT 0
);--> statement-breakpoint
CREATE TABLE governance_user_stories (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES governance_snapshots(id) ON DELETE CASCADE,
  story_id TEXT NOT NULL,
  title TEXT NOT NULL,
  user_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  capabilities TEXT NOT NULL DEFAULT '[]',
  use_cases TEXT NOT NULL DEFAULT '[]',
  acceptance_criteria TEXT NOT NULL DEFAULT '[]',
  taxonomy_node TEXT
);

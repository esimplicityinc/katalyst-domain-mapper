ALTER TABLE bounded_contexts ADD COLUMN owner_team TEXT;--> statement-breakpoint
CREATE TABLE taxonomy_teams (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  team_type TEXT NOT NULL,
  description TEXT,
  focus_area TEXT,
  communication_channels TEXT NOT NULL DEFAULT '[]',
  owned_nodes TEXT NOT NULL DEFAULT '[]'
);--> statement-breakpoint
CREATE TABLE taxonomy_persons (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  avatar_url TEXT
);--> statement-breakpoint
CREATE TABLE taxonomy_team_memberships (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES taxonomy_snapshots(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  person_name TEXT NOT NULL,
  role TEXT NOT NULL
);

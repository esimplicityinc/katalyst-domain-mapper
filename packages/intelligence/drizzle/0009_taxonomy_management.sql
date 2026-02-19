-- Migration 0009: Taxonomy management — personas, user stories, expanded capabilities
-- Adds dedicated tables for governance personas and user stories (previously only
-- accessible via raw_index JSON blob), and expands governance_capabilities with
-- the full capability schema fields.

-- ── Expand governance_capabilities ──────────────────────────────────────────
ALTER TABLE governance_capabilities ADD COLUMN capability_id TEXT;
ALTER TABLE governance_capabilities ADD COLUMN description TEXT;
ALTER TABLE governance_capabilities ADD COLUMN category TEXT;
ALTER TABLE governance_capabilities ADD COLUMN parent_capability TEXT;
ALTER TABLE governance_capabilities ADD COLUMN depends_on TEXT;

-- ── New table: governance_personas ──────────────────────────────────────────
CREATE TABLE governance_personas (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES governance_snapshots(id) ON DELETE CASCADE,
  persona_id TEXT NOT NULL,
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
  related_personas TEXT NOT NULL DEFAULT '[]',
  story_count INTEGER NOT NULL DEFAULT 0,
  capability_count INTEGER NOT NULL DEFAULT 0
);

-- ── New table: governance_user_stories ──────────────────────────────────────
CREATE TABLE governance_user_stories (
  id TEXT PRIMARY KEY,
  snapshot_id TEXT NOT NULL REFERENCES governance_snapshots(id) ON DELETE CASCADE,
  story_id TEXT NOT NULL,
  title TEXT NOT NULL,
  persona TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  capabilities TEXT NOT NULL DEFAULT '[]',
  use_cases TEXT NOT NULL DEFAULT '[]',
  acceptance_criteria TEXT NOT NULL DEFAULT '[]',
  taxonomy_node TEXT
);

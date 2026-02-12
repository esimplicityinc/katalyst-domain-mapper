# Plan: Add Taxonomy as Master Entity to Domain Mapper API

> Introduce the full katalyst-taxonomy as a first-class, versioned entity in the domain-mapper intelligence API, following the existing **snapshot ingestion pattern** used by governance. Taxonomy snapshots become the master reference that governance artifacts (ROAD items, capabilities, user stories) can be scoped to.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Taxonomy scope | Full hierarchy + all plugins | System/Subsystem/Stack/Layer nodes plus LayerTypes, Capabilities, Actions, CICD stages, Tools |
| Integration pattern | Snapshot ingestion | Matches existing governance snapshot pattern. POST full taxonomy state, store as versioned snapshot with denormalized tables |
| Cross-referencing | FK to taxonomy node name | Add optional `taxonomy_node` column to governance tables referencing the taxonomy node name/FQTN. Lightweight, backwards-compatible |

---

## Phase 1: Zod Schemas (`packages/foe-schemas`) ✅

**New file:** `src/taxonomy/taxonomy-snapshot.ts`

Define schemas for the ingested taxonomy state:

| Schema | Fields |
|--------|--------|
| `TaxonomySnapshotSchema` | `id (UUID)`, `project`, `version`, `generated`, `rawSnapshot (JSON)`, `nodeCount`, `environmentCount`, `pluginSummary` |
| `TaxonomyNodeSchema` | `name (PK kebab)`, `nodeType (system\|subsystem\|stack\|layer\|user\|org_unit)`, `description?`, `owners[]`, `parentNode?`, `dependsOnNodes[]`, `environments[]`, `labels{}`, `fqtn (qualified name)` |
| `TaxonomyEnvironmentSchema` | `name (PK)`, `description?`, `parentEnvironment?`, `promotionTargets[]`, `templateReplacements{}` |
| `TaxonomyLayerTypeSchema` | `name (PK)`, `description?`, `defaultLayerDir` |
| `TaxonomyCapabilitySchema` | `name (PK)`, `description`, `categories[]`, `dependsOnCapabilities[]` |
| `TaxonomyCapRelSchema` | `name (PK)`, `node (FK)`, `relationshipType`, `capabilities[]` |
| `TaxonomyActionSchema` | `name (PK)`, `actionType`, `layerType?`, `tags[]` |
| `TaxonomyStageSchema` | `name (PK)`, `description?`, `dependsOn[]` |
| `TaxonomyToolSchema` | `name (PK)`, `description`, `actions[]` |

**New file:** `src/taxonomy/index.ts` — Barrel export.

**Edit:** `src/governance/common.ts` — Add `TaxonomyNodeNamePattern` (kebab-case regex: `/^[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$/`).

**Edit:** `src/governance/road-item.ts` — Add optional `taxonomyNode?: string` field to `RoadItemSchema`.

**Edit:** `src/governance/capability.ts` — Add optional `taxonomyNode?: string` field.

**Edit:** `src/governance/user-story.ts` — Add optional `taxonomyNode?: string` field.

---

## Phase 2: Database Tables (`packages/intelligence/api/db/schema.ts`) ✅

Add 9 new tables following the existing governance snapshot pattern:

```
taxonomy_snapshots              -- Root: versioned point-in-time capture
  taxonomy_nodes                -- Denormalized: one row per node
  taxonomy_environments         -- Denormalized: one row per environment
  taxonomy_layer_types          -- Plugin: layer type definitions
  taxonomy_capabilities         -- Plugin: capability definitions
  taxonomy_capability_rels      -- Plugin: capability-to-node relationships
  taxonomy_actions              -- Plugin: layer actions
  taxonomy_stages               -- Plugin: CICD stages
  taxonomy_tools                -- Plugin: tool definitions
```

### Table: `taxonomy_snapshots`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text PK` | UUID |
| `project` | `text NOT NULL` | Project/taxonomy name |
| `version` | `text NOT NULL` | Taxonomy version |
| `generated` | `text NOT NULL` | ISO timestamp |
| `raw_snapshot` | `text JSON NOT NULL` | Full taxonomy payload |
| `node_count` | `integer NOT NULL` | |
| `environment_count` | `integer NOT NULL` | |
| `created_at` | `text NOT NULL` | |

### Table: `taxonomy_nodes`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text PK` | Composite: `snapshotId:name` |
| `snapshot_id` | `text FK NOT NULL` | CASCADE delete |
| `name` | `text NOT NULL` | Kebab-case node name |
| `node_type` | `text NOT NULL` | system/subsystem/stack/layer/user/org_unit |
| `fqtn` | `text NOT NULL` | Fully qualified taxonomy name |
| `description` | `text` | Nullable |
| `parent_node` | `text` | Nullable — name of parent |
| `owners` | `text JSON` | JSON array of strings |
| `environments` | `text JSON` | JSON array of strings |
| `labels` | `text JSON` | JSON key-value map |
| `depends_on` | `text JSON` | JSON array of node names |

### Table: `taxonomy_environments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text PK` | Composite: `snapshotId:name` |
| `snapshot_id` | `text FK NOT NULL` | CASCADE delete |
| `name` | `text NOT NULL` | |
| `description` | `text` | |
| `parent_environment` | `text` | |
| `promotion_targets` | `text JSON` | JSON array |
| `template_replacements` | `text JSON` | JSON key-value |

### Table: `taxonomy_layer_types`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text PK` | Composite: `snapshotId:name` |
| `snapshot_id` | `text FK NOT NULL` | CASCADE delete |
| `name` | `text NOT NULL` | |
| `description` | `text` | |
| `default_layer_dir` | `text` | |

### Table: `taxonomy_capabilities`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text PK` | Composite: `snapshotId:name` |
| `snapshot_id` | `text FK NOT NULL` | CASCADE delete |
| `name` | `text NOT NULL` | |
| `description` | `text NOT NULL` | |
| `categories` | `text JSON` | JSON array |
| `depends_on` | `text JSON` | JSON array of capability names |

### Table: `taxonomy_capability_rels`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text PK` | Composite: `snapshotId:name` |
| `snapshot_id` | `text FK NOT NULL` | CASCADE delete |
| `name` | `text NOT NULL` | |
| `node` | `text NOT NULL` | FK to taxonomy node name |
| `relationship_type` | `text NOT NULL` | supports/depends-on/implements/enables |
| `capabilities` | `text JSON` | JSON array of capability names |

### Table: `taxonomy_actions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text PK` | Composite: `snapshotId:name` |
| `snapshot_id` | `text FK NOT NULL` | CASCADE delete |
| `name` | `text NOT NULL` | |
| `action_type` | `text NOT NULL` | shell/http/workflow |
| `layer_type` | `text` | Nullable — FK to layer type name |
| `tags` | `text JSON` | JSON array |

### Table: `taxonomy_stages`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text PK` | Composite: `snapshotId:name` |
| `snapshot_id` | `text FK NOT NULL` | CASCADE delete |
| `name` | `text NOT NULL` | |
| `description` | `text` | |
| `depends_on` | `text JSON` | JSON array of stage names |

### Table: `taxonomy_tools`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text PK` | Composite: `snapshotId:name` |
| `snapshot_id` | `text FK NOT NULL` | CASCADE delete |
| `name` | `text NOT NULL` | |
| `description` | `text NOT NULL` | |
| `actions` | `text JSON` | JSON array of action refs |

### Edits to existing tables

Add optional `taxonomy_node` column (`text`, nullable) to:

- `governance_road_items`
- `governance_capabilities`

---

## Phase 3: Repository Port (`packages/intelligence/api/ports/`) ✅

**New file:** `TaxonomyRepository.ts`

```typescript
interface StoredTaxonomySnapshot {
  id: string;
  project: string;
  version: string;
  generated: string;
  nodeCount: number;
  environmentCount: number;
  createdAt: string;
}

interface TaxonomyNodeSummary {
  name: string;
  nodeType: string;
  fqtn: string;
  description: string | null;
  parentNode: string | null;
}

interface TaxonomyEnvironmentSummary {
  name: string;
  description: string | null;
  parentEnvironment: string | null;
}

interface TaxonomyHierarchyNode {
  name: string;
  nodeType: string;
  fqtn: string;
  children: TaxonomyHierarchyNode[];
}

interface TaxonomyHierarchy {
  systems: TaxonomyHierarchyNode[];
}

interface TaxonomyPluginSummary {
  layerTypes: number;
  capabilities: number;
  actions: number;
  stages: number;
  tools: number;
}

interface TaxonomyRepository {
  saveSnapshot(data: ValidatedTaxonomyData): Promise<StoredTaxonomySnapshot>;
  getLatestSnapshot(): Promise<StoredTaxonomySnapshot | null>;
  getSnapshotById(id: string): Promise<StoredTaxonomySnapshot | null>;
  listSnapshots(limit?: number): Promise<StoredTaxonomySnapshot[]>;
  deleteSnapshot(id: string): Promise<boolean>;
  getNodes(nodeType?: string): Promise<TaxonomyNodeSummary[]>;
  getHierarchy(): Promise<TaxonomyHierarchy>;
  getEnvironments(): Promise<TaxonomyEnvironmentSummary[]>;
  getPluginSummary(): Promise<TaxonomyPluginSummary>;
  getCapabilitiesByNode(nodeName: string): Promise<string[]>;
}
```

---

## Phase 4: SQLite Adapter (`packages/intelligence/api/adapters/sqlite/`) ✅

**New file:** `TaxonomyRepositorySQLite.ts`

Follows the same decomposition pattern as `GovernanceRepositorySQLite`:

- `saveSnapshot()` — Stores raw JSON in `taxonomy_snapshots`, denormalizes into 8 child tables within a transaction
- `getLatestSnapshot()` — Reads most recent by `created_at DESC`
- `getNodes()` — Queries `taxonomy_nodes` with optional `node_type` filter
- `getHierarchy()` — Queries all nodes from latest snapshot, builds tree by `parent_node` relationships
- `getEnvironments()` — Queries `taxonomy_environments` from latest snapshot
- `getPluginSummary()` — COUNT queries across plugin tables for latest snapshot
- `getCapabilitiesByNode()` — Joins `taxonomy_capability_rels` with `taxonomy_capabilities`
- `deleteSnapshot()` — Cascade deletes all child rows

---

## Phase 5: Domain Validation (`packages/intelligence/api/domain/taxonomy/`) ✅

**New file:** `validateTaxonomyData.ts`

Validates the incoming payload shape (matches the response from `GET /taxonomy` on the taxonomy server):

- Must have `documents[]` and `environments[]` arrays
- Each document must have `apiVersion`, `kind`, `metadata.name`, `taxonomyNodeType`
- Validates node type hierarchy (subsystem parent must be system, etc.)
- Validates environment references exist
- Extracts plugin data from the payload (capabilities, layer types, actions, stages, tools)
- Returns `ValidatedTaxonomyData` with denormalized node, environment, and plugin arrays

---

## Phase 6: Use Cases (`packages/intelligence/api/usecases/taxonomy/`) ✅

**New file:** `IngestTaxonomySnapshot.ts`

- Accepts raw taxonomy payload (from the taxonomy server's `GET /taxonomy` response or a CLI export)
- Calls `validateTaxonomyData()`
- Calls `taxonomyRepo.saveSnapshot()`
- Returns the stored snapshot summary

**New file:** `QueryTaxonomyState.ts`

- `getLatest()` — Latest snapshot summary
- `getById(id)` — Snapshot by ID
- `listSnapshots(limit?)` — All snapshots
- `getNodes(typeFilter?)` — Nodes from latest snapshot
- `getHierarchy()` — Tree-structured response
- `getEnvironments()` — Environments from latest snapshot
- `getPluginSummary()` — Plugin counts
- `getCapabilitiesForNode(name)` — Capabilities mapped to a node

---

## Phase 7: API Routes (`packages/intelligence/api/http/routes/`) ✅

**New file:** `taxonomy.ts`

| Method | Path | Use Case | Description |
|--------|------|----------|-------------|
| `POST` | `/api/v1/taxonomy` | IngestTaxonomySnapshot | Ingest a full taxonomy snapshot |
| `GET` | `/api/v1/taxonomy/latest` | QueryTaxonomyState.getLatest | Latest snapshot summary |
| `GET` | `/api/v1/taxonomy/snapshots` | QueryTaxonomyState.listSnapshots | List all snapshots |
| `GET` | `/api/v1/taxonomy/snapshot/:id` | QueryTaxonomyState.getById | Snapshot by ID |
| `GET` | `/api/v1/taxonomy/nodes` | QueryTaxonomyState.getNodes | All nodes, `?type=` filter |
| `GET` | `/api/v1/taxonomy/hierarchy` | QueryTaxonomyState.getHierarchy | Tree-structured response |
| `GET` | `/api/v1/taxonomy/environments` | QueryTaxonomyState.getEnvironments | All environments |
| `GET` | `/api/v1/taxonomy/plugins` | QueryTaxonomyState.getPluginSummary | Plugin counts |
| `GET` | `/api/v1/taxonomy/nodes/:name/capabilities` | QueryTaxonomyState.getCapabilitiesForNode | Capabilities for a node |
| `DELETE` | `/api/v1/taxonomy` | — | Delete all snapshots |
| `DELETE` | `/api/v1/taxonomy/:id` | — | Delete specific snapshot |

**Edit:** `server.ts` — Register taxonomy router.

---

## Phase 8: DI Container (`packages/intelligence/api/bootstrap/container.ts`) ✅

**Edit:** Add `TaxonomyRepositorySQLite` instantiation and wire `IngestTaxonomySnapshot` + `QueryTaxonomyState` use cases into the container.

---

## Phase 9: Schema.md Update ✅

**Edit:** `schema.md` — Add the new taxonomy DB tables to the ER diagram. Show the `taxonomy_node` FK from `governance_road_items` and `governance_capabilities` to `taxonomy_nodes`.

---

## File Summary

| Action | File | Package |
|--------|------|---------|
| **Create** | `src/taxonomy/taxonomy-snapshot.ts` | foe-schemas |
| **Create** | `src/taxonomy/index.ts` | foe-schemas |
| **Edit** | `src/governance/common.ts` | foe-schemas |
| **Edit** | `src/governance/road-item.ts` | foe-schemas |
| **Edit** | `src/governance/capability.ts` | foe-schemas |
| **Edit** | `src/governance/user-story.ts` | foe-schemas |
| **Edit** | `api/db/schema.ts` | intelligence |
| **Create** | `api/ports/TaxonomyRepository.ts` | intelligence |
| **Create** | `api/adapters/sqlite/TaxonomyRepositorySQLite.ts` | intelligence |
| **Create** | `api/domain/taxonomy/validateTaxonomyData.ts` | intelligence |
| **Create** | `api/usecases/taxonomy/IngestTaxonomySnapshot.ts` | intelligence |
| **Create** | `api/usecases/taxonomy/QueryTaxonomyState.ts` | intelligence |
| **Create** | `api/http/routes/taxonomy.ts` | intelligence |
| **Edit** | `api/http/server.ts` | intelligence |
| **Edit** | `api/bootstrap/container.ts` | intelligence |
| **Edit** | `schema.md` | root |

**Total:** 9 new files, 7 edits to existing files.

---

## Key Design Decisions

### 1. Snapshot pattern

Matches the existing governance approach. Taxonomy state is immutable per snapshot. The `raw_snapshot` JSON column preserves the full payload for future expansion without schema migrations.

### 2. Composite IDs

`snapshotId:name` pattern matches `governance_capabilities` and `governance_road_items`. Allows multiple snapshots to coexist without conflicts.

### 3. FQTN as stored field

The fully-qualified taxonomy name (e.g., `prima.web.garden.iac`) is stored alongside the simple `name`, enabling both flat lookups and hierarchy queries.

### 4. Optional `taxonomy_node` FK

Adding nullable columns to existing governance tables is backwards-compatible. Existing data remains valid. The FK is a soft reference (text column) rather than a hard DB foreign key, since taxonomy snapshots are versioned independently from governance snapshots.

### 5. Plugin denormalization

Each plugin type gets its own table rather than a single polymorphic table. This enables typed queries (e.g., "show all layer types") without JSON parsing, matching how governance denormalizes capabilities/road items/contexts separately.

---

## Implementation Order

1. ~~Phase 1 (Zod schemas) — foundation, no runtime dependencies~~ ✅
2. ~~Phase 2 (DB tables) — schema only, no migrations needed (SQLite auto-creates)~~ ✅
3. ~~Phase 3 (Port interface) — contract definition~~ ✅
4. ~~Phase 4 (SQLite adapter) — implements the port~~ ✅
5. ~~Phase 5 (Domain validation) — input validation logic~~ ✅
6. ~~Phase 6 (Use cases) — orchestration layer~~ ✅
7. ~~Phase 7 (API routes) — HTTP endpoints~~ ✅
8. ~~Phase 8 (DI container) — wire everything together~~ ✅
9. ~~Phase 9 (Schema.md) — documentation update~~ ✅

**Status: All 9 phases complete.** Migration `0004_vengeful_morgan_stark.sql` generated and applied. Build and typecheck passing.

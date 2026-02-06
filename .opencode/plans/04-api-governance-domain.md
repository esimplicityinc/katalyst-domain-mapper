# Phase 4: API Governance Domain

**Package:** `packages/foe-api/src/`
**Depends on:** Phase 1 + 2 (schemas)
**Can run in parallel with:** Phase 5 (scanner), Phase 6 (prima)

## Objective

Add a governance domain to the existing `@foe/api` Elysia server following the same hexagonal architecture pattern established by the report and scan domains. This enables programmatic access to governance data — ingesting governance indices, querying cross-references, and tracking governance health over time.

## Architecture Pattern Reference

The existing API uses this pattern (established in `src/ports/ReportRepository.ts`, `src/adapters/sqlite/ReportRepositorySQLite.ts`, `src/usecases/report/IngestReport.ts`, `src/http/routes/v1/reports.ts`):

```
Port (interface) → Adapter (SQLite impl) → Use Case (orchestration) → Route (HTTP handler)
```

All dependencies are injected via the container in `src/bootstrap/container.ts`. Routes are composed in `src/http/server.ts`.

## Files to Create

### Port: `packages/foe-api/src/ports/GovernanceRepository.ts`

```typescript
import type { GovernanceIndex } from '@foe/schemas/governance';

export interface GovernanceSummary {
  id: string;                          // UUID of the snapshot
  projectName: string;
  totalCapabilities: number;
  totalPersonas: number;
  totalRoadItems: number;
  totalContexts: number;
  roadsByStatus: Record<string, number>;
  referentialIntegrityValid: boolean;
  integrityErrorCount: number;
  createdAt: string;
}

export interface CapabilityCoverage {
  capabilityId: string;
  title: string;
  category: string;
  personaCount: number;
  storyCount: number;
  roadCount: number;
  testCoverage: number;              // percentage 0-100
}

export interface GovernanceRepository {
  /** Store a governance index snapshot */
  save(projectName: string, index: GovernanceIndex): Promise<string>;

  /** Get the latest governance snapshot for a project */
  getLatest(projectName: string): Promise<GovernanceIndex | null>;

  /** Get a specific snapshot by ID */
  getById(id: string): Promise<GovernanceIndex | null>;

  /** List all snapshots for a project (for trend tracking) */
  listSnapshots(projectName: string, limit?: number): Promise<GovernanceSummary[]>;

  /** Delete a snapshot */
  delete(id: string): Promise<boolean>;

  /** Get capability coverage analysis */
  getCapabilityCoverage(snapshotId: string): Promise<CapabilityCoverage[]>;
}
```

### Adapter: `packages/foe-api/src/adapters/sqlite/GovernanceRepositorySQLite.ts`

Implements `GovernanceRepository` against the SQLite tables defined below. Key approach:
- Store the full `GovernanceIndex` JSON as a blob in `governance_snapshots.raw_index`
- Denormalize key fields into separate tables for querying
- Use the governance schemas to validate on read

### Use Cases

#### `packages/foe-api/src/usecases/governance/IngestGovernanceIndex.ts`

```typescript
export class IngestGovernanceIndex {
  constructor(
    private repo: GovernanceRepository,
    private logger: Logger,
  ) {}

  async execute(projectName: string, rawIndex: unknown): Promise<{ id: string }> {
    // 1. Validate against GovernanceIndexSchema
    const index = GovernanceIndexSchema.parse(rawIndex);

    // 2. Store snapshot
    const id = await this.repo.save(projectName, index);

    this.logger.info('Governance index ingested', {
      id, projectName,
      capabilities: index.stats.totalCapabilities,
      roads: index.stats.totalRoadItems,
      contexts: index.stats.totalContexts,
    });

    return { id };
  }
}
```

#### `packages/foe-api/src/usecases/governance/GetGovernanceStatus.ts`

```typescript
export class GetGovernanceStatus {
  constructor(private repo: GovernanceRepository) {}

  async execute(projectName: string): Promise<GovernanceIndex | null> {
    return this.repo.getLatest(projectName);
  }
}
```

#### `packages/foe-api/src/usecases/governance/GetCoverageReport.ts`

```typescript
export class GetCoverageReport {
  constructor(private repo: GovernanceRepository) {}

  async execute(snapshotId: string): Promise<{
    capabilities: CapabilityCoverage[];
    overallCoverage: number;
    gaps: string[];
  }> {
    const coverage = await this.repo.getCapabilityCoverage(snapshotId);

    const overallCoverage = coverage.length > 0
      ? coverage.reduce((sum, c) => sum + c.testCoverage, 0) / coverage.length
      : 0;

    const gaps = coverage
      .filter(c => c.testCoverage < 50)
      .map(c => `${c.capabilityId}: ${c.title} (${c.testCoverage}% coverage)`);

    return { capabilities: coverage, overallCoverage, gaps };
  }
}
```

### Domain Types: `packages/foe-api/src/domain/governance/GovernanceErrors.ts`

```typescript
export class GovernanceNotFoundError extends Error {
  constructor(id: string) {
    super(`Governance snapshot not found: ${id}`);
    this.name = 'GovernanceNotFoundError';
  }
}

export class GovernanceValidationError extends Error {
  constructor(message: string) {
    super(`Governance validation failed: ${message}`);
    this.name = 'GovernanceValidationError';
  }
}
```

### Routes: `packages/foe-api/src/http/routes/v1/governance.ts`

```typescript
import Elysia, { t } from 'elysia';

export function createGovernanceRoutes(deps: {
  ingestGovernanceIndex: IngestGovernanceIndex;
  getGovernanceStatus: GetGovernanceStatus;
  getCoverageReport: GetCoverageReport;
  governanceRepo: GovernanceRepository;
}) {
  return new Elysia({ prefix: '/governance' })

    // POST /governance — Ingest a governance index
    .post('/', async ({ body, query }) => {
      const projectName = query.project || 'default';
      const result = await deps.ingestGovernanceIndex.execute(projectName, body);
      return { id: result.id, message: 'Governance index ingested successfully' };
    }, {
      query: t.Object({ project: t.Optional(t.String()) }),
      detail: { summary: 'Ingest a governance index', tags: ['Governance'] },
    })

    // GET /governance — Get latest governance status
    .get('/', async ({ query }) => {
      const projectName = query.project || 'default';
      return deps.getGovernanceStatus.execute(projectName);
    }, {
      query: t.Object({ project: t.Optional(t.String()) }),
      detail: { summary: 'Get latest governance status', tags: ['Governance'] },
    })

    // GET /governance/snapshots — List governance snapshots (trend)
    .get('/snapshots', async ({ query }) => {
      const projectName = query.project || 'default';
      const limit = query.limit ? Number(query.limit) : 20;
      return deps.governanceRepo.listSnapshots(projectName, limit);
    }, {
      query: t.Object({
        project: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      detail: { summary: 'List governance snapshots for trend tracking', tags: ['Governance'] },
    })

    // GET /governance/:id — Get specific snapshot
    .get('/:id', async ({ params }) => {
      return deps.governanceRepo.getById(params.id);
    }, {
      params: t.Object({ id: t.String() }),
      detail: { summary: 'Get a governance snapshot by ID', tags: ['Governance'] },
    })

    // GET /governance/:id/coverage — Get capability coverage report
    .get('/:id/coverage', async ({ params }) => {
      return deps.getCoverageReport.execute(params.id);
    }, {
      params: t.Object({ id: t.String() }),
      detail: { summary: 'Get capability coverage for a snapshot', tags: ['Governance'] },
    })

    // GET /governance/capabilities — Capabilities from latest snapshot
    .get('/capabilities', async ({ query }) => {
      const projectName = query.project || 'default';
      const index = await deps.getGovernanceStatus.execute(projectName);
      return index ? Object.values(index.capabilities) : [];
    }, {
      query: t.Object({ project: t.Optional(t.String()) }),
      detail: { summary: 'List capabilities from latest snapshot', tags: ['Governance'] },
    })

    // GET /governance/roads — Road items from latest snapshot
    .get('/roads', async ({ query }) => {
      const projectName = query.project || 'default';
      const index = await deps.getGovernanceStatus.execute(projectName);
      return index ? Object.values(index.roadItems) : [];
    }, {
      query: t.Object({ project: t.Optional(t.String()) }),
      detail: { summary: 'List road items from latest snapshot', tags: ['Governance'] },
    })

    // GET /governance/contexts — Bounded contexts from latest snapshot
    .get('/contexts', async ({ query }) => {
      const projectName = query.project || 'default';
      const index = await deps.getGovernanceStatus.execute(projectName);
      return index ? Object.values(index.boundedContexts) : [];
    }, {
      query: t.Object({ project: t.Optional(t.String()) }),
      detail: { summary: 'List bounded contexts from latest snapshot', tags: ['Governance'] },
    })

    // DELETE /governance/:id — Delete a snapshot
    .delete('/:id', async ({ params, set }) => {
      const deleted = await deps.governanceRepo.delete(params.id);
      if (!deleted) { set.status = 404; return { error: 'Snapshot not found' }; }
      return { message: 'Snapshot deleted' };
    }, {
      params: t.Object({ id: t.String() }),
      detail: { summary: 'Delete a governance snapshot', tags: ['Governance'] },
    });
}
```

## Files to Modify

### `packages/foe-api/src/db/schema.ts`

Add governance tables following the same Drizzle pattern:

```typescript
// ── Governance Snapshots ────────────────────────────────────────────────────

export const governanceSnapshots = sqliteTable('governance_snapshots', {
  id: text('id').primaryKey(),                   // UUID
  projectName: text('project_name').notNull(),
  rawIndex: text('raw_index', { mode: 'json' })
    .$type<Record<string, unknown>>().notNull(), // Full GovernanceIndex JSON
  totalCapabilities: integer('total_capabilities').notNull(),
  totalPersonas: integer('total_personas').notNull(),
  totalRoadItems: integer('total_road_items').notNull(),
  totalContexts: integer('total_contexts').notNull(),
  totalAggregates: integer('total_aggregates').notNull(),
  referentialIntegrityValid: integer('referential_integrity_valid', { mode: 'boolean' }).notNull(),
  integrityErrorCount: integer('integrity_error_count').notNull().default(0),
  roadsByStatus: text('roads_by_status', { mode: 'json' })
    .$type<Record<string, number>>().default({}),
  createdAt: text('created_at').notNull(),        // ISO 8601
});

// ── Governance Capabilities (denormalized for querying) ────────────────────

export const governanceCapabilities = sqliteTable('governance_capabilities', {
  id: text('id').primaryKey(),                    // CAP-XXX
  snapshotId: text('snapshot_id').notNull()
    .references(() => governanceSnapshots.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  status: text('status').notNull(),
  personaCount: integer('persona_count').notNull().default(0),
  storyCount: integer('story_count').notNull().default(0),
  roadCount: integer('road_count').notNull().default(0),
});

// ── Governance Road Items (denormalized) ────────────────────────────────────

export const governanceRoadItems = sqliteTable('governance_road_items', {
  id: text('id').primaryKey(),                    // composite: snapshotId + ROAD-XXX
  snapshotId: text('snapshot_id').notNull()
    .references(() => governanceSnapshots.id, { onDelete: 'cascade' }),
  roadId: text('road_id').notNull(),              // ROAD-XXX
  title: text('title').notNull(),
  status: text('status').notNull(),
  phase: integer('phase').notNull(),
  priority: text('priority').notNull(),
  capabilityCount: integer('capability_count').notNull().default(0),
});

// ── DDD Bounded Contexts (denormalized) ─────────────────────────────────────

export const governanceContexts = sqliteTable('governance_contexts', {
  id: text('id').primaryKey(),                    // composite: snapshotId + slug
  snapshotId: text('snapshot_id').notNull()
    .references(() => governanceSnapshots.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  aggregateCount: integer('aggregate_count').notNull().default(0),
  eventCount: integer('event_count').notNull().default(0),
  valueObjectCount: integer('value_object_count').notNull().default(0),
});
```

### `packages/foe-api/src/bootstrap/container.ts`

Add governance dependency wiring (same pattern as report/scan):

```typescript
// Governance domain
const governanceRepo = new GovernanceRepositorySQLite(db);
const ingestGovernanceIndex = new IngestGovernanceIndex(governanceRepo, logger);
const getGovernanceStatus = new GetGovernanceStatus(governanceRepo);
const getCoverageReport = new GetCoverageReport(governanceRepo);
```

### `packages/foe-api/src/http/server.ts`

Mount the governance routes:

```typescript
import { createGovernanceRoutes } from './routes/v1/governance.js';

// In the server setup:
.use(createGovernanceRoutes({
  ingestGovernanceIndex: container.ingestGovernanceIndex,
  getGovernanceStatus: container.getGovernanceStatus,
  getCoverageReport: container.getCoverageReport,
  governanceRepo: container.governanceRepo,
}))
```

## API Endpoint Summary

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/governance?project=name` | Ingest governance index JSON |
| GET | `/api/v1/governance?project=name` | Get latest governance status |
| GET | `/api/v1/governance/snapshots?project=name` | List snapshots for trend |
| GET | `/api/v1/governance/:id` | Get specific snapshot |
| GET | `/api/v1/governance/:id/coverage` | Capability coverage report |
| GET | `/api/v1/governance/capabilities?project=name` | List capabilities |
| GET | `/api/v1/governance/roads?project=name` | List road items |
| GET | `/api/v1/governance/contexts?project=name` | List bounded contexts |
| DELETE | `/api/v1/governance/:id` | Delete a snapshot |

## Database Migration

After modifying `schema.ts`, generate and run migration:

```bash
cd packages/foe-api
bun run db:generate
bun run db:migrate
```

## Testing

- `src/adapters/sqlite/__tests__/GovernanceRepositorySQLite.test.ts` — CRUD operations
- `src/usecases/governance/__tests__/IngestGovernanceIndex.test.ts` — validation, error cases
- `src/http/routes/v1/__tests__/governance.test.ts` — HTTP integration tests

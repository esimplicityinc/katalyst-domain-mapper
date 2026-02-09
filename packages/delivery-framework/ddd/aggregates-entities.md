---
title: Aggregates & Entities
---

# Aggregates & Entities

This document catalogues every aggregate root in the Katalyst Domain Mapper system. Because the project *is* a domain-modeling tool, this documentation is self-referential — the domain model describes itself.

> **Convention**: Each aggregate is the transactional consistency boundary. All state changes flow through the root. Entities inside an aggregate have local identity; value objects have none.

---

## 1. FOEReport (Reporting Context)

The canonical output of a repository scan. Represents the complete FOE assessment for a single repository at a point in time.

| Property | Type |
|----------|------|
| **Root** | `FOEReport` |
| **Entities** | `DimensionAssessment` (×3: Feedback, Understanding, Confidence), each containing 4 `SubScore` entities |
| **Value Objects** | `ReportId` (UUID), `DimensionScore` (0–100), `MaturityLevel` (enum), `TriangleDiagnosis`, `OverallScore`, `Finding`, `Strength`, `Recommendation`, `MethodReference` |
| **Invariants** | See below |

### Invariants

1. **Overall score range**: `overallScore` must be 0–100 (`z.number().min(0).max(100)`)
2. **Dimension weights sum to 1.0**: Feedback 0.35 + Understanding 0.35 + Confidence 0.30 = 1.0 (enforced by scanner scoring formula)
3. **Exactly 3 dimensions**: The `dimensions` object must contain `feedback`, `understanding`, and `confidence` — no more, no less
4. **4 subscores per dimension**: Each `DimensionScoreSchema` requires exactly 4 subscores (`z.array(SubScoreSchema).length(4)`), each scored 0–25
5. **Triangle diagnosis requires all 3 scores**: `TriangleDiagnosisSchema` references all three principles via `weakestPrinciple: z.enum(['feedback', 'understanding', 'confidence'])`
6. **Minimum strengths and gaps**: Report should include at least 3 top strengths and 3 top gaps for actionable output

### Repository Port

```typescript
// packages/foe-api/src/ports/ReportRepository.ts
export interface ReportRepository {
  save(report: FOEReport, rawReport: unknown): Promise<string>;
  getById(id: string): Promise<FOEReport | null>;
  getRawById(id: string): Promise<unknown | null>;
  list(filter?: ReportListFilter): Promise<StoredReport[]>;
  delete(id: string): Promise<boolean>;
  ensureRepository(name: string, url?: string, techStack?: string[], isMonorepo?: boolean): Promise<string>;
  listRepositories(): Promise<RepositorySummary[]>;
  getRepository(id: string): Promise<RepositorySummary | null>;
  getScoreTrend(repositoryId: string): Promise<ScoreTrendPoint[]>;
}
```

### Simplified Code (from Zod schemas)

```typescript
// packages/foe-schemas/src/scan/report.ts
export const FOEReportSchema = z.object({
  id: z.string().uuid(),                        // ReportId
  repository: z.string(),
  repositoryUrl: z.string().url().optional(),
  scanDate: z.string().datetime(),
  scanDuration: z.number().int().nonnegative(),
  scannerVersion: z.string(),
  overallScore: z.number().min(0).max(100),      // OverallScore VO
  maturityLevel: MaturityLevelSchema,             // MaturityLevel VO
  assessmentMode: AssessmentModeSchema,
  executiveSummary: z.string(),
  dimensions: z.object({
    feedback: DimensionScoreSchema,               // DimensionAssessment entity
    understanding: DimensionScoreSchema,
    confidence: DimensionScoreSchema,
  }),
  criticalFailures: z.array(FindingSchema),
  strengths: z.array(StrengthSchema),
  gaps: z.array(FindingSchema),
  recommendations: z.array(RecommendationSchema),
  triangleDiagnosis: TriangleDiagnosisSchema,     // TriangleDiagnosis VO
  methodology: MethodologySchema,
  referencedMethods: z.array(ReferencedMethodSummarySchema).default([]),
});
```

### Persistence (Drizzle tables)

The `FOEReport` aggregate is decomposed into normalized tables for storage:

- `scans` — report metadata, overall score, raw JSON blob
- `dimensions` — 3 rows per scan (Feedback, Understanding, Confidence)
- `subscores` — 4 rows per dimension (12 per scan)
- `findings` — gap and critical failure rows
- `strengths` — strength rows
- `recommendations` — recommendation rows
- `triangleDiagnoses` — 1 row per scan
- `methodologies` — 1 row per scan

See `packages/foe-api/src/db/schema.ts` and `packages/foe-api/src/adapters/sqlite/ReportRepositorySQLite.ts`.

---

## 2. DomainModel (Reporting Context)

The meta-aggregate — it models the DDD artifacts for any project, including this one. Managed via the API and visualized in the web UI.

| Property | Type |
|----------|------|
| **Root** | `DomainModel` |
| **Entities** | `BoundedContext`, `Aggregate`, `ValueObject`, `DomainEvent`, `GlossaryTerm` |
| **Value Objects** | `DomainModelId` (UUID), `ContextId` (UUID), `AggregateId` (UUID), `Slug` (`/^[a-z0-9-]+$/`) |
| **Invariants** | See below |

### Invariants

1. **Context names unique within model**: No two `BoundedContext` entities may share the same `slug` under one `DomainModel`
2. **Aggregate references valid context**: `Aggregate.contextId` must reference an existing `BoundedContext.id` in the same model
3. **Event references valid context**: `DomainEvent.contextId` must reference an existing `BoundedContext.id`
4. **Glossary term slug unique within context**: No duplicate `term` values within the same `contextId`
5. **Slug format enforced**: All slugs match `z.string().regex(/^[a-z0-9-]+$/)` per ADR-012 conventions
6. **Cascade delete**: Deleting a `DomainModel` cascades to all child entities (enforced at DB level via `onDelete: "cascade"`)

### Repository Port

Full CRUD for the root and nested entity CRUD, all via the REST API:

```
POST   /api/v1/domain-models                        — Create model
GET    /api/v1/domain-models                        — List models
GET    /api/v1/domain-models/:id                    — Get model with all artifacts
DELETE /api/v1/domain-models/:id                    — Delete model (cascades)
POST   /api/v1/domain-models/:id/contexts           — Add bounded context
PUT    /api/v1/domain-models/:id/contexts/:ctxId    — Update bounded context
DELETE /api/v1/domain-models/:id/contexts/:ctxId    — Delete bounded context
POST   /api/v1/domain-models/:id/aggregates         — Add aggregate
POST   /api/v1/domain-models/:id/events             — Add domain event
POST   /api/v1/domain-models/:id/value-objects      — Add value object
POST   /api/v1/domain-models/:id/glossary           — Add glossary term
GET    /api/v1/domain-models/:id/glossary           — List glossary terms
```

### Simplified Code (from Zod schemas)

```typescript
// packages/foe-schemas/src/ddd/domain-model.ts
export const DomainModelSchema = z.object({
  id: z.string().uuid(),                                  // DomainModelId
  name: z.string(),
  description: z.string().optional(),
  boundedContexts: z.array(BoundedContextSchema).default([]),
  aggregates: z.array(AggregateSchema).default([]),
  valueObjects: z.array(ValueObjectSchema).default([]),
  domainEvents: z.array(DomainEventSchema).default([]),
  glossary: z.array(GlossaryTermSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// packages/foe-schemas/src/ddd/bounded-context.ts
export const BoundedContextSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),               // Slug VO
  title: z.string(),
  responsibility: z.string(),
  relationships: z.array(ContextRelationshipSchema).default([]),
  status: z.enum(["draft", "stable", "deprecated"]).default("draft"),
  // ...
});

// packages/foe-schemas/src/ddd/aggregate.ts
export const AggregateSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  contextId: z.string().uuid(),                          // FK → BoundedContext
  rootEntity: z.string(),
  entities: z.array(z.string()).default([]),
  valueObjects: z.array(z.string()).default([]),
  events: z.array(z.string()).default([]),
  commands: z.array(z.string()).default([]),
  invariants: z.array(InvariantSchema).default([]),
  status: z.enum(["draft", "implemented", "deprecated"]).default("draft"),
  // ...
});
```

### Persistence (Drizzle tables)

- `domain_models` — root table
- `bounded_contexts` — FK → `domain_models.id` (cascade)
- `aggregates` — FK → `domain_models.id` + `bounded_contexts.id` (cascade)
- `value_objects` — FK → `domain_models.id` + `bounded_contexts.id` (cascade)
- `domain_events` — FK → `domain_models.id` + `bounded_contexts.id` (cascade), optional FK → `aggregates.id` (set null)
- `glossary_terms` — FK → `domain_models.id`, optional FK → `bounded_contexts.id` (set null)

See `packages/foe-api/src/db/schema.ts` and `packages/foe-api/src/http/routes/v1/domain-models.ts`.

---

## 3. MethodIndex (Field Guide Context)

The compiled catalog of all FOE methods and external framework methods. Built at *compile time* from markdown files and baked into the scanner Docker image.

| Property | Type |
|----------|------|
| **Root** | `MethodIndex` |
| **Entities** | `Method` (65+), `Observation` (39+) |
| **Value Objects** | `Keyword` (string), `FrameworkRef` (`ExternalMethodInfo`), `FoeRelevance` (via method maturity), `MaturityLevel` (hypothesized/observing/validated/proven) |
| **Invariants** | See below |

### Invariants

1. **All methods validate against MethodSchema**: Zod parse on every method file; invalid files are logged as warnings
2. **Method ID format**: Must match `z.string().regex(/^M\d{3,}$/)` (e.g., M111, M164)
3. **Observation ID format**: Must match `z.string().regex(/^O\d{3,}$/)` (e.g., O157, O100)
4. **Keyword count > 0 per method**: The `extractKeywords()` function produces up to 20 keywords from title + body; empty keyword lists indicate parse errors
5. **No duplicate slugs**: Method IDs are used as dictionary keys in `methods: Record<string, Method>` — duplicates overwrite silently

### Repository Port

**Read-only** — the MethodIndex is built at compile time and consumed as JSON:

```typescript
// Build-time: packages/foe-field-guide-tools/src/builders/methods-index.ts
export async function buildMethodsIndex(): Promise<MethodsIndex>;

// Output JSON structure
interface MethodsIndex {
  version: string;
  generated: string;
  methods: Record<string, Method>;         // by methodId
  byKeyword: Record<string, string[]>;     // keyword → methodId[]
  byFieldGuide: Record<string, string[]>;  // guide name → methodId[]
  byFramework: Record<string, string[]>;   // framework name → methodId[]
  byObservation: Record<string, string[]>; // observationId → methodId[]
  stats: { totalMethods: number; byMaturity: Record<MethodMaturity, number>; ... };
}
```

### Simplified Code (from Zod schemas)

```typescript
// packages/foe-schemas/src/field-guide/method.ts
export const MethodSchema = z.object({
  methodId: z.string().regex(/^M\d{3,}$/),
  title: z.string(),
  description: z.string().optional(),
  maturity: MethodMaturitySchema.optional(),         // hypothesized | observing | validated | proven
  fieldGuide: z.string().optional(),                  // "testing", "agentic-coding", etc.
  external: ExternalMethodInfoSchema.optional(),      // { framework, method }
  foeMaturity: MethodMaturitySchema.optional(),
  observations: z.array(z.string().regex(/^O\d{3,}$/)).default([]),
  keywords: z.array(z.string()).default([]),
  path: z.string(),
});

// packages/foe-schemas/src/field-guide/observation.ts
export const ObservationSchema = z.object({
  observationId: z.string().regex(/^O\d{3,}$/),
  title: z.string(),
  status: z.enum(['in-progress', 'completed']),
  sourceType: z.enum(['internal', 'external']),
  source: ExternalSourceSchema.optional(),
  methods: z.array(z.string().regex(/^M\d{3,}$/)).default([]),
  path: z.string(),
});
```

### Build Pipeline

```
Markdown files (docs/docs/field-guides/)
  ↓  parseMethodFile() / parseObservationFile()
Validated Method/Observation objects
  ↓  buildMethodsIndex() / buildObservationsIndex()
JSON indices (methods-index.json, observations-index.json)
  ↓  Docker multi-stage build
Baked into scanner container at /app/indices/
```

---

## 4. ScanJob (Scanning Context)

An ephemeral aggregate that orchestrates a single repository scan. Lives only inside the Docker container during execution.

| Property | Type |
|----------|------|
| **Root** | `ScanJob` |
| **Entities** | `AgentResult` (5 specialist agent outputs: CI, Tests, Architecture, Domain, Docs) |
| **Value Objects** | `ScanJobId` (UUID), `ScanStatus` (queued/running/completed/failed), `RepoUrl` (string) |
| **Invariants** | See below |

### Invariants

1. **Completion requires all 5 agents**: Can only transition to `completed` if all 5 specialist agents (CI, Tests, Architecture, Domain, Docs) have returned results
2. **Immutable after completion**: Once `status = completed`, no further modifications are allowed
3. **Must produce FOEReport on completion**: The orchestrator synthesizes a valid JSON report matching `FOEReportSchema` (or scanner format that `normalize.ts` can transform)
4. **Status transitions**: `queued → running → completed|failed` (no backwards transitions)

### Repository Port

For persistent tracking (when scans are triggered via the API rather than direct Docker invocation):

```typescript
// packages/foe-api/src/db/schema.ts
export const scanJobs = sqliteTable("scan_jobs", {
  id: text("id").primaryKey(),                    // ScanJobId (UUID)
  repositoryPath: text("repository_path").notNull(),
  repositoryName: text("repository_name"),
  status: text("status").notNull(),               // queued | running | completed | failed
  errorMessage: text("error_message"),
  scanId: text("scan_id").references(() => scans.id),  // FK → report, set on completion
  createdAt: text("created_at").notNull(),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
});
```

When running inside the Docker container, the ScanJob is ephemeral — the orchestrator agent (`foe-scanner-container.md`) manages it in-memory through 5 phases:

1. **Auto-Detection** — detect tech stack, monorepo structure
2. **Parallel Dispatch** — launch 5 specialist agents simultaneously
3. **Synthesis** — combine all agent results into dimension scores
4. **Triangle Diagnosis** — apply cognitive triangle thresholds
5. **JSON Output** — emit final report to stdout

### Simplified Code (from scanner orchestrator)

```typescript
// Conceptual ScanJob lifecycle (implemented by agent prompts, not TypeScript classes)
interface ScanJob {
  id: string;
  repositoryPath: string;
  techStack: string[];
  isMonorepo: boolean;
  agentResults: {
    ci?: AgentResult;
    tests?: AgentResult;
    arch?: AgentResult;
    domain?: AgentResult;
    docs?: AgentResult;
  };
  status: 'queued' | 'running' | 'completed' | 'failed';
}

// Scoring formula from foe-scanner-container.md:
// overall = (feedback × 0.35) + (understanding × 0.35) + (confidence × 0.30)
```

---

## 5. GovernanceSnapshot (Governance Context)

A point-in-time snapshot of all governance artifacts in the delivery framework. Validates integrity across roads, ADRs, NFRs, capabilities, and change records.

| Property | Type |
|----------|------|
| **Root** | `GovernanceSnapshot` |
| **Entities** | N/A (aggregates markdown artifacts — does not own them) |
| **Value Objects** | `ArtifactCounts` (roads, adrs, nfrs, caps, changes), `IntegrityResult` (pass/fail + violations), `ComplianceStatus` |
| **Invariants** | See below |

### Invariants

1. **References only existing road items**: Snapshot must not reference road items that don't exist in the `roads/` directory
2. **Cross-references must pass integrity**: All inter-artifact references (e.g., a capability referencing a road item) must resolve
3. **All artifact frontmatter must validate**: Every markdown file's YAML frontmatter must parse against its corresponding schema
4. **Snapshot immutability**: Once created, a snapshot is read-only (append-only history)

### Repository Port

```typescript
// Planned: packages/delivery-framework/scripts/ (ROAD-004)
// Currently built by governance parsers; output is a JSON index

interface GovernanceIndex {
  version: string;
  generated: string;
  artifacts: {
    roads: RoadItem[];
    adrs: ADR[];
    nfrs: NFR[];
    capabilities: Capability[];
    changes: ChangeRecord[];
  };
  counts: ArtifactCounts;
  integrity: IntegrityResult;
}
```

### Current Status

The Governance context is the least mature bounded context. Key artifacts live in `packages/delivery-framework/` as markdown files with YAML frontmatter. Formal Zod schemas for governance artifacts are planned under `packages/foe-schemas/src/governance/`.

### Simplified Code (planned)

```typescript
// Planned: packages/foe-schemas/src/governance/snapshot.ts
export const ArtifactCountsSchema = z.object({
  roads: z.number().int().nonnegative(),
  adrs: z.number().int().nonnegative(),
  nfrs: z.number().int().nonnegative(),
  capabilities: z.number().int().nonnegative(),
  changes: z.number().int().nonnegative(),
});

export const IntegrityResultSchema = z.object({
  passed: z.boolean(),
  violations: z.array(z.object({
    source: z.string(),
    target: z.string(),
    type: z.string(),
    message: z.string(),
  })).default([]),
});

export const GovernanceSnapshotSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  counts: ArtifactCountsSchema,
  integrity: IntegrityResultSchema,
});
```

---

## Aggregate Relationship Summary

```
┌──────────────────────────────────────────────────────────────────┐
│                    Scanning Context                               │
│  ┌─────────────┐                                                 │
│  │   ScanJob    │──── dispatches 5 agents ──→ produces ─────┐    │
│  │  (ephemeral) │                                            │    │
│  └─────────────┘                                            │    │
└─────────────────────────────────────────────────────────────│────┘
                                                              │
                          JSON (stdout or API)                │
                                                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Reporting Context                               │
│  ┌─────────────┐          ┌──────────────┐                       │
│  │  FOEReport   │          │ DomainModel   │                      │
│  │  (persisted) │          │ (persisted)   │                      │
│  └─────────────┘          └──────────────┘                       │
└──────────────────────────────────────────────────────────────────┘
        ▲ references methods                ▲ models contexts
        │                                   │
┌───────┴──────────────────────┐   ┌────────┴─────────────────────┐
│     Field Guide Context      │   │    Governance Context         │
│  ┌──────────────┐            │   │  ┌──────────────────────┐    │
│  │ MethodIndex   │           │   │  │ GovernanceSnapshot    │    │
│  │ (build-time)  │           │   │  │ (JSON index)          │    │
│  └──────────────┘            │   │  └──────────────────────┘    │
└──────────────────────────────┘   └──────────────────────────────┘
```

---

## Key Design Decisions

1. **Zod schemas as the aggregate definition**: Rather than traditional OOP classes, aggregates are defined as Zod schemas that serve as both validation and TypeScript type generation. This aligns with the project's schema-first design principle (AGENTS.md).

2. **Anti-Corruption Layer**: The `normalizeReport()` function in `packages/foe-api/src/domain/report/normalize.ts` acts as the ACL between the Scanning context's raw output format and the Reporting context's canonical `FOEReportSchema`.

3. **Build-time vs runtime aggregates**: `MethodIndex` is built at compile time and baked into Docker images. `FOEReport` and `DomainModel` are runtime aggregates persisted in SQLite via Drizzle ORM.

4. **Ephemeral vs persistent ScanJob**: Inside the Docker container, `ScanJob` is ephemeral (agent memory). When triggered via the API, it's tracked in the `scan_jobs` table for async status polling.

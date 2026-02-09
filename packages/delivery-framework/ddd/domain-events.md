---
title: Domain Events
---

# Domain Events

Domain events represent something meaningful that happened in the system. They are the primary mechanism for cross-context communication in Katalyst Domain Mapper, decoupling bounded contexts so they can evolve independently.

---

## Naming Conventions

1. **Past tense**: Events describe what *has happened*, not what should happen
   - `ScanCompleted` (not `CompleteScan`)
   - `ReportIngested` (not `IngestReport`)
   - `IndicesRebuilt` (not `RebuildIndices`)

2. **Context-prefixed when ambiguous**: If an event name could be confused across contexts, prefix with the source context

3. **Singular nouns**: One event per occurrence
   - `GovernanceSnapshotCreated` (not `GovernanceSnapshotsCreated`)

---

## Event Structure Pattern

All domain events follow a consistent structure:

```typescript
interface DomainEvent<T> {
  /** Unique event ID (UUID) */
  eventId: string;

  /** Event type name (PascalCase, past tense) */
  eventType: string;

  /** ISO 8601 timestamp of when the event occurred */
  occurredAt: string;

  /** Source bounded context */
  sourceContext: string;

  /** Source aggregate type */
  sourceAggregate: string;

  /** Source aggregate ID */
  aggregateId: string;

  /** Event-specific payload */
  payload: T;
}
```

---

## Event Catalog

### ScanCompleted

| Property | Value |
|----------|-------|
| **Source Context** | Scanning |
| **Source Aggregate** | ScanJob |
| **Trigger** | Orchestrator synthesizes all 5 agent results into final report |
| **Subscribers** | Reporting (ingest and persist the report) |

**Payload**:

```typescript
interface ScanCompletedPayload {
  scanJobId: string;           // UUID of the completed scan job
  repoUrl: string;             // Repository URL or path that was scanned
  dimensionScores: {
    feedback: number;           // 0–100
    understanding: number;      // 0–100
    confidence: number;         // 0–100
  };
  overallScore: number;         // Weighted composite: (F×0.35 + U×0.35 + C×0.30)
  maturityLevel: string;        // 'Hypothesized' | 'Emerging' | 'Practicing' | 'Optimized'
}
```

**Current implementation**: This event is implicit. The scanner container writes JSON to stdout. The `foe-api` scan loop (`packages/foe-api/src/bootstrap/scanLoop.ts`) polls for completion and calls `normalizeReport()` + `reportRepo.save()` — effectively acting as the event handler. The `scanJobs` table tracks `status: 'completed'` as the materialized event.

```typescript
// packages/foe-api/src/bootstrap/scanLoop.ts
const normalized = normalizeReport(result.report);
const reportId = await reportRepo.save(normalized, result.report);
// ↑ This is the "ScanCompleted → Ingest" flow
```

---

### ReportIngested

| Property | Value |
|----------|-------|
| **Source Context** | Reporting |
| **Source Aggregate** | FOEReport |
| **Trigger** | `IngestReport` use case successfully normalizes and persists a report |
| **Subscribers** | Future: trend tracking, notification system |

**Payload**:

```typescript
interface ReportIngestedPayload {
  reportId: string;            // UUID of the persisted report
  repoUrl: string;             // Repository URL
  repository: string;          // Repository name
  overallScore: number;        // 0–100
  maturityLevel: string;       // Maturity classification
  timestamp: string;           // ISO 8601 — when ingestion completed
}
```

**Current implementation**: The `IngestReport` use case (`packages/foe-api/src/usecases/report/IngestReport.ts`) performs the ingestion. Event publication is not yet explicit — the use case returns the result directly:

```typescript
// packages/foe-api/src/usecases/report/IngestReport.ts
export class IngestReport {
  async execute(rawData: unknown): Promise<{ id: string; overallScore: number; maturityLevel: string }> {
    const report = normalizeReport(rawData);   // ACL: scanner format → canonical
    const id = await this.reportRepo.save(report, rawData);
    return { id, overallScore: report.overallScore, maturityLevel: report.maturityLevel };
    // Future: await this.eventPublisher.publish(new ReportIngested(...));
  }
}
```

---

### DomainModelUpdated

| Property | Value |
|----------|-------|
| **Source Context** | Reporting |
| **Source Aggregate** | DomainModel |
| **Trigger** | Any CRUD operation on domain model or nested entities (contexts, aggregates, VOs, events, glossary) |
| **Subscribers** | Future: documentation site rebuild, domain model diff tracking |

**Payload**:

```typescript
interface DomainModelUpdatedPayload {
  domainModelId: string;       // UUID of the domain model
  changeType: 'created' | 'updated' | 'deleted';
  affectedEntity: {
    type: 'domain-model' | 'bounded-context' | 'aggregate' | 'value-object' | 'domain-event' | 'glossary-term';
    id: string;                // UUID of the affected entity
    slug?: string;             // Slug if applicable
  };
  timestamp: string;           // ISO 8601
}
```

**Current implementation**: The REST API routes (`packages/foe-api/src/http/routes/v1/domain-models.ts`) perform CRUD directly via Drizzle. No event publication yet — the API returns results synchronously:

```typescript
// POST /api/v1/domain-models/:id/contexts
db.insert(schema.boundedContexts).values({ ... }).run();
return { id: ctxId, slug: body.slug, title: body.title };
// Future: publish DomainModelUpdated event after successful insert
```

---

### GovernanceSnapshotCreated

| Property | Value |
|----------|-------|
| **Source Context** | Governance |
| **Source Aggregate** | GovernanceSnapshot |
| **Trigger** | Governance index build script completes successfully |
| **Subscribers** | Future: dashboard refresh, compliance reporting |

**Payload**:

```typescript
interface GovernanceSnapshotCreatedPayload {
  snapshotId: string;          // UUID of the snapshot
  artifactCounts: {
    roads: number;
    adrs: number;
    nfrs: number;
    capabilities: number;
    changes: number;
  };
  integrityResult: {
    passed: boolean;
    violationCount: number;
  };
  timestamp: string;           // ISO 8601
}
```

**Current implementation**: Planned under ROAD-004. The governance build scripts in `packages/delivery-framework/scripts/` will produce a JSON index. Event publication will follow once the governance schemas are formalized.

---

### IndicesRebuilt

| Property | Value |
|----------|-------|
| **Source Context** | Field Guide |
| **Source Aggregate** | MethodIndex |
| **Trigger** | `buildMethodsIndex()` and `buildObservationsIndex()` complete during Docker build or CLI `build` command |
| **Subscribers** | Scanning (refresh method references in scanner container) |

**Payload**:

```typescript
interface IndicesRebuiltPayload {
  methodCount: number;          // Total methods indexed (65+)
  observationCount: number;     // Total observations indexed (39+)
  keywordCount: number;         // Unique keywords extracted (625+)
  frameworkCount: number;       // External frameworks indexed (7)
  version: string;              // Index version
  generatedAt: string;          // ISO 8601
}
```

**Current implementation**: Build-time only. The CLI (`packages/foe-field-guide-tools/src/cli.ts`) runs the builders and writes JSON files. The Docker multi-stage build copies these into the scanner container. No runtime event — the "event" is the Docker image rebuild itself.

```typescript
// packages/foe-field-guide-tools/src/builders/methods-index.ts
const index = await buildMethodsIndex();
console.log(`Total methods: ${index.stats.totalMethods}`);
console.log(`Unique keywords: ${Object.keys(byKeyword).length}`);
// Output: methods-index.json → baked into Docker image
```

---

## Event Flow Diagram

```
┌─────────────────┐    ScanCompleted     ┌──────────────────┐
│                 │ ─────────────────────→ │                  │
│    Scanning     │    (JSON stdout       │    Reporting      │
│    Context      │     or API poll)      │    Context        │
│                 │                       │                  │
└─────────────────┘                       │  ReportIngested  │
                                          │  ──→ (future)    │
                                          │                  │
                                          │  DomainModel-    │
                                          │  Updated         │
                                          │  ──→ (future)    │
                                          └──────────────────┘

┌─────────────────┐   IndicesRebuilt     ┌──────────────────┐
│   Field Guide   │ ─────────────────→   │    Scanning      │
│   Context       │  (Docker build)      │    Context       │
└─────────────────┘                      └──────────────────┘

┌─────────────────┐   GovernanceSnapshot ┌──────────────────┐
│   Governance    │   Created            │   (future:       │
│   Context       │ ─────────────────→   │    dashboard)    │
└─────────────────┘                      └──────────────────┘
```

---

## Publish-Then-Save Ordering

The correct ordering for event publication depends on the consistency model:

### Current: Save-Then-Respond (Synchronous)

Because event publication is not yet explicit, the current pattern is synchronous:

```typescript
// 1. Validate and normalize
const report = normalizeReport(rawData);

// 2. Save to database
const id = await this.reportRepo.save(report, rawData);

// 3. Return result (implicit "event")
return { id, overallScore: report.overallScore };
```

### Future: Save-Then-Publish (Recommended)

When explicit event publishing is added, use **save-then-publish** to ensure data consistency:

```typescript
// ✅ Correct: save first, then publish
const report = normalizeReport(rawData);
const id = await this.reportRepo.save(report, rawData);          // Step 1: persist
await this.eventPublisher.publish(new ReportIngested(id, ...));   // Step 2: notify

// ❌ Wrong: publish before save
await this.eventPublisher.publish(new ReportIngested(id, ...));   // What if save fails?
const id = await this.reportRepo.save(report, rawData);
```

**Rationale**: If the save fails after publishing, subscribers will process an event for data that doesn't exist. Save-then-publish ensures the data is durable before notifying downstream contexts.

For eventual consistency guarantees in a distributed setup, consider the **Outbox Pattern**: write the event to an outbox table in the same transaction as the aggregate save, then a background process publishes from the outbox.

---

## DomainEvent Schema (for DDD Model)

Events documented here are also modeled as first-class entities within the `DomainModel` aggregate:

```typescript
// packages/foe-schemas/src/ddd/domain-event.ts
export const DomainEventSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),       // e.g., "scan-completed"
  title: z.string(),                              // e.g., "ScanCompleted"
  contextId: z.string().uuid(),                   // FK → BoundedContext
  aggregateId: z.string().uuid().optional(),       // FK → Aggregate (optional)
  description: z.string().optional(),
  payload: z.array(EventPayloadFieldSchema).default([]),
  consumedBy: z.array(z.string()).default([]),     // Context names that subscribe
  triggers: z.array(z.string()).default([]),        // What triggers this event
  sideEffects: z.array(z.string()).default([]),    // What happens after
  sourceFile: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

This allows the domain model API to track events as first-class DDD artifacts, with payload field definitions, consumer lists, and trigger descriptions.

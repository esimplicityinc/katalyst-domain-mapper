---
title: Context Map
---

# Context Map

The context map shows how the four bounded contexts of Katalyst Domain Mapper relate to each other. Each context owns its own ubiquitous language, aggregates, and persistence — communication happens through well-defined integration points.

---

## 1. Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   ┌───────────────────────┐                  ┌───────────────────────┐          │
│   │                       │   Customer-      │                       │          │
│   │       SCANNING        │   Supplier       │      REPORTING        │          │
│   │                       │ ════════════════> │                       │          │
│   │  packages/foe-scanner │   (JSON report   │  packages/foe-api     │          │
│   │                       │    via stdout     │  packages/foe-web-ui  │          │
│   │  Aggregates:          │    or API)        │                       │          │
│   │  · ScanJob            │                   │  Aggregates:          │          │
│   │                       │                   │  · FOEReport          │          │
│   └───────────┬───────────┘                   │  · DomainModel        │          │
│               │                               │                       │          │
│               │ Conformist                    └───────────┬───────────┘          │
│               │ (conforms to                              │                     │
│               │  method catalog)                          │ Conformist           │
│               │                                           │ (links to methods   │
│               ▼                                           │  in UI & reports)   │
│   ┌───────────────────────┐                               │                     │
│   │                       │◄──────────────────────────────┘                     │
│   │     FIELD GUIDE       │                                                     │
│   │                       │                                                     │
│   │  packages/            │                                                     │
│   │   foe-field-guide-    │                                                     │
│   │   tools               │                                                     │
│   │                       │                                                     │
│   │  Aggregates:          │                                                     │
│   │  · MethodIndex        │                                                     │
│   └───────────────────────┘                                                     │
│                                                                                 │
│   ┌───────────────────────┐                                                     │
│   │                       │                                                     │
│   │     GOVERNANCE        │   Separate Ways (Published Language)                │
│   │                       │   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ▶ │
│   │  packages/            │   Consumed by all contexts via                      │
│   │   delivery-framework  │   markdown frontmatter + JSON indices               │
│   │                       │                                                     │
│   │  Aggregates:          │                                                     │
│   │  · GovernanceSnapshot │                                                     │
│   └───────────────────────┘                                                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Legend:
  ══════> Customer-Supplier (upstream produces, downstream consumes)
  ──────> Conformist (downstream conforms to upstream's model)
  ─ ─ ─> Separate Ways / Published Language (independent, shared conventions)
```

---

## 2. Relationship Details

| Upstream | Downstream | Pattern | Integration Mechanism | Shared Kernel |
|----------|-----------|---------|----------------------|---------------|
| **Scanning** | **Reporting** | Customer-Supplier | JSON output via stdout (Docker) or API poll (`scanJobs` table). Reporting consumes whatever Scanning produces. | `FOEReportSchema` from `@foe/schemas/scan` |
| **Field Guide** | **Scanning** | Conformist | JSON indices (`methods-index.json`, `observations-index.json`) baked into Docker image at build time. Scanning conforms to Field Guide's method catalog structure. | `MethodSchema`, `ObservationSchema` from `@foe/schemas/field-guide` |
| **Field Guide** | **Reporting** | Conformist | `MethodReference` objects embedded in report findings/recommendations link to Field Guide methods. Web UI renders `MethodLink.tsx` components. | `MethodReferenceSchema` from `@foe/schemas/scan` |
| **Governance** | **All** | Published Language | Markdown files with YAML frontmatter. Each context reads governance artifacts (road items, ADRs) for its own purposes. No direct code dependency. | Governance schemas (`@foe/schemas/governance` — planned) |

---

## 3. Shared Kernel: `@foe/schemas`

The `@foe/schemas` package serves as the **shared kernel** across all bounded contexts. It contains Zod schemas that define the canonical data shapes used at context boundaries.

```
@foe/schemas
├── scan/               ← Shared between Scanning ↔ Reporting
│   ├── report.ts       ← FOEReportSchema (the canonical report format)
│   ├── dimension.ts    ← DimensionScoreSchema
│   ├── triangle-diagnosis.ts
│   ├── finding.ts
│   ├── strength.ts
│   ├── recommendation.ts
│   ├── methodology.ts
│   ├── method-reference.ts  ← Links Reporting → Field Guide
│   ├── method-summary.ts
│   ├── subscore.ts
│   └── common.ts       ← MaturityLevel, Severity, Confidence, Priority, Impact
│
├── field-guide/        ← Shared between Field Guide ↔ Scanning ↔ Reporting
│   ├── method.ts       ← MethodSchema
│   ├── observation.ts  ← ObservationSchema
│   ├── methods-index.ts ← MethodsIndex schema
│   └── field-guide.ts
│
├── ddd/                ← Used by Reporting (DomainModel CRUD)
│   ├── domain-model.ts
│   ├── bounded-context.ts
│   ├── aggregate.ts
│   ├── value-object.ts
│   ├── domain-event.ts
│   └── glossary.ts
│
└── governance/         ← Planned: Governance schemas
    └── (future)
```

**Why a shared kernel?** The project follows a **schema-first design** principle. By centralizing all Zod schemas in one package, we get:
- **Single source of truth** for data shapes
- **Runtime validation** at context boundaries (not just compile-time types)
- **Breaking change detection** — modifying a schema immediately shows which contexts are affected
- **Type generation** — `z.infer<>` produces TypeScript types consumed by all packages

---

## 4. Anti-Corruption Layers

### Scanner → Reporting ACL: `normalize.ts`

The most critical ACL in the system. The scanner agents produce a **scanner-specific output format** (defined in `foe-scanner-container.md`), which differs from the canonical `FOEReportSchema`. The `normalizeReport()` function translates between the two.

```typescript
// packages/foe-api/src/domain/report/normalize.ts

export function normalizeReport(data: unknown): FOEReport {
  // Attempt 1: Try canonical FOEReportSchema directly
  const zodResult = FOEReportSchema.safeParse(data);
  if (zodResult.success) return zodResult.data;

  // Attempt 2: Detect scanner format and transform
  if (isScannerFormat(data)) {
    const transformed = transformScannerReport(data);
    return transformed;
  }

  throw new ReportValidationError("Invalid report format");
}
```

**What it normalizes**:

| Scanner Format | Canonical Format | Transformation |
|---------------|-----------------|----------------|
| `repository.name` (nested object) | `repository` (flat string) | Extract `.name` field |
| `topStrengths: [{area, score, reason}]` | `strengths: [{id, area, evidence}]` | Generate IDs, map `reason` → `evidence` |
| `topGaps: [{area, score, reason}]` | `recommendations: [{id, priority, title, description, impact}]` | Derive priority from position, impact from score |
| `dimensions.*.subscores` (object) | `dimensions.*.subscores` (array of 4) | Convert Record to array, pad to 4 if needed |
| `scanDuration: "5m 32s"` (string) | `scanDuration: 332000` (milliseconds) | Parse minutes + seconds |
| `triangleDiagnosis.weakestDimension` | `triangleDiagnosis.weakestPrinciple` | Rename + normalize to enum value |
| No `id` field | `id: UUID` | Generate via `crypto.randomUUID()` |
| No `executiveSummary` | `executiveSummary: string` | Generate from name + score |

### Governance → All Contexts (Implicit ACL)

Governance artifacts are markdown files with YAML frontmatter. Each consuming context parses only the fields it cares about and ignores the rest. This implicit "cherry-picking" prevents governance format changes from breaking consuming contexts.

---

## 5. Integration Points Summary

```
                              ┌─────────────────┐
                              │   @foe/schemas   │
                              │  (Shared Kernel) │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
          ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
          │  Scanning    │   │ Field Guide  │   │  Reporting   │
          │             │   │             │   │             │
          │ Consumes:   │   │ Produces:   │   │ Consumes:   │
          │ · MethodSch.│   │ · MethodSch.│   │ · FOEReport │
          │ · FOEReport │   │ · Observ.Sch│   │ · MethodRef │
          │   (produces)│   │ · Index Sch.│   │ · DomainMdl │
          └─────────────┘   └─────────────┘   └─────────────┘
                                                     │
                                              ┌──────┴──────┐
                                              │ normalize.ts │
                                              │    (ACL)     │
                                              └─────────────┘
```

---

## 6. Context Communication Patterns

### Scanning → Reporting: Customer-Supplier

**How it works today**:
1. Scanner container writes JSON to stdout
2. `foe-api` scan loop polls `scanJobs` table for completed jobs
3. Scan loop calls `normalizeReport()` (ACL) to transform scanner output
4. `reportRepo.save()` persists the canonical FOEReport

**Key code paths**:
- Scanner output: `packages/foe-scanner/.opencode/agents/foe-scanner-container.md` (Phase 5)
- Scan loop: `packages/foe-api/src/bootstrap/scanLoop.ts`
- ACL: `packages/foe-api/src/domain/report/normalize.ts`
- Persistence: `packages/foe-api/src/adapters/sqlite/ReportRepositorySQLite.ts`

### Field Guide → Scanning: Conformist

**How it works today**:
1. `foe-field-guide-tools` builds JSON indices at compile time
2. Docker multi-stage build copies indices into scanner container
3. Scanner agents reference `methods-index.json` to look up FOE methods
4. Method IDs (e.g., `M111`) are embedded in scanner output findings

**Key code paths**:
- Index builder: `packages/foe-field-guide-tools/src/builders/methods-index.ts`
- Docker stage: `packages/foe-scanner/Dockerfile` (Stage 1)
- Scanner agent usage: `foe-scanner-*.md` agents reference method catalog

### Field Guide → Reporting: Conformist

**How it works today**:
1. Reports contain `MethodReference` objects in findings/recommendations
2. Web UI renders `MethodLink.tsx` components linking to Field Guide docs
3. `ReferencedMethodSummarySchema` tracks how many times each method appears in a report

**Key code paths**:
- Method reference schema: `packages/foe-schemas/src/scan/method-reference.ts`
- Web UI: `packages/foe-web-ui/src/components/MethodLink.tsx`
- Summary schema: `packages/foe-schemas/src/scan/method-summary.ts`

### Governance → All: Published Language

**How it works today**:
1. Governance artifacts live as markdown files in `packages/delivery-framework/`
2. YAML frontmatter follows conventions (planned: formal schemas)
3. Other contexts read these files for process/roadmap information
4. No runtime dependency — purely a documentation and process integration

**Key code paths**:
- Markdown sources: `packages/delivery-framework/roads/`, `packages/delivery-framework/ddd/`
- Planned schemas: `packages/foe-schemas/src/governance/`

---

## 7. Context Ownership

| Context | Package(s) | Primary Aggregate | Team Ownership |
|---------|-----------|-------------------|---------------|
| Scanning | `foe-scanner` | ScanJob | Platform / DevOps |
| Field Guide | `foe-field-guide-tools`, `foe-schemas/field-guide` | MethodIndex | Content / Engineering |
| Reporting | `foe-api`, `foe-web-ui`, `foe-schemas/scan`, `foe-schemas/ddd` | FOEReport, DomainModel | Product Engineering |
| Governance | `delivery-framework` | GovernanceSnapshot | All (shared stewardship) |

---

## 8. Evolution Notes

### Current State
- **Scanning ↔ Reporting** is the most mature integration, with a working ACL (`normalize.ts`), persistence layer, and API.
- **Field Guide → Scanning** is build-time only — no runtime communication.
- **Governance** is the least formal context — markdown-based, no Zod schemas yet.

### Planned Improvements
1. **Explicit domain events** — Replace implicit integrations (scan loop polling, API return values) with published domain events and event handlers.
2. **Governance schemas** — Formalize `@foe/schemas/src/governance/` to validate all governance artifact frontmatter (ROAD-004).
3. **Event-driven Field Guide refresh** — When indices are rebuilt, publish `IndicesRebuilt` event so the scanner container can be automatically rebuilt or hot-refreshed.
4. **Cross-context queries** — Add a read model / query service that joins data across contexts for dashboard views (e.g., "show me all repos scanned this week with their governance compliance status").

### Anti-Pattern Watch
- **No direct imports across context boundaries**: Contexts must not `import` from each other's internal modules. Only `@foe/schemas` (the shared kernel) may be imported by all.
- **No shared database tables**: Each context owns its own tables. The `scans` table belongs to Reporting, not Scanning. The `scanJobs` table is the handoff point.
- **No domain logic in the ACL**: `normalize.ts` should only *translate*, not *decide*. Business rules belong in aggregates.

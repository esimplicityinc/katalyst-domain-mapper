---
title: Bounded Contexts
---

# Bounded Contexts

The Katalyst Domain Mapper is decomposed into 4 bounded contexts, each with its own domain model, language, and responsibilities. The contexts collaborate through well-defined relationships — primarily customer-supplier (upstream/downstream) and shared references.

## Context Map Overview

```
┌─────────────────────────┐        ┌─────────────────────────┐
│  Scanning               │        │  Field Guide            │
│  (Core Domain)          │───────>│  (Supporting)           │
│                         │  uses  │                         │
│  • Repo analysis        │  refs  │  • Method catalog       │
│  • Dimension scoring    │        │  • Observation index    │
│  • Agent orchestration  │        │  • Keyword search       │
│  • Cognitive triangle   │        │  • Framework integration│
└────────────┬────────────┘        └─────────────────────────┘
             │                                  ▲
             │ produces                         │ links to
             ▼                                  │
┌─────────────────────────┐        ┌────────────┴────────────┐
│  Reporting              │        │  Governance             │
│  (Supporting)           │        │  (Generic)              │
│                         │        │                         │
│  • Report persistence   │        │  • Road items (ROAD-xxx)│
│  • REST API (Elysia)    │        │  • ADRs, NFRs           │
│  • Web UI (React)       │        │  • Capabilities         │
│  • Domain model CRUD    │        │  • Schema validation    │
│  • Score trends         │        │  • Change tracking      │
└─────────────────────────┘        └─────────────────────────┘

Relationships:
  Scanning ──(upstream/produces)──> Reporting
  Scanning ──(uses/conformist)───> Field Guide
  Reporting ──(uses/conformist)──> Field Guide (method links in UI)
  Governance ──(separate-ways)───> All (consumed for compliance, not runtime)
```

---

## 1. Scanning Context (Core Domain)

### Responsibility

Analyze software repositories via 5 specialist AI agents orchestrated inside a Docker container. Produce a scored FOE assessment with findings, recommendations, and cognitive triangle diagnosis. This is the core business capability — the unique differentiator.

### Core Concepts

- **ScanJob** — An in-progress analysis tracked through status transitions: `queued → running → completed | failed`. Defined in `foe-api/src/domain/scan/Scan.ts`.
- **FOEReport** — The complete scan output: overall score, 3 dimensions (each with 4 subscores), findings, strengths, recommendations, triangle diagnosis, methodology. Validated by `FOEReportSchema`.
- **Dimension** — One of 3 assessment axes (Feedback, Understanding, Confidence), each scored 0–100 with 4 subscores of max 25 points each.
- **TriangleDiagnosis** — Health assessment of the cognitive triangle. Cycle health: `virtuous | at-risk | vicious`. Identifies weakest principle and prescribes intervention.
- **Methodology** — Metadata about how the scan was conducted: files analyzed, test files found, ADRs counted, coverage report presence.

### Key Aggregates

| Aggregate | Root Entity | Package | Status |
|-----------|-------------|---------|--------|
| **ScanJob** | `ScanJob` | `foe-api/src/domain/scan/Scan.ts` | Implemented |
| **FOEReport** | `FOEReport` | `@foe/schemas/src/scan/report.ts` | Implemented |

### Commands

- `TriggerScan(repositoryPath)` — Queue a new scan job (`POST /api/v1/scans`)
- `IngestReport(rawJson)` — Validate, normalize, and persist a scan report (`POST /api/v1/reports`)

### Public Events

- `ScanCompleted` — Emitted when a scan job transitions to `completed` status. Carries the `scanId` and `repositoryPath`.
- `ReportIngested` — Emitted when a raw report is validated, normalized, and persisted. Carries the `reportId` and `overallScore`.

### Relationships

| Direction | Target Context | Pattern | Description |
|-----------|---------------|---------|-------------|
| **Upstream to** | Reporting | Customer-Supplier | Scanning produces reports; Reporting persists and displays them |
| **Uses** | Field Guide | Conformist | Scanner agents reference Field Guide methods/observations via pre-built JSON indices |

### Boundaries

- Does **NOT** persist reports directly — produces raw JSON, delegates persistence to the Reporting context via `IngestReport` use case
- Does **NOT** manage repositories — `Repository` records are created by the Reporting context during ingestion
- Does **NOT** modify source code — only reads and analyzes
- Scanner runs inside Docker — isolated from the API process

### Ports

| Port | Direction | Implementation |
|------|-----------|----------------|
| `ScanRunner` | Outbound | `DockerScanRunner` — shells out to `docker run` |
| `ScanJobRepository` | Outbound | `SqliteScanJobRepository` — tracks job status |

---

## 2. Field Guide Context (Supporting Subdomain)

### Responsibility

Parse, validate, and index 65+ methods and 39+ observations from markdown files. Build searchable JSON indices with 625+ extracted keywords. Integrate methods from external frameworks (DORA, DDD, BDD, Team Topologies, TDD, Continuous Delivery, Double Diamond). Serve as the authoritative knowledge base that makes scan recommendations actionable.

### Core Concepts

- **Method** — A documented engineering practice identified by `M{NNN}` (e.g., `M111`). Has a maturity level (`hypothesized | observing | validated | proven`), optional field guide association, optional external framework origin, linked observation IDs, and extracted keywords. Validated by `MethodSchema`.
- **Observation** — A documented finding from real-world projects identified by `O{NNN}` (e.g., `O157`). Has status (`in-progress | completed`), source type (`internal | external`), and linked method IDs. Validated by `ObservationSchema`.
- **Keyword** — A term extracted from method titles and content used for auto-linking scan findings to relevant methods. 625+ keywords indexed in `keywordIndex`.
- **ExternalFramework** — An external methodology (DORA, DDD, etc.) whose methods are adopted into the FOE catalog with FOE-specific maturity assessments via `ExternalMethodInfoSchema`.
- **MethodsIndex** — The build-time artifact containing all methods, keyword index, field guide index, and framework index. Validated by `MethodsIndexSchema`.

### Key Aggregates

| Aggregate | Root Entity | Package | Status |
|-----------|-------------|---------|--------|
| **MethodsIndex** | `MethodsIndex` | `@foe/schemas/src/field-guide/methods-index.ts` | Implemented |
| **ObservationsIndex** | (observations collection) | `@foe/field-guide-tools/src/builders/` | Implemented |

### Commands

- `BuildIndices()` — Parse all markdown files and generate `methods-index.json` + `observations-index.json` (CLI: `bun run build`)
- `ValidateFrontmatter()` — Check frontmatter validity without building (CLI: `bun run validate`)

### Public Events

- `IndicesRebuilt` — Conceptual event when indices are regenerated. In practice, this triggers a Docker rebuild to bake new indices into the scanner container.

### Relationships

| Direction | Target Context | Pattern | Description |
|-----------|---------------|---------|-------------|
| **Consumed by** | Scanning | Conformist | Scanner agents read pre-built JSON indices at runtime |
| **Consumed by** | Reporting | Conformist | Web UI links findings/recommendations to Field Guide methods via `MethodReference.linkUrl` |

### Boundaries

- **Read-only** reference data — does NOT modify source markdown files
- Does **NOT** run scans — provides the vocabulary and knowledge that makes scan results actionable
- Does **NOT** persist to a database — outputs static JSON files consumed by other contexts
- Build-time only — indices are generated once and baked into the scanner Docker image

### Key Schemas

| Schema | Purpose | File |
|--------|---------|------|
| `MethodSchema` | Single method validation | `@foe/schemas/src/field-guide/method.ts` |
| `ObservationSchema` | Single observation validation | `@foe/schemas/src/field-guide/observation.ts` |
| `MethodsIndexSchema` | Complete index validation | `@foe/schemas/src/field-guide/methods-index.ts` |
| `FieldGuideSchema` | Field guide metadata | `@foe/schemas/src/field-guide/field-guide.ts` |
| `MethodReferenceSchema` | Method link in scan results | `@foe/schemas/src/scan/method-reference.ts` |

---

## 3. Reporting Context (Supporting Subdomain)

### Responsibility

Persist FOE reports into normalized SQLite tables, serve them via a REST API (Elysia), render interactive visualizations in a React web UI, and manage DDD domain model CRUD. This context is the primary interface for human users — both API consumers and web UI users.

### Core Concepts

- **FOEReport** (persisted) — A stored report decomposed into normalized tables: `scans`, `dimensions`, `subscores`, `findings`, `strengths`, `recommendations`, `triangle_diagnoses`, `methodologies`. The raw JSON is also preserved in `scans.raw_report`.
- **Repository** — A tracked software repository with metadata (name, URL, tech stack, monorepo flag). Created automatically during report ingestion via `ensureRepository()`.
- **ScoreTrend** — Time-series of a repository's scores across scans. Tracked via `ScoreTrendPoint` (overall + per-dimension scores).
- **DomainModel** — A container for all DDD artifacts belonging to a single project. Contains bounded contexts, aggregates, value objects, domain events, and glossary terms. Managed via full CRUD API.
- **BoundedContext** (modeled) — A DDD bounded context within a domain model, with slug, responsibility, relationships, status, and team ownership.
- **Aggregate** (modeled) — A DDD aggregate with root entity, child entities, value objects, events, commands, and invariants.
- **ValueObject** (modeled) — An immutable domain primitive with typed properties and validation rules.
- **DomainEvent** (modeled) — A domain event with payload fields, consumers, triggers, and side effects.
- **GlossaryTerm** — A term definition with aliases, examples, related terms, and optional context association.

### Key Aggregates

| Aggregate | Root Entity | Package | Status |
|-----------|-------------|---------|--------|
| **FOEReport** (stored) | `scans` table row | `foe-api/src/db/schema.ts` | Implemented |
| **DomainModel** | `domain_models` table row | `foe-api/src/db/schema.ts` | Implemented |

### Commands

- `IngestReport(rawJson)` — Validate, normalize, decompose into tables (`POST /api/v1/reports`)
- `GetReport(id)` — Reassemble full report from normalized tables (`GET /api/v1/reports/:id`)
- `ListReports(filter)` — Query with filters: repository, maturity level, score range, pagination (`GET /api/v1/reports`)
- `CompareReports(id, otherId)` — Diff two reports side-by-side (`GET /api/v1/reports/:id/compare/:otherId`)
- `DeleteReport(id)` — Cascade delete report and all child records (`DELETE /api/v1/reports/:id`)
- `CreateDomainModel(name, description)` — Create a new DDD workspace (`POST /api/v1/domain-models`)
- `AddBoundedContext(modelId, context)` — Add context to model (`POST /api/v1/domain-models/:id/contexts`)
- `AddAggregate(modelId, aggregate)` — Add aggregate (`POST /api/v1/domain-models/:id/aggregates`)
- `AddValueObject(modelId, vo)` — Add value object (`POST /api/v1/domain-models/:id/value-objects`)
- `AddDomainEvent(modelId, event)` — Add domain event (`POST /api/v1/domain-models/:id/events`)
- `AddGlossaryTerm(modelId, term)` — Add glossary term (`POST /api/v1/domain-models/:id/glossary`)

### Public Events

- `ReportIngested` — A new FOE report has been persisted. Carries report ID, overall score, maturity level.
- `DomainModelUpdated` — A domain model or any of its child artifacts has been created, updated, or deleted.

### Relationships

| Direction | Target Context | Pattern | Description |
|-----------|---------------|---------|-------------|
| **Downstream from** | Scanning | Customer-Supplier | Receives and persists reports produced by the scanner |
| **Uses** | Field Guide | Conformist | Web UI renders method links from `MethodReference` data in reports |

### Boundaries

- Does **NOT** run scans — delegates repository analysis entirely to the Scanning context
- Does **NOT** parse Field Guide markdown — consumes pre-built indices and method references embedded in reports
- Does **NOT** enforce governance — stores domain models but governance tracking is in the Governance context

### Ports

| Port | Direction | Implementation |
|------|-----------|----------------|
| `ReportRepository` | Outbound | `SqliteReportRepository` — normalized table decomposition |
| `ScanJobRepository` | Outbound | `SqliteScanJobRepository` — job status tracking |
| `ScanRunner` | Outbound | `DockerScanRunner` — triggers scanner container |
| `Logger` | Outbound | Console logger (injectable) |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/v1/reports` | POST | Ingest a report |
| `/api/v1/reports` | GET | List reports (filterable) |
| `/api/v1/reports/:id` | GET | Get full report |
| `/api/v1/reports/:id/raw` | GET | Get original raw JSON |
| `/api/v1/reports/:id` | DELETE | Delete report |
| `/api/v1/reports/:id/compare/:otherId` | GET | Compare two reports |
| `/api/v1/repositories` | GET | List tracked repositories |
| `/api/v1/repositories/:id` | GET | Repository details |
| `/api/v1/repositories/:id/trend` | GET | Score trend over time |
| `/api/v1/scans` | POST | Trigger a new scan |
| `/api/v1/scans` | GET | List scan jobs |
| `/api/v1/scans/:id` | GET | Get scan job status |
| `/api/v1/domain-models` | POST/GET | Domain model CRUD |
| `/api/v1/domain-models/:id` | GET/DELETE | Domain model detail/delete |
| `/api/v1/domain-models/:id/contexts` | POST | Add bounded context |
| `/api/v1/domain-models/:id/aggregates` | POST | Add aggregate |
| `/api/v1/domain-models/:id/events` | POST | Add domain event |
| `/api/v1/domain-models/:id/value-objects` | POST | Add value object |
| `/api/v1/domain-models/:id/glossary` | POST/GET | Glossary terms |

---

## 4. Governance Context (Generic Subdomain)

### Responsibility

Track road items, capabilities, personas, user stories, ADRs, NFRs, and change entries. Validate governance artifacts via structured markdown frontmatter. Provide the infrastructure for governing domain modeling decisions and tracking the delivery process itself. This is generic delivery infrastructure whose *content* is specific to Katalyst Domain Mapper.

### Core Concepts

- **RoadItem** — A planned unit of work identified by `ROAD-xxx`. Contains title, status, priority, linked capabilities, acceptance criteria. Lives as markdown files in `packages/delivery-framework/roadmap/`.
- **Capability** — A system function that delivers value, identified by `CAP-xxx`. Maps to one or more road items. Lives in `packages/delivery-framework/capabilities/`.
- **Persona** — An actor archetype who interacts with the system, identified by `PER-xxx`. Used in user stories and BDD scenarios. Lives in `packages/delivery-framework/personas/`.
- **UserStory** — A narrative describing a persona's need and expected outcome. Embedded in road items or standalone.
- **ADR** — Architecture Decision Record identified by `ADR-xxx`. Documents a key technical decision with context, decision, and consequences.
- **NFR** — Non-Functional Requirement identified by `NFR-xxx`. Specifies quality attributes (performance, security, accessibility).
- **ChangeEntry** — A record of changes made to the system, identified by `CHANGE-xxx`. Tracks what changed, when, and why.
- **GovernanceSnapshot** — A point-in-time capture of all governance artifact states. Planned for ROAD-002+ to enable compliance auditing.

### Key Aggregates

| Aggregate | Root Entity | Package | Status |
|-----------|-------------|---------|--------|
| **GovernanceSnapshot** | (planned) | `packages/delivery-framework/` | Planned (ROAD-002+) |

### Commands

- `ValidateGovernanceArtifacts()` — Check all markdown frontmatter against expected schemas
- `CreateGovernanceSnapshot()` — Capture current state of all governance artifacts (planned)

### Public Events

- `GovernanceSnapshotCreated` — A new snapshot has been captured (planned for ROAD-002+)

### Relationships

| Direction | Target Context | Pattern | Description |
|-----------|---------------|---------|-------------|
| **Separate ways** | All contexts | Separate Ways | Governance is consumed for compliance but has no runtime coupling |

### Boundaries

- Governance infrastructure **only** — does NOT implement domain features
- Does **NOT** run scans, persist reports, or parse methods
- Markdown-first — all artifacts are markdown files with structured frontmatter, not database records
- Schema validation is structural (frontmatter format), not semantic (business rule enforcement)

---

## Context Integration Patterns

### Customer-Supplier: Scanning → Reporting

The Scanning context is the **upstream supplier** that produces FOE reports. The Reporting context is the **downstream customer** that consumes, persists, and displays them.

- **Integration point**: `IngestReport` use case accepts raw scanner JSON, validates against `FOEReportSchema`, normalizes into relational tables
- **Contract**: `FOEReportSchema` (Zod) is the shared contract. Scanner output MUST validate against this schema.
- **Failure handling**: Invalid reports are rejected with validation errors. The Reporting context never accepts partially valid reports.

### Conformist: Scanning → Field Guide / Reporting → Field Guide

Both Scanning and Reporting conform to Field Guide's data model without negotiation.

- **Integration point**: Pre-built JSON indices (`methods-index.json`, `observations-index.json`) baked into Docker image
- **Contract**: `MethodSchema`, `ObservationSchema`, `MethodsIndexSchema`
- **Direction**: Field Guide defines the schema; consumers conform

### Shared Kernel: @foe/schemas

The `@foe/schemas` package acts as a **shared kernel** across all TypeScript contexts. It defines:
- Scan schemas (`FOEReportSchema`, `DimensionScoreSchema`, etc.)
- Field Guide schemas (`MethodSchema`, `ObservationSchema`, etc.)
- DDD schemas (`DomainModelSchema`, `BoundedContextSchema`, `AggregateSchema`, etc.)

All contexts import from `@foe/schemas` to ensure type consistency at compile time and validation consistency at runtime.

### Separate Ways: Governance

The Governance context operates independently. Its artifacts (markdown files) are consumed by humans and CI checks, but there is no runtime integration with the other contexts. This is intentional — governance should not introduce coupling.

---

## Context-Specific Languages

Each context uses terminology natural to its domain. The same underlying concept may have different names:

| Concept | Scanning | Field Guide | Reporting | Governance |
|---------|----------|-------------|-----------|------------|
| **Top-level entity** | ScanJob | MethodsIndex | FOEReport / DomainModel | GovernanceSnapshot |
| **Scoring concept** | DimensionScore (0–100) | MaturityLevel (hypothesized→proven) | OverallScore (0–100) | ComplianceStatus (pass/fail) |
| **Identity scheme** | ScanJobId (UUID) | Slug (e.g., `M111`, `O157`) | UUID (report, model, context) | Prefix-number (ROAD-xxx, ADR-xxx) |
| **Evidence** | Finding.evidence (string) | Observation (full document) | StoredReport.rawReport (JSON) | ChangeEntry (markdown) |
| **Improvement** | Recommendation | Method | (displays both) | RoadItem |
| **Grouping** | Dimension (3 per report) | FieldGuide (guide → methods) | Repository (repo → scans) | Capability (cap → road items) |
| **Status lifecycle** | queued→running→completed/failed | in-progress→completed | (immutable once ingested) | draft→active→completed |
| **Severity/Priority** | critical/high/medium/low | (maturity levels instead) | (inherits from scan) | immediate/short-term/medium-term |

This language divergence is **intentional**. Each context uses the most natural terminology for its concerns. The `@foe/schemas` shared kernel provides the translation layer where contexts interact.

---

## BDD Test Coverage

Each bounded context has BDD test coverage tracked via Katalyst BDD (`@esimplicity/stack-tests`):

| Bounded Context | Feature Files | Scenarios | Status |
|----------------|---------------|-----------|--------|
| **Scanning** | 2 files | 8 scenarios | Active (API: `03_scans.feature`, `01_scan_governance_scoring.feature`) |
| **Field Guide** | 0 files | 0 scenarios | Planned (CLI tool — no API surface yet) |
| **Reporting** | 13 files | 55 scenarios | Active (API: reports, repositories, dimensions, comparisons, filtering, domain models, streaming; UI: report upload viewer; Hybrid: domain model e2e, SSE e2e) |
| **Governance** | 4 files | 13 scenarios | Active (API: `01_governance_ingest.feature`, `02_governance_coverage.feature`, `03_governance_state_machine.feature`; Hybrid: `01_governance_e2e.feature`) |

**Coverage by test type:**
- **API tests** (`@api`): 24 feature files across all contexts
- **UI tests** (`@ui`): 2 feature files (report upload, examples)
- **Hybrid tests** (`@hybrid`): 7 feature files (domain models, SSE, integrations, governance)

See the [Feature Index](../bdd/feature-index.md) for complete test details.

---

## Related Documentation

### DDD
- [Domain Overview](./domain-overview.md) - Domain vision and scope
- [Ubiquitous Language](./ubiquitous-language.md) - Domain terminology
- [Context Map](./context-map.md) - Visual context relationships

### BDD Testing
- [BDD Overview](../bdd/bdd-overview.md) - Testing approach
- [Feature Index](../bdd/feature-index.md) - Browse all test scenarios

---

**Next**: [Ubiquitous Language](./ubiquitous-language.md)

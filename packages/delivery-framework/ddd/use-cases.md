---
title: Use Cases
---

# Use Cases

Each use case describes a single user intention and how it flows through the system. Use cases are organized by bounded context and reference the actual code implementing them.

---

## Scanning Context

### UC-1: Scan Repository

**Actor**: DevOps Engineer / Tech Lead (via Docker CLI or API)
**Trigger**: `docker run -v $(pwd):/repo -e ANTHROPIC_API_KEY=$KEY katalyst-scanner` or `POST /api/v1/scan-jobs`

**Steps**:
1. Orchestrator agent (`foe-scanner-container.md`) auto-detects tech stack, monorepo structure, and repository name
2. Orchestrator dispatches 5 specialist agents in parallel:
   - `foe-scanner-ci.md` → Feedback dimension (CI/CD pipelines, deployment frequency)
   - `foe-scanner-tests.md` → Feedback + Confidence (test frameworks, coverage, BDD)
   - `foe-scanner-arch.md` → Understanding dimension (architecture patterns, dependencies)
   - `foe-scanner-domain.md` → Understanding dimension (DDD patterns, ubiquitous language)
   - `foe-scanner-docs.md` → Understanding dimension (ADRs, README, API docs)
3. Each agent analyzes the repository and returns YAML findings
4. Orchestrator synthesizes agent results into dimension scores using weighted formulas:
   - `overall = (feedback × 0.35) + (understanding × 0.35) + (confidence × 0.30)`
5. Orchestrator applies cognitive triangle diagnosis (thresholds: U≥35, F≥40, C≥30)
6. Orchestrator emits complete JSON report to stdout

**Postconditions**:
- Valid JSON report conforming to scanner output format (see `foe-scanner-container.md`)
- Report includes: 3 dimension scores, top strengths, top gaps, triangle diagnosis, methodology
- Exit code 0 on success, non-zero on failure

**Code**: `packages/foe-scanner/.opencode/agents/foe-scanner-container.md` (orchestrator), `packages/foe-scanner/Dockerfile`

---

### UC-2: Re-scan Repository

**Actor**: DevOps Engineer / Tech Lead
**Trigger**: Run the scanner again on the same repository (new Docker invocation or new `POST /api/v1/scan-jobs`)

**Steps**:
1. Same as UC-1 — each scan is independent
2. The API's `ensureRepository()` method recognizes the existing repository record by name
3. New report is ingested and associated with the same `repository_id`
4. `lastScannedAt` is updated on the repository record

**Postconditions**:
- New report stored alongside previous reports for the same repository
- Score trend data available via `getScoreTrend(repositoryId)`
- Both reports individually accessible via `GET /api/v1/reports/:id`

**Code**: `packages/foe-api/src/ports/ReportRepository.ts` (`ensureRepository`, `getScoreTrend`), `packages/foe-api/src/adapters/sqlite/ReportRepositorySQLite.ts`

---

## Field Guide Context

### UC-3: Build Indices

**Actor**: Developer (via CLI or Docker build)
**Trigger**: `bun run build` in `foe-field-guide-tools` or Docker multi-stage build stage 1

**Steps**:
1. CLI (`src/cli.ts`) invokes `buildMethodsIndex()` and `buildObservationsIndex()`
2. `buildMethodsIndex()`:
   - Globs all method markdown files from `docs/docs/field-guides/*/methods/**/*.md` and `docs/docs/external-frameworks/*/methods/*.md`
   - Parses each file via `parseMethodFile()` — extracts YAML frontmatter, validates against `MethodSchema`
   - Extracts keywords from title + body via `extractKeywords()` (top 20 per method)
   - Builds reverse indices: `byKeyword`, `byFieldGuide`, `byFramework`, `byObservation`
   - Computes statistics: total methods, by maturity, by field guide, by framework
3. `buildObservationsIndex()`:
   - Globs observation markdown files from `docs/docs/field-guides/observations/**/*.md`
   - Parses via `parseObservationFile()`, validates against `ObservationSchema`
   - Builds reverse indices: `byMethod`, `bySourceType`, `byStatus`
4. Both indices written as JSON files to output directory

**Postconditions**:
- `methods-index.json` — contains 65+ methods, 625+ unique keywords, 7 frameworks
- `observations-index.json` — contains 39+ observations with method cross-references
- All invalid files logged as warnings (parse continues despite individual failures)

**Code**: `packages/foe-field-guide-tools/src/builders/methods-index.ts`, `packages/foe-field-guide-tools/src/builders/observations-index.ts`, `packages/foe-field-guide-tools/src/builders/keywords.ts`

---

### UC-4: Search Methods

**Actor**: Scanner agent or developer
**Trigger**: Agent needs to find FOE methods matching a code pattern, or developer queries the index

**Steps**:
1. Load `methods-index.json` (pre-built, baked into container)
2. Query by one or more of:
   - **Keyword**: Look up `byKeyword[term]` → returns array of `methodId`s
   - **Framework**: Look up `byFramework["dora"]` → returns all DORA methods
   - **Field guide**: Look up `byFieldGuide["testing"]` → returns testing methods
   - **Observation**: Look up `byObservation["O157"]` → returns methods linked to that observation
3. Retrieve full `Method` objects by ID from `methods` dictionary
4. Return matching methods with maturity level, keywords, and observation links

**Postconditions**:
- Matching methods returned with full metadata
- Scanner agents embed `MethodReference` objects in findings and recommendations

**Code**: `packages/foe-schemas/src/field-guide/methods-index.ts` (schema), `packages/foe-field-guide-tools/src/builders/methods-index.ts` (builder)

---

## Reporting Context

### UC-5: Ingest Report

**Actor**: System (scan loop) or API consumer
**Trigger**: `POST /api/v1/reports` with raw JSON body, or scan loop detects completed scan job

**Steps**:
1. `IngestReport.execute(rawData)` receives raw JSON
2. `normalizeReport()` (the Anti-Corruption Layer) attempts two strategies:
   - **Attempt 1**: Parse directly as canonical `FOEReportSchema` (Zod validation)
   - **Attempt 2**: Detect scanner output format (`isScannerFormat()`) and transform via `transformScannerReport()`
3. Transformed report is validated against `FOEReportSchema`
4. `reportRepo.save()` decomposes the aggregate into normalized SQLite tables:
   - `repositories` (upsert via `ensureRepository`)
   - `scans` (report metadata + raw JSON blob)
   - `dimensions` (3 rows)
   - `subscores` (12 rows)
   - `findings` (variable)
   - `strengths` (variable)
   - `recommendations` (variable)
   - `triangleDiagnoses` (1 row)
   - `methodologies` (1 row)
5. Return `{ id, overallScore, maturityLevel }`

**Postconditions**:
- Report persisted in SQLite with full decomposition
- Repository record created or updated
- Report retrievable via `GET /api/v1/reports/:id`

**Code**: `packages/foe-api/src/usecases/report/IngestReport.ts`, `packages/foe-api/src/domain/report/normalize.ts`, `packages/foe-api/src/adapters/sqlite/ReportRepositorySQLite.ts`

---

### UC-6: View Report

**Actor**: Tech Lead / Engineering Manager (via web UI)
**Trigger**: User opens web UI and uploads a JSON report file, or navigates to a persisted report

**Steps**:
1. **Upload path**: User drags JSON file onto `ReportUpload.tsx`
   - File is parsed as JSON
   - Validated client-side against expected structure
   - Passed to `App.tsx` state
2. **API path**: `GET /api/v1/reports/:id` returns the full report
   - `ReportRepositorySQLite.getById()` reconstructs the aggregate from normalized tables
3. Web UI renders:
   - `OverviewCard.tsx` — repository name, overall score, maturity level
   - `DimensionCard.tsx` (×3) — radial charts, subscores, expandable findings
   - `TriangleDiagram.tsx` — SVG cognitive triangle with safe zone overlay
   - `FindingsTable.tsx` — top strengths
   - `GapsTable.tsx` — prioritized gaps with severity
   - `MethodLink.tsx` — links to Field Guide method documentation

**Postconditions**:
- Full report visualization displayed
- Dimensions color-coded: Blue (Feedback), Purple (Understanding), Green (Confidence)
- Recommendations sorted by priority

**Code**: `packages/foe-web-ui/src/components/` (8 components), `packages/foe-api/src/http/routes/v1/reports.ts`

---

### UC-7: Compare Reports

**Actor**: Tech Lead / Engineering Manager
**Trigger**: User selects two reports for the same repository to compare

**Steps**:
1. Load two reports by ID (both must reference the same repository)
2. Calculate deltas for:
   - Overall score
   - Each dimension score (Feedback, Understanding, Confidence)
   - Individual subscores (12 comparisons)
3. Display side-by-side with delta indicators (↑ improved, ↓ regressed, — unchanged)
4. Highlight new gaps that appeared and old gaps that were resolved

**Postconditions**:
- Visual comparison showing score changes over time
- Score trend chart via `getScoreTrend(repositoryId)` shows historical progression

**Current status**: Planned feature. The `getScoreTrend()` port method is defined in `ReportRepository` and returns `ScoreTrendPoint[]` with per-dimension scores. Full UI comparison is a future enhancement (see AGENTS.md "Short-Term" roadmap).

**Code**: `packages/foe-api/src/ports/ReportRepository.ts` (`getScoreTrend`)

---

### UC-8: Manage Domain Model

**Actor**: Domain Expert / Developer (via API or future UI)
**Trigger**: CRUD operations on the DDD workspace

**Steps**:

**Create model**:
1. `POST /api/v1/domain-models` with `{ name, description? }`
2. Generate UUID, set timestamps
3. Return `{ id, name, createdAt }`

**Add bounded context**:
1. `POST /api/v1/domain-models/:id/contexts` with `{ slug, title, responsibility, ... }`
2. Validate parent model exists (404 if not)
3. Insert with generated UUID, cascade FK to parent
4. Return `{ id, slug, title }`

**Add aggregate**:
1. `POST /api/v1/domain-models/:id/aggregates` with `{ contextId, slug, title, rootEntity, entities[], valueObjects[], events[], commands[], invariants[] }`
2. Validate parent model exists
3. Insert with FK to both model and context
4. Return `{ id, slug, title }`

**Add value object / domain event / glossary term**: Similar patterns.

**Get full model**:
1. `GET /api/v1/domain-models/:id`
2. Query all 6 tables (model + 5 entity types) filtered by `domainModelId`
3. Return assembled `DomainModel` with all nested entities

**Delete model**:
1. `DELETE /api/v1/domain-models/:id`
2. Cascade deletes all bounded contexts, aggregates, value objects, events, glossary terms (DB-level cascade)

**Postconditions**:
- Domain model and all nested entities persisted in SQLite
- Full model retrievable as single JSON response
- Cascade delete cleans up all child records

**Code**: `packages/foe-api/src/http/routes/v1/domain-models.ts`, `packages/foe-api/src/db/schema.ts` (tables: `domain_models`, `bounded_contexts`, `aggregates`, `value_objects`, `domain_events`, `glossary_terms`)

---

## Governance Context

### UC-9: Validate Governance Artifacts

**Actor**: Developer / CI pipeline
**Trigger**: Manual CLI run or pre-commit hook

**Steps**:
1. Glob all markdown files in `packages/delivery-framework/`:
   - `roads/*.md` — Road items (features / epics)
   - `adrs/*.md` — Architecture Decision Records (planned)
   - `nfrs/*.md` — Non-Functional Requirements (planned)
   - `capabilities/*.md` — Capability definitions (planned)
   - `changes/*.md` — Change records (planned)
2. For each file, extract YAML frontmatter
3. Validate frontmatter against the corresponding Zod schema
4. Report validation errors with file path and field-level details

**Postconditions**:
- All valid artifacts confirmed
- Invalid artifacts reported with specific validation errors
- Exit code 0 if all pass, non-zero if any fail

**Current status**: Partially implemented. The `foe-field-guide-tools` CLI has a `validate` command for method/observation frontmatter. Governance artifact validation is planned under ROAD-004.

**Code**: `packages/foe-field-guide-tools/src/cli.ts` (`validate` command)

---

### UC-10: Generate Governance Index

**Actor**: Developer / CI pipeline
**Trigger**: `bun run build` or dedicated governance build script (ROAD-004)

**Steps**:
1. Parse all governance artifacts from `packages/delivery-framework/`
2. Extract metadata from frontmatter (title, status, cross-references)
3. Build searchable JSON index with:
   - Artifact listings by type
   - Cross-reference index (which road items link to which ADRs, etc.)
   - Integrity check results
4. Compute `ArtifactCounts` and `IntegrityResult`
5. Write `governance-index.json`

**Postconditions**:
- Single JSON file containing all governance metadata
- Cross-references validated (broken links reported)
- Integrity result indicates pass/fail with violation details

**Current status**: Planned (ROAD-004). The pattern follows `foe-field-guide-tools` — parse markdown, validate, build index.

---

### UC-11: Track Road Item Progress

**Actor**: Product Owner / Tech Lead
**Trigger**: Road item status changes (proposed → approved → implementing → complete)

**Steps**:
1. Edit road item markdown file's frontmatter `status` field
2. Run governance validation (UC-9) to ensure valid status transition
3. Update governance index (UC-10) to reflect new status
4. Future: publish `GovernanceSnapshotCreated` event for dashboard updates

**Postconditions**:
- Road item status updated in markdown source
- Governance index reflects current status
- History of status changes tracked via git commits

**Current status**: Road items exist as markdown files. Status tracking is via manual frontmatter edits and git history. Formal lifecycle enforcement is planned.

---

## Use Case Summary Matrix

| ID | Use Case | Context | Actor | Implemented? |
|----|----------|---------|-------|-------------|
| UC-1 | Scan Repository | Scanning | DevOps Engineer | Yes (Docker) |
| UC-2 | Re-scan Repository | Scanning | DevOps Engineer | Yes (API) |
| UC-3 | Build Indices | Field Guide | Developer | Yes (CLI) |
| UC-4 | Search Methods | Field Guide | Scanner Agent | Yes (JSON index) |
| UC-5 | Ingest Report | Reporting | System / API | Yes |
| UC-6 | View Report | Reporting | Tech Lead | Yes (Web UI) |
| UC-7 | Compare Reports | Reporting | Tech Lead | Partial (trend API exists, UI planned) |
| UC-8 | Manage Domain Model | Reporting | Domain Expert | Yes (API CRUD) |
| UC-9 | Validate Artifacts | Governance | Developer / CI | Partial (methods/observations only) |
| UC-10 | Generate Gov Index | Governance | Developer / CI | Planned (ROAD-004) |
| UC-11 | Track Road Progress | Governance | Product Owner | Manual (git-based) |

# Roadmap next steps

**Session ID:** ses_3b7d26f54ffeEKnTCxbEzj3aXW
**Created:** 2/10/2026, 10:31:11 AM
**Updated:** 2/10/2026, 10:40:38 AM

---

## User

ok whats the next roadmap item?

---

## Assistant (Superpowers-Orchestrator · anthropic/claude-opus-4.6 · 3.9s)



I'll check the roadmap for active items. Let me look at the ROAD files and the roadmap dashboard.

**Tool: glob**

**Input:**
```json
{
  "pattern": "docs/roads/ROAD-*.md"
}
```

**Output:**
```
No files found
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/docs/ROADMAP.mdx"
}
```

**Error:**
```
Error: ENOENT: no such file or directory, scandir '/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/docs'
```

---

## Assistant (Superpowers-Orchestrator · anthropic/claude-opus-4.6 · 3.7s)

Let me search more broadly for roadmap-related files.

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/ROADMAP*"
}
```

**Output:**
```
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/ROADMAP.mdx
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/ROAD-*"
}
```

**Output:**
```
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-016.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-020.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-009.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-005.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-004.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-003.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-002.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-001.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-007.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-008.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-006.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-023.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-022.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-021.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-019.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-018.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-017.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-TEMPLATE.md
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/roads/**"
}
```

**Output:**
```
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-016.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-020.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-009.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-005.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-004.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-003.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-002.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-001.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-007.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-008.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-006.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-023.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-022.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-021.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-019.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-018.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-017.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/_category_.json
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-TEMPLATE.md
/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/index.md
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/docs/**/*.md"
}
```

**Output:**
```
No files found
```

---

## Assistant (Superpowers-Orchestrator · anthropic/claude-opus-4.6 · 64.0s)

Found them in `packages/delivery-framework/roads/`. Let me read the roadmap dashboard and all the ROAD files to find active items.

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/ROADMAP.mdx"
}
```

**Output:**
```
<file>
00001| ---
00002| title: Katalyst Delivery Framework — Roadmap
00003| description: Consolidated roadmap for the governance pipeline, DDD tooling, and delivery framework.
00004| ---
00005| 
00006| # Katalyst Delivery Framework — Roadmap
00007| 
00008| > **Last Updated**: 2026-02-09
00009| > **Total Items**: 23 | **In Progress**: 2 | **Proposed**: 21 | **Complete**: 0
00010| 
00011| Turn this monorepo into a **self-governing delivery framework**. Import governance infrastructure, build Zod-validated schemas, create parsers and CLI tooling, add API endpoints, enhance the scanner, and visualize governance health — all while the framework governs its own development.
00012| 
00013| ---
00014| 
00015| ## Status Legend
00016| 
00017| | Emoji | Status | Description |
00018| |-------|--------|-------------|
00019| | 🚧 | `implementing` | Currently being worked on |
00020| | 🎯 | `proposed` | Requirements defined, not yet started |
00021| | ✅ | `complete` | All governance gates passed |
00022| | 🔄 | `nfr_validating` | Implementation done, validating NFRs |
00023| | ⏸️ | `nfr_blocked` | NFR validation failed, needs fixes |
00024| | 📋 | `adr_validated` | ADRs approved, ready for BDD |
00025| | 📝 | `bdd_pending` | BDD scenarios written, awaiting approval |
00026| | ✏️ | `bdd_complete` | BDD approved, ready for implementation |
00027| 
00028| ---
00029| 
00030| ## Phase 0: Foundation — Import Generic Infrastructure
00031| 
00032| > **Goal**: Bring prima's governance infrastructure into this repo as `packages/delivery-framework/`, with agents at root, using the domain-mapper's own domain as example content.
00033| 
00034| ### [ROAD-001] Import Governance Infrastructure 🚧
00035| **Status**: Implementing
00036| **Priority**: High
00037| **Phase**: 0 — Foundation
00038| **Created**: 2026-02-05
00039| 
00040| Import the generic governance infrastructure from prima-delivery-demonstrator into this monorepo. Establishes the Docusaurus documentation site, React dashboard components, governance scripts, and doc templates.
00041| 
00042| - ✅ 0.1 — Import Docusaurus site, components, scripts, templates
00043| - 🎯 0.2 — Import + genericize 16 agents to `.opencode/agents/`
00044| - 🎯 0.3 — Import + adapt skills to `.opencode/skills/`
00045| - 🎯 0.4 — Create root configs (`opencode.json`, `Justfile`, `agentspec.md`)
00046| - 🎯 0.5 — Populate self-referential example domain content
00047| 
00048| **Dependencies**: None (foundation)
00049| **Enables**: [ROAD-002](#road-002-governance-zod-schemas-), [ROAD-003](#road-003-ddd-artifact-schemas-), [ROAD-007](#road-007-bdd-agent-skills-)
00050| 
00051| ---
00052| 
00053| ## Phase 1: Core Schemas & Skills
00054| 
00055| > **Goal**: Create the canonical Zod validation schemas for all governance and DDD artifact types, and install BDD agent skills. Phases 1 schemas are the foundation that parsers, API, and scanner all build upon.
00056| 
00057| ### [ROAD-002] Governance Zod Schemas 🎯
00058| **Status**: Proposed
00059| **Priority**: High
00060| **Phase**: 1 — Core
00061| **Created**: 2026-02-05
00062| 
00063| Create Zod validation schemas for all 7 governance artifact types in `@foe/schemas`. Replaces hand-written JS validation in prima's `governance-linter.js` with type-safe, runtime-validated schemas.
00064| 
00065| - 🎯 Create `common.ts` — shared enums, ID patterns, priority schema
00066| - 🎯 Create `capability.ts` — CAP-XXX schema with category and tag
00067| - 🎯 Create `persona.ts` — PER-XXX schema with archetypes and technical profile
00068| - 🎯 Create `user-story.ts` — US-XXX schema with persona and capability refs
00069| - 🎯 Create `use-case.ts` — UC-XXX schema with actors and flows
00070| - 🎯 Create `road-item.ts` — ROAD-XXX schema with 8-state machine and governance block
00071| - 🎯 Create `adr.ts` — ADR-XXX schema with status and category
00072| - 🎯 Create `nfr.ts` — NFR-XXX schema with category and threshold
00073| - 🎯 Create `change-entry.ts` — CHANGE-XXX schema with compliance and signatures
00074| - 🎯 Create `governance-index.ts` — GovernanceIndexSchema with reverse indices
00075| - 🎯 Create barrel export `index.ts`
00076| - 🎯 Unit tests for all schemas
00077| 
00078| **Requires**: [ROAD-001](#road-001-import-governance-infrastructure-)
00079| **Enables**: [ROAD-004](#road-004-governance-parsers-index-builder--cli-)
00080| 
00081| **Detailed Plan**: [01-governance-schemas.md](../plans/governance-schemas.md) | **~500 lines, ~10 files**
00082| 
00083| ---
00084| 
00085| ### [ROAD-003] DDD Artifact Schemas 🎯
00086| **Status**: Proposed
00087| **Priority**: High
00088| **Phase**: 1 — Core
00089| **Created**: 2026-02-05
00090| 
00091| Create Zod schemas for 4 DDD artifact types: BoundedContext, Aggregate, ValueObject, and DomainEvent. Formalizes domain model knowledge into validated markdown frontmatter.
00092| 
00093| - 🎯 Create `bounded-context.ts` — slug, responsibility, communication pattern, upstream/downstream
00094| - 🎯 Create `aggregate.ts` — root entity, invariants, commands, events published
00095| - 🎯 Create `value-object.ts` — properties, validation rules, immutability flag
00096| - 🎯 Create `domain-event.ts` — payload schema, source aggregate, subscriber contexts
00097| - 🎯 Create DDD barrel export `ddd/index.ts`
00098| - 🎯 Extend `GovernanceIndexSchema` with DDD collections and reverse indices
00099| - 🎯 Unit tests for all DDD schemas
00100| 
00101| **Requires**: [ROAD-001](#road-001-import-governance-infrastructure-)
00102| **Enables**: [ROAD-004](#road-004-governance-parsers-index-builder--cli-)
00103| 
00104| **Detailed Plan**: [02-ddd-schemas.md](../plans/ddd-schemas.md) | **~300 lines, ~5 files**
00105| 
00106| ---
00107| 
00108| ### [ROAD-007] BDD Agent Skills 🎯
00109| **Status**: Proposed
00110| **Priority**: Medium
00111| **Phase**: 1 — Core
00112| **Created**: 2026-02-05
00113| 
00114| Install 5 OpenCode agent skills for the `@esimplicity/stack-tests` BDD framework. Pure static markdown reference docs that enable agents to write, run, and troubleshoot BDD tests.
00115| 
00116| - 🎯 Create `katalyst-bdd-quickstart/SKILL.md` — setup, running tests, tag system
00117| - 🎯 Create `katalyst-bdd-step-reference/SKILL.md` — complete step catalog (API/UI/TUI/hybrid)
00118| - 🎯 Create `katalyst-bdd-create-test/SKILL.md` — test creation patterns and examples
00119| - 🎯 Create `katalyst-bdd-troubleshooting/SKILL.md` — common errors and debugging
00120| - 🎯 Create `katalyst-bdd-architecture/SKILL.md` — ports & adapters, custom steps
00121| 
00122| **Requires**: None (independent of governance pipeline)
00123| **Enables**: None (standalone reference docs)
00124| 
00125| **Detailed Plan**: [05-katalyst-bdd-skills.md](../plans/katalyst-bdd-skills.md) | **~1,200 lines, ~5 files**
00126| 
00127| ---
00128| 
00129| ## Phase 2: Parsers, Builder & CLI
00130| 
00131| > **Goal**: Build the tooling that transforms validated schemas into a usable governance pipeline. The governance index builder is the critical convergence point — everything downstream depends on it.
00132| 
00133| ### [ROAD-004] Governance Parsers, Index Builder & CLI 🎯
00134| **Status**: Proposed
00135| **Priority**: High
00136| **Phase**: 2 — Parsers & CLI
00137| **Created**: 2026-02-05
00138| 
00139| Extend `@foe/field-guide-tools` with 11 new parsers, a governance index builder with referential integrity validation, and 6 new CLI commands. This is the critical convergence point.
00140| 
00141| - 🎯 Create 11 parsers (capability, persona, user-story, use-case, road-item, adr, nfr, change-entry, bounded-context, aggregate, value-object, domain-event)
00142| - 🎯 Create `governance-index.ts` builder with cross-reference validation
00143| - 🎯 Implement referential integrity checks (orphans, missing targets, circular deps)
00144| - 🎯 Add CLI: `build:governance` — parse all artifacts to `governance-index.json`
00145| - 🎯 Add CLI: `build:all` — build methods + observations + governance indices
00146| - 🎯 Add CLI: `validate:governance` — validate frontmatter without building
00147| - 🎯 Add CLI: `validate:transitions` — check state machine compliance
00148| - 🎯 Add CLI: `coverage:capabilities` — capability-to-feature coverage
00149| - 🎯 Add CLI: `coverage:personas` — persona-to-story coverage
00150| - 🎯 Unit tests for parsers + integration tests for index builder
00151| 
00152| **Requires**: [ROAD-002](#road-002-governance-zod-schemas-), [ROAD-003](#road-003-ddd-artifact-schemas-)
00153| **Enables**: [ROAD-005](#road-005-api-governance-domain-), [ROAD-006](#road-006-scanner-governance-agent-), [ROAD-008](#road-008-delivery-framework-integration-)
00154| 
00155| **Detailed Plan**: [03-parsers-and-builders.md](../plans/parsers-and-builders.md) | **~1,200 lines, ~14 files**
00156| 
00157| ---
00158| 
00159| ## Phase 3: API, Scanner, Visualization & Domain Tooling
00160| 
00161| > **Goal**: Multiple parallel workstreams that consume the governance index: API endpoints, scanner agents, delivery framework integration, SSE streaming, governance dashboards, interactive DDD visualizations, export pipelines, and onboarding. Can all start once Phase 2 is complete.
00162| 
00163| ### [ROAD-005] API Governance Domain 🎯
00164| **Status**: Proposed
00165| **Priority**: Medium
00166| **Phase**: 3 — API & Services
00167| **Created**: 2026-02-05
00168| 
00169| Add governance domain to `@foe/api` (Elysia + SQLite + Drizzle) following hexagonal architecture. Provides REST endpoints for governance snapshot ingestion, trend tracking, and coverage reporting.
00170| 
00171| - 🎯 Create `GovernanceRepository` port interface
00172| - 🎯 Create SQLite adapter with 4 Drizzle tables
00173| - 🎯 Create use cases: IngestSnapshot, QueryState, GetCoverage, GetTrend
00174| - 🎯 Create 9 HTTP endpoints under `/api/v1/governance/*`
00175| - 🎯 Database migration for governance tables
00176| - 🎯 Integration tests for all endpoints
00177| 
00178| **Requires**: [ROAD-004](#road-004-governance-parsers-index-builder--cli-)
00179| **Enables**: [ROAD-009](#road-009-governance--ddd-web-visualization-)
00180| 
00181| **Detailed Plan**: [04-api-governance-domain.md](../plans/api-governance-domain.md) | **~700 lines, ~10 files**
00182| 
00183| ---
00184| 
00185| ### [ROAD-006] Scanner Governance Agent 🎯
00186| **Status**: Proposed
00187| **Priority**: Low
00188| **Phase**: 3 — API & Services
00189| **Created**: 2026-02-05
00190| 
00191| Create `foe-scanner-governance.md` specialist agent for governance health analysis. Update Docker build to bake in `governance-index.json`. Modify orchestrator to dispatch governance as 6th specialist.
00192| 
00193| - 🎯 Create governance agent with 4 subscores (Artifact Completeness, Cross-Reference Integrity, State Machine Compliance, DDD Model Quality)
00194| - 🎯 Update Docker multi-stage build to include governance index
00195| - 🎯 Update orchestrator to dispatch governance agent in parallel
00196| - 🎯 Enhance DDD domain agent to check for formal DDD markdown artifacts
00197| - 🎯 Graceful zero-score when no governance artifacts found
00198| 
00199| **Requires**: [ROAD-004](#road-004-governance-parsers-index-builder--cli-)
00200| **Enables**: None (terminal leaf)
00201| 
00202| **Detailed Plan**: [05-scanner-agents.md](../plans/scanner-agents.md) | **~400 lines, ~2 files**
00203| 
00204| ---
00205| 
00206| ### [ROAD-008] Delivery Framework Integration 🎯
00207| **Status**: Proposed
00208| **Priority**: Medium
00209| **Phase**: 3 — API & Services
00210| **Created**: 2026-02-05
00211| 
00212| Replace hand-written JS governance scripts with `@foe/schemas` + `@foe/field-guide-tools` CLI. Create self-referential domain content. Migrate Docusaurus plugins to consume `governance-index.json`.
00213| 
00214| - 🎯 Create self-referential domain content (~40-60 markdown files)
00215| - 🎯 Create 3 bounded contexts (Scanning, FieldGuide, Reporting)
00216| - 🎯 Create 4-5 aggregates, 5-6 domain events, 6-8 value objects
00217| - 🎯 Create 4-6 capabilities (FOE Report Generation, Governance Validation, etc.)
00218| - 🎯 Update Docusaurus plugins to consume `governance-index.json`
00219| - 🎯 Update Justfile recipes from `node scripts/*.js` to `bunx foe-field-guide` CLI
00220| - 🎯 Deprecate old governance scripts (keep for comparison)
00221| - 🎯 Validate new system output matches old system
00222| 
00223| **Requires**: [ROAD-004](#road-004-governance-parsers-index-builder--cli-)
00224| **Enables**: None (validates the pipeline)
00225| 
00226| **Detailed Plan**: [06-prima-integration.md](../plans/prima-integration.md) | **~200 new lines, ~1,500 deleted**
00227| 
00228| ---
00229| 
00230| ### [ROAD-015] SSE Streaming for Real-time Agent Responses 🎯
00231| **Status**: Proposed
00232| **Priority**: High
00233| **Phase**: 3 — API & Services
00234| **Created**: 2026-02-06
00235| 
00236| Server-Sent Events (SSE) endpoint so the UI can display agent output as it's generated — no waiting for the full response. Eliminates perceived latency during 5-15 minute scans and 30+ second governance validations by streaming incremental results in real-time.
00237| 
00238| - 🎯 Create SSE endpoint `GET /api/v1/stream/:sessionId` with EventSource-compatible protocol
00239| - 🎯 Implement server-side event emitter for agent output chunks (text, status, progress)
00240| - 🎯 Define SSE event types: `agent:chunk`, `agent:status`, `agent:complete`, `agent:error`
00241| - 🎯 Create Elysia SSE plugin/adapter with `Content-Type: text/event-stream` headers
00242| - 🎯 Add reconnection support with `Last-Event-ID` for resumable streams
00243| - 🎯 Create React `useSSE` hook and `EventSourceProvider` component for `@foe/web-ui`
00244| - 🎯 Stream scanner agent output in real-time during FOE assessment
00245| - 🎯 Stream governance validation progress during CLI and API operations
00246| - 🎯 Add SSE connection management (heartbeat keep-alive, timeout, max connections)
00247| - 🎯 Integration tests with SSE client assertions
00248| 
00249| **Requires**: [ROAD-005](#road-005-api-governance-domain-)
00250| **Enables**: Real-time user experience for all long-running operations
00251| **Capabilities**: [CAP-008](#cap-008-real-time-streaming)
00252| **User Stories**: [US-026](#us-026-stream-agent-responses-via-sse), [US-027](#us-027-view-live-agent-progress-in-ui)
00253| **BDD Features**: `api/streaming/01_sse_streaming.feature` (8 scenarios), `hybrid/streaming/01_sse_e2e.feature` (2 scenarios)
00254| 
00255| ---
00256| 
00257| ### [ROAD-009] Governance & DDD Web Visualization 🎯
00258| **Status**: Proposed
00259| **Priority**: Low
00260| **Phase**: 3 — API, Scanner, Visualization & Domain Tooling
00261| **Created**: 2026-02-05
00262| 
00263| Add 2 new report templates to `@foe/web-ui`: a Governance Dashboard (Template 12) and a DDD Context Map (Template 13).
00264| 
00265| - 🎯 Template 12: Governance Dashboard — health summary, road item Kanban, capability coverage matrix, integrity report
00266| - 🎯 Template 13: DDD Context Map — context overview cards, SVG context map, aggregate deep dive, event flow diagram, ubiquitous language glossary
00267| - 🎯 Shared components: `ContextCard.tsx`, `KanbanBoard.tsx`
00268| - 🎯 Governance + DDD color palette extensions in Tailwind
00269| - 🎯 Responsive design (mobile, tablet, desktop) + dark mode
00270| - 🎯 Data from API endpoints or static JSON fallback
00271| 
00272| **Requires**: [ROAD-005](#road-005-api-governance-domain-)
00273| **Enables**: [ROAD-016](#road-016-interactive-context-map-diagram-), [ROAD-017](#road-017-aggregate-tree-hierarchy-view-), [ROAD-018](#road-018-domain-event-flow-visualization-), [ROAD-019](#road-019-application-lifecycle-state-machine-view-), [ROAD-020](#road-020-subdomain-classification-system-), [ROAD-021](#road-021-markdown-documentation-export-), [ROAD-023](#road-023-onboarding--how-it-works-experience-)
00274| 
00275| > **Note**: The DDD visualization scope (Template 13) has been decomposed into 8 focused deliverables. ROAD-009 now focuses on **Template 12 (Governance Dashboard)** and the foundational DDD visualization infrastructure. The focused deliverables (ROAD-016..023) follow immediately in this same phase.
00276| 
00277| **Detailed Plan**: [07-web-visualization.md](../plans/web-visualization.md) | **~2,000 lines, ~4 files**
00278| 
00279| ---
00280| 
00281| ### [ROAD-020] Subdomain Classification System 🚧
00282| **Status**: Implementing
00283| **Priority**: High
00284| **Phase**: 3 — API, Scanner, Visualization & Domain Tooling
00285| **Created**: 2026-02-06
00286| 
00287| Add subdomain type classification (Core/Supporting/Generic) to bounded contexts. API schema extension, UI form controls, color coding across views, and strategic investment guidance.
00288| 
00289| - 🎯 Add `subdomainType` field to bounded context DB schema and API model
00290| - 🎯 Add subdomain type dropdown to context creation/edit forms
00291| - 🎯 Build classification overview card with investment guidance
00292| - 🎯 Integrate color coding in context list
00293| - 🎯 Build-vs-buy recommendation hints
00294| 
00295| **Requires**: [ROAD-009](#road-009-governance--ddd-web-visualization-)
00296| **Enables**: [ROAD-016](#road-016-interactive-context-map-diagram-), [ROAD-021](#road-021-markdown-documentation-export-)
00297| **Capabilities**: [CAP-011](#cap-011-subdomain-classification)
00298| **User Stories**: [US-037](#us-037-classify-bounded-contexts-by-subdomain-type)
00299| 
00300| ---
00301| 
00302| ### [ROAD-016] Interactive Context Map Diagram 🎯
00303| **Status**: Proposed
00304| **Priority**: Critical
00305| **Phase**: 3 — API, Scanner, Visualization & Domain Tooling
00306| **Created**: 2026-02-06
00307| 
00308| SVG-based interactive context map with colored nodes, relationship paths with DDD pattern labels, hover highlighting, click-to-select detail panels, and subdomain-based color coding.
00309| 
00310| - 🎯 Build reusable SVG canvas component with pan/zoom
00311| - 🎯 Implement auto-layout algorithm for context node positioning
00312| - 🎯 Render relationship paths with DDD pattern labels (Customer-Supplier, Conformist, ACL, etc.)
00313| - 🎯 Add hover highlighting (dim unrelated, brighten connected)
00314| - 🎯 Add click-to-select with detail panel (description, relationships, artifact counts)
00315| - 🎯 Color-code by subdomain type (Core=blue, Supporting=green, Generic=gray, External=dark)
00316| - 🎯 Support dark mode and keyboard navigation with ARIA labels
00317| 
00318| **Requires**: [ROAD-009](#road-009-governance--ddd-web-visualization-), [ROAD-020](#road-020-subdomain-classification-system-)
00319| **Enables**: [ROAD-022](#road-022-static-documentation-site-generator-)
00320| **Capabilities**: [CAP-010](#cap-010-interactive-domain-visualization-engine)
00321| **User Stories**: [US-033](#us-033-visualize-context-map-as-interactive-svg-diagram)
00322| 
00323| ---
00324| 
00325| ### [ROAD-017] Aggregate Tree Hierarchy View 🎯
00326| **Status**: Proposed
00327| **Priority**: High
00328| **Phase**: 3 — API, Scanner, Visualization & Domain Tooling
00329| **Created**: 2026-02-06
00330| 
00331| Collapsible tree view for aggregate structure exploration. Shows hierarchical relationships between roots, entities, value objects, and fields with type badges, optional indicators, and hover descriptions.
00332| 
00333| - 🎯 Build recursive tree node component with expand/collapse
00334| - 🎯 Color-coded type badges (Aggregate=blue, Entity=purple, Value Object=green, List=amber)
00335| - 🎯 Inline data type annotations (`: str`, `: UUID`, `: date`)
00336| - 🎯 Optional field indicators and hover descriptions
00337| - 🎯 Expand All / Collapse All controls
00338| - 🎯 Group by bounded context with context headers
00339| - 🎯 Dark mode support
00340| 
00341| **Requires**: [ROAD-009](#road-009-governance--ddd-web-visualization-)
00342| **Enables**: [ROAD-022](#road-022-static-documentation-site-generator-)
00343| **Capabilities**: [CAP-010](#cap-010-interactive-domain-visualization-engine)
00344| **User Stories**: [US-034](#us-034-explore-aggregate-hierarchy-as-collapsible-tree)
00345| 
00346| ---
00347| 
00348| ### [ROAD-018] Domain Event Flow Visualization 🎯
00349| **Status**: Proposed
00350| **Priority**: Medium
00351| **Phase**: 3 — API, Scanner, Visualization & Domain Tooling
00352| **Created**: 2026-02-06
00353| 
00354| Step-by-step event flow timeline with category color coding, sync/async filtering, and click-to-expand detail cards. Includes summary grid of all events.
00355| 
00356| - 🎯 Build horizontal step-based event flow component
00357| - 🎯 Category color coding derived from bounded context association
00358| - 🎯 Filter toggle: All / Synchronous / Asynchronous
00359| - 🎯 Click-to-expand detail panel (trigger, effect, timing, payload, consumers)
00360| - 🎯 Async badge on batch-processed events
00361| - 🎯 Summary grid with all events as clickable chips
00362| - 🎯 Dark mode support
00363| 
00364| **Requires**: [ROAD-009](#road-009-governance--ddd-web-visualization-)
00365| **Enables**: [ROAD-022](#road-022-static-documentation-site-generator-)
00366| **Capabilities**: [CAP-010](#cap-010-interactive-domain-visualization-engine)
00367| **User Stories**: [US-036](#us-036-browse-domain-events-as-flow-timeline)
00368| 
00369| ---
00370| 
00371| ### [ROAD-019] Application Lifecycle State Machine View 🎯
00372| **Status**: Proposed
00373| **Priority**: Medium
00374| **Phase**: 3 — API, Scanner, Visualization & Domain Tooling
00375| **Created**: 2026-02-06
00376| 
00377| SVG state machine visualization for domain workflows with positioned state nodes, transition arrows, sync/async distinction, terminal/error marking, and interactive detail panels. Requires new DomainWorkflow API entity.
00378| 
00379| - 🎯 Design DomainWorkflow API model (states, transitions, sync/async, terminal/error)
00380| - 🎯 Add API endpoints for workflow CRUD
00381| - 🎯 Build SVG state machine renderer with positioned nodes
00382| - 🎯 Solid lines for sync transitions, dashed for async
00383| - 🎯 Terminal/error state badges
00384| - 🎯 Hover highlighting and click detail panels
00385| - 🎯 Dark mode support
00386| 
00387| **Requires**: [ROAD-009](#road-009-governance--ddd-web-visualization-)
00388| **Enables**: [ROAD-022](#road-022-static-documentation-site-generator-)
00389| **Capabilities**: [CAP-010](#cap-010-interactive-domain-visualization-engine)
00390| **User Stories**: [US-035](#us-035-view-application-lifecycle-state-machine)
00391| 
00392| ---
00393| 
00394| ### [ROAD-021] Markdown Documentation Export 🎯
00395| **Status**: Proposed
00396| **Priority**: High
00397| **Phase**: 3 — API, Scanner, Visualization & Domain Tooling
00398| **Created**: 2026-02-06
00399| 
00400| Export the domain model as a downloadable zip of professional-quality markdown documentation files (glossary, subdomains, context-map, bounded-contexts, aggregates, domain-events).
00401| 
00402| - 🎯 Build markdown generation engine for each document type
00403| - 🎯 Generate ASCII art context map diagram
00404| - 🎯 Add "Export as Markdown" button to UI
00405| - 🎯 Generate zip with JSZip (client-side)
00406| - 🎯 Include generated-by header with timestamp
00407| - 🎯 Ensure CommonMark validity with proper heading hierarchy
00408| 
00409| **Requires**: [ROAD-009](#road-009-governance--ddd-web-visualization-), [ROAD-020](#road-020-subdomain-classification-system-)
00410| **Enables**: [ROAD-022](#road-022-static-documentation-site-generator-)
00411| **Capabilities**: [CAP-012](#cap-012-domain-model-export-pipeline)
00412| **User Stories**: [US-038](#us-038-export-domain-model-as-markdown-documentation)
00413| 
00414| ---
00415| 
00416| ### [ROAD-022] Static Documentation Site Generator 🎯
00417| **Status**: Proposed
00418| **Priority**: Medium
00419| **Phase**: 3 — API, Scanner, Visualization & Domain Tooling
00420| **Created**: 2026-02-06
00421| 
00422| Generate a standalone Vite + React + Tailwind site from a domain model with interactive visualizations, deployable to any static host. Capstone feature that combines all visualization components.
00423| 
00424| - 🎯 Create site template project (Vite + React + Tailwind)
00425| - 🎯 Build data injection pipeline (bake domain model JSON into template)
00426| - 🎯 Port visualization components as self-contained, data-driven modules
00427| - 🎯 Add "Generate Site" button to Katalyst UI
00428| - 🎯 Include "How It Was Generated" page
00429| - 🎯 Include deployment instructions (Netlify, Vercel, GitHub Pages)
00430| - 🎯 Ensure build output under 5MB
00431| 
00432| **Requires**: [ROAD-016](#road-016-interactive-context-map-diagram-), [ROAD-017](#road-017-aggregate-tree-hierarchy-view-), [ROAD-018](#road-018-domain-event-flow-visualization-), [ROAD-019](#road-019-application-lifecycle-state-machine-view-), [ROAD-020](#road-020-subdomain-classification-system-), [ROAD-021](#road-021-markdown-documentation-export-)
00433| **Enables**: None (capstone)
00434| **Capabilities**: [CAP-010](#cap-010-interactive-domain-visualization-engine), [CAP-012](#cap-012-domain-model-export-pipeline)
00435| **User Stories**: [US-039](#us-039-generate-standalone-static-documentation-site)
00436| 
00437| ---
00438| 
00439| ### [ROAD-023] Onboarding & How It Works Experience 🎯
00440| **Status**: Proposed
00441| **Priority**: Medium
00442| **Phase**: 3 — API, Scanner, Visualization & Domain Tooling
00443| **Created**: 2026-02-06
00444| 
00445| "How It Works" page explaining the 4-phase Domain Mapper workflow (Intake, Discovery, Facilitation, Documentation), Human-in-the-Loop rationale, output artifacts, and quick-start guidance.
00446| 
00447| - 🎯 Build "How It Works" page with 4-phase visual workflow
00448| - 🎯 Expandable phase detail sections
00449| - 🎯 "Why Human-in-the-Loop?" explanation section
00450| - 🎯 Output artifacts list
00451| - 🎯 Quick-start guidance panel
00452| - 🎯 First-visit banner detection
00453| - 🎯 Add to sidebar navigation
00454| 
00455| **Requires**: [ROAD-009](#road-009-governance--ddd-web-visualization-)
00456| **Enables**: None (standalone UX improvement)
00457| **Capabilities**: [CAP-010](#cap-010-interactive-domain-visualization-engine)
00458| **User Stories**: [US-040](#us-040-view-domain-mapper-onboarding-and-workflow-guide)
00459| 
00460| ---
00461| 
00462| ## Phase 4: Advanced External Integrations
00463| 
00464| > **Goal**: Connect the governance pipeline to external project management and documentation tools for bidirectional data flow. Extend scanner data sources beyond repository analysis.
00465| 
00466| ### [ROAD-010] Jira Bidirectional Integration 🎯
00467| **Status**: Proposed
00468| **Priority**: Medium
00469| **Phase**: 4 — Advanced External Integrations
00470| **Created**: 2026-02-05
00471| 
00472| Bidirectional sync between the governance pipeline and Jira. Import Jira data (issues, sprints, velocity, cycle time) to assess the Feedback dimension, and push governance artifacts (ROAD items, capabilities, user stories) back to Jira for project management tracking.
00473| 
00474| - 🎯 Create Jira REST API client with OAuth 2.0 / API token authentication
00475| - 🎯 Import adapter: pull issues, sprints, velocity, and workflow data
00476| - 🎯 Map Jira issues → governance artifacts (ROAD items, user stories, capabilities)
00477| - 🎯 Export adapter: push ROAD items and user stories as Jira issues
00478| - 🎯 Bidirectional sync engine with conflict resolution strategy
00479| - 🎯 Scanner enhancement: assess Feedback dimension from Jira metrics (cycle time, WIP, deployment frequency)
00480| - 🎯 CLI command: `jira:sync` — run bidirectional sync
00481| - 🎯 CLI command: `jira:import` — one-way import from Jira
00482| - 🎯 Configuration schema for Jira project mapping (`jira-config.json`)
00483| - 🎯 Integration tests with Jira API mocks
00484| 
00485| **Requires**: [ROAD-004](#road-004-governance-parsers-index-builder--cli-), [ROAD-005](#road-005-api-governance-domain-)
00486| **Enables**: Enhanced Feedback dimension scoring with real project data
00487| **Capabilities**: [CAP-005](#cap-005-jira-integration)
00488| **User Stories**: [US-016](#us-016-sync-governance-artifacts-to-jira), [US-017](#us-017-import-jira-metrics-for-scanning)
00489| **BDD Features**: `api/jira/01_jira_sync.feature` (7 scenarios), `hybrid/integrations/01_jira_e2e.feature` (2 scenarios)
00490| 
00491| ---
00492| 
00493| ### [ROAD-011] Confluence Bidirectional Integration 🎯
00494| **Status**: Proposed
00495| **Priority**: Medium
00496| **Phase**: 4 — Advanced External Integrations
00497| **Created**: 2026-02-05
00498| 
00499| Bidirectional sync between the governance pipeline and Confluence. Import Confluence content (wiki pages, ADRs, runbooks, design docs) to assess the Understanding dimension, and publish governance reports, roadmaps, and DDD artifacts back to Confluence for team visibility.
00500| 
00501| - 🎯 Create Confluence REST API client with OAuth 2.0 / API token authentication
00502| - 🎯 Import adapter: pull wiki pages, ADRs, runbooks, and design documentation
00503| - 🎯 Map Confluence pages → governance artifacts (ADRs, documentation coverage metrics)
00504| - 🎯 Export adapter: publish governance dashboard, roadmap, and DDD context maps to Confluence spaces
00505| - 🎯 Bidirectional sync engine with conflict resolution and page versioning
00506| - 🎯 Scanner enhancement: assess Understanding dimension from Confluence content (doc freshness, coverage, quality)
00507| - 🎯 CLI command: `confluence:sync` — run bidirectional sync
00508| - 🎯 CLI command: `confluence:import` — one-way import from Confluence
00509| - 🎯 Configuration schema for Confluence space mapping (`confluence-config.json`)
00510| - 🎯 Integration tests with Confluence API mocks
00511| 
00512| **Requires**: [ROAD-004](#road-004-governance-parsers-index-builder--cli-), [ROAD-005](#road-005-api-governance-domain-)
00513| **Enables**: Enhanced Understanding dimension scoring with real documentation data
00514| **Capabilities**: [CAP-006](#cap-006-confluence-integration)
00515| **User Stories**: [US-018](#us-018-sync-documentation-to-confluence), [US-019](#us-019-import-confluence-content-for-scanning)
00516| **BDD Features**: `api/confluence/01_confluence_sync.feature` (9 scenarios), `hybrid/integrations/01_confluence_e2e.feature` (2 scenarios)
00517| 
00518| ---
00519| 
00520| ### [ROAD-012] GitHub Feedback Integration 🎯
00521| **Status**: Proposed
00522| **Priority**: Medium
00523| **Phase**: 4 — Advanced External Integrations
00524| **Created**: 2026-02-06
00525| 
00526| Import GitHub Actions/CI data to enrich the Feedback dimension: workflow run history, deployment frequency, build times, test results, release cadence, and failure rates. Uses GitHub App + PAT authentication.
00527| 
00528| - 🎯 Create GitHub REST/GraphQL API client with App + PAT authentication
00529| - 🎯 Import adapter: pull Actions workflow runs, timing, and status
00530| - 🎯 Calculate deployment frequency from GitHub Releases + deployment events
00531| - 🎯 Calculate build failure rate and mean time to recovery from workflow data
00532| - 🎯 Import test result artifacts from Actions workflow runs
00533| - 🎯 Scanner enhancement: assess Feedback dimension from GitHub CI metrics
00534| - 🎯 CLI command: `github:import --feedback` — pull CI/deployment data
00535| - 🎯 Configuration schema for GitHub repo/org mapping (`github-config.json`)
00536| - 🎯 Integration tests with GitHub API mocks
00537| 
00538| **Requires**: [ROAD-004](#road-004-governance-parsers-index-builder--cli-), [ROAD-005](#road-005-api-governance-domain-)
00539| **Enables**: Enhanced Feedback dimension scoring with real CI/CD performance data
00540| **Capabilities**: [CAP-007](#cap-007-github-integration)
00541| **User Stories**: [US-020](#us-020-import-github-actions-metrics), [US-021](#us-021-track-deployment-frequency-via-github)
00542| **BDD Features**: `api/github/01_github_feedback.feature` (7 scenarios), `hybrid/integrations/02_github_feedback_e2e.feature` (2 scenarios)
00543| 
00544| ---
00545| 
00546| ### [ROAD-013] GitHub Understanding Integration 🎯
00547| **Status**: Proposed
00548| **Priority**: Medium
00549| **Phase**: 4 — Advanced External Integrations
00550| **Created**: 2026-02-06
00551| 
00552| Import GitHub data to enrich the Understanding dimension: PR descriptions, commit message quality, README/docs presence, repo structure, wiki content, and ADR patterns. Publish governance reports back to GitHub Pages/wiki.
00553| 
00554| - 🎯 Import adapter: pull PR descriptions, review comments, and discussion threads
00555| - 🎯 Assess commit message quality (Conventional Commits, linked issues, clarity)
00556| - 🎯 Assess documentation presence (README, CONTRIBUTING, CHANGELOG, ADRs, wiki)
00557| - 🎯 Map GitHub Issues/Discussions → documentation gaps and knowledge artifacts
00558| - 🎯 Export adapter: publish governance reports to GitHub Pages or wiki
00559| - 🎯 Scanner enhancement: assess Understanding dimension from GitHub docs and PR quality
00560| - 🎯 CLI command: `github:import --understanding` — pull docs/PR data
00561| - 🎯 Integration tests with GitHub API mocks
00562| 
00563| **Requires**: [ROAD-004](#road-004-governance-parsers-index-builder--cli-), [ROAD-005](#road-005-api-governance-domain-)
00564| **Enables**: Enhanced Understanding dimension scoring with GitHub documentation signals
00565| **Capabilities**: [CAP-007](#cap-007-github-integration)
00566| **User Stories**: [US-022](#us-022-import-github-docs-for-scanning), [US-023](#us-023-publish-governance-to-github)
00567| **BDD Features**: `api/github/02_github_understanding.feature` (7 scenarios), `hybrid/integrations/02_github_understanding_e2e.feature` (2 scenarios)
00568| 
00569| ---
00570| 
00571| ### [ROAD-014] GitHub Confidence Integration 🎯
00572| **Status**: Proposed
00573| **Priority**: Medium
00574| **Phase**: 4 — Advanced External Integrations
00575| **Created**: 2026-02-06
00576| 
00577| Import GitHub data to enrich the Confidence dimension: PR review quality, branch protection rules, code scanning/Dependabot alerts, required status checks, and merge policies.
00578| 
00579| - 🎯 Import adapter: pull PR review data (approval rate, review depth, turnaround time)
00580| - 🎯 Assess branch protection rules (required reviews, status checks, signed commits)
00581| - 🎯 Import Dependabot/CodeQL security alerts and resolution metrics
00582| - 🎯 Assess merge policies (squash/merge/rebase, commit signing, linear history)
00583| - 🎯 Calculate code review coverage (% of PRs with substantive reviews)
00584| - 🎯 Scanner enhancement: assess Confidence dimension from GitHub quality gates
00585| - 🎯 CLI command: `github:import --confidence` — pull review/security data
00586| - 🎯 Integration tests with GitHub API mocks
00587| 
00588| **Requires**: [ROAD-004](#road-004-governance-parsers-index-builder--cli-), [ROAD-005](#road-005-api-governance-domain-)
00589| **Enables**: Enhanced Confidence dimension scoring with GitHub quality and security signals
00590| **Capabilities**: [CAP-007](#cap-007-github-integration)
00591| **User Stories**: [US-024](#us-024-import-github-quality-signals), [US-025](#us-025-assess-branch-protection--security)
00592| **BDD Features**: `api/github/03_github_confidence.feature` (7 scenarios), `hybrid/integrations/02_github_confidence_e2e.feature` (2 scenarios)
00593| 
00594| ---
00595| 
00596| ## Dependency Graph
00597| 
00598| ```
00599| Phase 0          Phase 1          Phase 2          Phase 3 (API, Scanner, Viz & Domain Tooling)        Phase 4
00600| ─────────        ──────────       ──────────       ──────────────────────────────────────────────       ──────────
00601| 
00602|                  ┌──────────┐
00603|                  │ ROAD-002 │
00604|                  │ Schemas  │
00605|          ┌──────►│          │──────┐
00606|          │       └──────────┘      │
00607| ┌────────┐│                        │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐
00608| │ROAD-001│┤                        ├─►│ ROAD-004 │─►│ ROAD-005 │─►│ ROAD-009 │─►│  ROAD-020   │
00609| │Import  ││  ┌──────────┐          │  │ Parsers  │  │ API      │  │ Web Viz  │  │  Subdomain  │
00610| │Infra   │├─►│ ROAD-003 │──────────┘  │ CLI      │  └──────────┘  └──────────┘  │  Classif.   │
00611| └────────┘│  │ DDD      │             └──────────┘─┐      │                     └──────┬──────┘
00612|           │  └──────────┘                  │       ├►ROAD-006 Scanner                  │
00613|           │                                │       ├►ROAD-008 Integr.     ┌────────────┼──────────┐
00614|           │  ┌──────────┐                  │       ├►ROAD-015 SSE         ▼            ▼          ▼
00615|           └─►│ ROAD-007 │                  │       │                ┌──────────┐ ┌──────────┐ ┌──────────┐
00616|              │ BDD      │                  │       │                │ ROAD-016 │ │ ROAD-017 │ │ ROAD-021 │
00617|              └──────────┘                  │       │                │ Ctx Map  │ │ Agg Tree │ │ MD Export│
00618|                                            │       │                └────┬─────┘ └────┬─────┘ └────┬─────┘
00619|                                            │       │                     │            │            │
00620|                                            │       │                ┌────┴─────┐ ┌───┴──────┐     │
00621|                                            │       │                │ ROAD-018 │ │ ROAD-019 │     │
00622|                                            │       │                │ Evt Flow │ │ State M. │     │
00623|                                            │       │                └────┬─────┘ └────┬─────┘     │
00624|                                            │       │                     └─────┬──────┘           │
00625|                                            │       │                           ▼                  │
00626|                                            │       │                     ┌──────────┐             │
00627|                                            │       │                     │ ROAD-022 │◄────────────┘
00628|                                            │       │                     │ Static   │
00629|                                            │       │                     │ Site Gen │
00630|                                            │       │                     └──────────┘
00631|                                            │       │
00632|                                            │       │   ┌──────────┐                        ┌──────────┐
00633|                                            │       │   │ ROAD-023 │  Onboarding            │ ROAD-010 │
00634|                                            │       │   │ How It   │  (standalone)           │ Jira     │
00635|                                            │       │   │ Works    │                         └──────────┘
00636|                                            │       │   └──────────┘                        ┌──────────┐
00637|                                            │       │                                       │ ROAD-011 │
00638|                                            │       │                                       │Confluence│
00639|                                            └───────┴──────────────────────────────────────►└──────────┘
00640|                                                                                            ROAD-012..014
00641|                                                                                            (GitHub ×3)
00642| ```
00643| 
00644| ---
00645| 
00646| ## Progressive Release Path
00647| 
00648| Each release swaps one layer of the old system with the new. Domain visualization and export are now integrated into Phase 3 for early delivery:
00649| 
00650| | Release | What Ships | Old System | New System | Agents |
00651| |---------|-----------|------------|------------|--------|
00652| | **0.1.0** | ROAD-001: Import infrastructure | All old scripts + agents running | Schemas exist (scan/field-guide only) | Use old conventions |
00653| | **0.2.0** | ROAD-002 + 003: Governance + DDD schemas | Old scripts still validate | `@foe/schemas/governance` available | No change |
00654| | **0.3.0** | ROAD-004: Parsers + index builder + CLI | Old scripts + new CLI both run in CI | `foe-field-guide build:governance` produces index | Agents start using `validate:governance` |
00655| | **0.4.0** | ROAD-005: API governance endpoints | Old Docusaurus plugins still generate JSON | `POST /api/v1/governance` ingests index | Agents can query API |
00656| | **0.5.0** | ROAD-008: Delivery framework integration | Plugins consume `governance-index.json` | Old plugins replaced | Agents use CLI as primary validation |
00657| | **0.6.0** | Delete old governance scripts + ROAD-015 SSE | Gone | New system is sole authority, real-time streaming | Agents reference CLI/API exclusively, live progress |
00658| | **0.7.0** | ROAD-006 + 009: Scanner + web viz foundation | N/A | Full pipeline: scan → report → governance → viz | Governance agent scores governance health |
00659| | **0.7.1** | ROAD-020: Subdomain classification | N/A | Subdomain types on bounded contexts, color coding | Context map diagram uses subdomain colors |
00660| | **0.8.0** | ROAD-016 + 017: Context map + Aggregate tree | N/A | Interactive SVG context map, collapsible aggregate tree | DDD visualizations replace flat lists |
00661| | **0.8.1** | ROAD-023: Onboarding experience | N/A | How It Works page, quick-start guidance | New user guidance improves adoption |
00662| | **0.9.0** | ROAD-018 + 019: Event flow + State machine | N/A | Event timeline, lifecycle state machine | Full DDD visualization suite |
00663| | **0.10.0** | ROAD-021 + 022: Export pipeline + Static site | N/A | Markdown export, standalone React site generator | Domain docs in git, capstone feature |
00664| | **0.11.0** | ROAD-010: Jira integration | N/A | Bidirectional Jira sync, Feedback dimension from Jira metrics | Agents can import/export Jira issues |
00665| | **0.12.0** | ROAD-011: Confluence integration | N/A | Bidirectional Confluence sync, Understanding dimension from wiki | Agents can import/export Confluence pages |
00666| | **0.13.0** | ROAD-012 + 013 + 014: GitHub integrations | N/A | Feedback + Understanding + Confidence from GitHub | Full GitHub signal integration |
00667| 
00668| ---
00669| 
00670| ## File Count Summary
00671| 
00672| | Phase | ROAD Items | New Files | Adapted Files | Est. Lines |
00673| |-------|-----------|-----------|---------------|------------|
00674| | 0 — Foundation | ROAD-001 | ~75 | ~17 | N/A |
00675| | 1 — Core Schemas | ROAD-002, 003, 007 | ~20 | ~3 | ~2,000 |
00676| | 2 — Parsers & CLI | ROAD-004 | ~14 | ~4 | ~1,200 |
00677| | 3 — API, Scanner, Viz & Domain Tooling | ROAD-005, 006, 008, 009, 015, 016..023 | ~100 | ~15 | ~8,300 |
00678| | 4 — Advanced External Integrations | ROAD-010, 011, 012, 013, 014 | ~35 | ~6 | ~4,200 |
00679| | **Total** | **23** | **~244** | **~45** | **~15,700** |
00680| 
00681| ---
00682| 
00683| ## Key Principles
00684| 
00685| 1. **The old system is the test oracle.** Until deleted, old governance scripts validate that the new system produces equivalent results.
00686| 
00687| 2. **Agents are the canary.** If agents can create valid artifacts using the new tooling, the migration is working.
00688| 
00689| 3. **Progressive, not big-bang.** Each release replaces one piece. Old and new coexist during transition.
00690| 
00691| 4. **Self-referential domain.** The delivery framework governs its own development. ROAD items track the phases of this plan.
00692| 
00693| 5. **Generic by default.** No domain-specific content in the framework itself. The example domain (FOE scanning/reporting) demonstrates the pattern without coupling to it.
00694| 
00695| ---
00696| 
00697| ## Detailed Plan Documents
00698| 
00699| | Document | ROAD Items | Scope |
00700| |----------|-----------|-------|
00701| | [Master Plan](../plans/master-plan.md) | All | Full vision, end state, progressive release path |
00702| | [Governance Mapper Overview](../plans/governance-mapper-overview.md) | All | Architecture, cross-reference model, dependency order |
00703| | [Governance Schemas](../plans/governance-schemas.md) | ROAD-002 | 10 Zod schema files for 7 governance artifact types |
00704| | [DDD Schemas](../plans/ddd-schemas.md) | ROAD-003 | 5 schema files for 4 DDD artifact types |
00705| | [Parsers and Builders](../plans/parsers-and-builders.md) | ROAD-004 | 11 parsers, governance index builder, 6 CLI commands |
00706| | [API Governance Domain](../plans/api-governance-domain.md) | ROAD-005 | API port, adapter, use cases, routes, DB tables |
00707| | [Scanner Agents](../plans/scanner-agents.md) | ROAD-006 | Governance scanner agent, enhanced DDD agent |
00708| | [Katalyst BDD Skills](../plans/katalyst-bdd-skills.md) | ROAD-007 | 5 OpenCode agent skills for BDD testing |
00709| | [Delivery Framework Integration](../plans/prima-integration.md) | ROAD-008 | Progressive migration, self-referential domain |
00710| | [Web Visualization](../plans/web-visualization.md) | ROAD-009 | Governance dashboard + DDD context map templates |
00711| | Jira Integration *(plan TBD)* | ROAD-010 | Bidirectional Jira sync, Feedback dimension enhancement |
00712| | Confluence Integration *(plan TBD)* | ROAD-011 | Bidirectional Confluence sync, Understanding dimension enhancement |
00713| | GitHub Feedback Integration *(plan TBD)* | ROAD-012 | GitHub Actions/CI metrics, deployment frequency, build times |
00714| | GitHub Understanding Integration *(plan TBD)* | ROAD-013 | PR/docs quality, wiki import, governance publishing to GitHub |
00715| | GitHub Confidence Integration *(plan TBD)* | ROAD-014 | PR reviews, branch protection, security alerts |
00716| | SSE Streaming *(plan TBD)* | ROAD-015 | Real-time agent output, React useSSE hook, connection management |
00717| | Interactive Context Map *(plan TBD)* | ROAD-016 | SVG context map with DDD pattern labels, hover/click, subdomain colors |
00718| | Aggregate Tree *(plan TBD)* | ROAD-017 | Collapsible tree view for aggregate hierarchy exploration |
00719| | Domain Event Flow *(plan TBD)* | ROAD-018 | Step-based event flow timeline with category color coding |
00720| | Application Lifecycle State Machine *(plan TBD)* | ROAD-019 | SVG state machine with workflow states, transitions, sync/async |
00721| | Subdomain Classification *(plan TBD)* | ROAD-020 | Core/Supporting/Generic classification for bounded contexts |
00722| | Markdown Documentation Export *(plan TBD)* | ROAD-021 | Export domain model as downloadable markdown zip |
00723| | Static Documentation Site Generator *(plan TBD)* | ROAD-022 | Generate standalone Vite + React + Tailwind site from domain model |
00724| | Onboarding & How It Works *(plan TBD)* | ROAD-023 | 4-phase workflow guide, Human-in-the-Loop rationale, quick-start |
00725| 

(End of file - total 725 lines)
</file>
```

**Tool: task**

**Input:**
```json
{
  "subagent_type": "explore",
  "description": "Find active ROAD items",
  "prompt": "Thoroughness: medium\n\nRead ALL ROAD files in /Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ (ROAD-001 through ROAD-023, skip ROAD-TEMPLATE.md and index.md).\n\nFor each file, extract:\n- ROAD number\n- Title (from frontmatter or heading)\n- Status (look for status field in frontmatter, or emoji indicators like 🚧 In Progress, 🔄 Iterating, ✅ Complete, 📋 Planned, etc.)\n- Phase number\n- Priority\n- Brief description\n\nReturn a structured list of ALL items, clearly highlighting which ones have status 🚧 (in-progress), 🔄 (iterating), or 📋 (planned/ready to start). Sort by status priority: in-progress first, then iterating, then planned."
}
```

**Output:**
```
I have all 17 ROAD files (ROAD-001 through ROAD-009, and ROAD-016 through ROAD-023; there are no ROAD-010 through ROAD-015). Here is the structured list, sorted by status priority:

---

## ROAD Items Inventory (17 total)

### IMPLEMENTING (Active Work) -- 4 items

| ROAD | Title | Phase | Priority | Description |
|------|-------|-------|----------|-------------|
| **ROAD-005** | API Governance Domain | 3 | Medium | Add governance domain to the Elysia API server with REST endpoints for ingesting governance snapshots, querying road item status, and tracking capability coverage trends. Hexagonal architecture with SQLite/Drizzle. |
| **ROAD-009** | Governance & DDD Web Visualization | 3 | Low | Add Governance Dashboard (Template 12) and DDD Context Map (Template 13) to the web UI. Kanban boards, coverage matrices, context maps. 6/6 hybrid BDD tests passing; 10 UI scenarios WIP. |
| **ROAD-016** | Interactive Context Map Diagram | 3 | **Critical** | Interactive SVG-based context map with bounded contexts as colored nodes, curved relationship paths, hover highlighting, click-to-select detail panels, and subdomain-based color coding. |
| **ROAD-020** | Subdomain Classification System | 3 | High | Add subdomain type classification (Core/Supporting/Generic) to bounded contexts with API schema extension, UI form controls, and color coding. 6/6 BDD tests passing; implementation complete across 12 files. |

### PROPOSED (Planned / Ready to Start) -- 9 items

| ROAD | Title | Phase | Priority | Description |
|------|-------|-------|----------|-------------|
| **ROAD-017** | Aggregate Tree Hierarchy View | 3 | High | Collapsible tree view for exploring aggregate structure: roots, entities, value objects, fields with data types, optional indicators, and hover descriptions. |
| **ROAD-021** | Markdown Documentation Export | 3 | High | Export pipeline generating a downloadable zip of professional DDD documentation (glossary, subdomains, context-map, bounded-contexts, aggregates, domain-events) from API data. |
| **ROAD-007** | BDD Agent Skills | 1 | Medium | Install 5 OpenCode agent skills as `.opencode/skills/` markdown files for the `@esimplicity/stack-tests` BDD framework (quickstart, step reference, test creation, troubleshooting, architecture). |
| **ROAD-008** | Delivery Framework Integration | 3 | Medium | Replace hand-written JS governance scripts with `@foe/schemas` + `@foe/field-guide-tools` CLI pipeline. Dogfood the governance system on itself with self-referential domain content. |
| **ROAD-018** | Domain Event Flow Visualization | 3 | Medium | Step-by-step event flow timeline with category color coding, sync/async filtering, click-to-expand detail cards, and summary grid. |
| **ROAD-019** | Application Lifecycle State Machine View | 3 | Medium | SVG state machine visualization for domain workflows with positioned state nodes, transition arrows, sync/async distinction, terminal/error marking. Requires new API entity `DomainWorkflow`. |
| **ROAD-022** | Static Documentation Site Generator | 3 | Medium | Generate a standalone Vite + React + Tailwind documentation site from a domain model, pre-populated with all DDD data and interactive visualizations. Downloadable zip. |
| **ROAD-023** | Onboarding & How It Works Experience | 3 | Medium | "How It Works" page explaining the 4-phase workflow, Human-in-the-Loop approach, output artifacts, and quick-start guide for new users. |
| **ROAD-006** | Scanner Governance Agent | 3 | Low | New `foe-scanner-governance.md` specialist agent assessing governance health as the 6th scanner agent. Four subscores: Artifact Completeness, Cross-Reference Integrity, State Machine Compliance, DDD Model Quality. |

### COMPLETE -- 4 items

| ROAD | Title | Phase | Priority | Description |
|------|-------|-------|----------|-------------|
| **ROAD-001** | Import Governance Infrastructure | 0 | High | Import generic governance infrastructure from prima-delivery-demonstrator: Docusaurus site, 16 React components, 6 governance scripts, 27 doc templates, OpenCode agents & skills. |
| **ROAD-002** | Governance Zod Schemas | 1 | High | 10 Zod validation schemas for governance artifact types (capabilities, personas, user stories, use cases, road items, ADRs, NFRs, change entries). 543 lines across 16 files. |
| **ROAD-003** | DDD Artifact Schemas | 1 | High | Zod schemas for 4 DDD artifact types: BoundedContext, Aggregate, ValueObject, DomainEvent with cross-reference IDs using slugs. |
| **ROAD-004** | Governance Parsers, Index Builder & CLI | 2 | High | 11 governance/DDD parsers, governance index builder with referential integrity validation, 6 new CLI commands. 1,583 lines; 93/93 files valid. |

---

## Summary Statistics

| Status | Count | ROADs |
|--------|-------|-------|
| **Implementing** | 4 | 005, 009, 016, 020 |
| **Proposed** | 9 | 006, 007, 008, 017, 018, 019, 021, 022, 023 |
| **Complete** | 4 | 001, 002, 003, 004 |

**Notes:**
- ROAD-010 through ROAD-015 do not exist (numbering gap).
- No items have the "iterating" status. The status values used are: `complete`, `implementing`, and `proposed`.
- ROAD-020 has status `implementing` but its governance checklist shows implementation as complete with 6/6 BDD tests passing -- it may be effectively done and just not formally marked `complete`.
- ROAD-016 is the only item marked **critical** priority.
- All implementing items are in Phase 3. All complete items are in Phases 0-2, showing a clear progression.

<task_metadata>
session_id: ses_3b7d230b8ffeeuv08UW5M29uJL
</task_metadata>
```

---

## Assistant (Superpowers-Orchestrator · anthropic/claude-opus-4.6 · 209.2s)

Here's the current state of your roadmap:

---

## 📊 Roadmap Status

### ✅ Complete (Phase 0-2 done!)
| ROAD | Title | Phase |
|------|-------|-------|
| ROAD-001 | Import Governance Infrastructure | 0 |
| ROAD-002 | Governance Zod Schemas | 1 |
| ROAD-003 | DDD Artifact Schemas | 1 |
| ROAD-004 | Governance Parsers, Index Builder & CLI | 2 |

### 🚧 Implementing (4 active)
| # | ROAD | Title | Priority | Notes |
|---|------|-------|----------|-------|
| 1 | **ROAD-016** | Interactive Context Map Diagram | **🔴 Critical** | SVG context map with DDD patterns, hover/click |
| 2 | **ROAD-020** | Subdomain Classification System | **High** | 6/6 BDD tests passing — may be nearly done |
| 3 | **ROAD-005** | API Governance Domain | Medium | Elysia + SQLite REST endpoints |
| 4 | **ROAD-009** | Governance & DDD Web Visualization | Low | Dashboard + context map foundation |

### 🎯 Proposed (next up)
| ROAD | Title | Priority |
|------|-------|----------|
| ROAD-017 | Aggregate Tree Hierarchy View | High |
| ROAD-021 | Markdown Documentation Export | High |
| ROAD-007 | BDD Agent Skills | Medium |
| ROAD-008 | Delivery Framework Integration | Medium |

---

**ROAD-016 (Interactive Context Map)** is the highest-priority active item (marked **Critical**). **ROAD-020** looks close to completion with all BDD tests passing.

**Tool: question**

**Input:**
```json
{
  "questions": [
    {
      "question": "Which roadmap item would you like to work on?",
      "header": "Select ROAD Item",
      "options": [
        {
          "label": "ROAD-016 (Recommended)",
          "description": "Interactive Context Map Diagram — Critical priority, currently implementing"
        },
        {
          "label": "ROAD-020",
          "description": "Subdomain Classification — 6/6 BDD passing, may just need final gates to complete"
        },
        {
          "label": "ROAD-005",
          "description": "API Governance Domain — Medium priority, implementing"
        },
        {
          "label": "ROAD-009",
          "description": "Governance & DDD Web Visualization — Foundation for other items"
        },
        {
          "label": "ROAD-017",
          "description": "Aggregate Tree Hierarchy View — Next proposed, High priority"
        }
      ]
    }
  ]
}
```

**Output:**
```
User has answered your questions: "Which roadmap item would you like to work on?"="ROAD-016 (Recommended)". You can now continue with the user's answers in mind.
```

---

## Assistant (Superpowers-Orchestrator · anthropic/claude-opus-4.6 · 7.1s)

Great choice! **ROAD-016: Interactive Context Map Diagram** — the critical-priority item. Let me kick off the full orchestration workflow.

Starting by loading the required skills and reading the ROAD-016 details in parallel.

**Tool: skill**

**Input:**
```json
{
  "name": "superpowers-integration"
}
```

**Output:**
```
<skill_content name="superpowers-integration">
# Skill: superpowers-integration

# Superpowers + Domain Agents Integration

This skill bridges **Superpowers development methodology** with **specialized domain agents**.

## The Dual-Loop System

### Outer Loop: Superpowers Methodology
Provides structure, planning, and quality gates.

### Inner Loop: Domain Specialists
Provide deep expertise in DDD, architecture, and BDD testing.

```
SUPERPOWERS (Methodology Layer)
├── /superpowers:brainstorm → Design refinement with BDD/TDD mindset
├── /superpowers:write-plan → Break into tasks, assign to domain agents
└── /superpowers:execute-plan → Orchestrate with checkpoints

        ↓

DOMAIN AGENTS (Implementation Layer)
├── bdd-writer → Create BDD scenarios (RED phase)
├── code-writer → Implement features (GREEN phase)
├── architecture-inspector → Verify hexagonal compliance
├── ddd-aligner → Check domain alignment
├── bdd-runner → Execute tests (REFACTOR phase)
└── ci-runner → Full quality check
```

## When to Use This Integration

**ALWAYS use for:**
- New roadmap items (ROAD-XXX)
- Feature implementation
- Refactoring existing code
- Adding new bounded contexts
- Complex bug fixes

**MANDATORY - NEVER SKIP:**
- The brainstorm phase (catches design issues early)
- BDD scenario creation before implementation
- **Architecture review after domain layer implementation - NO EXCEPTIONS**
- **Architecture review after full implementation - NO EXCEPTIONS**
- **@architecture-inspector MUST PASS before proceeding to next phase**
- CI checks before completion

## Architecture Rules - NO BYPASS ALLOWED

### 🚫 ABSOLUTE PROHIBITIONS

**These are HARD STOPS - If violated, the workflow CANNOT proceed:**

1. **Domain Layer Purity**
   - Domain layer MUST NOT import infrastructure (database, HTTP clients, external APIs)
   - Domain layer MUST NOT have direct I/O operations
   - Domain layer MUST be 100% pure TypeScript/JavaScript
   - **VIOLATION = STOP. Fix before proceeding.**

2. **Dependency Direction**
   - Dependencies can ONLY flow inward: UI → Application → Domain
   - Domain layer has NO dependencies on outer layers
   - Application layer has NO dependencies on infrastructure
   - **VIOLATION = STOP. Refactor before proceeding.**

3. **Required Architecture Review**
   - @architecture-inspector MUST be invoked after domain layer
   - @architecture-inspector MUST be invoked after full implementation
   - If inspector finds violations, workflow STOPS until fixed
   - **NEVER "just move on" with architecture violations**

4. **Mandatory Ports & Adapters**
   - All external interactions MUST go through ports (interfaces)
   - Infrastructure MUST implement adapter pattern
   - Direct calls to database from application/domain are FORBIDDEN
   - **VIOLATION = STOP. Create proper ports before proceeding.**

### ✅ Architecture Checklist (MUST ALL PASS)

Before proceeding past any checkpoint:

- [ ] Domain layer has zero infrastructure imports
- [ ] All dependencies point inward only
- [ ] Repository interfaces (ports) defined in domain/application
- [ ] Infrastructure implements repository adapters
- [ ] No circular dependencies between layers
- [ ] Domain entities have no ORM/database annotations
- [ ] Value objects are immutable
- [ ] Aggregate roots enforce invariants

**If any item is unchecked → STOP. Fix before proceeding.**

## The Complete Workflow

### Phase 1: Design & Planning (Superpowers)

#### Step 1: Brainstorm
```
Command: /superpowers:brainstorm
```

**What happens:**
- Interactive design refinement
- Explores alternatives
- Validates assumptions
- Considers BDD scenarios

**Agent behavior:**
- Main agent engages in Socratic questioning
- References AGENT.md for project constraints
- Thinks about testability from the start
- Considers domain boundaries

**Output:**
- Design document saved
- Clear acceptance criteria
- BDD scenario outline
- Domain boundaries identified

**When complete:**
→ Proceed to Write Plan

#### Step 2: Write Implementation Plan
```
Command: /superpowers:write-plan
```

**What happens:**
- Breaks work into 2-5 minute tasks
- Assigns tasks to domain agents
- Defines verification steps
- Includes exact file paths

**Task assignment strategy:**

| Task Type | Assigned Agent | Order | Blocking? |
|-----------|---------------|-------|-----------|
| BDD Scenarios | bdd-writer | 1st (always) | Yes - must pass before coding |
| Domain Layer | code-writer | 2nd | Yes - must pass arch review |
| **Architecture Review** | **architecture-inspector** | **2a** | **🚫 HARD STOP if violations** |
| Application Layer | code-writer | 3rd | Yes - must pass arch review |
| **Architecture Review** | **architecture-inspector** | **3a** | **🚫 HARD STOP if violations** |
| Infrastructure | code-writer | 4th | Yes - must pass arch review |
| **Architecture Review** | **architecture-inspector** | **4a** | **🚫 HARD STOP if violations** |
| Domain Alignment | ddd-aligner | 5th | Yes |
| Test Execution | bdd-runner | 6th | Yes |
| CI Checks | ci-runner | 7th | Yes |

**Note:** Architecture Review runs MULTIPLE times (after each layer) and is **ALWAYS a blocking checkpoint**. If violations are found, the workflow **STOPs** until fixed.

**Output:**
- Detailed implementation plan
- Task-to-agent mapping
- Verification checkpoints

**When complete:**
→ Proceed to Execute Plan

### Phase 2: Implementation (Domain Agents)

#### Step 3: Execute Plan with Superpowers
```
Command: /superpowers:execute-plan
```

**What happens:**
- Executes tasks in batches
- Coordinates domain agents
- Human checkpoints at key stages
- TDD/BDD enforcement

**The Inner Loop (Per Task):**

```
For each task in plan:
    1. Dispatch relevant domain agent
    2. Agent performs work
    3. Two-stage review (spec + code quality)
    4. ARCHITECTURE REVIEW (MANDATORY for code tasks)
       - @architecture-inspector checks hexagonal compliance
       - If violations found → STOP, fix violations
       - NO EXCEPTIONS, NO BYPASSING
    5. Checkpoint: Human approval to continue?
    6. If yes → next task
    7. If no → revise and retry
```

**CRITICAL: Architecture Inspection is NOT Optional**

After EVERY domain layer task and EVERY infrastructure task:
1. @architecture-inspector MUST run
2. All architecture rules MUST pass
3. If violations exist, workflow STOPS
4. @code-writer fixes violations
5. @architecture-inspector re-verifies
6. Only then can workflow continue

**Specific Agent Invocation:**

**BDD Scenarios (Task 1 - ALWAYS FIRST):**
```
@bdd-writer create BDD scenarios for [feature] based on design document
```
- Creates `.feature` files
- Defines Gherkin scenarios
- Asks permission before creating

**Domain Implementation (Tasks 2-4):**
```
@code-writer implement [feature] following DDD/Hexagonal patterns
- Start with domain layer
- Create/update aggregates
- Add value objects if needed
- Then application services
- Finally infrastructure (database adapters)
```

**Architecture Review (Task 5) - MANDATORY BLOCKING CHECKPOINT:**
```
@architecture-inspector verify hexagonal compliance for [feature]
- Check ports & adapters
- Verify dependency direction
- Ensure domain purity
- **MUST PASS before proceeding to Task 6**
- **NO BYPASS ALLOWED - If violations found, STOP and fix**
```

**If @architecture-inspector finds violations:**
1. Workflow STOPS immediately
2. Violations are reported to user
3. @code-writer fixes the violations
4. @architecture-inspector re-verifies
5. Only continue after ALL violations resolved

**Domain Alignment (Task 6):**
```
@ddd-aligner check domain model alignment for [feature]
- Verify ubiquitous language
- Check aggregate boundaries
- Validate domain events
```

**Test Execution (Task 7):**
```
@bdd-runner run BDD tests for [feature]
- Execute all scenarios
- Report failures
- Coordinate fixes if needed
```

**CI Validation (Task 8):**
```
@ci-runner run full CI suite
- Lint check
- TypeScript typecheck
- All tests
- Format verification
```

**When complete:**
→ Feature is fully implemented and tested

### Phase 3: Completion

#### Step 4: Finish Branch
```
Command: /superpowers:finish-branch
```

**What happens:**
- Verifies all tests pass
- Presents merge options (merge/PR/keep/discard)
- Cleans up worktree
- Updates documentation

**Agent responsibilities:**
- Main agent coordinates final checks
- ci-runner confirms everything passes
- site-keeper ensures servers stable

**Documentation updates:**
- Update ROADMAP.md status
- Add CHANGELOG.md entry
- Update relevant DDD docs

## Workflow Examples

### Example 1: Implement ROAD-035 (Advertisement Bot)

**Step 1: Brainstorm**
```
/superpowers:brainstorm

Discussion points:
- What channels should the bot support? (Discord, Twitter, forums)
- How to avoid spam detection?
- What metrics to track?
- Integration with ROAD-036 tracker?
- Authentication for bot accounts?
```

**Step 2: Write Plan**
```
/superpowers:write-plan

Plan output:
Task 1: Create BDD scenarios for advertisement bot
  → @bdd-writer
  
Task 2: Design AdvertisementBot aggregate
  → @code-writer (domain layer)
  
Task 3: Create application service for bot operations
  → @code-writer (application layer)
  
Task 4: Implement database infrastructure
  → @code-writer (infrastructure layer)
  
Task 5: Create UI components for bot management
  → @code-writer (UI layer)
  
Task 6: Verify hexagonal architecture
  → @architecture-inspector
  
Task 7: Check domain alignment
  → @ddd-aligner
  
Task 8: Run BDD tests
  → @bdd-runner
  
Task 9: Run CI checks
  → @ci-runner
```

**Step 3: Execute**
```
/superpowers:execute-plan

Checkpoint 1: After BDD scenarios (human approves?)
Checkpoint 2: After domain layer (human approves?)
Checkpoint 3: After full implementation (human approves?)
Checkpoint 4: After all reviews pass (human approves?)
```

**Step 4: Finish**
```
/superpowers:finish-branch

Options:
- Merge to main
- Create PR
- Keep branch
- Discard
```

### Example 2: Bug Fix with BDD

**Scenario:** Test failure in promise settlement

**Step 1: Investigate (No brainstorm needed for bugs)**
```
@bdd-runner identify failing test
```

**Step 2: Plan**
```
/superpowers:write-plan

Task 1: Analyze test failure root cause
  → Main agent
  
Task 2: Fix domain logic
  → @code-writer
  
Task 3: Fix infrastructure if needed
  → @code-writer
  
Task 4: Verify architecture still valid
  → @architecture-inspector
  
Task 5: Re-run tests
  → @bdd-runner
  
Task 6: Run CI
  → @ci-runner
```

**Step 3: Execute**
```
/superpowers:execute-plan
```

### Example 3: Quick UI Enhancement

**Scenario:** Add loading spinner to button

**Decision:** Skip Superpowers (too small)

**Direct execution:**
```
@code-writer add loading spinner to ReportUploadButton
- Add isLoading prop
- Show spinner when loading
- Disable button during loading
- Update tests
```

**When to skip Superpowers:**
- Pure UI changes (no business logic)
- Single file modifications
- Documentation updates
- Configuration changes
- < 10 minutes of work

## Decision Trees

### When to Use Full Superpowers Workflow?

```
Is this a new feature?
├── YES → Use Superpowers
│   └── Does it touch domain logic?
│       ├── YES → Definitely use Superpowers
│       └── NO (pure UI) → Can skip brainstorm
│
└── NO (bug fix/enhancement)
    ├── Does it require BDD scenario changes?
    │   ├── YES → Use Superpowers
    │   └── NO
    │       └── Is it complex (>30 min)?
    │           ├── YES → Use Superpowers
    │           └── NO → Direct agent execution
    │
    └── Is it a hotfix?
        └── YES → Fast track (bdd-runner → code-writer → ci-runner)
```

### Which Agent for Which Task?

```
Task involves...
├── Writing BDD scenarios
│   └── @bdd-writer
│
├── Implementing domain logic
│   ├── Domain layer (aggregates, value objects)
│   ├── Application layer (services)
│   ├── Infrastructure (database adapters)
│   └── UI components (React)
│   └── @code-writer
│
├── Verifying architecture
│   ├── Hexagonal compliance
│   ├── Dependency direction
│   └── Ports & adapters
│   └── @architecture-inspector
│
├── Checking domain model
│   ├── Ubiquitous language
│   ├── Aggregate boundaries
│   └── Domain events
│   └── @ddd-aligner
│
├── Running tests
│   ├── BDD tests
│   ├── Unit tests
│   └── Test reports
│   └── @bdd-runner
│
└── CI/Quality checks
    ├── Lint
    ├── Typecheck
    ├── Format
    └── @ci-runner
```

## TDD/BDD Alignment

### The RED-GREEN-REFACTOR Cycle

**SUPERPOWERS enforces:**
1. **RED** - Write failing test first (bdd-writer)
2. **GREEN** - Write minimal code to pass (code-writer)
3. **REFACTOR** - Improve while keeping tests green (code-writer + inspectors)

**Agent coordination:**

**RED Phase:**
```
@bdd-writer create scenario:
  Scenario: Bot sends advertisement
    Given a registered advertisement bot
    When the bot sends an advertisement to "discord"
    Then the advertisement is recorded
    And the bot's last activity timestamp is updated
```

**GREEN Phase:**
```
@code-writer implement:
  1. Create AdvertisementSent event
  2. Add sendAdvertisement method to AdvertisementBot aggregate
  3. Implement AdvertisementService
  4. Create infrastructure adapter
  5. Minimal code to make test pass
```

**REFACTOR Phase:**
```
@architecture-inspector:
  - "Domain layer has no infrastructure imports ✓"
  - "Ports properly defined ✓"
  - "Dependency direction correct ✓"

@ddd-aligner:
  - "Ubiquitous language consistent ✓"
  - "AdvertisementBot aggregate boundaries correct ✓"
  - "Domain event naming matches glossary ✓"

@code-writer:
  - Extract helper methods
  - Improve naming
  - Add JSDoc comments
  - Keep tests passing
```

### BDD Scenario Quality

**bdd-writer should create scenarios that are:**
- **Independent** - Each scenario can run alone
- **Repeatable** - Same result every time
- **Readable** - Clear Given/When/Then structure
- **Focused** - Tests one thing per scenario
- **Domain-aligned** - Uses ubiquitous language

**Before implementation starts:**
- All scenarios should fail (RED)
- Feature file reviewed and approved
- Edge cases identified

## Quality Gates

### Mandatory Checkpoints - NO BYPASS

**🚫 HARD RULE: If a checkpoint fails, workflow STOPS until resolved.**

1. **After BDD Scenarios**
   - [ ] Scenarios reviewed by human?
   - [ ] Ubiquitous language correct?
   - [ ] Edge cases covered?
   - **Must pass before writing domain code**

2. **After Domain Layer - ARCHITECTURE BLOCKING CHECKPOINT**
   - [ ] Aggregates enforce invariants?
   - [ ] Value objects immutable?
   - [ ] **Domain layer has NO infrastructure imports?**
   - [ ] **Dependencies point inward only?**
   - [ ] **@architecture-inspector approved?**
   - **🚫 STOP HERE if any unchecked. NO EXCEPTIONS.**
   - **Must pass before application layer work**

3. **After Application Layer**
   - [ ] Services use repository ports (not implementations)?
   - [ ] No direct infrastructure calls?
   - [ ] **@architecture-inspector re-approved?**
   - **🚫 STOP HERE if any unchecked.**
   - **Must pass before infrastructure layer work**

4. **After Infrastructure Layer - FINAL ARCHITECTURE CHECK**
   - [ ] All external calls go through adapters?
   - [ ] Repository implementations properly isolated?
   - [ ] **@architecture-inspector final approval?**
   - **🚫 STOP HERE if any unchecked.**
   - **Must pass before testing**

5. **After Full Implementation**
   - [ ] All scenarios pass?
   - [ ] @ddd-aligner verified?
   - [ ] Code review complete?

6. **Before Merge**
   - [ ] All tests pass?
   - [ ] CI green?
   - [ ] Documentation updated?
   - [ ] Changelog entry added?

### Architecture Violation Consequences

**If @architecture-inspector finds violations:**
- Workflow immediately halts
- User is notified of all violations
- @code-writer must refactor to fix violations
- @architecture-inspector must re-verify and PASS
- Only then can workflow continue

**Common violations that trigger STOP:**
- Domain layer imports from database modules or infrastructure
- Application layer creates database connections directly
- Infrastructure layer is accessed without adapter pattern
- Dependencies flow outward (Domain → Application is forbidden)
- Missing repository ports in domain/application layers

### Automation

**Superpowers automatically:**
- Creates worktrees for isolation
- Runs tests between tasks
- Checks for regressions
- Manages checkpoints

**Domain agents ensure:**
- DDD principles followed
- Architecture compliant
- Tests comprehensive
- Code quality high

## Common Patterns

### Pattern 1: Multi-Context Feature

**Example:** Jira integration needs both `governance` and new `jira-sync` context.

**Workflow:**
```
/superpowers:brainstorm
  ↓
Identify two bounded contexts needed
  ↓
/superpowers:write-plan
  ↓
Task 1: Define jira-sync context boundaries (@ddd-aligner)
Task 2: Create shared kernel if needed (@code-writer)
Task 3: Implement governance changes (@code-writer)
Task 4: Implement jira-sync context (@code-writer)
Task 5: Create anti-corruption layer (@code-writer)
Task 6: Write cross-context BDD (@bdd-writer)
...
```

### Pattern 2: Breaking Change

**Example:** Changing aggregate structure

**Workflow:**
```
/superpowers:brainstorm
  ↓
Migration strategy discussion
  ↓
/superpowers:write-plan
  ↓
Task 1: Create migration BDD (@bdd-writer)
Task 2: Implement new aggregate (@code-writer)
Task 3: Add migration script (@code-writer)
Task 4: Verify backwards compatibility (@bdd-runner)
Task 5: Data migration test (@bdd-runner)
...
```

### Pattern 3: Spike/Prototype

**Example:** Exploring new technology

**Workflow:**
```
/superpowers:brainstorm
  ↓
Quick exploration (1-2 hours max)
  ↓
Decision: Keep or discard?
  ↓
If keep → Full workflow
If discard → /superpowers:finish-branch → discard
```

## Troubleshooting

### Agent Not Responding

**Check:**
1. Is agent defined in `opencode.json`?
2. Is `.opencode/agents/{name}.md` present?
3. Correct @mention syntax?

### Superpowers Commands Not Working

**Check:**
1. Superpowers installed? (`ls ~/.config/opencode/superpowers`)
2. Plugin symlinked? (`ls -l ~/.config/opencode/plugins/`)
3. Skills symlinked? (`ls -l ~/.config/opencode/skills/`)
4. Restarted OpenCode?

### Tests Failing Unexpectedly

**Debug flow:**
```
@bdd-runner report failures
  ↓
Main agent analyzes
  ↓
If domain issue → @code-writer fix
If test issue → @bdd-writer fix
If server issue → @site-keeper fix
  ↓
@bdd-runner re-run
  ↓
@ci-runner final check
```

### Architecture Violations - STOP AND FIX

**⚠️ CRITICAL: Architecture violations are HARD STOPS. You cannot bypass them.**

**Common violations that STOP the workflow:**
- Domain layer importing infrastructure (database, HTTP clients, external APIs)
- Missing repository ports (interfaces)
- Direct database calls in domain or application layers
- Dependencies pointing outward (violating hexagonal architecture)
- Infrastructure leaking into domain logic

**Mandatory Fix Flow - NO EXCEPTIONS:**
```
@architecture-inspector identify violations
  ↓
🚫 WORKFLOW STOPS - Cannot proceed with violations
  ↓
User reviews violations
  ↓
@code-writer MUST refactor to fix ALL violations
  ↓
Move logic to proper layer
Create missing ports
Extract adapters
Remove infrastructure imports from domain
  ↓
@architecture-inspector re-verify
  ↓
✅ ALL violations must be resolved before continuing
```

**NEVER:**
- "Just skip the architecture review this once"
- "We'll fix it later"
- "It's just a small violation"
- "It works, so it's fine"

**ALWAYS:**
- Fix violations immediately when found
- Verify with @architecture-inspector after fixes
- Only proceed after explicit approval

## Best Practices

### 1. Always Start with BDD

**Why:** Tests define the contract and behavior upfront.

**How:**
- Never write code before BDD scenarios
- bdd-writer creates scenarios first
- All scenarios should fail (RED phase)

### 2. Keep Tasks Small

**Why:** Easier to review, faster feedback, less risk.

**Target:** 2-5 minutes per task

**Signs tasks are too big:**
- Takes >15 minutes
- Touches >5 files
- Multiple responsibilities

### 3. Review Early and Often

**Why:** Catches issues before they compound.

**Checkpoints:**
- After BDD (human review)
- After domain layer (architecture review)
- After implementation (domain review)
- Before merge (CI review)

### 4. Document as You Go

**Why:** Keeps docs in sync with code.

**What to update:**
- ROADMAP.md (status changes)
- CHANGELOG.md (every change)
- DDD docs (domain changes)
- AGENT.md (workflow changes)

### 5. Use Skills for Complex Patterns

**Why:** Consistency and expertise.

**When to load skills:**
```
Before implementing complex domain logic:
  use skill tool to load clean-ddd-hexagonal

Before creating new BDD tests:
  use skill tool to load superpowers-integration

Before debugging:
  use skill tool to load systematic-debugging
```

## Command Reference

### Superpowers Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/superpowers:brainstorm` | Interactive design | Starting new feature |
| `/superpowers:write-plan` | Create task plan | After brainstorm |
| `/superpowers:execute-plan` | Execute with checkpoints | After plan approval |
| `/superpowers:finish-branch` | Complete and merge | After all tasks |

### Domain Agent Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `@bdd-writer` | Create BDD scenarios | Always first |
| `@code-writer` | Implement features | After BDD |
| `@architecture-inspector` | Verify architecture | After implementation |
| `@ddd-aligner` | Check domain model | After implementation |
| `@bdd-runner` | Run tests | After code complete |
| `@ci-runner` | Full CI suite | Before merge |
| `@site-keeper` | Manage servers | Server issues |
| `@ux-ui-inspector` | UI review | UI changes |

### Just Commands

| Command | Purpose |
|---------|---------|
| `just dev-all` | Start development |
| `just test` | Run unit tests |
| `just bdd-test` | Run BDD tests |
| `just check` | Lint + typecheck + test |
| `just bdd-roadmap ROAD-XXX` | Test specific feature |

## Migration from Old Workflow

### If You Were Using Direct Agent Calls

**Before:**
```
@code-writer implement feature X
```

**After:**
```
/superpowers:brainstorm
/superpowers:write-plan
/superpowers:execute-plan
```

**Benefits:**
- Better planning
- Consistent TDD/BDD
- Quality gates
- Documentation enforced

### If You Were Using Manual TDD

**Before:**
```
Write tests manually
Write code manually
Refactor manually
```

**After:**
```
@bdd-writer creates tests
@code-writer implements
@architecture-inspector + @ddd-aligner review
```

**Benefits:**
- Agent expertise
- Consistent patterns
- Automated quality checks
- Faster iteration

## Summary

**This integration gives you:**
1. **Structure** - Superpowers methodology
2. **Expertise** - Specialized domain agents
3. **Quality** - TDD/BDD enforcement
4. **Speed** - Parallel agent execution
5. **Safety** - Multiple review checkpoints

**Remember:**
- Superpowers = The "how" (methodology)
- Domain Agents = The "what" (implementation)
- Always use both together for best results
- Never skip BDD scenarios before coding
- **🚫 NEVER bypass architecture checks - they are HARD STOPS**
- **Domain purity is non-negotiable**
- **@architecture-inspector MUST PASS before proceeding**
- Always run full CI before merging

**Architecture Enforcement - ZERO TOLERANCE:**
1. Domain layer imports infrastructure? → **STOP and fix**
2. Missing repository ports? → **STOP and create**
3. Dependencies flow outward? → **STOP and refactor**
4. @architecture-inspector finds violations? → **STOP and resolve ALL**
5. **No exceptions. No bypassing. No "we'll fix it later."

**When in doubt:**
1. Load this skill: `use skill tool to load superpowers-integration`
2. Start with brainstorm: `/superpowers:brainstorm`
3. Follow the workflow
4. Trust the process

---

**Version**: 1.0.0
**Last Updated**: 2026-01-31
**Compatible With**: Superpowers v4.1+, OpenCode latest

Base directory for this skill: file:///Users/aaron.west/Documents/Projects/katalyst-domain-mapper/.opencode/skills/superpowers-integration
Relative paths in this skill (e.g., scripts/, reference/) are relative to this base directory.
Note: file list is sampled.

<skill_files>

</skill_files>
</skill_content>
```

**Tool: skill**

**Input:**
```json
{
  "name": "clean-ddd-hexagonal"
}
```

**Output:**
```
<skill_content name="clean-ddd-hexagonal">
# Skill: clean-ddd-hexagonal

# Clean Architecture + DDD + Hexagonal

Backend architecture combining DDD tactical patterns, Clean Architecture dependency rules, and Hexagonal ports/adapters for maintainable, testable systems.

## When to Use (and When NOT to)

| Use When | Skip When |
|----------|-----------|
| Complex business domain with many rules | Simple CRUD, few business rules |
| Long-lived system (years of maintenance) | Prototype, MVP, throwaway code |
| Team of 5+ developers | Solo developer or small team (1-2) |
| Multiple entry points (API, CLI, events) | Single entry point, simple API |
| Need to swap infrastructure (DB, broker) | Fixed infrastructure, unlikely to change |
| High test coverage required | Quick scripts, internal tools |

**Start simple. Evolve complexity only when needed.** Most systems don't need full CQRS or Event Sourcing.

## CRITICAL: The Dependency Rule

Dependencies point **inward only**. Outer layers depend on inner layers, never the reverse.

```
Infrastructure → Application → Domain
   (adapters)     (use cases)    (core)
```

**Violations to catch:**
- Domain importing database/HTTP libraries
- Controllers calling repositories directly (bypassing use cases)
- Entities depending on application services

**Design validation:** "Create your application to work without either a UI or a database" — Alistair Cockburn. If you can run your domain logic from tests with no infrastructure, your boundaries are correct.

## Quick Decision Trees

### "Where does this code go?"

```
Where does it go?
├─ Pure business logic, no I/O           → domain/
├─ Orchestrates domain + has side effects → application/
├─ Talks to external systems              → infrastructure/
├─ Defines HOW to interact (interface)    → port (domain or application)
└─ Implements a port                      → adapter (infrastructure)
```

### "Is this an Entity or Value Object?"

```
Entity or Value Object?
├─ Has unique identity that persists → Entity
├─ Defined only by its attributes    → Value Object
├─ "Is this THE same thing?"         → Entity (identity comparison)
└─ "Does this have the same value?"  → Value Object (structural equality)
```

### "Should this be its own Aggregate?"

```
Aggregate boundaries?
├─ Must be consistent together in a transaction → Same aggregate
├─ Can be eventually consistent                 → Separate aggregates
├─ Referenced by ID only                        → Separate aggregates
└─ >10 entities in aggregate                    → Split it
```

**Rule:** One aggregate per transaction. Cross-aggregate consistency via domain events (eventual consistency).

## Directory Structure

```
src/
├── domain/                    # Core business logic (NO external dependencies)
│   ├── {aggregate}/
│   │   ├── entity              # Aggregate root + child entities
│   │   ├── value_objects       # Immutable value types
│   │   ├── events              # Domain events
│   │   ├── repository          # Repository interface (DRIVEN PORT)
│   │   └── services            # Domain services (stateless logic)
│   └── shared/
│       └── errors              # Domain errors
├── application/               # Use cases / Application services
│   ├── {use-case}/
│   │   ├── command             # Command/Query DTOs
│   │   ├── handler             # Use case implementation
│   │   └── port                # Driver port interface
│   └── shared/
│       └── unit_of_work        # Transaction abstraction
├── infrastructure/            # Adapters (external concerns)
│   ├── persistence/           # Database adapters
│   ├── messaging/             # Message broker adapters
│   ├── http/                  # REST/GraphQL adapters (DRIVER)
│   └── config/
│       └── di                  # Dependency injection / composition root
└── main                        # Bootstrap / entry point
```

## DDD Building Blocks

| Pattern | Purpose | Layer | Key Rule |
|---------|---------|-------|----------|
| **Entity** | Identity + behavior | Domain | Equality by ID |
| **Value Object** | Immutable data | Domain | Equality by value, no setters |
| **Aggregate** | Consistency boundary | Domain | Only root is referenced externally |
| **Domain Event** | Record of change | Domain | Past tense naming (`OrderPlaced`) |
| **Repository** | Persistence abstraction | Domain (port) | Per aggregate, not per table |
| **Domain Service** | Stateless logic | Domain | When logic doesn't fit an entity |
| **Application Service** | Orchestration | Application | Coordinates domain + infra |

## Anti-Patterns (CRITICAL)

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Anemic Domain Model** | Entities are data bags, logic in services | Move behavior INTO entities |
| **Repository per Entity** | Breaks aggregate boundaries | One repository per AGGREGATE |
| **Leaking Infrastructure** | Domain imports DB/HTTP libs | Domain has ZERO external deps |
| **God Aggregate** | Too many entities, slow transactions | Split into smaller aggregates |
| **Skipping Ports** | Controllers → Repositories directly | Always go through application layer |
| **CRUD Thinking** | Modeling data, not behavior | Model business operations |
| **Premature CQRS** | Adding complexity before needed | Start with simple read/write, evolve |
| **Cross-Aggregate TX** | Multiple aggregates in one transaction | Use domain events for consistency |

## Implementation Order

1. **Discover the Domain** — Event Storming, conversations with domain experts
2. **Model the Domain** — Entities, value objects, aggregates (no infra)
3. **Define Ports** — Repository interfaces, external service interfaces
4. **Implement Use Cases** — Application services coordinating domain
5. **Add Adapters last** — HTTP, database, messaging implementations

**DDD is collaborative.** Modeling sessions with domain experts are as important as the code patterns.

## Reference Documentation

| File | Purpose |
|------|---------|
| [references/LAYERS.md](references/LAYERS.md) | Complete layer specifications |
| [references/DDD-STRATEGIC.md](references/DDD-STRATEGIC.md) | Bounded contexts, context mapping |
| [references/DDD-TACTICAL.md](references/DDD-TACTICAL.md) | Entities, value objects, aggregates (pseudocode) |
| [references/HEXAGONAL.md](references/HEXAGONAL.md) | Ports, adapters, naming |
| [references/CQRS-EVENTS.md](references/CQRS-EVENTS.md) | Command/query separation, events |
| [references/TESTING.md](references/TESTING.md) | Unit, integration, architecture tests |
| [references/CHEATSHEET.md](references/CHEATSHEET.md) | Quick decision guide |

## Sources

### Primary Sources
- [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) — Robert C. Martin (2012)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) — Alistair Cockburn (2005)
- [Domain-Driven Design: The Blue Book](https://www.domainlanguage.com/ddd/blue-book/) — Eric Evans (2003)
- [Implementing Domain-Driven Design](https://openlibrary.org/works/OL17392277W) — Vaughn Vernon (2013)

### Pattern References
- [CQRS](https://martinfowler.com/bliki/CQRS.html) — Martin Fowler
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) — Martin Fowler
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html) — Martin Fowler (PoEAA)
- [Unit of Work](https://martinfowler.com/eaaCatalog/unitOfWork.html) — Martin Fowler (PoEAA)
- [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html) — Martin Fowler
- [Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html) — microservices.io
- [Effective Aggregate Design](https://www.dddcommunity.org/library/vernon_2011/) — Vaughn Vernon

### Implementation Guides
- [Microsoft: DDD + CQRS Microservices](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/)
- [Domain Events](https://udidahan.com/2009/06/14/domain-events-salvation/) — Udi Dahan

Base directory for this skill: file:///Users/aaron.west/Documents/Projects/katalyst-domain-mapper/.opencode/skills/clean-ddd-hexagonal
Relative paths in this skill (e.g., scripts/, reference/) are relative to this base directory.
Note: file list is sampled.

<skill_files>
<file>/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/.opencode/skills/clean-ddd-hexagonal/references/CQRS-EVENTS.md</file>
<file>/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/.opencode/skills/clean-ddd-hexagonal/references/HEXAGONAL.md</file>
<file>/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/.opencode/skills/clean-ddd-hexagonal/references/LAYERS.md</file>
<file>/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/.opencode/skills/clean-ddd-hexagonal/references/TESTING.md</file>
<file>/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/.opencode/skills/clean-ddd-hexagonal/references/CHEATSHEET.md</file>
<file>/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/.opencode/skills/clean-ddd-hexagonal/references/DDD-TACTICAL.md</file>
<file>/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/.opencode/skills/clean-ddd-hexagonal/references/DDD-STRATEGIC.md</file>
</skill_files>
</skill_content>
```

**Tool: skill**

**Input:**
```json
{
  "name": "test-driven-development"
}
```

**Output:**
```
<skill_content name="test-driven-development">
# Skill: test-driven-development

# Test-Driven Development (TDD)

TDD is a software development discipline where tests are written before the production code. It produces clean, well-designed code through rapid feedback cycles.

## The Three Laws of TDD

1. **You may not write production code until you have written a failing unit test.**
2. **You may not write more of a unit test than is sufficient to fail, and not compiling is failing.**
3. **You may not write more production code than is sufficient to pass the currently failing test.**

## The RED-GREEN-REFACTOR Cycle

```
    ┌─────────────────────────────────────────┐
    │                                         │
    ▼                                         │
┌───────┐      ┌───────┐      ┌───────────┐  │
│  RED  │ ───▶ │ GREEN │ ───▶ │ REFACTOR  │──┘
└───────┘      └───────┘      └───────────┘
 Write a        Write the      Improve the
 failing        minimum        code while
 test           code to        keeping tests
                pass           green
```

### RED Phase: Write a Failing Test

**Goal:** Define the expected behavior before implementation.

**Rules:**
- Write the test FIRST
- Test should fail for the right reason (not syntax errors)
- Test exactly ONE behavior
- Use descriptive test names that explain intent

**Example:**
```typescript
// RED: Test what we want, not what we have
describe('AdvertisementBot', () => {
  it('should send advertisement to specified channel', async () => {
    const bot = AdvertisementBot.create({
      name: 'TestBot',
      ownerId: 'user-123',
    });

    const result = bot.sendAdvertisement({
      channel: 'discord',
      message: 'Check out our marketplace!',
    });

    expect(result.isSuccess()).toBe(true);
    expect(bot.lastActivity).toBeDefined();
  });
});
```

**Run the test.** It should fail. If it passes, either:
- The behavior already exists (don't write duplicate code)
- The test is wrong (fix it)

### GREEN Phase: Make It Pass

**Goal:** Write the minimum code to make the test pass.

**Rules:**
- Do the simplest thing that works
- It's OK to hardcode values initially
- Don't add functionality the test doesn't require
- Avoid over-engineering

**Example:**
```typescript
// GREEN: Minimum code to pass
class AdvertisementBot {
  private _lastActivity?: Date;

  get lastActivity() {
    return this._lastActivity;
  }

  static create(props: { name: string; ownerId: string }) {
    return new AdvertisementBot();
  }

  sendAdvertisement(props: { channel: string; message: string }) {
    this._lastActivity = new Date();
    return { isSuccess: () => true };
  }
}
```

**Run the test.** It should pass. If it doesn't, you have a bug—fix it.

### REFACTOR Phase: Clean Up

**Goal:** Improve code quality without changing behavior.

**Rules:**
- Tests must stay green throughout refactoring
- Remove duplication
- Improve naming
- Extract methods/classes as needed
- Apply design patterns where appropriate

**What to refactor:**
- Duplicate code
- Long methods
- Poor naming
- Missing abstractions
- Hardcoded values from GREEN phase

**Example:**
```typescript
// REFACTOR: Proper domain model
class AdvertisementBot extends AggregateRoot<BotId> {
  private readonly name: BotName;
  private readonly ownerId: UserId;
  private lastActivity?: Timestamp;

  private constructor(props: AdvertisementBotProps) {
    super(props.id);
    this.name = props.name;
    this.ownerId = props.ownerId;
  }

  static create(props: CreateBotProps): Result<AdvertisementBot> {
    const nameResult = BotName.create(props.name);
    if (nameResult.isFailure()) {
      return Result.fail(nameResult.error);
    }

    return Result.ok(new AdvertisementBot({
      id: BotId.generate(),
      name: nameResult.value,
      ownerId: UserId.from(props.ownerId),
    }));
  }

  sendAdvertisement(command: SendAdvertisementCommand): Result<void> {
    // Validate channel
    const channelResult = Channel.create(command.channel);
    if (channelResult.isFailure()) {
      return Result.fail(channelResult.error);
    }

    // Record activity
    this.lastActivity = Timestamp.now();

    // Raise domain event
    this.addDomainEvent(new AdvertisementSent({
      botId: this.id,
      channel: channelResult.value,
      sentAt: this.lastActivity,
    }));

    return Result.ok();
  }
}
```

**Run all tests.** They must still pass.

## TDD Cycle Timing

| Phase | Time | Focus |
|-------|------|-------|
| RED | 1-2 min | Define behavior |
| GREEN | 1-5 min | Make it work |
| REFACTOR | 2-10 min | Make it right |

**Target:** Complete a full cycle in 10-15 minutes max.

If a cycle takes longer:
- The test is too big (split it)
- You're implementing too much (smaller steps)
- You're refactoring too much (defer some to later cycles)

## Test Qualities (F.I.R.S.T.)

Good tests are:

| Quality | Meaning | Why It Matters |
|---------|---------|----------------|
| **F**ast | Tests run quickly (<100ms each) | Fast feedback enables rapid iteration |
| **I**ndependent | Tests don't depend on each other | Can run in any order, parallelize |
| **R**epeatable | Same result every time | No flaky tests, deterministic |
| **S**elf-validating | Pass/fail without manual checking | Automation requires binary results |
| **T**imely | Written before production code | TDD discipline, design feedback |

## Test Naming Conventions

Use descriptive names that explain the scenario:

```typescript
// PATTERN: should_[expected]_when_[condition]
'should reject registration when name is empty'
'should calculate discount when order exceeds threshold'
'should emit event when status changes'

// PATTERN: [method]_[scenario]_[expected]
'register_withEmptyName_throwsValidationError'
'calculateDiscount_orderAboveThreshold_applies10Percent'

// PATTERN: Given_When_Then (BDD style)
'given valid bot credentials, when registering, then bot is created'
```

## Test Structure (Arrange-Act-Assert)

Every test follows this pattern:

```typescript
it('should calculate total with tax', () => {
  // ARRANGE: Set up the test scenario
  const order = Order.create({
    items: [{ price: 100, quantity: 2 }],
    taxRate: 0.1,
  });

  // ACT: Execute the behavior under test
  const total = order.calculateTotal();

  // ASSERT: Verify the expected outcome
  expect(total).toBe(220); // 200 + 10% tax
});
```

**Keep each section focused:**
- ARRANGE: Only what's needed for this test
- ACT: Single operation being tested
- ASSERT: Single logical assertion (may be multiple `expect` calls)

## What to Test

### DO Test:
- Public behavior (methods, functions)
- Edge cases and boundaries
- Error conditions
- State transitions
- Domain invariants

### DON'T Test:
- Private methods directly (test through public interface)
- External libraries (they have their own tests)
- Trivial getters/setters (unless they have logic)
- Implementation details (refactoring will break tests)

## TDD Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Test After** | Writing tests after code | Stop. Write the test first. |
| **Too Big Steps** | Testing complex behavior in one go | Smaller, incremental tests |
| **Liar Tests** | Tests that pass but don't verify anything | Assert meaningful behavior |
| **Fragile Tests** | Tests break when implementation changes | Test behavior, not implementation |
| **Slow Tests** | Tests take too long to run | Mock external deps, optimize setup |
| **Test Duplication** | Same behavior tested multiple times | Remove duplicates, use parameterized tests |
| **Insufficient Assertions** | Test passes but behavior is wrong | Assert all relevant outcomes |
| **Setup Heavy** | 50 lines of setup, 1 line of test | Extract test helpers, simplify domain |

## TDD with BDD

TDD and BDD work together:

```
BDD (Outer Loop)              TDD (Inner Loop)
┌────────────────┐            ┌────────────────┐
│ Feature file   │ ──────────▶│ Unit tests     │
│ (Gherkin)      │            │ (TDD cycle)    │
│                │            │                │
│ Given/When/Then│ ──────────▶│ RED            │
│                │            │ GREEN          │
│                │            │ REFACTOR       │
└────────────────┘            └────────────────┘
```

**BDD defines WHAT** the system should do (acceptance criteria).
**TDD defines HOW** the code implements it (unit-level behavior).

### Integration with Domain Agents

```
@bdd-writer → Creates BDD scenarios (acceptance tests)
     ↓
@code-writer → Implements using TDD (unit tests)
     ↓
@bdd-runner → Verifies BDD scenarios pass
```

## TDD Decision Tree

```
Starting new feature?
├─ Yes → Write failing acceptance test (BDD)
│        └─ Then TDD the implementation
│
└─ No, fixing a bug?
   ├─ Yes → Write failing test that reproduces bug
   │        └─ Then fix using TDD (test fails → passes)
   │
   └─ No, refactoring?
      └─ Ensure tests exist
         └─ If not, write characterization tests first
            └─ Then refactor with safety net
```

## Test Doubles

Use test doubles to isolate the unit under test:

| Type | Purpose | Example |
|------|---------|---------|
| **Stub** | Provide canned responses | `stub.getUser = () => testUser` |
| **Spy** | Record calls for verification | `expect(spy).toHaveBeenCalledWith(...)` |
| **Mock** | Stub + Spy + expectations | Pre-programmed expectations |
| **Fake** | Working implementation (simplified) | In-memory database |
| **Dummy** | Placeholder, never used | Required param but not relevant |

**Prefer:**
1. Real objects (when fast and deterministic)
2. Fakes (for external dependencies)
3. Stubs (for simple canned responses)
4. Mocks (sparingly, for interaction testing)

## When NOT to Use TDD

TDD may not be ideal for:

- **Exploratory/spike code**: Throw-away prototypes
- **UI layouts**: Visual design is iterative
- **Trivial code**: Simple getters, configuration
- **External integrations**: Test at integration level instead

**But even then:** Write tests after to prevent regression.

## TDD Workflow Commands

| Phase | Command | Agent |
|-------|---------|-------|
| Define acceptance | Write .feature files | @bdd-writer |
| RED | Write failing unit test | @code-writer |
| GREEN | Implement minimum code | @code-writer |
| REFACTOR | Clean up code | @code-writer |
| Verify | Run all tests | @bdd-runner |
| Quality | Check architecture | @architecture-inspector |

## Quick Reference

### Starting TDD Cycle
```
1. Pick smallest behavior to implement
2. Write test that fails
3. Run test, see it fail (RED)
4. Write simplest code to pass
5. Run test, see it pass (GREEN)
6. Clean up code and tests
7. Run all tests (REFACTOR)
8. Repeat
```

### Test File Organization
```
src/
├── domain/bot/
│   └── AdvertisementBot.ts
└── __tests__/domain/bot/
    └── AdvertisementBot.test.ts
```

### Checklist Before Commit
- [ ] All tests pass
- [ ] Each test has clear intent (readable name)
- [ ] No skipped tests
- [ ] No console.log in tests
- [ ] Tests run in isolation
- [ ] Tests run fast (<5s for unit suite)

## Sources

- [Test-Driven Development by Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530) — Kent Beck (2002)
- [The Three Laws of TDD](https://blog.cleancoder.com/uncle-bob/2014/12/17/TheCyclesOfTDD.html) — Robert C. Martin
- [TDD is Dead. Long Live Testing.](https://dhh.dk/2014/tdd-is-dead-long-live-testing.html) — DHH (counter-perspective)
- [Is TDD Dead?](https://martinfowler.com/articles/is-tdd-dead/) — Fowler, Beck, DHH (discussion series)
- [Growing Object-Oriented Software, Guided by Tests](http://www.growing-object-oriented-software.com/) — Freeman & Pryce

---

**Version**: 1.0.0
**Last Updated**: 2026-01-31
**Compatible With**: All domain agents

Base directory for this skill: file:///Users/aaron.west/Documents/Projects/katalyst-domain-mapper/.opencode/skills/test-driven-development
Relative paths in this skill (e.g., scripts/, reference/) are relative to this base directory.
Note: file list is sampled.

<skill_files>

</skill_files>
</skill_content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-016.md"
}
```

**Output:**
```
<file>
00001| ---
00002| id: ROAD-016
00003| title: "Interactive Context Map Diagram"
00004| status: implementing
00005| phase: 3
00006| priority: critical
00007| created: "2026-02-06"
00008| updated: "2026-02-10"
00009| owner: ""
00010| tags: [web-ui, visualization, ddd, context-map, svg]
00011| governance:
00012|   adrs:
00013|     validated: false
00014|     ids: []
00015|     validated_by: ""
00016|     validated_at: ""
00017|   bdd:
00018|     status: draft
00019|     feature_files: []
00020|     scenarios: 0
00021|     passing: 0
00022|   nfrs:
00023|     applicable: [NFR-PERF-001, NFR-A11Y-001]
00024|     status: pending
00025|     results: {}
00026| dependencies:
00027|   requires: [ROAD-009, ROAD-020]
00028|   enables: [ROAD-022]
00029| ---
00030| 
00031| # ROAD-016: Interactive Context Map Diagram
00032| 
00033| ## Summary
00034| 
00035| Build an interactive SVG-based context map diagram for the Domain Mapper UI. Bounded contexts render as colored nodes positioned on a canvas, with curved connection paths showing DDD relationship patterns. Supports hover highlighting, click-to-select with detail panels, and subdomain-based color coding.
00036| 
00037| ## Business Value
00038| 
00039| The context map is the signature DDD visualization. Currently the Katalyst UI shows bounded contexts as a flat list of cards (US-029). This transforms it into a spatial diagram that communicates system topology at a glance — the single most impactful visual for stakeholders, architects, and new team members.
00040| 
00041| ## Acceptance Criteria
00042| 
00043| 1. SVG canvas renders bounded contexts as positioned nodes
00044| 2. Nodes color-coded by subdomain type (Core=blue, Supporting=green, Generic=gray)
00045| 3. Curved SVG paths with arrowheads connect related contexts
00046| 4. Relationship pattern labels displayed on paths (Customer-Supplier, Conformist, ACL, etc.)
00047| 5. Hover a node: highlight connected paths, dim unrelated nodes
00048| 6. Click a node: open detail panel with description, relationships, artifact counts
00049| 7. Legend showing subdomain type colors
00050| 8. Responsive layout (scales for mobile to desktop)
00051| 9. Dark mode support
00052| 10. Keyboard navigation with ARIA labels on SVG elements
00053| 
00054| ## Technical Approach
00055| 
00056| ### New Files
00057| 
00058| ```
00059| packages/foe-web-ui/src/components/domain/
00060| ├── ContextMapDiagram.tsx      # Main SVG context map component
00061| ├── ContextNode.tsx            # Individual context node rendering
00062| ├── RelationshipPath.tsx       # SVG path with label for relationships
00063| ├── ContextDetailPanel.tsx     # Click-to-expand detail panel
00064| └── svg/
00065|     ├── useAutoLayout.ts       # Auto-position algorithm for nodes
00066|     ├── useSvgPanZoom.ts       # Pan/zoom hook for SVG canvas
00067|     └── markers.tsx            # SVG arrowhead marker definitions
00068| ```
00069| 
00070| ### Data Source
00071| 
00072| Consumes `DomainModelFull.boundedContexts` with `relationships` array from CAP-009 API. Uses `subdomainType` field from CAP-011 for color coding.
00073| 
00074| ### Layout Algorithm
00075| 
00076| Auto-layout positions Core contexts centrally, Supporting contexts in a middle ring, Generic/External contexts on the periphery. Manual position overrides stored per context.
00077| 
00078| ## Dependencies
00079| 
00080| - **Requires**: ROAD-009 (API endpoints), ROAD-020 (subdomain classification for color coding)
00081| - **Enables**: ROAD-022 (static site generator reuses this component)
00082| 
00083| ## Risks & Mitigations
00084| 
00085| | Risk | Impact | Mitigation |
00086| |------|--------|------------|
00087| | Layout becomes cluttered with >10 contexts | Medium | Auto-layout with spacing algorithm; add pan/zoom |
00088| | SVG accessibility challenges | Medium | ARIA labels, keyboard navigation, screen-reader-friendly text |
00089| | Performance with many relationship paths | Low | Limit visible paths to hovered context; batch SVG updates |
00090| 
00091| ## Estimation
00092| 
00093| - **Complexity**: High
00094| - **Estimated Effort**: 4 days
00095| 
00096| ---
00097| 
00098| ## Governance Checklist
00099| 
00100| - [ ] ADRs identified and validated
00101| - [ ] BDD scenarios written and approved
00102| - [ ] Implementation complete
00103| - [ ] NFRs validated (performance, accessibility)
00104| - [ ] Change record created
00105| - [ ] Documentation updated
00106| 

(End of file - total 106 lines)
</file>
```

---

## Assistant (Superpowers-Orchestrator · anthropic/claude-opus-4.6 · 73.1s)

Skills loaded and ROAD-016 details read. Let me now check the current state — BDD scenarios, existing implementation, and git status.

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "id": "phase0",
      "content": "Phase 0: Load skills (superpowers-integration, clean-ddd-hexagonal, TDD)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase1",
      "content": "Phase 1: Roadmap discovery — selected ROAD-016",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase2",
      "content": "Phase 2: BDD verification — check/create scenarios for ROAD-016",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "id": "phase3",
      "content": "Phase 3: Environment health check",
      "status": "pending",
      "priority": "high"
    },
    {
      "id": "phase4",
      "content": "Phase 4: Superpowers execution — implement Interactive Context Map",
      "status": "pending",
      "priority": "high"
    },
    {
      "id": "phase5",
      "content": "Phase 5: Quality gates — architecture, DDD, tests, CI",
      "status": "pending",
      "priority": "high"
    },
    {
      "id": "phase6",
      "content": "Phase 6: BDD step implementation verification",
      "status": "pending",
      "priority": "high"
    },
    {
      "id": "phase7",
      "content": "Phase 7: Completion — docs, changelog, execution log",
      "status": "pending",
      "priority": "medium"
    }
  ]
}
```

**Output:**
```
[
  {
    "id": "phase0",
    "content": "Phase 0: Load skills (superpowers-integration, clean-ddd-hexagonal, TDD)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase1",
    "content": "Phase 1: Roadmap discovery — selected ROAD-016",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase2",
    "content": "Phase 2: BDD verification — check/create scenarios for ROAD-016",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "id": "phase3",
    "content": "Phase 3: Environment health check",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "phase4",
    "content": "Phase 4: Superpowers execution — implement Interactive Context Map",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "phase5",
    "content": "Phase 5: Quality gates — architecture, DDD, tests, CI",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "phase6",
    "content": "Phase 6: BDD step implementation verification",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "phase7",
    "content": "Phase 7: Completion — docs, changelog, execution log",
    "status": "pending",
    "priority": "medium"
  }
]
```

**Tool: bash**

**Input:**
```json
{
  "command": "git status --short",
  "description": "Check git working tree status"
}
```

**Output:**
```
?? data/
?? road-016-context-map-diagram.png
?? road-020-subdomain-classification.png
?? session-ses_3bc0.md
?? session-ses_3cc5.md

```

**Tool: bash**

**Input:**
```json
{
  "command": "git branch --show-current",
  "description": "Show current git branch"
}
```

**Output:**
```
main

```

**Tool: task**

**Input:**
```json
{
  "subagent_type": "explore",
  "description": "Find BDD scenarios for ROAD-016",
  "prompt": "Thoroughness: medium\n\nSearch the entire codebase at /Users/aaron.west/Documents/Projects/katalyst-domain-mapper for any BDD/feature files related to ROAD-016 (Interactive Context Map Diagram). \n\nLook in:\n1. `stack-tests/features/` directory\n2. Any `.feature` files anywhere in the repo\n3. Search for \"context map\", \"context-map\", \"ROAD-016\", \"ContextMap\" in feature files\n\nAlso look for any existing implementation files related to the context map:\n1. Search for files named `ContextMap*`, `context-map*`, `context_map*`\n2. Search in `packages/foe-web-ui/src/components/domain/` \n3. Any `.tsx` or `.ts` files with \"context map\" in them\n\nReturn:\n- List of any BDD feature files found (or \"none found\")\n- List of any existing implementation files found\n- Summary of what already exists vs what needs to be created"
}
```

**Output:**
```
I now have a complete picture. Here is the full report.

---

## Search Results for ROAD-016 (Interactive Context Map Diagram)

### BDD Feature Files Found

**1 dedicated feature file found:**

| File | Tags | Scenarios |
|------|------|-----------|
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/stack-tests/features/ui/domain-model/05_context_map_diagram.feature` | `@ui @ddd-modeling @ROAD-016` | 5 scenarios (including Background) |

**Scenarios in `05_context_map_diagram.feature`:**
1. **SVG context map diagram renders on the page** (`@smoke`) -- checks for "Context Map" and "Diagram" text
2. **Bounded contexts render as SVG nodes** -- checks for "Scanning", "Governance", "Logging" text
3. **Nodes are color-coded by subdomain type** -- checks for "Core", "Supporting", "Generic" text
4. **Legend shows subdomain type colors** -- checks for "Legend", "Core", "Supporting", "Generic" text
5. **Context map has view toggle between list and diagram** -- checks for "Diagram" and "List" text

**Additional feature files referencing context map (not ROAD-016-specific):**

| File | Relevance |
|------|-----------|
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/stack-tests/features/hybrid/domain-models/01_domain_model_e2e.feature` | E2E hybrid test that creates a domain model via API and verifies it in the context map UI (navigates to `/context-map`) |
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/stack-tests/features/ui/reporting/01_report_upload_viewer.feature` | Has a `@wip @context-map @ROAD-009` scenario for DDD context map display |
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/stack-tests/features/api/confluence/01_confluence_sync.feature` | References publishing a "ddd-context-map" content type to Confluence |
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/stack-tests/features/api/reporting/05_foe_dimension_scores.feature` | Test data mentions "No context map found" as gap evidence |

---

### Existing Implementation Files

All implementation files live under `packages/foe-web-ui/src/components/domain/`. Here is the complete set related to the context map:

**Core Components (all exist and are fully implemented):**

| File | Lines | Purpose |
|------|-------|---------|
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextMapView.tsx` | 412 | Parent view with Diagram/List toggle, create form, bounded context list |
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextMapDiagram.tsx` | 248 | Main interactive SVG canvas: pan/zoom, hover highlight, click-to-select, legend |
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextNode.tsx` | 190 | SVG node for each bounded context: color-coded by subdomain, artifact counts, keyboard a11y |
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/RelationshipPath.tsx` | 160 | SVG quadratic bezier path with arrowheads and DDD relationship type labels |
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextDetailPanel.tsx` | 203 | Slide-in detail panel showing description, responsibility, team, relationships, artifact counts |

**SVG Utilities (all exist):**

| File | Purpose |
|------|---------|
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/svg/useAutoLayout.ts` | Auto-position algorithm for context nodes |
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/svg/useSvgPanZoom.ts` | Pan/zoom hook for SVG canvas |
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/svg/markers.tsx` | SVG arrowhead marker definitions |

**Page-Level Integration:**

| File | Relevance |
|------|-----------|
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/pages/DomainMapperPage.tsx` | Imports `ContextMapView` and renders it as a route element |

**Delivery/Docs:**

| File | Purpose |
|------|---------|
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/roads/ROAD-016.md` | Road spec (status: `implementing`, updated 2026-02-10) |
| `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/ddd/context-map.md` | Delivery framework documentation for context maps |

---

### Summary: What Already Exists vs. What May Need Work

**Already Exists (substantial implementation in place):**

- The **full component tree** specified in ROAD-016's Technical Approach section is implemented: `ContextMapDiagram.tsx`, `ContextNode.tsx`, `RelationshipPath.tsx`, `ContextDetailPanel.tsx`, `useAutoLayout.ts`, `useSvgPanZoom.ts`, `markers.tsx` -- every file listed in the ROAD-016 spec exists.
- The parent **`ContextMapView.tsx`** provides the Diagram/List toggle, create form, and list view.
- The page-level route in **`DomainMapperPage.tsx`** wires it all up.
- The **BDD feature file** (`05_context_map_diagram.feature`) exists with 5 scenarios covering rendering, color-coding, legend, and view toggle.
- The ROAD-016 spec status is **`implementing`** (not yet "complete").

**Potential Gaps / What May Still Need Work:**

1. **BDD governance metadata is empty** -- In `ROAD-016.md`, the governance section shows `bdd.feature_files: []`, `bdd.scenarios: 0`, `bdd.passing: 0`. These need updating to reflect the actual feature file.
2. **BDD scenarios are lightweight** -- The 5 scenarios only check for text presence (e.g., `Then I should see text "Context Map"`). There are no scenarios testing:
   - Hover highlighting behavior
   - Click-to-select and detail panel opening
   - Pan/zoom interaction
   - Relationship path rendering with labels
   - Dark mode rendering
   - Keyboard navigation / accessibility
   - Responsive layout behavior
3. **NFRs are pending** -- Performance (`NFR-PERF-001`) and accessibility (`NFR-A11Y-001`) are listed as applicable but status is `pending`.
4. **ADRs not validated** -- `governance.adrs.validated: false`.
5. **No unit/component tests found** -- The search found no `*.test.tsx` or `*.spec.tsx` files specifically for the context map components (though they may exist elsewhere; a deeper search was not performed).

<task_metadata>
session_id: ses_3b7cdc68effep83chTVJ0ZjpOw
</task_metadata>
```

---

## Assistant (Superpowers-Orchestrator · anthropic/claude-opus-4.6 · 19.1s)

Excellent! The exploration reveals a lot already exists. Let me summarize the situation:

## 📋 ROAD-016 Status Assessment

**Implementation**: ✅ All 8 files from the spec exist and are fully built
- `ContextMapDiagram.tsx` (248 lines)
- `ContextNode.tsx` (190 lines)  
- `RelationshipPath.tsx` (160 lines)
- `ContextDetailPanel.tsx` (203 lines)
- `useAutoLayout.ts`, `useSvgPanZoom.ts`, `markers.tsx`
- `ContextMapView.tsx` (412 lines — parent view with toggle)

**BDD Scenarios**: ⚠️ 5 scenarios exist but are lightweight (text-presence checks only)

**Gaps Identified**:
1. BDD governance metadata in ROAD-016.md not updated
2. No scenarios for hover, click-to-select, pan/zoom, keyboard navigation, dark mode
3. NFRs pending (performance, accessibility)
4. ADRs not validated
5. No unit/component tests found

Since the implementation appears substantially complete, the main work is around **quality gates, BDD enrichment, and governance completion**. Let me check the actual code quality and decide on next steps.

**Tool: question**

**Input:**
```json
{
  "questions": [
    {
      "question": "ROAD-016 implementation appears substantially complete (all 8 files built). The BDD scenarios exist but are lightweight (text-only checks). The governance metadata needs updating. How would you like to proceed?",
      "header": "ROAD-016 Approach",
      "options": [
        {
          "label": "Run quality gates (Recommended)",
          "description": "Run architecture, DDD, CI checks on existing code. Update governance. Complete the ROAD item."
        },
        {
          "label": "Enrich BDD scenarios first",
          "description": "Add deeper scenarios for hover, click, pan/zoom, keyboard nav, then run quality gates"
        },
        {
          "label": "Full review & fix",
          "description": "Read all implementation files, identify issues, fix them, then complete quality gates"
        }
      ]
    }
  ]
}
```

**Output:**
```
User has answered your questions: "ROAD-016 implementation appears substantially complete (all 8 files built). The BDD scenarios exist but are lightweight (text-only checks). The governance metadata needs updating. How would you like to proceed?"="Run quality gates (Recommended)". You can now continue with the user's answers in mind.
```

---

## Assistant (Superpowers-Orchestrator · anthropic/claude-opus-4.6 · 129.4s)

Let's run quality gates on ROAD-016. I'll kick off the architecture inspection, DDD alignment check, and CI validation in parallel.

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "id": "phase0",
      "content": "Phase 0: Load skills (superpowers-integration, clean-ddd-hexagonal, TDD)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase1",
      "content": "Phase 1: Roadmap discovery — selected ROAD-016",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase2",
      "content": "Phase 2: BDD verification — 5 scenarios exist in 05_context_map_diagram.feature",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase3",
      "content": "Phase 3: Environment health check (skipped — quality gates focus)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase5",
      "content": "Phase 5: Quality gates — architecture, DDD, tests, CI",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "id": "phase5a",
      "content": "  5a. Architecture inspection (@architecture-inspector)",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "id": "phase5b",
      "content": "  5b. DDD alignment check (@ddd-aligner)",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "id": "phase5c",
      "content": "  5c. CI validation (typecheck, lint, tests)",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "id": "phase5d",
      "content": "  5d. BDD test execution",
      "status": "pending",
      "priority": "high"
    },
    {
      "id": "phase6",
      "content": "Phase 6: Update governance metadata in ROAD-016.md",
      "status": "pending",
      "priority": "high"
    },
    {
      "id": "phase7",
      "content": "Phase 7: Completion — docs, changelog, execution log",
      "status": "pending",
      "priority": "medium"
    }
  ]
}
```

**Output:**
```
[
  {
    "id": "phase0",
    "content": "Phase 0: Load skills (superpowers-integration, clean-ddd-hexagonal, TDD)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase1",
    "content": "Phase 1: Roadmap discovery — selected ROAD-016",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase2",
    "content": "Phase 2: BDD verification — 5 scenarios exist in 05_context_map_diagram.feature",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase3",
    "content": "Phase 3: Environment health check (skipped — quality gates focus)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase5",
    "content": "Phase 5: Quality gates — architecture, DDD, tests, CI",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "id": "phase5a",
    "content": "  5a. Architecture inspection (@architecture-inspector)",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "id": "phase5b",
    "content": "  5b. DDD alignment check (@ddd-aligner)",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "id": "phase5c",
    "content": "  5c. CI validation (typecheck, lint, tests)",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "id": "phase5d",
    "content": "  5d. BDD test execution",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "phase6",
    "content": "Phase 6: Update governance metadata in ROAD-016.md",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "phase7",
    "content": "Phase 7: Completion — docs, changelog, execution log",
    "status": "pending",
    "priority": "medium"
  }
]
```

**Tool: task**

**Input:**
```json
{
  "subagent_type": "architecture-inspector",
  "description": "Architecture review ROAD-016",
  "prompt": "Verify hexagonal architecture compliance for ROAD-016 (Interactive Context Map Diagram) implementation.\n\nThe implementation files are in:\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextMapDiagram.tsx`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextNode.tsx`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/RelationshipPath.tsx`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextDetailPanel.tsx`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextMapView.tsx`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/svg/useAutoLayout.ts`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/svg/useSvgPanZoom.ts`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/svg/markers.tsx`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/pages/DomainMapperPage.tsx`\n\nThis is a React frontend (web UI) project, NOT a backend service. For frontend code, check:\n1. Separation of concerns (presentation vs data fetching vs business logic)\n2. Component composition and single responsibility\n3. Proper use of hooks vs inline logic\n4. No direct API calls in presentation components (should use hooks or services)\n5. TypeScript types properly defined (no `any` abuse)\n6. Props interfaces well-defined\n7. SVG utilities properly isolated in `svg/` subdirectory\n\nAlso check the broader `packages/foe-web-ui/` structure to understand how these components fit into the overall architecture.\n\nRead ALL the files listed above. Report:\n- PASS / CONDITIONAL PASS / FAIL\n- Any violations found\n- Recommendations for improvement\n- Overall assessment"
}
```

**Output:**
```
I now have a comprehensive picture of the implementation. Let me compile the full audit report.

---

# 🏛️ Architecture Inspection Report — ROAD-016 (Interactive Context Map Diagram)

## Verdict: ✅ CONDITIONAL PASS

The implementation demonstrates **strong architectural discipline** for a React frontend. The component decomposition follows clean separation of concerns, SVG utilities are properly isolated, TypeScript types are well-defined, and pure presentation components contain zero API calls. There are a few DRY violations and one minor layering concern that prevent a full PASS.

---

## 1. Separation of Concerns (Presentation vs Data Fetching vs Business Logic)

### ✅ PASS — Presentation Components

| Component | API Imports | Data Fetching | Business Logic | Verdict |
|-----------|------------|---------------|----------------|---------|
| `ContextMapDiagram.tsx` | None | None | Pure rendering + layout orchestration | ✅ |
| `ContextNode.tsx` | None | None | Pure SVG rendering | ✅ |
| `RelationshipPath.tsx` | None | None | Pure SVG geometry + rendering | ✅ |
| `ContextDetailPanel.tsx` | None | None | Pure detail rendering | ✅ |
| `SvgMarkers` | None | None | Pure SVG `<defs>` | ✅ |

These five components are **purely presentational**. They receive all data via props, contain no API calls, no side effects, and no state management beyond local UI state (hover, selection). This is textbook clean architecture for the view layer.

### ✅ PASS — Data Fetching Isolation

Data fetching is properly concentrated in the **container/orchestrator layers**:

- **`DomainMapperPage.tsx`** (page) — Fetches and manages `DomainModelFull`, passes it down
- **`ContextMapView.tsx`** (view) — Handles create/delete via `api` client, calls `onModelUpdated()` callback

The `api` client is a **clean adapter** (centralized in `src/api/client.ts`), acting as a port-like abstraction over HTTP. All components consume it through this single interface — not raw `fetch()`.

### ⚠️ MINOR CONCERN — `ContextMapView.tsx` Mixes Concerns

`ContextMapView.tsx` (line 13) imports `api` directly and contains both **CRUD operations** (create/delete bounded contexts) and **presentation logic** (view toggle, list rendering, diagram rendering). This file is 412 lines and handles:
- View mode toggling (diagram vs list)
- Create form state (7 form fields)
- API create/delete operations
- List rendering with expand/collapse
- Diagram rendering delegation

This is acceptable for this project's established pattern (other views like `GlossaryView`, `DomainModelList` follow the same pattern), but it's the one file that would benefit from extraction.

**Severity**: Low — consistent with codebase conventions.

---

## 2. Component Composition & Single Responsibility

### ✅ EXCELLENT — Clean Component Hierarchy

```
DomainMapperPage (page: routing, model selection, data fetching)
  └─ ContextMapView (container: view toggle, CRUD, model prop passing)
       ├─ ContextMapDiagram (diagram: SVG canvas, pan/zoom, interaction state)
       │    ├─ SvgMarkers (SVG defs)
       │    ├─ RelationshipPath × N (SVG path + label)
       │    ├─ ContextNode × N (SVG node rendering)
       │    └─ ContextDetailPanel (slide-in detail view)
       ├─ SubdomainOverview (classification summary)
       └─ SubdomainBadge (small badge component)
```

Each component has a **clear, singular purpose**:
- `ContextMapDiagram` — Canvas orchestration + interaction state
- `ContextNode` — Single node rendering with visual states
- `RelationshipPath` — Single edge rendering with geometry
- `ContextDetailPanel` — Slide-in detail view
- `SvgMarkers` — Reusable SVG marker definitions

---

## 3. Proper Use of Hooks vs Inline Logic

### ✅ PASS — Hooks Properly Extracted to `svg/` Subdirectory

| Hook | Location | Purpose | Quality |
|------|----------|---------|---------|
| `useAutoLayout` | `svg/useAutoLayout.ts` | Concentric ring layout algorithm | ✅ Pure computation, memoized |
| `useSvgPanZoom` | `svg/useSvgPanZoom.ts` | Pan/zoom via viewBox manipulation | ✅ Clean state + handlers |

Both hooks:
- ✅ Return typed interfaces (`PositionedNode[]`, `UseSvgPanZoomResult`)
- ✅ Use `useMemo` / `useCallback` appropriately
- ✅ Are framework-agnostic (work with any SVG element)
- ✅ Export dimension constants (`NODE_WIDTH`, `NODE_HEIGHT`) for consumers

### ✅ PASS — Memoization in `ContextMapDiagram`

The main diagram component properly memoizes expensive computations:
- `positionMap` (line 28) — O(n) position lookup
- `relationships` (line 37) — Flattened relationship list with coordinates
- `connectedContextIds` (line 72) — Hover highlight set
- `artifactCountsMap` (line 97) — Artifact counts per context
- `isRelHighlighted` / `isRelDimmed` (lines 109, 117) — `useCallback` for stable references

---

## 4. No Direct API Calls in Presentation Components

### ✅ PASS

The **five new diagram components** (`ContextMapDiagram`, `ContextNode`, `RelationshipPath`, `ContextDetailPanel`, `SvgMarkers`) contain **zero API imports** and **zero data fetching**. They are pure render functions that receive all data through props.

API calls are confined to:
- `DomainMapperPage.tsx` — model loading/selection (page level)
- `ContextMapView.tsx` — create/delete operations (container level)

This follows the established project pattern where "View" components are the boundary for API interaction, and sub-components beneath them are purely presentational.

---

## 5. TypeScript Types — No `any` Abuse

### ✅ PASS — Zero `any` Usage

A grep for `any` across all ROAD-016 files returned **zero matches**. Every type is explicit:

- Props interfaces defined for all components (`ContextMapDiagramProps`, `ContextNodeProps`, `RelationshipPathProps`, `ContextDetailPanelProps`, `ContextMapViewProps`)
- Hook return types explicitly typed (`PositionedNode[]`, `UseSvgPanZoomResult`)
- Internal interfaces defined (`ViewBox`, `PanZoomHandlers`, `ArtifactCounts`, `SubdomainColors`)
- Event handlers properly typed (`React.MouseEvent<SVGSVGElement>`, `React.WheelEvent`, `React.TouchEvent`, `React.KeyboardEvent`)

---

## 6. Props Interfaces Well-Defined

### ✅ PASS

Every component has a clearly defined props interface:

```typescript
// ContextMapDiagramProps — minimal, clean
interface ContextMapDiagramProps {
  model: DomainModelFull;
}

// ContextNodeProps — comprehensive with interaction callbacks
interface ContextNodeProps {
  context: BoundedContext;
  x: number; y: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  artifactCounts: ArtifactCounts;
}

// RelationshipPathProps — geometry + visual state
interface RelationshipPathProps {
  sourceX: number; sourceY: number;
  targetX: number; targetY: number;
  type: ContextRelationship['type'];
  isHighlighted: boolean;
  isDimmed: boolean;
}
```

All props use domain types from `../../types/domain` rather than raw primitives where appropriate.

---

## 7. SVG Utilities Properly Isolated

### ✅ PASS

The `svg/` subdirectory cleanly encapsulates:
- `useAutoLayout.ts` — Layout algorithm with exported constants
- `useSvgPanZoom.ts` — Pan/zoom interaction with touch support
- `markers.tsx` — SVG marker definitions

These have **no domain knowledge** — they work with generic geometry and SVG primitives. The layout hook takes `BoundedContext[]` as input which creates a minimal coupling to domain types, but this is appropriate since the layout strategy depends on `subdomainType`.

---

## Issues Found

### ❌ Issue 1: `RELATIONSHIP_LABELS` Duplicated 3 Times (DRY Violation)

**Severity**: Medium — Maintenance risk

The same mapping is defined in three separate files:

| File | Line | Type Signature |
|------|------|---------------|
| `RelationshipPath.tsx` | 14 | `Record<ContextRelationship['type'], string>` ✅ type-safe |
| `ContextDetailPanel.tsx` | 22 | `Record<string, string>` ⚠️ loosely typed |
| `ContextMapView.tsx` | 30 | `Record<string, string>` ⚠️ loosely typed |

**Recommendation**: Extract to a shared constant file:
```typescript
// src/components/domain/constants.ts
import type { ContextRelationship } from '../../types/domain';

export const RELATIONSHIP_LABELS: Record<ContextRelationship['type'], string> = {
  upstream: 'Upstream',
  downstream: 'Downstream',
  conformist: 'Conformist',
  'anticorruption-layer': 'ACL',
  'shared-kernel': 'Shared Kernel',
  'customer-supplier': 'Customer-Supplier',
  partnership: 'Partnership',
  'published-language': 'Published Language',
};
```

Note: `RelationshipPath.tsx` uses the correctly typed `Record<ContextRelationship['type'], string>` while the other two use the weaker `Record<string, string>`. Consolidation would also fix this type-safety inconsistency.

### ❌ Issue 2: `STATUS_COLORS` / `STATUS_STYLES` Duplicated

**Severity**: Low

Status style mappings appear in both `ContextMapView.tsx` (line 24) and `ContextDetailPanel.tsx` (line 16) with slightly different names but identical content.

**Recommendation**: Extract to shared constants alongside `RELATIONSHIP_LABELS`.

### ❌ Issue 3: `SUBDOMAIN_BADGE_STYLES` Duplicated vs `SubdomainBadge`

**Severity**: Low

`ContextDetailPanel.tsx` (line 10) defines its own `SUBDOMAIN_BADGE_STYLES` instead of reusing the `SubdomainBadge` component that already exists and does the same thing.

**Recommendation**: Use `<SubdomainBadge subdomainType={context.subdomainType} />` in `ContextDetailPanel.tsx` instead of reimplementing the badge inline.

### ⚠️ Issue 4: `ContextMapView.tsx` Is a Large Multi-Responsibility Component (412 lines)

**Severity**: Low — follows codebase conventions

This file handles:
1. View mode toggle (diagram/list)
2. Create form with 7 fields
3. Delete confirmation + API call
4. List rendering with expand/collapse
5. Diagram delegation

**Recommendation** (future refactor, not blocking):
- Extract `CreateContextForm` as a standalone component
- Extract the list view into a `ContextListView` component
- Keep `ContextMapView` as a thin orchestrator

### ⚠️ Issue 5: Inline CSS Animation in `ContextDetailPanel.tsx`

**Severity**: Very Low

Lines 51-55 define a `@keyframes slideInRight` animation via an inline `<style>` tag. This works but could cause issues if multiple panels render simultaneously (duplicate style tags).

**Recommendation**: Move the animation to Tailwind config or a CSS file.

---

## Accessibility Audit (Bonus)

### ✅ Good Accessibility Practices

- `ContextMapDiagram` SVG has `role="img"` and `aria-label` (line 155-156)
- `ContextNode` has `role="button"`, `tabIndex={0}`, and `aria-label` (lines 103-105)
- Keyboard handler for Enter/Space on nodes (line 84-89)
- Close button has `aria-label="Close detail panel"` (line 84)
- Reset View button has `aria-label="Reset diagram view"` (line 231)

---

## Dependency Flow Analysis

```
DomainMapperPage (page)
  ├── api/client ✅ (data fetching at page level)
  ├── types/domain ✅ (shared types)
  └── ContextMapView (container)
       ├── api/client ✅ (CRUD at container level — established pattern)
       ├── types/domain ✅
       ├── SubdomainBadge ✅ (pure presentation)
       ├── SubdomainOverview ✅ (pure presentation)
       └── ContextMapDiagram ✅ (pure presentation)
            ├── svg/useAutoLayout ✅ (pure computation hook)
            ├── svg/useSvgPanZoom ✅ (interaction hook)
            ├── svg/markers ✅ (pure SVG defs)
            ├── ContextNode ✅ (pure SVG presentation)
            ├── RelationshipPath ✅ (pure SVG presentation)
            └── ContextDetailPanel ✅ (pure presentation)
```

**All dependency arrows point inward.** No presentation component reaches up to fetch data. No circular dependencies detected.

---

## Summary

| Criteria | Status | Notes |
|----------|--------|-------|
| Separation of concerns | ✅ PASS | 5/5 diagram components are purely presentational |
| Component composition | ✅ PASS | Clean hierarchy, each with single purpose |
| Hook extraction | ✅ PASS | Layout + pan/zoom properly extracted to `svg/` |
| No API in presentation | ✅ PASS | Zero API imports in diagram components |
| TypeScript types | ✅ PASS | Zero `any`, all interfaces defined |
| Props interfaces | ✅ PASS | Comprehensive, domain-typed props |
| SVG isolation | ✅ PASS | Clean `svg/` subdirectory encapsulation |
| DRY principle | ❌ 3 violations | `RELATIONSHIP_LABELS`, status styles, subdomain badge |
| Component size | ⚠️ Advisory | `ContextMapView.tsx` at 412 lines could be split |
| Accessibility | ✅ PASS | ARIA labels, keyboard nav, roles |

### Overall Assessment

**CONDITIONAL PASS** — The architecture is sound and follows established codebase patterns. The five new diagram components demonstrate excellent separation of concerns with zero architectural violations. The three DRY violations are the only issue preventing a full PASS. These are low-risk and can be addressed in a follow-up cleanup.

### Required for Full PASS:
1. **Extract shared `RELATIONSHIP_LABELS` constant** with proper `ContextRelationship['type']` typing (addresses DRY + type safety)
2. **Extract shared status style constant** used by both `ContextMapView` and `ContextDetailPanel`
3. **Reuse `SubdomainBadge` component** in `ContextDetailPanel` instead of reimplementing inline

### Recommended (Non-Blocking):
4. Extract `CreateContextForm` from `ContextMapView` to reduce file size
5. Move `@keyframes slideInRight` to CSS/Tailwind config

<task_metadata>
session_id: ses_3b7cc63c5ffezSowvqkxlR933A
</task_metadata>
```

**Tool: task**

**Input:**
```json
{
  "subagent_type": "ddd-aligner",
  "description": "DDD alignment check ROAD-016",
  "prompt": "Check domain model alignment for ROAD-016 (Interactive Context Map Diagram) implementation.\n\nThis is a React web UI that visualizes DDD concepts (bounded contexts, relationships, subdomain types). The implementation files are:\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextMapDiagram.tsx`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextNode.tsx`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/RelationshipPath.tsx`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextDetailPanel.tsx`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/ContextMapView.tsx`\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/foe-web-ui/src/components/domain/svg/useAutoLayout.ts`\n\nCheck:\n1. **Ubiquitous Language**: Do component names, prop names, and type names use correct DDD terminology? (bounded context, aggregate, relationship patterns like Customer-Supplier, Conformist, ACL, Open Host Service, etc.)\n2. **Domain Concepts Accuracy**: Are subdomain types correctly represented (Core, Supporting, Generic)? Are DDD relationship patterns correctly listed and displayed?\n3. **Type Definitions**: Do TypeScript interfaces/types accurately model DDD concepts?\n4. **Naming Consistency**: Are names consistent with the project's domain model and DDD best practices?\n\nAlso check the DDD documentation at:\n- `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper/packages/delivery-framework/ddd/context-map.md`\n\nRead ALL the files. Report:\n- PASS / CONDITIONAL PASS / FAIL\n- Any ubiquitous language violations\n- Any DDD concept inaccuracies\n- Recommendations"
}
```

**Output:**
```
I now have a complete picture. Here is my thorough DDD alignment report:

---

# DDD Alignment Report — ROAD-016: Interactive Context Map Diagram

**Verdict: ✅ CONDITIONAL PASS**

---

## 1. Ubiquitous Language Audit

### ✅ PASS — Correct terms used consistently

| Term Used in Code | Ubiquitous Language Term | Status |
|---|---|---|
| `BoundedContext` | **Bounded Context** | ✅ Correct |
| `SubdomainType` | **Subdomain Type** | ✅ Correct |
| `ContextRelationship` | **Context Relationship** | ✅ Correct |
| `DomainModelFull` / `DomainModel` | **Domain Model** | ✅ Correct |
| `Aggregate` | **Aggregate** | ✅ Correct |
| `DomainEvent` / `domainEvents` | **Domain Event** | ✅ Correct |
| `ValueObject` / `valueObjects` | **Value Object** | ✅ Correct |
| `GlossaryTerm` / `glossaryTerms` | **Glossary Term** | ✅ Correct |
| `Invariant` / `AggregateInvariant` | **Invariant** | ✅ Correct |
| `responsibility` (prop name) | Bounded Context has "responsibility" | ✅ Correct |
| `teamOwnership` (prop name) | Bounded Context has "team ownership" | ✅ Correct |
| `sourceDirectory` (prop name) | Bounded Context has "source directory" | ✅ Correct |
| `slug` (prop name) | All DDD entities have "slug" | ✅ Correct |

### ⚠️ MINOR — Abbreviated labels in SVG nodes

| Location | Issue | Severity |
|---|---|---|
| `ContextNode.tsx:62-64` | `"2 agg, 3 evt, 1 vo"` — uses abbreviations `agg`, `evt`, `vo` | Low |

**Assessment**: These are purely **display abbreviations** in a space-constrained SVG node, not domain model terms. The full terms "Aggregates", "Events", "Value Objects" are used in `ContextDetailPanel.tsx:177,183,189`. This is acceptable — UI truncation for visual density is not a ubiquitous language violation.

### ✅ No anti-language violations detected

Checked for all "terms to avoid" from ubiquitous-language.md:
- No "scan result" → ✅
- No "practice/technique" → ✅
- No "finding/note/insight" (in Field Guide sense) → ✅
- No "health triangle" → ✅
- No "document/file/spec" for artifacts → ✅
- No bare "context" when "bounded context" is meant → ✅ (component is `ContextNode` but renders `BoundedContext` data, and aria-label says "bounded context")

---

## 2. Domain Concepts Accuracy

### ✅ PASS — Subdomain Types

| Subdomain Type | Correctly Represented | Investment Guidance (SubdomainOverview) |
|---|---|---|
| **Core** | ✅ Blue color, center position in layout | ✅ "High Investment" / "Build" |
| **Supporting** | ✅ Green color, middle ring | ✅ "Medium Investment" / "Integrate" |
| **Generic** | ✅ Gray color, outer ring | ✅ "Low Investment" / "Buy" |
| **Unclassified (null)** | ✅ Slate/amber, outer ring | ✅ "Needs Classification" / "Review" |

The `useAutoLayout.ts` correctly positions Core contexts at center, Supporting in a middle ring, and Generic/unclassified in an outer ring — visually reinforcing strategic importance. This is excellent DDD practice.

### ⚠️ ISSUE — Relationship Type Divergence (Medium Severity)

This is the most significant finding. There are **three different sources of truth** for relationship types, and they **don't align**:

#### Source 1: `@foe/schemas` (`bounded-context.ts`) — The Authoritative Schema

```typescript
// ContextRelationshipSchema.type
z.enum(["upstream", "downstream", "partnership", "shared-kernel", "separate-ways"])

// CommunicationPatternSchema (separate field)
z.enum([
  "domain-events", "shared-kernel", "anti-corruption-layer",
  "open-host-service", "conformist", "partnership",
  "customer-supplier", "separate-ways"
])
```

The schema uses a **two-field model**: `type` (directional: upstream/downstream/partnership/shared-kernel/separate-ways) + `communicationPattern` (integration style: conformist, ACL, customer-supplier, etc.).

#### Source 2: Web UI `types/domain.ts` — What the UI uses

```typescript
type: 'upstream' | 'downstream' | 'conformist' | 'anticorruption-layer'
    | 'shared-kernel' | 'customer-supplier' | 'partnership' | 'published-language'
```

The UI **flattens both concepts into a single `type` field**, mixing directional types with communication patterns.

#### Source 3: Ubiquitous Language doc

> **Context Relationship**: `upstream | downstream | partnership | shared-kernel | separate-ways`
> **Communication Pattern**: `domain-events | shared-kernel | anti-corruption-layer | open-host-service | conformist | partnership | customer-supplier | separate-ways`

#### Specific Divergences:

| Value | In Schema? | In UI types? | Issue |
|---|---|---|---|
| `upstream` | ✅ (type) | ✅ | OK |
| `downstream` | ✅ (type) | ✅ | OK |
| `partnership` | ✅ (type) | ✅ | OK |
| `shared-kernel` | ✅ (type) | ✅ | OK |
| `separate-ways` | ✅ (type) | ❌ Missing | UI can't represent "Separate Ways" |
| `conformist` | ✅ (comm pattern) | ✅ (as type) | **Conflated**: comm pattern in schema, type in UI |
| `anticorruption-layer` | ✅ (comm pattern, as `anti-corruption-layer`) | ✅ (as type, different hyphenation) | **Conflated + spelling**: schema uses `anti-corruption-layer`, UI uses `anticorruption-layer` |
| `customer-supplier` | ✅ (comm pattern) | ✅ (as type) | **Conflated**: comm pattern in schema, type in UI |
| `published-language` | ❌ Not in either schema | ✅ (as type) | **Not in schema at all** |
| `open-host-service` | ✅ (comm pattern) | ❌ Missing | UI can't represent "Open Host Service" |
| `domain-events` | ✅ (comm pattern) | ❌ Missing | UI can't represent "Domain Events" pattern |

#### Source 4: Context Map doc (`context-map.md`)

The context map documentation uses: **Customer-Supplier**, **Conformist**, **Published Language**, **Separate Ways** — which aligns more with the UI's flattened model than with the schema's two-field model.

### ⚠️ ISSUE — Schema Field Name Divergence

| Schema field | UI field | Issue |
|---|---|---|
| `targetContext` (string) | `targetContextId` (string) | Different field name for the same concept |

The Zod schema in `bounded-context.ts:16` uses `targetContext` but the UI type in `domain.ts:31` uses `targetContextId`. The API layer is likely translating, but this is a naming inconsistency between the shared kernel schema and the UI types.

---

## 3. Type Definitions Accuracy

### ✅ PASS — Core types model DDD concepts correctly

| Interface | DDD Concept | Assessment |
|---|---|---|
| `DomainModel` | Top-level DDD model container | ✅ Correct: id, name, description, timestamps |
| `DomainModelFull` | Model + all artifacts | ✅ Correct: extends DomainModel with all child collections |
| `BoundedContext` | DDD Bounded Context | ✅ Correct: slug, title, responsibility, subdomain type, relationships, team, source dir, status |
| `Aggregate` | DDD Aggregate | ✅ Correct: root entity, entities, value objects, events, commands, invariants |
| `ValueObject` | DDD Value Object | ✅ Correct: properties, validation rules, immutable flag |
| `DomainEvent` | DDD Domain Event | ✅ Correct: payload fields, consumers, triggers, side effects |
| `GlossaryTerm` | Ubiquitous Language entry | ✅ Correct: term, definition, aliases, examples, related terms |
| `SubdomainType` | Strategic DDD classification | ✅ Correct: `'core' | 'supporting' | 'generic'` |
| `AggregateInvariant` | Business rule | ✅ Correct: rule + optional description |
| `EventPayloadField` | Event schema field | ✅ Correct: name, type, description |
| `ValueObjectProperty` | VO property | ✅ Correct: name, type, description |

### ✅ PASS — Bounded Context status enum

UI `domain.ts` uses `status: string | null` which is flexible. The schema defines `"draft" | "stable" | "deprecated"`. The UI properly handles unknown values by falling back to `draft` styling in `STATUS_STYLES`. However, the ubiquitous language says `"draft | stable | deprecated"` while `ContextDetailPanel.tsx:17-19` and `ContextMapView.tsx:24-28` use `"draft" | "active" | "deprecated"`.

### ⚠️ ISSUE — Status Value Mismatch

| Source | Values |
|---|---|
| Schema (`bounded-context.ts`) | `draft`, `stable`, `deprecated` |
| Ubiquitous Language doc | `draft`, `stable`, `deprecated` |
| UI STATUS_STYLES | `draft`, **`active`**, `deprecated` |

The UI uses **`active`** where the schema and docs say **`stable`**. This is a ubiquitous language violation.

---

## 4. Naming Consistency

### ✅ PASS — Component names follow DDD conventions

| Component | Naming Assessment |
|---|---|
| `ContextMapDiagram` | ✅ "Context Map" is canonical DDD term |
| `ContextMapView` | ✅ View for the Context Map |
| `ContextNode` | ✅ Visual node representing a Bounded Context |
| `ContextDetailPanel` | ✅ Detail panel for a Bounded Context |
| `RelationshipPath` | ✅ SVG path for a Context Relationship |
| `SubdomainBadge` | ✅ Badge showing Subdomain Type |
| `SubdomainOverview` | ✅ Overview of Subdomain Classification |
| `useAutoLayout` | ✅ Layout hook — implementation detail, not domain |
| `SvgMarkers` | ✅ SVG markers — implementation detail, not domain |

### ✅ PASS — Prop names use domain terms

| Props / Variables | Assessment |
|---|---|
| `model: DomainModelFull` | ✅ Uses "Domain Model" |
| `context: BoundedContext` | ✅ Uses "Bounded Context" |
| `context.subdomainType` | ✅ Uses "Subdomain Type" |
| `context.relationships` | ✅ Uses "relationships" |
| `context.responsibility` | ✅ Uses "responsibility" |
| `context.teamOwnership` | ✅ Uses "team ownership" |
| `artifactCounts` | ✅ Uses "artifacts" (though abbreviated in SVG) |
| `connectedContextIds` | ✅ Clear domain intent |
| `selectedContextId` | ✅ Clear selection state |

### ✅ PASS — Relationship labels use correct DDD terminology

Both `RelationshipPath.tsx` and `ContextDetailPanel.tsx` display correct DDD pattern names:
- "Upstream" / "Downstream" ✅
- "Conformist" ✅  
- "ACL" (abbreviated from "Anti-Corruption Layer") ✅
- "Shared Kernel" ✅
- "Customer-Supplier" ✅
- "Partnership" ✅
- "Published Language" / "Pub Language" ✅

### ⚠️ MINOR — Inconsistent label abbreviation

| File | Label for `customer-supplier` |
|---|---|
| `RelationshipPath.tsx:20` | `"Cust-Supplier"` |
| `ContextDetailPanel.tsx:28` | `"Customer-Supplier"` |
| `ContextMapView.tsx:36` | `"Customer-Supplier"` |

The SVG path label abbreviates to "Cust-Supplier" while the detail panel and list view use the full term. This is minor since it's a space constraint, but ideally the RELATIONSHIP_LABELS map should be defined once and shared.

### ⚠️ MINOR — Similarly for published-language

| File | Label for `published-language` |
|---|---|
| `RelationshipPath.tsx:22` | `"Pub Language"` |
| `ContextDetailPanel.tsx:30` | `"Published Language"` |
| `ContextMapView.tsx:38` | `"Published Language"` |

---

## 5. Context Isolation Check

### ✅ PASS — No bounded context boundary violations

The ROAD-016 implementation lives entirely within `packages/foe-web-ui/` (the **Reporting** bounded context's UI layer). It:
- Imports types only from its own `types/domain.ts` ✅
- Does not import from `foe-scanner`, `foe-field-guide-tools`, or `delivery-framework` ✅
- API calls go through `api/client.ts` (proper anti-corruption) ✅
- No domain logic in the UI — it's purely visualization ✅

---

## 6. DDD Layout Semantics

### ✅ EXCELLENT — `useAutoLayout.ts` encodes strategic design knowledge

The concentric ring layout in `useAutoLayout.ts` is particularly well-aligned with DDD:
- **Core** at center = highest strategic importance, invest heavily
- **Supporting** in middle ring = necessary but secondary
- **Generic/Unclassified** at outer ring = commodity, least investment

This visual encoding matches the Subdomain Type definitions in the ubiquitous language exactly. The `SubdomainOverview.tsx` investment guidance ("High Investment / Build", "Medium Investment / Integrate", "Low Investment / Buy") also perfectly matches DDD strategic design principles.

---

## Summary of Findings

### Blocking Issues (0)

None. The implementation can proceed.

### Medium Severity Issues (2)

| # | Issue | Location | Recommendation |
|---|---|---|---|
| **M1** | **Relationship type model divergence**: UI flattens the schema's two-field model (`type` + `communicationPattern`) into a single `type` enum. This mixes directional relationships (upstream/downstream) with communication patterns (conformist/ACL/customer-supplier). Missing `separate-ways`, `open-host-service`, `domain-events`. Extra `published-language` not in schema. | `types/domain.ts:32-40` vs `@foe/schemas/src/ddd/bounded-context.ts:15-20` | **Decide on one model and align.** If the API already returns the flattened form, update the schema to match. If the schema's two-field model is authoritative, update the UI to have both `type` and `communicationPattern`. File a follow-up ROAD item. |
| **M2** | **Status value `active` vs `stable`**: UI uses "active" but schema and ubiquitous language define "stable". | `ContextDetailPanel.tsx:18`, `ContextMapView.tsx:26` | Change `active` to `stable` in both `STATUS_STYLES` maps, or update the schema if "active" was an intentional evolution (then update ubiquitous-language.md). |

### Low Severity Issues (3)

| # | Issue | Location | Recommendation |
|---|---|---|---|
| **L1** | **Hyphenation inconsistency**: Schema uses `anti-corruption-layer`, UI uses `anticorruption-layer` | `types/domain.ts:36` vs schema | Align to schema's `anti-corruption-layer` |
| **L2** | **Field name**: Schema uses `targetContext`, UI uses `targetContextId` | `types/domain.ts:31` vs `bounded-context.ts:16` | Verify the API response shape; align the naming |
| **L3** | **RELATIONSHIP_LABELS defined 3 times**: `RelationshipPath.tsx`, `ContextDetailPanel.tsx`, `ContextMapView.tsx` all define the same map with minor variations | All three files | Extract to a shared `domain/constants.ts` to ensure consistency |

### Positive Highlights

- ✅ **All DDD domain types** are accurately modeled in TypeScript
- ✅ **Ubiquitous language** is consistently used in component names, prop names, and UI labels
- ✅ **No anti-language violations** (no "scan result", "practice", "finding" misuse)
- ✅ **Subdomain classification** is correctly represented with proper Core/Supporting/Generic semantics and investment guidance
- ✅ **Context isolation** is clean — no cross-boundary imports
- ✅ **Accessibility** uses domain terms correctly (e.g., aria-label: "bounded context", "subdomain")
- ✅ **Layout semantics** encode DDD strategic design knowledge visually (core at center)
- ✅ **No domain logic in UI** — purely presentation, which avoids the "Smart UI" anti-pattern

---

**Overall: ✅ CONDITIONAL PASS** — The implementation demonstrates excellent DDD alignment with correct ubiquitous language usage, accurate domain modeling, and clean bounded context isolation. The two medium issues (relationship type model divergence and `active` vs `stable` status) should be addressed, but they are **data alignment issues between schema and UI types**, not fundamental DDD violations. The implementation itself correctly renders whatever model it receives.

<task_metadata>
session_id: ses_3b7cc47f5ffeQBlo5j0LhJQ2kJ
</task_metadata>
```

**Tool: task**

**Input:**
```json
{
  "subagent_type": "ci-runner",
  "description": "Run CI checks for ROAD-016",
  "prompt": "Run all CI quality checks for the project at /Users/aaron.west/Documents/Projects/katalyst-domain-mapper.\n\nThis is a monorepo using Bun workspaces. The web UI package is at `packages/foe-web-ui/`.\n\nRun these checks in order:\n1. TypeScript type checking: `bunx tsc --noEmit` (run from the foe-web-ui package directory)\n2. Lint check: Look for a lint script in package.json or try `bun run lint` \n3. Unit tests: `bun test` (from the web-ui package directory)\n4. Check if there's a Justfile with relevant commands: `just check` or similar\n\nAlso check:\n- Look at `packages/foe-web-ui/package.json` for available scripts\n- Look at the root `justfile` or `Justfile` for available commands\n- Try to find and run the most relevant quality checks\n\nReport results:\n- Each check: PASS / FAIL with details\n- Any errors or warnings\n- Auto-fix anything that can be auto-fixed (formatting, minor lint issues)\n- Overall CI status: GREEN / YELLOW / RED"
}
```

**Output:**
```
All TypeScript still compiles clean after the formatting fixes. Here's the full CI report:

---

## CI Quality Check Report

### Overall Status: 🟡 YELLOW

---

### 1. TypeScript Type Checking — ✅ PASS

| Package | Result | Errors |
|---------|--------|--------|
| `@foe/schemas` | ✅ PASS | 0 errors |
| `@foe/api` | ✅ PASS | 0 errors |
| `@foe/web-ui` | ✅ PASS | 0 errors |

All 3 packages compile cleanly with `--noEmit`.

---

### 2. ESLint Linting — ⚠️ SKIPPED (No Config)

**Issue:** No ESLint configuration file exists anywhere in the project (no `.eslintrc.*` or `eslint.config.*`). The `lint` script in `package.json` and the `lint` recipe in `Justfile` reference ESLint, but there's nothing to configure it.

**Additionally:** `bunx eslint` resolves ESLint v10 (flat config format), but the lint command uses `--ext ts,tsx` which is an ESLint v8 flag.

**Action Required:**
- Create an `eslint.config.js` (flat config) or `.eslintrc.cjs` (legacy) in `packages/foe-web-ui/`
- Pin ESLint version in `devDependencies` (v8 for legacy config, or v9+ for flat config)
- Install required plugins: `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

---

### 3. Prettier Formatting — ✅ PASS (Auto-Fixed)

**Before:** 165 files had formatting issues across all packages
**After:** ✅ All files now use Prettier code style

**Auto-fixed packages:** `foe-schemas`, `foe-api`, `foe-web-ui`, `foe-field-guide-tools`, `delivery-framework`, `web-report`

---

### 4. Unit Tests — ⚠️ NO TESTS

**Result:** 0 test files found across the entire monorepo. No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files exist.

**Action Required:** Unit tests need to be written. Priority areas:
- `packages/foe-schemas/src/` — Zod schema validation
- `packages/foe-api/src/domain/` — Domain logic (normalize, governance validation)
- `packages/foe-api/src/usecases/` — Use case logic
- `packages/foe-field-guide-tools/src/parsers/` — Markdown parsers

---

### 5. Justfile Commands — ✅ Available

The `Justfile` is well-structured with these quality recipes:

| Recipe | Command | Status |
|--------|---------|--------|
| `just check` | typecheck + lint + test | ⚠️ Lint broken, no tests |
| `just ci` | check + bdd-api | ⚠️ Blocked by check |
| `just typecheck` | tsc across 3 packages | ✅ Working |
| `just lint` | ESLint foe-web-ui | ❌ No config |
| `just lint-fix` | ESLint auto-fix | ❌ No config |
| `just format-check` | Prettier check | ✅ Working (now clean) |
| `just format` | Prettier write | ✅ Working |
| `just test` | bun test | ⚠️ No test files |

---

### Summary

| Check | Status | Details |
|-------|--------|---------|
| TypeScript | ✅ **PASS** | 0 errors across 3 packages |
| ESLint | ❌ **FAIL** | No config file — needs setup |
| Formatting | ✅ **PASS** | Auto-fixed 165 files |
| Unit Tests | ⚠️ **N/A** | No test files exist yet |
| Build Config | ✅ **PASS** | Justfile properly configured |

### Blocking Issues (to reach GREEN)

1. **ESLint config missing** — Create `eslint.config.js` or `.eslintrc.cjs` and pin ESLint as a devDependency
2. **No unit tests** — Write tests for domain logic, schemas, and parsers

### What Was Auto-Fixed

- ✅ **165 files** reformatted with Prettier across all packages (consistent code style)

<task_metadata>
session_id: ses_3b7cc3350ffe27AQn1hxR6kwJ2
</task_metadata>
```

---

## Assistant (Superpowers-Orchestrator · anthropic/claude-opus-4.6 · 11.4s)

All three quality gate reports are back. Let me update the status and summarize results.

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "id": "phase0",
      "content": "Phase 0: Load skills (superpowers-integration, clean-ddd-hexagonal, TDD)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase1",
      "content": "Phase 1: Roadmap discovery — selected ROAD-016",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase2",
      "content": "Phase 2: BDD verification — 5 scenarios exist in 05_context_map_diagram.feature",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase3",
      "content": "Phase 3: Environment health check (skipped — quality gates focus)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase5a",
      "content": "5a. Architecture inspection — CONDITIONAL PASS (3 DRY violations)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase5b",
      "content": "5b. DDD alignment — CONDITIONAL PASS (relationship type divergence, active vs stable)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase5c",
      "content": "5c. CI validation — YELLOW (tsc ✅, format ✅ auto-fixed, ESLint no config, no unit tests)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase5-fix",
      "content": "5-FIX: Address DRY violations + DDD alignment issues",
      "status": "pending",
      "priority": "high"
    },
    {
      "id": "phase6",
      "content": "Phase 6: Update governance metadata in ROAD-016.md",
      "status": "pending",
      "priority": "high"
    },
    {
      "id": "phase7",
      "content": "Phase 7: Completion — docs, changelog, execution log",
      "status": "pending",
      "priority": "medium"
    }
  ]
}
```

**Output:**
```
[
  {
    "id": "phase0",
    "content": "Phase 0: Load skills (superpowers-integration, clean-ddd-hexagonal, TDD)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase1",
    "content": "Phase 1: Roadmap discovery — selected ROAD-016",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase2",
    "content": "Phase 2: BDD verification — 5 scenarios exist in 05_context_map_diagram.feature",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase3",
    "content": "Phase 3: Environment health check (skipped — quality gates focus)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase5a",
    "content": "5a. Architecture inspection — CONDITIONAL PASS (3 DRY violations)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase5b",
    "content": "5b. DDD alignment — CONDITIONAL PASS (relationship type divergence, active vs stable)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase5c",
    "content": "5c. CI validation — YELLOW (tsc ✅, format ✅ auto-fixed, ESLint no config, no unit tests)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase5-fix",
    "content": "5-FIX: Address DRY violations + DDD alignment issues",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "phase6",
    "content": "Phase 6: Update governance metadata in ROAD-016.md",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "phase7",
    "content": "Phase 7: Completion — docs, changelog, execution log",
    "status": "pending",
    "priority": "medium"
  }
]
```

---

## Assistant (Superpowers-Orchestrator · anthropic/claude-opus-4.6 · 25.9s)

## 📊 Quality Gate Results

| Gate | Result | Key Findings |
|------|--------|-------------|
| **Architecture** | ✅ CONDITIONAL PASS | 3 DRY violations (RELATIONSHIP_LABELS ×3, status styles ×2, subdomain badge reimplemented) |
| **DDD Alignment** | ✅ CONDITIONAL PASS | Relationship type model divergence (UI flattens schema's 2-field model), `active` vs `stable` status mismatch |
| **TypeScript** | ✅ PASS | 0 errors across all 3 packages |
| **Formatting** | ✅ PASS | Auto-fixed 165 files |
| **ESLint** | ⚠️ SKIPPED | No config exists project-wide |
| **Unit Tests** | ⚠️ N/A | No test files exist yet |

Both architecture and DDD got **Conditional Pass** — the issues are fixable. The key items to address:

1. **Extract shared constants** (RELATIONSHIP_LABELS, STATUS_STYLES) — DRY fix
2. **Fix `active` → `stable` status term** — DDD alignment 
3. **Reuse SubdomainBadge** in ContextDetailPanel

**Tool: question**

**Input:**
```json
{
  "questions": [
    {
      "question": "Quality gates returned CONDITIONAL PASS. There are fixable issues:\n\n1. **DRY violations**: RELATIONSHIP_LABELS duplicated 3 times, STATUS_STYLES duplicated 2 times\n2. **DDD alignment**: UI uses 'active' but schema says 'stable' for bounded context status\n3. **SubdomainBadge**: reimplemented inline instead of reusing existing component\n\nShall I delegate these fixes to @code-writer to get a full PASS?",
      "header": "Fix Issues?",
      "options": [
        {
          "label": "Yes, fix all (Recommended)",
          "description": "Delegate fixes to @code-writer: extract constants, fix status term, reuse SubdomainBadge"
        },
        {
          "label": "Fix DRY only",
          "description": "Extract shared constants but skip the active→stable rename (may affect other code)"
        },
        {
          "label": "Skip fixes, accept conditional",
          "description": "Move on to governance metadata update and completion as-is"
        }
      ]
    }
  ]
}
```

**Output:**
```
User has answered your questions: "Quality gates returned CONDITIONAL PASS. There are fixable issues:

1. **DRY violations**: RELATIONSHIP_LABELS duplicated 3 times, STATUS_STYLES duplicated 2 times
2. **DDD alignment**: UI uses 'active' but schema says 'stable' for bounded context status
3. **SubdomainBadge**: reimplemented inline instead of reusing existing component

Shall I delegate these fixes to @code-writer to get a full PASS?"="Yes, fix all (Recommended)". You can now continue with the user's answers in mind.
```

---

## Assistant (Superpowers-Orchestrator · anthropic/claude-opus-4.6 · 15.3s)

Delegating all three fixes to @code-writer now.

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "id": "phase0",
      "content": "Phase 0: Load skills (superpowers-integration, clean-ddd-hexagonal, TDD)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase1",
      "content": "Phase 1: Roadmap discovery — selected ROAD-016",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase2",
      "content": "Phase 2: BDD verification — 5 scenarios exist in 05_context_map_diagram.feature",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase3",
      "content": "Phase 3: Environment health check (skipped — quality gates focus)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase5a",
      "content": "5a. Architecture inspection — CONDITIONAL PASS (3 DRY violations)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase5b",
      "content": "5b. DDD alignment — CONDITIONAL PASS (relationship type divergence, active vs stable)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase5c",
      "content": "5c. CI validation — YELLOW (tsc ✅, format ✅ auto-fixed, ESLint no config, no unit tests)",
      "status": "completed",
      "priority": "high"
    },
    {
      "id": "phase5-fix",
      "content": "5-FIX: @code-writer fixing DRY violations + DDD alignment issues",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "id": "phase6",
      "content": "Phase 6: Update governance metadata in ROAD-016.md",
      "status": "pending",
      "priority": "high"
    },
    {
      "id": "phase7",
      "content": "Phase 7: Completion — docs, changelog, execution log",
      "status": "pending",
      "priority": "medium"
    }
  ]
}
```

**Output:**
```
[
  {
    "id": "phase0",
    "content": "Phase 0: Load skills (superpowers-integration, clean-ddd-hexagonal, TDD)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase1",
    "content": "Phase 1: Roadmap discovery — selected ROAD-016",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase2",
    "content": "Phase 2: BDD verification — 5 scenarios exist in 05_context_map_diagram.feature",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase3",
    "content": "Phase 3: Environment health check (skipped — quality gates focus)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase5a",
    "content": "5a. Architecture inspection — CONDITIONAL PASS (3 DRY violations)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase5b",
    "content": "5b. DDD alignment — CONDITIONAL PASS (relationship type divergence, active vs stable)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase5c",
    "content": "5c. CI validation — YELLOW (tsc ✅, format ✅ auto-fixed, ESLint no config, no unit tests)",
    "status": "completed",
    "priority": "high"
  },
  {
    "id": "phase5-fix",
    "content": "5-FIX: @code-writer fixing DRY violations + DDD alignment issues",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "id": "phase6",
    "content": "Phase 6: Update governance metadata in ROAD-016.md",
    "status": "pending",
    "priority": "high"
  },
  {
    "id": "phase7",
    "content": "Phase 7: Completion — docs, changelog, execution log",
    "status": "pending",
    "priority": "medium"
  }
]
```

**Tool: task**

**Input:**
```json
{}
```

**Error:**
```
Tool execution aborted
```

---


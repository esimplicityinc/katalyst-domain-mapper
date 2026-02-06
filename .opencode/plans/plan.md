# Katalyst Delivery Framework — Master Plan

## Vision

Turn this monorepo into a **self-governing delivery framework**. Import the generic governance infrastructure from prima-delivery-demonstrator (agents, skills, templates, Docusaurus site, governance scripts) as a new `packages/delivery-framework/` package. Use the katalyst-domain-mapper's own domain (FOE scanning, reports, field guides) as the example content. Then progressively replace the old hand-written JS governance scripts with the new Zod-validated, API-backed system — release by release.

The delivery framework governs its own development. The agents use the docs system to create services. As each phase of the new system ships, the agents adopt it, replacing the old conventions with formal tooling.

## Current State

```
katalyst-domain-mapper/
├── packages/
│   ├── foe-schemas/              # Zod schemas (scan, field-guide, graph)
│   ├── foe-field-guide-tools/    # Markdown parsers, index builders, CLI
│   ├── foe-scanner/              # Docker container with 6 AI scanner agents
│   ├── foe-api/                  # Elysia + SQLite + Drizzle API (uncommitted)
│   ├── foe-web-ui/               # Vite SPA report viewer
│   └── web-report/               # Next.js 11-template gallery
├── .opencode/
│   ├── plans/                    # Phase plan documents (01-07)
│   └── skills/                   # BDD skills (katalyst-specific)
├── AGENTS.md
└── package.json                  # Bun workspace
```

No agents at root level. No opencode.json. No governance framework. No Docusaurus docs site.

## End State

```
katalyst-domain-mapper/
├── packages/
│   ├── foe-schemas/              # EXTENDED with governance/ + ddd/ modules
│   ├── foe-field-guide-tools/    # EXTENDED with governance parsers + builder + CLI
│   ├── foe-scanner/              # EXTENDED with governance scanner agent
│   ├── foe-api/                  # EXTENDED with governance domain
│   ├── foe-web-ui/               # Existing (unchanged)
│   ├── web-report/               # EXTENDED with governance templates
│   └── delivery-framework/       # NEW — Docusaurus governance site framework
│       ├── docs/                 # Docusaurus site (templates, sidebars, plugins)
│       ├── scripts/              # Old governance scripts (progressively deleted)
│       ├── src/                  # React components, hooks, types
│       └── package.json
├── .opencode/
│   ├── agents/                   # NEW — 15 genericized governance agents
│   ├── skills/                   # EXTENDED — DDD, TDD, Superpowers skills
│   └── plans/
├── opencode.json                 # NEW — agent config, tools, MCP servers
├── Justfile                      # NEW — governance + docs recipes
├── agentspec.md                  # NEW — governance state machine spec
├── AGENTS.md                     # UPDATED — agent architecture overview
└── package.json
```

---

## Phase 0: Import Generic Infrastructure

**Goal:** Bring prima's governance infrastructure into this repo as `packages/delivery-framework/`, with agents at root, using the domain-mapper's own domain as example content.

### 0.1 Create `packages/delivery-framework/`

New Docusaurus package with prima's generic infrastructure:

**BRING as-is (33 files):**

| Category | Files |
|----------|-------|
| Docusaurus config | `docusaurus.config.ts`, `sidebars.ts`, `tsconfig.json` |
| React components (12) | `RoadmapDashboard.tsx`, `RoadmapFilter.tsx`, `RoadmapStats.tsx`, `RoadmapCard.tsx`, `KanbanView.tsx`, `TimelineView.tsx`, `DependencyView.tsx`, `MobileListView.tsx`, `BDDViewer.tsx`, `BDDSummary.tsx`, `SearchBDD.tsx` + CSS modules |
| Hooks (2) | `useRoadmapItems.ts`, `useBDDData.ts` |
| Types (2) | `roadmap.ts`, `bdd.ts` |
| Plugins (2) | `roadmap-data-plugin.js`, `bdd-data-plugin.js` |

**BRING and adapt (strip branding, 7 files):**

| File | Adaptation |
|------|------------|
| `src/pages/index.tsx` | Replace ClawMarket branding with "Katalyst Delivery Framework" |
| Scripts: `governance-linter.js`, `validate-changes.js`, `validate-bdd-tags.js`, `capability-coverage-report.js`, `persona-coverage-report.js` | Bring as-is initially — these are the "old system" that gets progressively replaced |

**Frontmatter templates (bring as-is):**
- `roads/ROAD-TEMPLATE.md`
- `adr/ADR-TEMPLATE.md`
- `nfr/NFR-TEMPLATE.md`
- `changes/TEMPLATE.md`

**DDD doc templates (bring as empty scaffolding):**
- `docs/ddd/index.md`, `domain-overview.md`, `bounded-contexts.md`, `ubiquitous-language.md`, `aggregates-entities.md`, `value-objects.md`, `domain-events.md`, `use-cases.md`, `context-map.md`
- `docs/bdd/index.md`, `bdd-overview.md`, `gherkin-syntax.md`, `feature-index.md`

### 0.2 Import Agents to `.opencode/agents/`

**BRING as-is (5 agents):**
- `agent-analyzer.md` — Analyzes OpenCode sessions
- `agent-creator.md` — Creates new agents via guided questionnaire
- `agent-editor.md` — Edits/improves existing agents
- `agent-manager.md` — Orchestrates agent CRUD
- `main-orchestrator.md` — Delegation and workflow coordination

**ADAPT (strip ClawMarket content, keep workflow logic — 10 agents):**

| Agent | What to Strip | What to Keep |
|-------|--------------|-------------|
| `architecture-inspector.md` | BotRepository, ConvexBotRepository, Convex-specific examples | Hexagonal audit pattern, dependency direction checks, violation detection |
| `bdd-runner.md` | @bot-identity/@promise-market context tags, ROAD-004/005 refs, CAP descriptions | BDD execution pattern, Cucumber integration, failure analysis workflow |
| `bdd-writer.md` | Bot/Promise/Escrow ubiquitous language, CAP-001-007 tags, file organization | Gherkin authoring methodology, Given-When-Then patterns, tag conventions |
| `change-manager.md` | "Prima Delivery Team" reference | Governance CHANGE file workflow, compliance tracking, signature collection |
| `ci-runner.md` | BotAccount.ts examples, Promise class naming | CI/QA validation pattern, test execution, linting, build verification |
| `code-writer.md` | BotAccount/TokenAmount/RegisterBotService, Convex infrastructure | DDD/Hexagonal implementation pattern, TDD workflow, layer-by-layer approach |
| `roadmap-addition.md` | Phase names (Bot Identity, Token Mgmt), ClawMarket examples | ROAD item management workflow, decision tree, governance hierarchy |
| `site-keeper.md` | Convex/Next.js-specific references | Generic dev server management, port conflict resolution, cache clearing |
| `superpowers-orchestrator.md` | ROAD-035/036 OpenClaw examples | Full governance lifecycle workflow, permission matrix, delegation rules, auto-fix strategy |
| `ux-ui-inspector.md` | Bot Registration flow, BotRegistrationForm examples | WCAG/accessibility audit, responsive design checks, form validation patterns |

**CREATE new (1 agent):**
- `ddd-aligner.md` — Generic DDD alignment agent (replaces the ClawMarket-saturated original). Reads bounded context, aggregate, value object, and domain event markdown files instead of hardcoding domain knowledge. Uses the governance index for cross-reference validation.

### 0.3 Import Skills to `.opencode/skills/`

**BRING as-is (7 files):**
- `clean-ddd-hexagonal/SKILL.md` + 6 reference docs (CHEATSHEET, CQRS-EVENTS, DDD-STRATEGIC, DDD-TACTICAL, HEXAGONAL, LAYERS, TESTING)

**ADAPT (2 skills):**
- `superpowers-integration/SKILL.md` — Strip ROAD-035 Advertisement Bot examples
- `test-driven-development/SKILL.md` — Replace AdvertisementBot examples with generic domain examples

### 0.4 Create Root Config Files

**`opencode.json`** — Merged from prima's config:
- 16 agent definitions (tool permissions, trigger phrases)
- 4 MCP servers (fetch, g-search, playwright, context7)
- Tool permissions matrix
- Strip "ClawMarket" reference

**`Justfile`** — Governance + docs recipes from prima:
- `validate-docs`, `governance-lint`, `lint-road`, `lint-roads`, `lint-adrs`
- `validate-changes`, `validate-bdd-tags`
- `capability-coverage`, `persona-coverage`
- `docs-dev`, `docs-build`
- Title updated to "Katalyst Delivery Framework"

**`agentspec.md`** — Governance state machine spec from prima:
- 8-state machine (proposed → complete)
- Agent delegation protocol
- Quality gate definitions
- Strip "Prima Delivery Demonstrator" branding

### 0.5 Populate Example Domain Content (Self-Referential)

Using the katalyst-domain-mapper domain itself as the example content:

**Bounded Contexts (3):**
- `docs/ddd/contexts/scanning.md` — Repository analysis, agent dispatch, report generation
- `docs/ddd/contexts/field-guide.md` — Method/observation management, index building
- `docs/ddd/contexts/reporting.md` — Report storage, comparison, visualization

**Aggregates (4):**
- `docs/ddd/aggregates/foe-report.md` — Root: FOEReport, VOs: DimensionScore, SubScore, TriangleDiagnosis
- `docs/ddd/aggregates/scan-job.md` — Root: ScanJob, entities: none, events: ScanQueued, ScanCompleted, ScanFailed
- `docs/ddd/aggregates/method.md` — Root: Method, VOs: MethodMaturity, ExternalMethodInfo
- `docs/ddd/aggregates/governance-index.md` — Root: GovernanceIndex, VOs: ReferentialIntegrity

**Domain Events (5):**
- `docs/ddd/events/scan-queued.md`
- `docs/ddd/events/scan-completed.md`
- `docs/ddd/events/report-ingested.md`
- `docs/ddd/events/governance-index-built.md`
- `docs/ddd/events/referential-integrity-failed.md`

**Value Objects (6):**
- `docs/ddd/value-objects/dimension-score.md`
- `docs/ddd/value-objects/maturity-level.md`
- `docs/ddd/value-objects/method-id.md`
- `docs/ddd/value-objects/triangle-diagnosis.md`
- `docs/ddd/value-objects/subscore.md`
- `docs/ddd/value-objects/capability-id.md`

**Capabilities (4):**
- `capabilities/CAP-001.md` — FOE Report Generation
- `capabilities/CAP-002.md` — Governance Validation
- `capabilities/CAP-003.md` — Field Guide Indexing
- `capabilities/CAP-004.md` — Repository Scanning

**Road Items (3 initial):**
- `roads/ROAD-001.md` — Governance Schema Implementation (Phase 1+2)
- `roads/ROAD-002.md` — Governance Parsers and CLI (Phase 3)
- `roads/ROAD-003.md` — API Governance Domain (Phase 4)

---

## Progressive Release Path

Each release swaps one layer of the old system with the new:

| Release | What Ships | Old System | New System | Agents |
|---------|-----------|------------|------------|--------|
| **0.1.0** | Phase 0: Import infrastructure | All old scripts + agents running | Schemas exist (scan/field-guide only) | Use old conventions |
| **0.2.0** | Phase 1+2: Governance + DDD schemas | Old scripts still validate | `@foe/schemas/governance` available, validated against old script outputs | No change |
| **0.3.0** | Phase 3: Parsers + index builder + CLI | Old scripts + new CLI both run in CI | `foe-field-guide build:governance` produces governance-index.json | Agents start calling `foe-field-guide validate:governance` for self-checking |
| **0.4.0** | Phase 4: API governance endpoints | Old Docusaurus plugins still generate JSON | `POST /api/v1/governance` ingests index, API serves governance data | Agents can query API for governance state |
| **0.5.0** | Docusaurus plugins consume governance-index.json | Old plugins replaced | delivery-framework reads governance-index.json | Agents use CLI as primary validation |
| **0.6.0** | Delete old governance scripts | Gone | New system is sole authority | Agents reference CLI/API exclusively |
| **0.7.0** | Phase 5+7: Scanner governance agent + web viz | N/A | Full pipeline: scan → report → governance → visualization | Governance agent scores governance health |

### The Canary: Agent Validation

At each release, the acceptance test is: **can the agents still successfully create, validate, and advance governance artifacts?**

- After 0.1.0: Agents create ROAD items using old templates → `just governance-lint` passes
- After 0.3.0: Agents create ROAD items → `foe-field-guide validate:governance` passes AND old lint passes (both run)
- After 0.6.0: Agents create ROAD items → `foe-field-guide validate:governance` passes (old lint deleted)

---

## Implementation Order

```
Phase 0 (import infrastructure)
    │
    ├── 0.1 Create delivery-framework package
    ├── 0.2 Import + genericize agents
    ├── 0.3 Import + adapt skills
    ├── 0.4 Create root config (opencode.json, Justfile, agentspec.md)
    └── 0.5 Populate self-referential example domain
         │
    ┌────┴────┐
    │         │
Phase 1    Phase 2
(gov schemas) (DDD schemas)
    │         │
    └────┬────┘
         │
    Phase 3 (parsers + builders + CLI)
         │
    ┌────┼────────┐
    │    │        │
Phase 4  Phase 5  Update agents to use CLI
(API)   (scanner)  (agent prompt updates)
    │    │        │
    └────┼────────┘
         │
    Phase 6 (delete old scripts)
         │
    Phase 7 (web visualization)
```

## Detailed Phase Documents

See `.opencode/plans/` for detailed specifications:

| Document | Covers |
|----------|--------|
| `01-governance-schemas.md` | 10 Zod schema files for governance artifacts |
| `02-ddd-schemas.md` | 5 schema files for DDD domain model artifacts |
| `03-parsers-and-builders.md` | 11 parsers, governance index builder, 6 CLI commands |
| `04-api-governance-domain.md` | API port, adapter, use cases, routes, DB tables |
| `05-scanner-agents.md` | Governance scanner agent, enhanced DDD agent |
| `06-prima-integration.md` | Prima migration guide (adapted for delivery-framework) |
| `07-web-visualization.md` | Governance dashboard + DDD context map templates |

---

## File Count Summary

| Phase | New Files | Adapted Files | Deleted Files | Net |
|-------|-----------|--------------|---------------|-----|
| 0. Import infrastructure | ~75 (package + agents + skills + config) | ~17 (genericize) | 0 | +75 |
| 1. Governance schemas | ~10 | 2 | 0 | +10 |
| 2. DDD schemas | ~5 | 1 | 0 | +5 |
| 3. Parsers + builder + CLI | ~14 | 4 | 0 | +14 |
| 4. API governance domain | ~10 | 3 | 0 | +10 |
| 5. Scanner agents | ~2 | 2 | 0 | +2 |
| 6. Delete old scripts | 0 | 2 | 5 | -5 |
| 7. Web visualization | ~4 | 1 | 0 | +4 |
| **Total** | **~120** | **~32** | **5** | **~115** |

## Key Principles

1. **The old system is the test oracle.** Until deleted, old governance scripts validate that the new system produces equivalent results.

2. **Agents are the canary.** If agents can create valid artifacts using the new tooling, the migration is working.

3. **Progressive, not big-bang.** Each release replaces one piece. Old and new coexist during transition.

4. **Self-referential domain.** The delivery framework governs its own development. ROAD items track the phases of this plan. The governance index validates the governance index implementation.

5. **Generic by default.** No domain-specific content in the framework itself. The example domain (FOE scanning/reporting) demonstrates the pattern without coupling to it.

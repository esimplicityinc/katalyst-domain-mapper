# Governance Domain Mapper — Plan Overview

## Context

The **katalyst-domain-mapper** repo has a proven pipeline for turning structured markdown (with YAML frontmatter) into validated JSON indices, persisting them via an API, scanning repos with AI agents, and visualizing results in web UIs. The pipeline today handles **FOE Field Guide** artifacts (methods + observations).

The **prima-delivery-demonstrator** repo defines a rich **governance framework** with 7 artifact types (Capabilities, Personas, User Stories, Road Items, ADRs, NFRs, Change Entries) plus a DDD domain model (Bounded Contexts, Aggregates, Value Objects, Domain Events). These artifacts have complex YAML frontmatter schemas and cross-reference each other. However, prima's validation is done via hand-written Node.js scripts (`governance-linter.js`, `validate-changes.js`, etc.) with no shared schema package, no type safety, and no API.

**This plan generalizes the domain-mapper pattern to handle governance and DDD artifacts**, making `@foe/schemas` the canonical schema source that both repos (and any future project) can import.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Package structure | Extend `@foe/field-guide-tools` | Keep one CLI; simpler dependency graph |
| API location | In this repo (`@foe/api`) | Already scaffolded with Elysia + SQLite + Drizzle |
| DDD artifacts | Full frontmatter schemas | BoundedContext, Aggregate, ValueObject, DomainEvent become first-class markdown files |
| Schema ownership | `@foe/schemas` is canonical | Prima imports from here, replacing its JS governance linter schemas |

## Architecture After Implementation

```
                    @foe/schemas (canonical Zod schemas)
                    ├── scan/           (existing — FOE scan reports)
                    ├── field-guide/    (existing — methods, observations)
                    ├── graph/          (existing — Neo4j types)
                    └── governance/     (NEW — all governance + DDD artifact types)
                            │
              ┌─────────────┼─────────────────┐
              │             │                 │
     @foe/field-guide-tools │          @foe/api (Elysia)
     ├── parsers/           │          ├── governance domain
     │   ├── method.ts      │          │   ├── ports
     │   ├── observation.ts │          │   ├── adapters (SQLite)
     │   ├── capability.ts  (NEW)      │   ├── use cases
     │   ├── persona.ts     (NEW)      │   └── routes /api/v1/governance/*
     │   ├── road-item.ts   (NEW)      ├── report domain (existing)
     │   ├── adr.ts         (NEW)      └── scan domain (existing)
     │   ├── nfr.ts         (NEW)
     │   ├── change-entry.ts(NEW)
     │   ├── user-story.ts  (NEW)
     │   ├── use-case.ts    (NEW)
     │   ├── bounded-context.ts (NEW)
     │   ├── aggregate.ts   (NEW)
     │   ├── value-object.ts(NEW)
     │   └── domain-event.ts(NEW)
     ├── builders/
     │   ├── methods-index.ts    (existing)
     │   ├── observations-index.ts (existing)
     │   └── governance-index.ts (NEW)
     └── cli.ts (extended with governance commands)
              │
              │  (indices baked into Docker)
              │
     @foe/scanner
     ├── foe-scanner-container.md  (UPDATED — dispatches governance agent)
     ├── foe-scanner-governance.md (NEW)
     └── ...existing 5 agents unchanged
              │
              │  (JSON report output)
              │
     @foe/web-report
     └── template-12-governance/   (NEW)
     └── template-13-context-map/  (NEW)
```

## Phases

| Phase | Document | Scope | New Files | Est. Lines |
|-------|----------|-------|-----------|------------|
| 1 | `01-governance-schemas.md` | Zod schemas for 7 governance artifact types | ~10 | ~500 |
| 2 | `02-ddd-schemas.md` | Zod schemas for 4 DDD artifact types | ~5 | ~300 |
| 3 | `03-parsers-and-builders.md` | Parsers, governance index builder, CLI commands | ~14 | ~1,200 |
| 4 | `04-api-governance-domain.md` | API ports, adapters, use cases, routes, DB tables | ~10 | ~700 |
| 5 | `05-scanner-agents.md` | New governance scanner agent, enhanced DDD agent | ~2 | ~400 |
| 6 | `06-prima-integration.md` | Replace prima's JS scripts with canonical schemas | net -4 | ~200 new, ~1,500 deleted |
| 7 | `07-web-visualization.md` | Governance dashboard + DDD context map templates | ~4 | ~2,000 |

**Total: ~45 new files, ~5,300 lines of code**

## Dependency Order

Phases must be executed in this order due to import dependencies:

```
Phase 1 (governance schemas)  ─┐
                                ├──> Phase 3 (parsers + builders + CLI)
Phase 2 (DDD schemas)         ─┘         │
                                    ┌─────┼──────┐
                                    │     │      │
                              Phase 4  Phase 5  Phase 6
                              (API)   (scanner) (prima)
                                    │     │      │
                                    └─────┼──────┘
                                          │
                                    Phase 7 (web)
```

Phases 4, 5, and 6 can run in parallel once Phase 3 is complete.

## Key Existing Files Modified

| File | Change |
|------|--------|
| `packages/foe-schemas/package.json` | Add `./governance` path export |
| `packages/foe-schemas/src/index.ts` | Re-export governance module |
| `packages/foe-field-guide-tools/src/config.ts` | Add governance directory paths + output paths |
| `packages/foe-field-guide-tools/src/cli.ts` | Add 6 governance CLI commands |
| `packages/foe-field-guide-tools/src/parsers/index.ts` | Export 11 new parsers |
| `packages/foe-field-guide-tools/src/builders/index.ts` | Export governance index builder |
| `packages/foe-api/src/db/schema.ts` | Add 8 governance tables |
| `packages/foe-api/src/bootstrap/container.ts` | Wire governance dependencies |
| `packages/foe-api/src/http/server.ts` | Mount `/api/v1/governance` routes |
| `packages/foe-scanner/.opencode/agents/foe-scanner-container.md` | Dispatch governance agent |

## Cross-Reference Model

The governance system's core value is **referential integrity** across artifact types. Every cross-reference in frontmatter is validated at build time:

```
PER-XXX (Persona)
  ├── typical_capabilities[] ──→ CAP-XXX
  ├── related_stories[] ───────→ US-XXX
  └── related_personas[] ─────→ PER-XXX

US-XXX (User Story)
  ├── persona ─────────────────→ PER-XXX
  ├── capabilities[] ──────────→ CAP-XXX
  └── use_cases[] ─────────────→ UC-XXX

ROAD-XXX (Road Item)
  ├── governance.capabilities[] → CAP-XXX
  ├── governance.adrs.compliance_check[].adr → ADR-XXX
  ├── governance.nfrs.applicable[] → NFR-XXX
  ├── depends_on[] ────────────→ ROAD-XXX
  ├── blocked_by[] ────────────→ ROAD-XXX
  └── blocks[] ────────────────→ ROAD-XXX

CHANGE-XXX (Change Entry)
  └── road_id ─────────────────→ ROAD-XXX

BoundedContext
  └── aggregates[] ────────────→ Aggregate slugs

Aggregate
  ├── context ─────────────────→ BoundedContext slug
  ├── valueObjects[] ──────────→ ValueObject slugs
  └── events[] ────────────────→ DomainEvent slugs

DomainEvent
  └── context ─────────────────→ BoundedContext slug
```

The governance index builder (Phase 3) validates all of these at build time and produces a `governance-index.json` with reverse lookups for every relationship.

## Source Repos

| Repo | Path | Role |
|------|------|------|
| katalyst-domain-mapper | `/Users/aaron.west/Documents/Projects/katalyst-domain-mapper` | Canonical schemas, tools, API, scanner, web UIs |
| prima-delivery-demonstrator | `/Users/aaron.west/Documents/prima-delivery-demonstrator` | Consumer of schemas; governance framework for ClawMarket project |

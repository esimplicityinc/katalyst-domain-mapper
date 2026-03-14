---
id: ROAD-044
title: "Business Landscape Visualization"
status: complete
priority: High
phase: 2
created: 2026-02-19
completed: 2026-02-19
tags: [landscape, visualization, elk, dagre, d3-force, svg, react, api, domain]
capabilities:
  - CAP-023
  - CAP-024
  - CAP-009
  - CAP-019
user_stories:
  - US-072
  - US-073
  - US-074
  - US-075
dependencies: []
enables:
  - ROAD-046
estimated_effort: XL
governance:
  adrs:
    validated: true
    ids: [ADR-018, ADR-003, ADR-012]
    validated_by: "@architecture-inspector"
    validated_at: "2026-02-19"
  bdd:
    id: BDD-044
    status: approved
    feature_files:
      - "api/landscape/01_landscape_graph.feature"
      - "api/landscape/02_landscape_lint.feature"
      - "hybrid/landscape/01_landscape_visualization_e2e.feature"
    scenarios: 19
    passing: 19
  nfrs:
    applicable: [NFR-PERF-001, NFR-A11Y-001]
    status: pass
    results:
      performance: "Layout computation &lt; 500ms for 50 contexts; SVG rendering &lt; 100ms post-layout"
      accessibility: "Canvas uses ARIA labels on interactive user type badges and filter controls"
  agent_signatures:
    architecture-inspector: "pass"
    code-writer: "approved"
contribution:
  status: accepted
  proposed_by: "Katalyst Team"
  proposed_at: "2026-02-19"
  accepted_at: "2026-02-19"
  reviewed_by: "governance-linter"
  reviewed_at: "2026-03-14"
---

# ROAD-044: Business Landscape Visualization

> **Note (v0.2.0):** As of @foe/schemas v0.2.0, the `ddd/` and `governance/` modules were consolidated into a unified `taxonomy/` module. File paths and import statements below (e.g. `src/governance/domain-event.ts`, `src/governance/bounded-context.ts`) reflect the original implementation at time of writing.

**Status**: ✅ Complete  
**Priority**: High  
**Phase**: 2 — Advanced Features  
**Estimated Effort**: XL (5+ days)  
**Completed**: 2026-02-19

## Description

Build a full-stack Business Landscape visualization: a `GET /api/v1/landscape/:domainModelId` API endpoint that assembles a complete `LandscapeGraph`, a pure-function Landscape Linter domain with 7 coverage metrics, and a React SVG canvas with 10 composited rendering layers, 3 interchangeable layout engines (ELK/Dagre/D3-Force), animated user type workflow dots, user type click-to-filter with dimming, story-to-capability connection lines in user type color, and collapse/expand user type groups with 300ms cubic-eased transitions.

## Value Proposition

- **Unified domain view**: One canvas shows the full interconnection of bounded contexts, events, capabilities, user types, and workflows
- **Discovery**: Auto-detects unknown external systems from unresolved event consumer references
- **Quality gating**: 7-metric linter surfaces coverage gaps before they compound
- **Flexibility**: Three layout engines adapt to any domain topology

## User Stories

- **US-072** — View Business Landscape Graph (primary visualization)
- **US-073** — Switch Between Layout Engines (ELK/Dagre/D3-Force)
- **US-074** — Filter Landscape by User Type (click-to-filter with dimming)
- **US-075** — Lint Domain Model for Coverage Gaps (7 metrics)

## Capabilities

- **Implements**: CAP-023 (Business Landscape Visualization)
- **Implements**: CAP-024 (Landscape Domain Linter)
- **Extends**: CAP-009 (DDD Domain Modeling API — new landscape endpoint)
- **Extends**: CAP-019 (Taxonomy CRUD API — new getLatestSnapshotByProject, getCapabilityTree)

## Technical Design

### Architecture

```
DB Layer (4 new migrations):
  0006_landscape_columns     — context_type, taxonomy_node, context_ids
  0007_event_capability_links — source_capability_id, target_capability_ids
  0008_capability_hierarchy  — parent_capability, tag on capabilities

API Layer:
  GET /api/v1/landscape/:domainModelId → LandscapeGraph
  LintLandscape use case → LintReport (7 coverage scores)
  Landscape Linter domain (referential + semantic + coverage rules)

Frontend Layer:
  LandscapeView.tsx (data-fetch + state management)
  LandscapeCanvas.tsx (10-layer SVG renderer)
  useCollapseAnimation.ts (RAF cubic-eased transitions)
  ElkLayoutEngine / DagreLayoutEngine / D3ForceLayoutEngine
```

### Implementation Tasks

- [x] DB migrations 0006–0008 (landscape columns, event-capability links, capability hierarchy)
- [x] `LandscapeGraph` type definition (`api/types/landscape.ts`)
- [x] `GET /api/v1/landscape/:domainModelId` HTTP route
- [x] `LintLandscape` use case with 3 rule sets (referential, semantic, coverage)
- [x] `LandscapeCanvas.tsx` — 10-layer SVG renderer with pan/zoom
- [x] `LandscapeView.tsx` — data-fetch + state management shell
- [x] `useCollapseAnimation.ts` — RAF cubic-eased group transitions
- [x] `ElkLayoutEngine.ts`, `DagreLayoutEngine.ts`, `D3ForceLayoutEngine.ts`
- [x] `layout-helpers.ts` — shared layout utilities
- [x] Frontend type definitions (`web/src/types/landscape.ts`)
- [x] Schema extensions: `sourceCapabilityId`, `targetCapabilityIds` on events; `contextType`, `taxonomyNode` on bounded contexts
- [x] Port extensions: `getLatestSnapshotByProject`, `getCapabilityTree`
- [x] Seed scripts for Durham Water and Prima Katalyst (3-level capability hierarchies)
- [x] User type filter bug fixes (3 bugs resolved)
- [x] User type color propagation to connection lines when filter active

### Key Files Changed

**Added:**
- `packages/intelligence/api/types/landscape.ts` (153 lines) — LandscapeGraph type
- `packages/intelligence/api/http/routes/v1/landscape.ts` (349 lines) — GET endpoint
- `packages/intelligence/api/domain/lint/` — LandscapeLinter + 3 rule sets + LintReport types
- `packages/intelligence/api/usecases/LintLandscape.ts` — use case orchestrator
- `packages/intelligence/drizzle/0006_landscape_columns.sql`
- `packages/intelligence/drizzle/0007_event_capability_links.sql`
- `packages/intelligence/drizzle/0008_capability_hierarchy.sql`
- `packages/intelligence/web/src/components/landscape/LandscapeCanvas.tsx` (1,240 lines)
- `packages/intelligence/web/src/components/landscape/LandscapeView.tsx` (475 lines)
- `packages/intelligence/web/src/hooks/useCollapseAnimation.ts` (428 lines)
- `packages/intelligence/web/src/layout/ElkLayoutEngine.ts` (594 lines)
- `packages/intelligence/web/src/layout/DagreLayoutEngine.ts` (190 lines)
- `packages/intelligence/web/src/layout/D3ForceLayoutEngine.ts` (299 lines)
- `packages/intelligence/web/src/layout/layout-helpers.ts` (829 lines)
- `packages/intelligence/web/src/types/landscape.ts` (339 lines)

**Modified:**
- `packages/foe-schemas/src/governance/domain-event.ts` — sourceCapabilityId, targetCapabilityIds
- `packages/foe-schemas/src/governance/bounded-context.ts` — contextType, taxonomyNode
- `packages/intelligence/api/ports/TaxonomyRepository.ts` — new methods
- `packages/intelligence/api/ports/GovernanceRepository.ts` — getLatestSnapshotByProject
- `packages/intelligence/api/db/schema.ts` — mirror of all migrations
- `packages/intelligence/web/package.json` — elkjs, @types/d3-force
- `packages/intelligence/web/vite.config.ts` — optimizeDeps for elkjs

## Acceptance Criteria

From US-072:
1. ✅ Bounded contexts render grouped under taxonomy system hierarchy
2. ✅ Domain event flow arrows render between producer/consumer contexts
3. ✅ Capability nodes render as port-style connectors
4. ✅ Animated user type dots ride workflow event chains
5. ✅ Inferred unknown external systems render as dashed boxes
6. ✅ Graph loads within 3 seconds for ≤20 bounded contexts

From US-073:
1. ✅ Toolbar shows ELK (default), Dagre, and D3-Force buttons
2. ✅ Switching engine re-renders canvas with new positions
3. ✅ Execution time displays in toolbar in milliseconds

From US-074:
1. ✅ Clicking user type activates filter — user type connections render in user type color
2. ✅ Non-selected elements dim to 0.25 opacity
3. ✅ Active filter pill in toolbar with clear button
4. ✅ Collapsed labels show accurate story counts

From US-075:
1. ✅ 7 coverage metrics computed: userTypeToStory through eventToCapability
2. ✅ Referential, semantic, and coverage rule sets implemented
3. ✅ Severity levels (error/warning/info) on all findings
4. ✅ Pure-function linter with zero I/O in domain layer

## Dependencies

- None (greenfield capability)

## Non-Functional Requirements

### NFR-PERF-001: Performance
- **Result**: Layout computation `< 500ms` for 50 contexts; SVG rendering `< 100ms` post-layout
- **Status**: ✅ Pass

### NFR-A11Y-001: Accessibility
- **Result**: Canvas uses ARIA labels on interactive user type badges and filter controls
- **Status**: ✅ Pass

## Testing Strategy

### Automated
- Unit tests for Landscape Linter rule sets (pure functions, no I/O)
- Unit tests for layout-helpers coordinate calculations
- Integration test: `GET /api/v1/landscape/:id` returns valid LandscapeGraph shape

### Manual
- Visual regression: 3 layout engines render without overlap for reference seed data
- User type filter: click/clear cycle, opacity transitions, connection line coloring
- Collapse/expand: 300ms animation completes without jank

## Files Changed

See **Key Files Changed** section above. 37 files total across api, web, drizzle, and foe-schemas packages.

## Success Metrics

- ✅ Landscape page renders for both Durham Water and Prima Katalyst seed data
- ✅ All 3 layout engines produce non-overlapping layouts
- ✅ User type filter correctly dims non-selected elements
- ✅ Linter reports 7 coverage metrics with severity classification
- ✅ TypeScript compiles with zero errors across all packages
- ✅ No ESLint errors in new landscape components

## Git Commits

- `bfe39f2` — Retroactive governance documentation (ADR-017)
- `735d5d2` — Zod schemas: capability linkage fields to events + bounded contexts
- `a682ade` — DB: 3 Drizzle migrations (landscape, event-cap links, cap hierarchy)
- `ca8dc18` — API: landscape endpoint, lint domain, capability-aware ports
- `1e34826` — Extend API landscape types, add historical scan runner
- `f81ed39` — Refactor landscape route with improved resolution logic
- `79bc33d` — Seed scripts for Durham Water and Prima Katalyst
- `fb13b4d` — Upgrade seeds to 3-level capability hierarchies
- `7556b22` — Add elkjs/d3-force, improve SVG pan/zoom, extend domain types
- `50e82d9` — Wire BusinessLandscapePage, enhance WorkflowView
- `0164a90` — Build LandscapeCanvas + 3 layout engines + animation
- `380a001` — Fix 3 user type filter bugs
- `d96e9b6` — User type color on connection lines when filter active

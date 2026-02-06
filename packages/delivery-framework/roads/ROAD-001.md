---
id: ROAD-001
title: "Import Governance Infrastructure"
status: implementing
phase: 0
priority: high
created: "2026-02-05"
updated: "2026-02-05"
owner: ""
tags: [infrastructure, governance, docusaurus, agents]
governance:
  adrs:
    validated: true
    ids: [ADR-001, ADR-005, ADR-008]
    validated_by: "architecture-inspector"
    validated_at: "2026-02-06"
  bdd:
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: []
    status: pending
    results: {}
dependencies:
  requires: []
  enables: [ROAD-002, ROAD-003, ROAD-007]
---

# ROAD-001: Import Governance Infrastructure

## Summary

Import the generic governance infrastructure from prima-delivery-demonstrator into this monorepo as `packages/delivery-framework/`. This establishes the Docusaurus documentation site, React dashboard components, governance scripts, and doc templates that all subsequent phases build upon.

## Business Value

Provides a unified documentation and governance platform for the Katalyst Domain Mapper project. Teams get a ready-made delivery framework with roadmap tracking, BDD integration, ADR management, NFR validation, and change history — all in a browsable Docusaurus site.

## Acceptance Criteria

1. `packages/delivery-framework/` exists with Docusaurus 3.9.2 configuration
2. All 16 React components imported (roadmap dashboard, BDD viewer, kanban/timeline/dependency views)
3. All 6 governance scripts imported as-is (old system, to be progressively replaced)
4. Doc templates for all artifact types (roads, ADR, NFR, changes, DDD, BDD, plans, agents)
5. Branding adapted from ClawMarket to "Katalyst Delivery Framework"
6. OpenCode agents genericized and imported to `.opencode/agents/`
7. Skills imported to `.opencode/skills/`
8. Root configs created (`opencode.json`, `Justfile`, `agentspec.md`)
9. `bun install && bun run build` succeeds in the delivery-framework package

## Technical Approach

### Phase 0 Subtasks

| Subtask | Description | Status |
|---------|-------------|--------|
| 0.1 | Import Docusaurus site, components, scripts, templates | Complete |
| 0.2 | Import + genericize agents to `.opencode/agents/` | Pending (user-owned) |
| 0.3 | Import + adapt skills to `.opencode/skills/` | Pending (user-owned) |
| 0.4 | Create root configs (`opencode.json`, `Justfile`, `agentspec.md`) | Pending |
| 0.5 | Populate self-referential example domain content | Pending |

### What Was Imported (Subtask 0.1)

- **Config**: `package.json`, `docusaurus.config.ts`, `sidebars.ts`, `tsconfig.json`
- **Components** (16): RoadmapDashboard, RoadmapFilter, RoadmapStats, RoadmapCard, KanbanView, TimelineView, DependencyView, MobileListView, BDDViewer, BDDSummary, SearchBDD (+ CSS modules)
- **Hooks/Types**: useRoadmapItems, useBDDData, roadmap.ts, bdd.ts
- **Plugins**: roadmap-data-plugin.js, bdd-data-plugin.js
- **Scripts** (6): governance-linter.js, validate-changes.js, validate-bdd-tags.js, capability-coverage-report.js, persona-coverage-report.js, validate-docs.js
- **Templates** (27 doc files): roads, ADR, NFR, changes, DDD (9), BDD (4), plans, agents

### Adaptations Made

- `docusaurus.config.ts`: title/tagline/org/URLs → Katalyst
- `src/pages/index.tsx`: homepage → FOE Assessment / DDD Architecture / BDD-Driven Development
- `src/css/custom.css`: comment header → Katalyst
- `RoadmapFilter.tsx`, `TimelineView.tsx`: phase names genericized

## Dependencies

- **Requires**: None (foundation)
- **Enables**: ROAD-002 (Governance Schemas), ROAD-003 (DDD Schemas), ROAD-007 (BDD Skills)

## Detailed Plan

See [Governance Mapper Overview](../plans/governance-mapper-overview.md) for the full architecture spec.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Prima components depend on ClawMarket-specific data shapes | Medium | All components use generic interfaces; data comes from plugins |
| Docusaurus version incompatibility with monorepo | Low | Isolated package with its own deps |

## Estimation

- **Complexity**: Medium
- **Estimated Effort**: 3 days

---

## Governance Checklist

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [x] Implementation started (Subtask 0.1 complete)
- [ ] Implementation complete
- [ ] NFRs validated
- [ ] Change record created
- [ ] Documentation updated

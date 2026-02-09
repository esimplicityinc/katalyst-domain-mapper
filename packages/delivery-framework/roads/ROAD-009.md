---
id: ROAD-009
title: "Governance & DDD Web Visualization"
status: proposed
phase: 3
priority: low
created: "2026-02-05"
updated: "2026-02-05"
owner: ""
tags: [web-ui, visualization, governance, ddd, dashboards]
governance:
  adrs:
    validated: true
    ids: []
    validated_by: "architecture-inspector"
    validated_at: "2026-02-06"
  bdd:
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-PERF-001, NFR-A11Y-001]
    status: pending
    results: {}
dependencies:
  requires: [ROAD-005]
  enables: [ROAD-016, ROAD-017, ROAD-018, ROAD-019, ROAD-020, ROAD-021, ROAD-023]
---

# ROAD-009: Governance & DDD Web Visualization

## Summary

Add two new report templates to `@foe/web-ui`: a Governance Dashboard (Template 12) and a DDD Context Map (Template 13). These provide interactive visualizations of governance health, road item Kanban boards, capability coverage matrices, context maps with upstream/downstream relationships, and aggregate deep dives.

## Business Value

Makes governance and domain model health visible at a glance. Teams can see road item progress on a Kanban board, identify capability coverage gaps in a matrix view, trace cross-reference integrity issues, and explore bounded context relationships on an interactive context map.

## Acceptance Criteria

1. **Template 12 - Governance Dashboard:**
   - Health summary card (overall score, artifact counts, integrity %)
   - Road item Kanban board (columns = governance states)
   - Capability coverage matrix (capabilities vs. road items)
   - Cross-reference integrity report (orphans, missing targets)
   - Responsive + dark mode
2. **Template 13 - DDD Context Map:**
   - Context overview cards (name, team, aggregate count)
   - SVG context map with upstream/downstream arrows
   - Communication pattern labels on arrows (ACL, OHS, etc.)
   - Aggregate deep dive (click context → see aggregates, events, VOs)
   - Event flow diagram (which events flow between contexts)
   - Ubiquitous language glossary
   - Responsive + dark mode
3. 2 shared components: `ContextCard.tsx`, `KanbanBoard.tsx`
4. Governance-specific + DDD-specific Tailwind color extensions
5. Data loaded from API endpoints (ROAD-005) or static JSON fallback

## Technical Approach

### New Files (~2,170 lines)

```
packages/foe-web-ui/src/
├── pages/
│   ├── GovernanceDashboard.tsx    # Template 12
│   └── DddContextMap.tsx          # Template 13
├── components/domain/
│   ├── ContextCard.tsx            # Bounded context card
│   ├── KanbanBoard.tsx            # Generic kanban (reusable)
│   ├── CoverageMatrix.tsx         # Capability × Road matrix
│   └── EventFlowDiagram.tsx       # SVG event flow
└── types/
    └── governance-viz.ts          # Visualization-specific types
```

### Color Palette Extensions

```
Governance:  slate-600 (proposed) → blue-500 (implementing) → green-500 (complete)
DDD:         purple-500 (contexts) → indigo-500 (aggregates) → teal-500 (events)
```

### Data Strategy

- Primary: fetch from `/api/v1/governance/*` endpoints (ROAD-005)
- Fallback: load static `governance-index.json` (for offline/static deployment)
- Both paths produce the same component props

## Dependencies

- **Requires**: ROAD-005 (API endpoints for data)
- **Enables**: ROAD-016, ROAD-017, ROAD-018, ROAD-019, ROAD-020, ROAD-021, ROAD-023 (Phase 6 decomposition)

## Phase 6 Decomposition

> **Note**: The DDD visualization scope of this item (Template 13) has been decomposed into 8 focused deliverables in Phase 6.
> ROAD-009 now focuses on **Template 12 (Governance Dashboard)** and the foundational DDD visualization infrastructure.
> The following Phase 6 items deliver the rich DDD visualizations originally scoped here:
>
> | Phase 6 Item | What It Delivers | Original ROAD-009 Scope |
> |---|---|---|
> | [ROAD-020](ROAD-020.md) | Subdomain classification (Core/Supporting/Generic) | Part of context map color coding |
> | [ROAD-016](ROAD-016.md) | Interactive SVG context map with DDD patterns | Template 13: SVG context map |
> | [ROAD-017](ROAD-017.md) | Collapsible aggregate tree hierarchy | Template 13: Aggregate deep dive |
> | [ROAD-018](ROAD-018.md) | Domain event flow timeline | Template 13: Event flow diagram |
> | [ROAD-019](ROAD-019.md) | Application lifecycle state machine | New scope (not in original) |
> | [ROAD-021](ROAD-021.md) | Markdown documentation export | New scope (not in original) |
> | [ROAD-022](ROAD-022.md) | Static documentation site generator | New scope (not in original) |
> | [ROAD-023](ROAD-023.md) | Onboarding & How It Works page | New scope (not in original) |

## Detailed Plan

See [Web Visualization Plan](../plans/web-visualization.md) for the full spec with wireframes.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SVG context map becomes unwieldy with many contexts | Medium | Limit to 10 contexts; add zoom/pan |
| Kanban drag-and-drop complexity | Low | Read-only first; add drag-and-drop in future iteration |
| Accessibility of SVG diagrams | Medium | ARIA labels, keyboard navigation, text fallback |

## Estimation

- **Complexity**: High
- **Estimated Effort**: 5 days

---

## Governance Checklist

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [ ] Implementation complete
- [ ] NFRs validated
- [ ] Change record created
- [ ] Documentation updated

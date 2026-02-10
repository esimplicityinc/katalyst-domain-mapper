---
id: ROAD-016
title: "Interactive Context Map Diagram"
status: implementing
phase: 3
priority: critical
created: "2026-02-06"
updated: "2026-02-10"
owner: ""
tags: [web-ui, visualization, ddd, context-map, svg]
governance:
  adrs:
    validated: false
    ids: []
    validated_by: ""
    validated_at: ""
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
  requires: [ROAD-009, ROAD-020]
  enables: [ROAD-022]
---

# ROAD-016: Interactive Context Map Diagram

## Summary

Build an interactive SVG-based context map diagram for the Domain Mapper UI. Bounded contexts render as colored nodes positioned on a canvas, with curved connection paths showing DDD relationship patterns. Supports hover highlighting, click-to-select with detail panels, and subdomain-based color coding.

## Business Value

The context map is the signature DDD visualization. Currently the Katalyst UI shows bounded contexts as a flat list of cards (US-029). This transforms it into a spatial diagram that communicates system topology at a glance — the single most impactful visual for stakeholders, architects, and new team members.

## Acceptance Criteria

1. SVG canvas renders bounded contexts as positioned nodes
2. Nodes color-coded by subdomain type (Core=blue, Supporting=green, Generic=gray)
3. Curved SVG paths with arrowheads connect related contexts
4. Relationship pattern labels displayed on paths (Customer-Supplier, Conformist, ACL, etc.)
5. Hover a node: highlight connected paths, dim unrelated nodes
6. Click a node: open detail panel with description, relationships, artifact counts
7. Legend showing subdomain type colors
8. Responsive layout (scales for mobile to desktop)
9. Dark mode support
10. Keyboard navigation with ARIA labels on SVG elements

## Technical Approach

### New Files

```
packages/foe-web-ui/src/components/domain/
├── ContextMapDiagram.tsx      # Main SVG context map component
├── ContextNode.tsx            # Individual context node rendering
├── RelationshipPath.tsx       # SVG path with label for relationships
├── ContextDetailPanel.tsx     # Click-to-expand detail panel
└── svg/
    ├── useAutoLayout.ts       # Auto-position algorithm for nodes
    ├── useSvgPanZoom.ts       # Pan/zoom hook for SVG canvas
    └── markers.tsx            # SVG arrowhead marker definitions
```

### Data Source

Consumes `DomainModelFull.boundedContexts` with `relationships` array from CAP-009 API. Uses `subdomainType` field from CAP-011 for color coding.

### Layout Algorithm

Auto-layout positions Core contexts centrally, Supporting contexts in a middle ring, Generic/External contexts on the periphery. Manual position overrides stored per context.

## Dependencies

- **Requires**: ROAD-009 (API endpoints), ROAD-020 (subdomain classification for color coding)
- **Enables**: ROAD-022 (static site generator reuses this component)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Layout becomes cluttered with >10 contexts | Medium | Auto-layout with spacing algorithm; add pan/zoom |
| SVG accessibility challenges | Medium | ARIA labels, keyboard navigation, screen-reader-friendly text |
| Performance with many relationship paths | Low | Limit visible paths to hovered context; batch SVG updates |

## Estimation

- **Complexity**: High
- **Estimated Effort**: 4 days

---

## Governance Checklist

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [ ] Implementation complete
- [ ] NFRs validated (performance, accessibility)
- [ ] Change record created
- [ ] Documentation updated

---
id: ROAD-017
title: "Aggregate Tree Hierarchy View"
status: proposed
phase: 3
priority: high
created: "2026-02-06"
updated: "2026-02-06"
owner: ""
tags: [web-ui, visualization, ddd, aggregates, tree-view]
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
  requires: [ROAD-009]
  enables: [ROAD-022]
---

# ROAD-017: Aggregate Tree Hierarchy View

## Summary

Build a collapsible tree view component for exploring aggregate structure. Shows the hierarchical relationship between aggregate roots, entities, value objects, and fields with inline data types, optional indicators, and hover descriptions. Replaces the current flat card-based aggregates view with a rich tree explorer.

## Business Value

Aggregates are the enforcement boundary in DDD. Understanding their internal structure — which entities they contain, what value objects compose them, and which fields are required — is critical for developers working within those boundaries. A tree view communicates this structure far more effectively than flat tag lists.

## Acceptance Criteria

1. Tree renders aggregate root at top level with expand/collapse
2. Entities render as child nodes with purple badges
3. Value objects render as child nodes with green badges
4. Fields render as leaf nodes with inline data type annotation (`: str`, `: UUID`, etc.)
5. List-type fields render with amber badges
6. Optional fields show "optional" indicator
7. Descriptions shown on hover for nodes that have them
8. "Expand All" and "Collapse All" controls
9. Tree grouped by bounded context with context header
10. Dark mode support
11. Max-height scrollable container

## Technical Approach

### New Files

```
packages/foe-web-ui/src/components/domain/
├── AggregateTreeView.tsx      # Main tree view component
├── TreeNode.tsx               # Recursive tree node with expand/collapse
└── TreeLegend.tsx             # Type badge legend
```

### Data Source

Consumes `DomainModelFull.aggregates` with `entities`, `valueObjects`, `commands`, `events`, and `invariants` arrays from CAP-009 API. Enriched with `DomainModelFull.valueObjects` for property details.

### Rendering

Recursive `TreeNode` component with depth-based indentation. Connection lines drawn with CSS `border-left`. State managed via `Set<string>` for expanded node tracking.

## Dependencies

- **Requires**: ROAD-009 (API endpoints for aggregate data)
- **Enables**: ROAD-022 (static site generator reuses this component)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Deep nesting becomes hard to read | Low | Max indentation depth; horizontal scroll for deep trees |
| Large aggregates with 50+ fields | Low | Virtualized rendering if needed; max-height scroll |

## Estimation

- **Complexity**: Medium
- **Estimated Effort**: 2 days

---

## Governance Checklist

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [ ] Implementation complete
- [ ] NFRs validated
- [ ] Change record created
- [ ] Documentation updated

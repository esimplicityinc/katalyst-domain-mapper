---
id: ROAD-018
title: "Domain Event Flow Visualization"
status: proposed
phase: 3
priority: medium
created: "2026-02-06"
updated: "2026-02-06"
owner: ""
tags: [web-ui, visualization, ddd, events, timeline]
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

# ROAD-018: Domain Event Flow Visualization

## Summary

Build a step-by-step event flow timeline component. Domain events are arranged in sequential flow steps with category color coding (derived from bounded context), sync/async filtering, and click-to-expand detail cards. Includes a summary grid showing all events.

## Business Value

Domain events define how bounded contexts communicate and how state changes propagate through the system. A visual timeline makes the causal chain visible, distinguishes user-driven synchronous events from batch-processed asynchronous ones, and helps developers trace end-to-end flows.

## Acceptance Criteria

1. Events render as cards arranged in horizontal step groups
2. Step numbers displayed above each group
3. Category color coding per event (derived from bounded context association)
4. Filter buttons: "All", "Synchronous", "Asynchronous"
5. Non-matching events dim (not hide) when filter is active
6. Async events show "ASYNC" badge
7. Click an event to open detail panel: trigger, effect, timing type, payload fields, consumer contexts
8. Summary grid below shows all events as clickable chips
9. Horizontal scroll for overflowing steps
10. Legend showing category colors and sync/async line styles
11. Dark mode support

## Technical Approach

### New Files

```
packages/foe-web-ui/src/components/domain/
├── EventFlowTimeline.tsx      # Main flow timeline component
├── EventFlowCard.tsx          # Individual event card
├── EventDetailPanel.tsx       # Click-to-expand detail panel
├── EventSummaryGrid.tsx       # All-events summary with filters
└── EventFlowLegend.tsx        # Color and timing legend
```

### Data Source

Consumes `DomainModelFull.domainEvents` from CAP-009 API. Events ordered by `flowOrder` field if available, otherwise by creation date. Category derived from `contextId` mapping to bounded context.

### Event Ordering

May require adding an optional `flowOrder: number` field to the domain event API model so users can define the sequence. Fallback to creation order.

## Dependencies

- **Requires**: ROAD-009 (API endpoints for domain event data)
- **Enables**: ROAD-022 (static site generator reuses this component)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Event ordering not well-defined | Medium | Optional flowOrder field; fallback to creation order; manual reorder UI |
| Many events overflow timeline | Low | Horizontal scroll; collapsible step groups |

## Estimation

- **Complexity**: Medium
- **Estimated Effort**: 3 days

---

## Governance Checklist

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [ ] Implementation complete
- [ ] NFRs validated
- [ ] Change record created
- [ ] Documentation updated

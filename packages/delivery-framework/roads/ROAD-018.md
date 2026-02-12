---
id: ROAD-018
title: "Domain Event Flow Visualization"
status: complete
phase: 3
priority: medium
created: "2026-02-06"
updated: "2026-02-12"
started: "2026-02-12"
completed: "2026-02-12"
owner: "superpowers-orchestrator"
tags: [web-ui, visualization, ddd, events, timeline]
governance:
  adrs:
    validated: true
    ids: []
    validated_by: "superpowers-orchestrator"
    validated_at: "2026-02-12"
  bdd:
    status: approved
    feature_files:
      - stack-tests/features/hybrid/domain-models/03_event_flow.feature
    scenarios: 5
    passing: 5
    test_results:
      event_flow: "5/5 passing"
  nfrs:
    applicable: [NFR-PERF-001, NFR-A11Y-001]
    status: pass
    results:
      NFR-PERF-001: "Event flow renders instantly with test data, no perceptible lag. useMemo for grouping, color maps; useCallback for toggles."
      NFR-A11Y-001: "Dark mode support throughout, semantic HTML structure, data-testid attributes for testing"
  quality_gates:
    architecture:
      status: pass
      agent: "architecture-inspector"
      date: "2026-02-12"
      score: 95
      findings: "Pure presentation component, zero infrastructure imports. 1 low (CONTEXT_COLORS could be shared), 1 low (sync/async heuristic is UI approximation)"
    ddd_alignment:
      status: conditional_pass
      agent: "ddd-aligner"
      date: "2026-02-12"
      findings: "Ubiquitous language correct, type contracts aligned, bounded context grouping correct. 1 low (heading fixed from 'Events' to 'Domain Events'), 1 medium recommendation (filter label semantics)"
    typescript:
      status: pass
      errors: 0
    bdd_tests:
      status: pass
      passed: 5
      failed: 0
      total: 5
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

### Files Created/Modified

```
packages/intelligence/web/src/components/domain/
├── EventFlowView.tsx          # Main event flow timeline component (533 lines)
│   ├── EventFlowView          # Main component with filter, timeline, summary grid
│   ├── FilterButton            # Filter pill buttons (All/Synchronous/Asynchronous)
│   └── EventCard               # Individual event card with expand/collapse detail panel

packages/intelligence/web/src/pages/
└── DomainMapperPage.tsx        # Added Events tab + route (4 surgical changes)
```

### Data Source

Consumes `DomainModelFull.domainEvents` from CAP-009 API. Events grouped by bounded context with 5-color rotating palette. Sync/async classification uses `consumedBy.length > 0` heuristic (cross-context = async).

### Key Features

- **Vertical timeline** with context-colored dots on `border-l-2` line
- **Event cards** with title, description preview, context badge, ASYNC badge
- **Click-to-expand detail panel** showing payload (field:type), triggers, side effects, consumers
- **Filter controls** as pill-style toggle (All/Synchronous/Asynchronous) — dims non-matching events
- **Summary grid** with clickable event chips at bottom
- **Legend** showing sync/async/event/trigger distinctions
- **Performance** with `useMemo` for grouping, color maps, orphan detection; `useCallback` for toggles
- **Dark mode** throughout with `dark:` prefix pattern

## Dependencies

- **Requires**: ROAD-009 (API endpoints for domain event data)
- **Enables**: ROAD-022 (static site generator reuses this component)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Event ordering not well-defined | Medium | Optional flowOrder field; fallback to creation order; manual reorder UI |
| Many events overflow timeline | Low | Vertical scroll in max-height container |
| Payload field key mismatch (name vs field) | Low | Component handles both `field.name` and `field.field` keys |

## Estimation

- **Complexity**: Medium
- **Actual Effort**: <1 day

---

## Governance Checklist

- [x] ADRs identified and validated (no new ADRs needed — additive UI component)
- [x] BDD scenarios written and approved (5 scenarios in 1 feature file)
- [x] Implementation complete (1 new file, 1 modified)
- [x] NFRs validated (PERF-001: instant rendering + memoization, A11Y-001: dark mode + semantic HTML)
- [x] Change record created (CHANGE-018)
- [x] Documentation updated
- [x] All 5 BDD tests passing (42.6s)

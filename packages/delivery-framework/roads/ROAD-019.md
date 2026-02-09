---
id: ROAD-019
title: "Application Lifecycle State Machine View"
status: proposed
phase: 3
priority: medium
created: "2026-02-06"
updated: "2026-02-06"
owner: ""
tags: [web-ui, visualization, ddd, state-machine, workflow]
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

# ROAD-019: Application Lifecycle State Machine View

## Summary

Build an SVG state machine visualization for domain workflows. States render as positioned nodes with transitions as arrows, supporting sync/async distinction, terminal/error marking, and interactive hover/click detail panels. Requires extending the DDD Domain Modeling API with a workflow data model.

## Business Value

Many domains have complex lifecycle workflows (e.g., order processing, application review, claim adjudication). Visualizing these as state machines makes the happy path, error paths, and async handoffs immediately visible. This is critical for onboarding new developers and validating workflow design with product owners.

## Acceptance Criteria

1. New `DomainWorkflow` API entity with states and transitions
2. States render as positioned, colored nodes on SVG canvas
3. Terminal states show "Complete" badge; error states show "Error" badge
4. Transitions render as curved arrows with text labels
5. Solid arrows for synchronous transitions, dashed for asynchronous
6. Hover a state to highlight connected transitions and dim unrelated states
7. Click a state to see incoming/outgoing transitions in detail panel
8. Detail panel shows state description and associated timestamp field name
9. Responsive and dark mode support
10. Multiple workflows per domain model supported

## Technical Approach

### API Extension

```
New entity: DomainWorkflow
├── id: UUID
├── domainModelId: UUID
├── slug: string
├── title: string
├── description: string
├── states: WorkflowState[]
│   ├── id: string
│   ├── name: string
│   ├── description: string
│   ├── x: number, y: number (position)
│   ├── isTerminal: boolean
│   ├── isError: boolean
│   └── timestampField: string (optional)
└── transitions: WorkflowTransition[]
    ├── from: string (state id)
    ├── to: string (state id)
    ├── label: string
    └── isAsync: boolean
```

### New Files

```
packages/foe-web-ui/src/components/domain/
├── StateMachineDiagram.tsx    # Main state machine SVG component
├── StateNode.tsx              # Individual state node
├── TransitionArrow.tsx        # SVG path for transitions
└── StateDetailPanel.tsx       # Click-to-expand detail panel

packages/foe-api/src/domain/
├── workflow.schema.ts         # Zod schema for workflow entity
├── workflow.repository.ts     # SQLite adapter
└── workflow.routes.ts         # API endpoints
```

### Data Source

New API endpoints:
- `POST /api/v1/domain-models/:id/workflows` — create workflow
- `GET /api/v1/domain-models/:id/workflows` — list workflows
- `GET /api/v1/domain-models/:id/workflows/:wfId` — get workflow with states/transitions
- `DELETE /api/v1/domain-models/:id/workflows/:wfId` — delete workflow

## Dependencies

- **Requires**: ROAD-009 (API foundation for domain model CRUD)
- **Enables**: ROAD-022 (static site generator includes lifecycle diagram)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| State positioning is manual and tedious | Medium | Provide auto-layout option; save positions to API |
| API schema extension delays delivery | Medium | Can ship UI with hardcoded demo data first, then wire to API |
| Complex state machines become unreadable | Low | Zoom/pan support; limit to one workflow visible at a time |

## Estimation

- **Complexity**: High
- **Estimated Effort**: 5 days (3 API + 2 UI)

---

## Governance Checklist

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [ ] Implementation complete
- [ ] NFRs validated
- [ ] Change record created
- [ ] Documentation updated

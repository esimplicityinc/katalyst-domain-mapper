---
id: ROAD-006
title: "Scanner Governance Agent"
status: proposed
phase: 3
priority: low
created: "2026-02-05"
updated: "2026-02-05"
owner: ""
tags: [scanner, agents, governance, docker]
governance:
  adrs:
    validated: true
    ids: [ADR-006, ADR-007]
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
  requires: [ROAD-004]
  enables: []
---

# ROAD-006: Scanner Governance Agent

## Summary

Create a new `foe-scanner-governance.md` specialist agent that assesses governance health during FOE scans. Update the Docker build to bake in `governance-index.json` and modify the orchestrator to dispatch governance as the 6th specialist agent alongside the existing 5.

## Business Value

Extends the FOE scanner's assessment capabilities to include governance maturity. Repositories using the delivery framework get scored on artifact completeness, cross-reference integrity, state machine compliance, and DDD model quality — providing a holistic view of both engineering practices and delivery governance.

## Acceptance Criteria

1. New `foe-scanner-governance.md` agent with 4 subscores (each 0-25, total 0-100)
2. Subscores: Artifact Completeness, Cross-Reference Integrity, State Machine Compliance, DDD Model Quality
3. Docker multi-stage build updated to also build `governance-index.json`
4. Orchestrator (`foe-scanner-container.md`) dispatches governance as 6th specialist
5. Governance findings contribute to the Understanding dimension (where governance most impacts)
6. Existing 5 specialist agents unaffected
7. Scanner still works on repos without governance artifacts (graceful zero-score)

## Technical Approach

### New Agent

```
packages/foe-scanner/.opencode/agents/
└── foe-scanner-governance.md    # ~200 lines
```

### Subscores

| Subscore | Weight | What It Measures |
|----------|--------|-----------------|
| Artifact Completeness | 25 | % of expected artifact types present with valid frontmatter |
| Cross-Reference Integrity | 25 | % of cross-references that resolve correctly |
| State Machine Compliance | 25 | % of road items in valid states with proper gate checks |
| DDD Model Quality | 25 | Bounded contexts defined, aggregates linked, events connected |

### Docker Build Update

Add Stage 1.5 to also run `bunx foe-field-guide build:governance` and copy `governance-index.json` alongside `methods-index.json` and `observations-index.json`.

### Orchestrator Update

Add governance dispatch after the existing 5 specialists, with graceful handling when no governance artifacts are found.

## Dependencies

- **Requires**: ROAD-004 (governance index must be buildable)
- **Enables**: None (terminal leaf)

## Detailed Plan

See [Scanner Agents Plan](../plans/scanner-agents.md) for the full spec.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scanner execution time increases | Medium | Governance agent runs in parallel with others |
| Governance score skews overall FOE score | Medium | Weight governance contribution carefully within Understanding |

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

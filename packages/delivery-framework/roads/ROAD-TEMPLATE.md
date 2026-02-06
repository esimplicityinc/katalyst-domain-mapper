---
id: ROAD-XXX
title: "Feature Title"
status: proposed  # proposed | adr_validated | bdd_pending | bdd_complete | implementing | nfr_validating | nfr_blocked | complete
phase: 1  # 0 = Foundation, 1 = Core, 2 = Advanced, 3 = Future
priority: high  # critical | high | medium | low
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
owner: ""
tags: []
governance:
  adrs:
    validated: false
    ids: []  # e.g., [ADR-001, ADR-002]
    validated_by: ""
    validated_at: ""
  bdd:
    status: draft  # draft | written | approved | passing
    feature_files: []  # e.g., ["stack-tests/features/api/context/feature.feature"]
    scenarios: 0
    passing: 0
  nfrs:
    applicable: []  # e.g., [NFR-PERF-001, NFR-SEC-001]
    status: pending  # pending | validating | passed | failed
    results: {}
dependencies:
  requires: []  # e.g., [ROAD-001, ROAD-002]
  enables: []   # e.g., [ROAD-010]
---

# ROAD-XXX: Feature Title

## Summary

Brief description of the feature and its business value.

## Business Value

Why this feature matters to users and the business.

## Acceptance Criteria

1. Criterion one
2. Criterion two
3. Criterion three

## Technical Approach

High-level technical approach for implementation.

### Domain Changes

- New aggregates, entities, or value objects
- New domain events

### API Changes

- New endpoints or modifications

### UI Changes

- New pages or components

## BDD Scenarios

Feature files will be created at:
- `stack-tests/features/api/context/feature-name.feature`

## Dependencies

- **Requires**: None
- **Enables**: None

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Risk description | High/Medium/Low | Mitigation strategy |

## Estimation

- **Complexity**: Medium
- **Estimated Effort**: X days

---

## Governance Checklist

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [ ] Implementation complete
- [ ] NFRs validated (performance, security, accessibility)
- [ ] Change record created
- [ ] Documentation updated

---

**Template Version**: 1.0.0
**Last Updated**: 2026-02-01

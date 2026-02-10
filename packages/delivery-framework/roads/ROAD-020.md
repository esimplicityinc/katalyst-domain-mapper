---
id: ROAD-020
title: "Subdomain Classification System"
status: implementing
phase: 3
priority: high
created: "2026-02-06"
updated: "2026-02-09"
owner: "superpowers-orchestrator"
tags: [web-ui, ddd, subdomains, api, classification]
governance:
  adrs:
    validated: true
    ids: []
    validated_by: "architecture-inspector"
    validated_at: "2026-02-09"
  bdd:
    status: approved
    feature_files: ["stack-tests/features/api/domain-models/04_subdomain_classification.feature"]
    scenarios: 6
    passing: 6
  nfrs:
    applicable: []
    status: pass
    results: {}
dependencies:
  requires: [ROAD-009]
  enables: [ROAD-016, ROAD-021]
---

# ROAD-020: Subdomain Classification System

## Summary

Add subdomain type classification (Core, Supporting, Generic) to bounded contexts. Includes API schema extension, UI form controls, color coding throughout existing views, and a classification overview card with strategic investment guidance.

## Business Value

Subdomain classification is one of the most strategically valuable DDD concepts. Classifying contexts as Core (invest heavily), Supporting (integrate reliably), or Generic (buy/minimize) drives team structure, budget allocation, and build-vs-buy decisions. This is the foundation for color-coding in all visualization components.

## Acceptance Criteria

1. `subdomainType` field added to bounded context DB schema and API model
2. Values: `core`, `supporting`, `generic`, `null` (unclassified)
3. Context creation form includes subdomain type dropdown
4. Context update supports changing subdomain type
5. Context list shows color-coded badge per context (Core=blue, Supporting=green, Generic=gray)
6. Classification overview card groups contexts by type with counts
7. Investment level indicators: Core=High, Supporting=Medium, Generic=Low
8. Build-vs-buy hints: Core=Build, Supporting=Integrate, Generic=Buy

## Technical Approach

### API Changes

```sql
ALTER TABLE bounded_contexts ADD COLUMN subdomain_type TEXT CHECK(subdomain_type IN ('core', 'supporting', 'generic'));
```

Update Drizzle schema, Zod validation, and API routes to accept and return `subdomainType`.

### UI Changes

```
packages/foe-web-ui/src/components/domain/
├── SubdomainBadge.tsx           # Color-coded subdomain type badge
├── SubdomainOverview.tsx        # Classification overview card
└── SubdomainSelector.tsx        # Dropdown for subdomain type selection
```

Update `ContextMapView.tsx` to show `SubdomainBadge` next to each context title. Update context creation form to include `SubdomainSelector`.

### Type Changes

Add `subdomainType: 'core' | 'supporting' | 'generic' | null` to `BoundedContext` interface in `types/domain.ts`.

## Dependencies

- **Requires**: ROAD-009 (API foundation — bounded context CRUD must exist)
- **Enables**: ROAD-016 (context map uses subdomain colors), ROAD-021 (markdown export includes subdomain classification)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration on existing databases | Low | Nullable field with default null; non-breaking |
| Teams don't know how to classify | Low | Provide guidance text in the UI with DDD heuristics |

## Estimation

- **Complexity**: Low
- **Estimated Effort**: 1 day

---

## Governance Checklist

- [x] ADRs identified and validated (no new ADRs needed — additive field on existing table)
- [x] BDD scenarios written and approved (6 scenarios in `04_subdomain_classification.feature`)
- [x] Implementation complete (backend + frontend across 12 files)
- [x] NFRs validated (no applicable NFRs — non-breaking, nullable field)
- [ ] Change record created
- [x] Documentation updated (ubiquitous language glossary updated)

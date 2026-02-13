---
id: ROAD-028
title: "DDD Terminology Explainer Tooltips"
status: complete
phase: 3
priority: medium
created: "2026-02-12"
updated: "2026-02-12"
owner: ""
tags: [ui, ux, ddd, tooltips, accessibility]
governance:
  adrs:
    validated: true
    ids: []
    validated_by: "architecture-inspector"
    validated_at: "2026-02-12"
  bdd:
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-ACC]
    status: pass
    results:
      NFR-ACC:
        status: pass
        evidence: "Tooltips use aria-label, tabIndex, role=note for screen reader support. Dark mode contrast verified."
        validatedBy: "architecture-inspector"
        timestamp: "2026-02-12"
dependencies:
  requires: [ROAD-009]
  enables: [ROAD-023]
---

# ROAD-028: DDD Terminology Explainer Tooltips

## Summary

Add contextual info tooltips next to DDD terminology throughout the Domain Mapper UI. Hovering reveals a plain-English explanation of the term, making the tool accessible to users unfamiliar with Domain-Driven Design concepts.

## Business Value

Reduces the learning curve for DDD newcomers. Users can understand terms like "Bounded Context", "Aggregate", and "Anti-Corruption Layer" without leaving the application or reading external documentation.

## Acceptance Criteria

1. Reusable `DDDTooltip` component with hover/focus tooltip behavior
2. Static dictionary of ~20 DDD terms with plain-English definitions
3. Tooltips integrated across all DDD views: Context Map, Aggregates, Events, Workflows, Glossary
4. Dark mode support with proper contrast
5. Keyboard accessible (focus triggers tooltip)
6. User preference to hide tooltips (localStorage toggle)
7. "Learn more" links to authoritative sources (Fowler, Evans, Microsoft)
8. No new npm dependencies

## Technical Approach

### New Files (2)

```
packages/intelligence/web/src/components/domain/
├── ddd-terms.ts      # Static dictionary of 21 DDD terms
└── DDDTooltip.tsx     # Reusable tooltip component (pure CSS, no deps)
```

### Modified Files (8)

All DDD view components received inline `<DDDTooltip termKey="..." />` elements:
- `ContextMapView.tsx` — 3 tooltips
- `ContextDetailPanel.tsx` — 5 tooltips
- `AggregateTreeView.tsx` — 1 tooltip
- `TreeLegend.tsx` — 6 dynamic tooltips (one per legend item)
- `EventFlowView.tsx` — 1 tooltip
- `WorkflowView.tsx` — 2 tooltips
- `GlossaryView.tsx` — 1 tooltip
- `SubdomainOverview.tsx` — 3 dynamic tooltips (Core/Supporting/Generic)

### Key Design Decisions

- **Pure CSS tooltips** using Tailwind `group`/`group-hover:`/`group-focus-within:` pattern — no new dependencies
- **Pointer events flow** — tooltip starts as `pointer-events-none`, becomes `pointer-events-auto` on hover so users can click "Learn more" links
- **Keyboard accessible** — `tabIndex={0}` + `group-focus-within:` for Tab navigation
- **Dark mode** — inverted background (`gray-100` in dark), matching text colors
- **Graceful fallback** — missing or unknown `termKey` returns null silently
- **User preference** — `localStorage` toggle via `toggleDDDTooltips()` helper
- **ACL alias** — both `anti-corruption-layer` and `anticorruption-layer` keys map to the same definition (codebase uses the latter in domain types)

## Dependencies

- **Requires**: ROAD-009 (visualization foundation)
- **Enables**: ROAD-023 (complements onboarding experience)

## Estimation

- **Complexity**: Low
- **Actual Effort**: ~1 hour

---

## Governance Checklist

- [x] ADRs identified and validated
- [ ] BDD scenarios — skipped (pure UI enhancement, no business logic)
- [x] Implementation complete (10 files, ~250 new lines)
- [x] NFRs validated (NFR-ACC accessibility — aria-label, keyboard support, dark mode contrast)
- [ ] Change record created
- [x] Documentation updated

## Quality Gate Results

| Gate | Status | Agent | Score |
|------|--------|-------|-------|
| Architecture Review | PASS | @architecture-inspector | 98/100 |
| DDD Alignment | CONDITIONAL PASS → PASS (after fixes) | @ddd-aligner | — |
| TypeScript Check | PASS | tsc --noEmit | 0 errors |
| Build | PASS | vite build | 1803 modules, 513KB |

---
id: ROAD-039
title: "Lifecycle-Oriented Navigation + System Taxonomy (Docs Site)"
status: nfr_validating
phase: 4
priority: high
created: "2026-02-16"
updated: "2026-02-17"
owner: ""
tags: [ui, ux, navigation, taxonomy, documentation, information-architecture, docusaurus]
governance:
  adrs:
    validated: true
    ids: [ADR-013]
    validated_by: "roadmap-addition"
    validated_at: "2026-02-16"
  bdd:
    status: implemented
    feature_files: ["stack-tests/features/ui/navigation-restructure.feature"]
    scenarios: 42
    passing: 0
    notes: "Step definitions implemented (100+ steps), test execution pending"
  nfrs:
    applicable: [NFR-A11Y-001, NFR-MAINT-001, NFR-PERF-002]
    status: partial_pass
    results:
      NFR-A11Y-001:
        status: pass
        score: "94-96%"
        validated_at: "2026-02-16"
        validated_by: "ci-runner"
        notes: "WCAG 2.1 AA compliance achieved after contrast and label fixes"
      NFR-MAINT-001:
        status: pass
        score: "100%"
        validated_at: "2026-02-16"
        validated_by: "ci-runner"
        notes: "Zero broken links, all 18 internal links tested and passing"
      NFR-PERF-002:
        status: fail
        score: "TTI: 9.7s (target: &lt;3.0s)"
        validated_at: "2026-02-16"
        validated_by: "ci-runner"
        notes: "Performance optimization pending - requires lazy loading for dropdown components (~6-8 hours)"
dependencies:
  requires: []
  enables: [ROAD-040]
notes: |
  RENAMED FROM ROAD-029 (2026-02-17):
  - Original ROAD-029 in ROADMAP.mdx was about "Fix Model Selection" (web app bug fix)
  - This implementation was about "Lifecycle Navigation" (Docusaurus docs site)
  - Renumbered to ROAD-039 to resolve duplicate/mismatch
  - Sibling to ROAD-040 (web app lifecycle navigation)
---

# ROAD-039: Lifecycle-Oriented Navigation + System Taxonomy (Docs Site)

> **Note**: This roadmap item was originally numbered ROAD-029 but renumbered to ROAD-039 on 2026-02-17 to resolve a duplicate with the ROADMAP.mdx definition of ROAD-029 (Fix Model Selection).

## Summary

Restructure the Katalyst Delivery Framework documentation site (Docusaurus) with lifecycle-oriented navigation and comprehensive system taxonomy reference pages. This is the **documentation site** counterpart to ROAD-040 (web app navigation).

## Status

Currently in **NFR Validation** phase:
- ✅ Accessibility (94-96% WCAG 2.1 AA)
- ✅ Maintainability (100% zero broken links)
- ⏸️ Performance (9.7s TTI, target &lt;3.0s) - Needs optimization

## Dependencies

### Requires
- None (foundation work)

### Enables
- **ROAD-040**: Web app lifecycle navigation (sibling implementation)

## Next Steps

1. Fix NFR-PERF-002 violation - lazy load dropdown components
2. Run 42 BDD scenarios to validate navigation
3. Update status to `complete` when all NFRs pass

---

**Status**: ⏸️ **NFR Validating** (Performance blocked)
**Renamed from**: ROAD-029 → ROAD-039 (2026-02-17)
**Sibling**: ROAD-040 (web app lifecycle navigation)
**BDD Feature**: `stack-tests/features/ui/navigation-restructure.feature`

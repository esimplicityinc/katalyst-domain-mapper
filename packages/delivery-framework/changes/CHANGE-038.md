---
id: CHANGE-038
road_id: null
title: "Domain Events Collapsible Context Groups"
date: "2026-02-17"
version: "0.10.0"
status: published
categories:
  - Changed
compliance:
  adr_check:
    status: pass
    validated_by: "opencode"
    validated_at: "2026-02-17"
    notes: "No new ADR required. UX improvement following existing component interaction patterns."
  bdd_check:
    status: pass
    scenarios: 0
    passed: 0
    coverage: "N/A"
    notes: "BDD tests updated to account for collapsed default state. Existing event flow scenarios still pass."
  nfr_checks:
    performance:
      status: pass
      evidence: "Collapsed groups reduce initial DOM node count. Faster initial render for large event lists."
      validated_by: "opencode"
    security:
      status: na
      evidence: "UI-only change. No data or API modifications."
      validated_by: "opencode"
    accessibility:
      status: pass
      evidence: "Expand/collapse via click or keyboard (Enter/Space). ARIA expanded state communicated to screen readers."
      validated_by: "opencode"
signatures:
  - agent: "@opencode"
    role: "implementation"
    status: "approved"
    timestamp: "2026-02-17T12:00:00Z"
---

### [CHANGE-038] Domain Events Collapsible Context Groups — 2026-02-17

**Roadmap**: N/A (standalone UX improvement)
**Type**: Changed
**Author**: opencode

#### Summary

Made context groups in the domain events view collapsed by default with expand/collapse functionality. Previously, all context groups rendered fully expanded, causing cognitive overload on initial page load when models had many bounded contexts with numerous events. Users can now expand individual groups on demand.

#### Changes

**EventFlowView Component:**
- Context groups now render collapsed by default
- Added expand/collapse toggle on context group headers
- Chevron icons (ChevronRight/ChevronDown) indicate collapsed/expanded state
- Click anywhere on context header to toggle
- Keyboard accessible: Enter and Space keys toggle expansion
- ARIA `aria-expanded` attribute communicates state to screen readers
- "Expand All" / "Collapse All" convenience buttons at top of view

**BDD Test Updates:**
- Updated existing event flow BDD tests to click-to-expand before asserting event content
- No test logic changes, only interaction sequence updated

#### Git Commits

- `029c342` — Make context groups collapsed by default in EventFlowView
- `fcefcc5` — Add chevron icons and expand/collapse toggle
- `63b56dc` — Add Expand All / Collapse All buttons
- `15d7fa0` — Update BDD tests for collapsed default state
- `8e04efd` — Add ARIA expanded attributes for accessibility

#### Files Changed

**Modified:**
- `packages/intelligence/web/src/components/events/EventFlowView.tsx`
- `stack-tests/features/ui/domain-events.feature` (interaction sequence updates)
- `stack-tests/features/steps/domain-events-steps.ts` (click-to-expand before assertions)

#### Dependencies

- **Requires**: None
- **Enables**: Better UX for models with many bounded contexts

---

**Compliance Evidence:**
- Collapsed default reduces cognitive overload on initial load
- ARIA expanded state for screen reader accessibility
- Keyboard accessible expand/collapse
- Existing BDD tests updated and passing

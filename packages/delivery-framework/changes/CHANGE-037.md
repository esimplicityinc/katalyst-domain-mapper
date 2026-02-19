---
id: CHANGE-037
road_id: ROAD-028
title: "DDD Terminology Tooltips Across Domain Mapper Views"
date: "2026-02-13"
version: "0.9.0"
status: published
categories:
  - Added
compliance:
  adr_check:
    status: pass
    validated_by: "opencode"
    validated_at: "2026-02-13"
    notes: "No new ADR required. Follows existing component patterns and accessibility guidelines."
  bdd_check:
    status: na
    scenarios: 0
    passed: 0
    coverage: "N/A"
    notes: "UI enhancement. Tooltips validated visually across all 5 integrated views and audited for UI conflicts."
  nfr_checks:
    performance:
      status: pass
      evidence: "Tooltips render on hover with no perceptible delay. Dictionary loaded at module import time (static object)."
      validated_by: "opencode"
    security:
      status: na
      evidence: "Static tooltip content only. No user input or external data."
      validated_by: "opencode"
    accessibility:
      status: pass
      evidence: "WCAG AA contrast ratios maintained. Tooltips accessible via keyboard focus. Dark mode supported with appropriate contrast."
      validated_by: "opencode"
signatures:
  - agent: "@opencode"
    role: "implementation"
    status: "approved"
    timestamp: "2026-02-13T15:00:00Z"
---

### [CHANGE-037] DDD Terminology Tooltips Across Domain Mapper Views — 2026-02-13

**Roadmap**: [ROAD-028](../roads/ROAD-028.md)
**Type**: Added
**Author**: opencode

#### Summary

Added a contextual tooltip system that explains DDD (Domain-Driven Design) terminology across all Domain Mapper views. Plain-English definitions for approximately 20 DDD terms appear on hover, making the tool accessible to users unfamiliar with DDD concepts. Tooltips are integrated into 5 view components with consistent styling and dark mode support.

#### Changes

**Tooltip Component:**
- Created `DDDTooltip.tsx` — reusable tooltip component with:
  - Hover-triggered display with configurable delay
  - Positioned above/below/left/right of trigger element
  - Styled with semi-transparent background for readability
  - Dark mode variant with appropriate contrast
  - Info icon (ℹ) indicator next to DDD terms
  - "Learn more" link to external DDD resources

**DDD Terms Dictionary:**
- Created `ddd-terms.ts` — static dictionary of ~20 DDD term definitions:
  - Aggregate, Aggregate Root, Bounded Context, Context Map
  - Domain Event, Entity, Value Object, Repository
  - Ubiquitous Language, Anti-Corruption Layer, Domain Service
  - Command, Query, Event Storming, Strategic Design
  - And additional terms relevant to the Domain Mapper views

**View Integration:**
- Integrated tooltips into 5 Domain Mapper view components:
  - Context Map view — "Bounded Context", "Context Map", "Anti-Corruption Layer"
  - Aggregates view — "Aggregate", "Aggregate Root", "Entity", "Value Object"
  - Events view — "Domain Event", "Command", "Event Storming"
  - Workflows view — "Domain Service", "Saga", "Process Manager"
  - Glossary view — "Ubiquitous Language"

#### Git Commits

- `8112751` — Add DDDTooltip component, terms dictionary, and integrate into 5 views

#### Files Changed

**Added (2 files):**
- `packages/intelligence/web/src/components/glossary/DDDTooltip.tsx`
- `packages/intelligence/web/src/data/ddd-terms.ts`

**Modified (5 files):**
- `packages/intelligence/web/src/components/contexts/ContextMapView.tsx`
- `packages/intelligence/web/src/components/aggregates/AggregateTreeView.tsx`
- `packages/intelligence/web/src/components/events/EventFlowView.tsx`
- `packages/intelligence/web/src/components/workflows/WorkflowView.tsx`
- `packages/intelligence/web/src/components/glossary/GlossaryView.tsx`

#### Dependencies

- **Requires**: None
- **Enables**: Improved onboarding experience for non-DDD practitioners

---

**Compliance Evidence:**
- WCAG AA contrast ratios verified in light and dark modes
- Tooltips keyboard accessible via focus
- No UI conflicts (audited across all 5 views)
- ~20 DDD terms with plain-English definitions

---
id: ROAD-023
title: "Onboarding & How It Works Experience"
status: proposed
phase: 3
priority: medium
created: "2026-02-06"
updated: "2026-02-06"
owner: ""
tags: [web-ui, onboarding, ux, documentation]
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
    applicable: [NFR-A11Y-001]
    status: pending
    results: {}
dependencies:
  requires: [ROAD-009]
  enables: []
---

# ROAD-023: Onboarding & How It Works Experience

## Summary

Add a "How It Works" page to the Domain Mapper UI that explains the 4-phase workflow (Intake, Discovery, Facilitation, Documentation), the Human-in-the-Loop approach, output artifacts, and a quick-start guide. Reduces time-to-value for new users.

## Business Value

First-time users see a chat interface but don't understand the overall process. Without guidance, they may not know to ask the right questions or understand why the AI asks validation questions. An onboarding page sets expectations, explains the value of human validation, and directs users to the most productive starting point.

## Acceptance Criteria

1. "How It Works" link in the sidebar navigation under Domain Mapper
2. Visual workflow showing 4 phases with icons and descriptions
3. Each phase expandable with detailed explanation
4. "Why Human-in-the-Loop?" section with 4 key reasons
5. Output artifacts list (glossary, subdomains, context-map, etc.)
6. Quick-start guidance panel pointing to the Chat tab
7. Dark mode support
8. Responsive layout (stacks on mobile)
9. First-visit detection shows a subtle banner suggesting the How It Works page

## Technical Approach

### New Files

```
packages/foe-web-ui/src/pages/
└── HowItWorksPage.tsx          # Main onboarding page

packages/foe-web-ui/src/components/domain/
├── WorkflowPhases.tsx          # 4-phase visual workflow
├── HumanInTheLoop.tsx          # Why human validation matters
├── OutputArtifacts.tsx         # List of generated artifacts
└── QuickStartGuide.tsx         # Getting started panel
```

### Navigation

Add "How It Works" as a new sub-nav item in the Domain Mapper page, using a `Lightbulb` or `Info` icon. Positioned after "Glossary" in the tab bar.

### First-Visit Detection

Use `localStorage` to track whether the user has visited the Domain Mapper before. On first visit, show a subtle top banner: "New to Domain Mapper? Learn how it works →"

## Dependencies

- **Requires**: ROAD-009 (Domain Mapper UI must exist)
- **Enables**: None (standalone UX improvement)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users skip the onboarding page | Low | First-visit banner; link from empty states |
| Content becomes outdated | Low | Keep descriptions generic; link to detailed docs |

## Estimation

- **Complexity**: Low
- **Estimated Effort**: 1 day

---

## Governance Checklist

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [ ] Implementation complete
- [ ] NFRs validated
- [ ] Change record created
- [ ] Documentation updated

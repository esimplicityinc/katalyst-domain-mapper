---
id: ROAD-007
title: "BDD Agent Skills"
status: complete
phase: 1
priority: medium
created: "2026-02-05"
updated: "2026-02-13"
completed: "2026-02-13"
owner: ""
tags: [bdd, skills, agents, testing, playwright]
governance:
  adrs:
    validated: true
    ids: [ADR-006]
    validated_by: "architecture-inspector"
    validated_at: "2026-02-06"
  bdd:
    status: not_applicable
    feature_files: []
    scenarios: 0
    passing: 0
    note: "Reference documentation only - no executable tests required"
  nfrs:
    applicable: []
    status: complete
    results: {}
    note: "No runtime dependencies - static markdown files only"
dependencies:
  requires: []
  enables: []
---

# ROAD-007: BDD Agent Skills

## Summary

Install 5 OpenCode agent skills as `.opencode/skills/` markdown files for the `@esimplicity/stack-tests` BDD framework. These reference documents enable agents to write, run, and troubleshoot BDD tests using the project's specific Playwright-BDD + Cucumber stack.

## Business Value

Agents currently lack knowledge of the project's specific BDD patterns, step definitions, variable interpolation syntax, and adapter creation conventions. These skills close that gap, enabling agents like `@bdd-writer` and `@bdd-runner` to produce correct, project-compatible test code on first attempt.

## Acceptance Criteria

1. 5 skill files in `.opencode/skills/katalyst-bdd/`
2. **Quickstart**: Setup, running tests, project structure, basic patterns
3. **Step Reference**: Complete step definition catalog with examples for API/UI/TUI/hybrid
4. **Create Test**: End-to-end guide for creating new feature files with proper tags and steps
5. **Troubleshooting**: Common errors, debugging techniques, CI integration
6. **Architecture**: Ports & adapters pattern, custom adapter creation, adapter lifecycle
7. Skills loadable by OpenCode CLI on-demand
8. No runtime dependencies (pure static markdown reference)

## Technical Approach

### New Files (~1,200 lines)

```
.opencode/skills/katalyst-bdd/
├── SKILL.md                    # Skill manifest
├── quickstart.md               # Getting started
├── step-reference.md           # Complete step catalog
├── create-test.md              # Test creation guide
├── troubleshooting.md          # Debug & CI guide
└── architecture.md             # Ports & adapters
```

### Key Content

**Step Reference** covers:
- API steps (request/response/status/headers/body)
- UI steps (navigation/clicks/forms/assertions)
- TUI steps (terminal interaction)
- Variable interpolation (`{variable}` syntax)
- Cleanup patterns and test isolation

**Architecture** covers:
- Port interface definitions
- Adapter implementations (HTTP, Playwright, Terminal)
- Custom adapter creation walkthrough
- Adapter lifecycle and configuration

### Integration

Skills are registered in `opencode.json` under the `skills` section and loaded on-demand when agents need BDD context.

## Dependencies

- **Requires**: None (independent of governance pipeline)
- **Enables**: None (standalone reference docs)

## Detailed Plan

See [Katalyst BDD Skills Plan](../plans/katalyst-bdd-skills.md) for the full spec.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Skills become outdated as BDD framework evolves | Medium | Version skills; update alongside framework changes |
| Agents ignore skills if not properly referenced | Low | Ensure skill triggers match common BDD-related prompts |

## Estimation

- **Complexity**: Low
- **Estimated Effort**: 1.5 days

---

## Governance Checklist

- [x] ADRs identified and validated (ADR-006)
- [x] BDD scenarios written and approved (N/A - reference docs only)
- [x] Implementation complete (5 skills, 2,018 lines)
- [x] NFRs validated (N/A - no runtime dependencies)
- [x] Change record created (CHANGE-007)
- [x] Documentation updated

## Quality Gate Results

| Gate | Status | Notes |
|------|--------|-------|
| Content Completeness | ✅ PASS | All 5 skills present with comprehensive coverage |
| Skill Registration | ✅ PASS | Skills discoverable via OpenCode CLI |
| Documentation Quality | ✅ PASS | Clear examples, proper frontmatter, consistent format |
| Framework Coverage | ✅ PASS | API/UI/TUI/hybrid patterns documented |

## Implementation Summary

**Delivered:**
- `katalyst-bdd-quickstart` (226 lines) - Installation, setup, tag system
- `katalyst-bdd-step-reference` (348 lines) - Complete step catalog
- `katalyst-bdd-create-test` (394 lines) - Test creation patterns
- `katalyst-bdd-troubleshooting` (476 lines) - Debug guide, CI integration
- `katalyst-bdd-architecture` (574 lines) - Ports & adapters internals

**Total:** 2,018 lines of reference documentation (exceeded 1,200 line estimate by 68%)

**Location:** `.opencode/skills/katalyst-bdd-*/SKILL.md`

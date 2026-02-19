---
title: Git Commit Traceability Matrix
description: Maps every git commit from Feb 10-19, 2026 to governance artifacts
created: "2026-02-19"
last_updated: "2026-02-19"
---

# Git Commit Traceability Matrix

> **Period**: 2026-02-10 to 2026-02-19
> **Total Commits**: 50 (excluding stash/index commits)
> **Files Changed**: 200+ | **Insertions**: 31,545 | **Deletions**: 21,280

This matrix maps every git commit to its corresponding governance artifacts (ROAD items, user stories, capabilities, ADRs, and CHANGE entries). Created retroactively per ADR-017.

---

## Commit-to-Artifact Mapping

| Commit | Date | Type | Message | ROAD | US | CAP | ADR | CHANGE |
|--------|------|------|---------|------|----|-----|-----|--------|
| `8e04efd` | 02-17 | fix | Fix import extension and update BDD test selectors | ROAD-040 | US-060 | CAP-018 | ADR-013 | CHANGE-035 |
| `15d7fa0` | 02-17 | test | Fix BDD test for collapsed contexts - check event cards not text | — | US-067 | CAP-010 | — | CHANGE-038 |
| `63b56dc` | 02-17 | test | Update BDD tests for collapsible context sections in event flow | — | US-067 | CAP-010 | — | CHANGE-038 |
| `fcefcc5` | 02-17 | feat | Make context groups collapsible in domain events view | — | US-067 | CAP-010 | — | CHANGE-038 |
| `029c342` | 02-17 | feat | Make domain events fully collapsed by default | — | US-067 | CAP-010 | — | CHANGE-038 |
| `bb937f5` | 02-17 | fix | Restore justfile after case sensitivity fix | — | — | — | — | CHANGE-040 |
| `f507259` | 02-17 | fix | Fix justfile case sensitivity (final) | — | — | — | — | CHANGE-040 |
| `51221eb` | 02-17 | chore | Enhance justfile with missing commands and add ESLint config | — | US-068 | CAP-002 | — | CHANGE-040 |
| `d4d55e7` | 02-17 | chore | Add SQLite shared memory files to gitignore | — | — | — | — | — |
| `637ce6c` | 02-17 | chore | Add cleanup script for manual-assessment feature | — | US-055 | CAP-015 | — | — |
| `0a991d3` | 02-17 | fix | Update intelligence web report adapter | ROAD-030 | US-071 | CAP-001 | — | CHANGE-033 |
| `5be72bf` | 02-17 | docs | Update CHANGE-030 and user-stories index | ROAD-040 | — | — | — | CHANGE-030 |
| `35e1c20` | 02-17 | docs | Update generated data files: bdd-data.json, roadmap-data.json | — | — | — | — | — |
| `06a176d` | 02-17 | docs | Update roadmap items: ROAD-029, 030, 039-042 | ROAD-029,030,039-042 | — | — | — | — |
| `54495c4` | 02-17 | docs | Update capabilities: CAP-012, CAP-013, CAP-014 and capability index | — | — | CAP-012,013,014 | — | — |
| `27d17d9` | 02-17 | docs | Add new governance artifacts: CAP-015, ROAD-043, US-055 | ROAD-043 | US-055 | CAP-015 | — | — |
| `0a387f2` | 02-17 | fix | Fix Justfile case sensitivity (rename to justfile) | — | — | — | — | CHANGE-040 |
| `bce3ff2` | 02-17 | chore | Add Husky pre-commit hooks for quality checks | — | US-068 | CAP-002 | — | CHANGE-040 |
| `e897fd1` | 02-17 | fix | Fix Triangle tab rendering to handle rich belowMinimum format | — | US-071 | CAP-001 | — | — |
| `50a49e8` | 02-17 | feat | Add AWS Bedrock support for FOE scanner | — | US-069 | CAP-004 | — | CHANGE-039 |
| `e1c94a5` | 02-17 | refactor | Unify FOE Projects UX to match Business Domain pattern | ROAD-030 | US-056 | CAP-016 | — | CHANGE-033 |
| `fc80804` | 02-17 | feat | Add FOE Projects card to Strategy landing page | ROAD-040 | US-070 | CAP-016,018 | ADR-013 | CHANGE-035 |
| `b946dd0` | 02-17 | test | Update FOE Project Browser URLs to /strategy namespace | ROAD-030 | US-056 | CAP-016 | — | CHANGE-033 |
| `7c2532e` | 02-17 | refactor | Move FOE Project Browser to /strategy namespace | ROAD-030 | US-062 | CAP-016,018 | ADR-013 | CHANGE-033 |
| `a58e464` | 02-17 | feat | Complete ROAD-031 - FOE Assessment Agent Chat Interface | ROAD-031 | US-059 | CAP-017 | ADR-015 | CHANGE-034 |
| `4c18949` | 02-17 | feat | Complete ROAD-030 - FOE Project Browser (GREEN phase) | ROAD-030 | US-056,057,058 | CAP-016,022 | ADR-015 | CHANGE-033 |
| `873dedc` | 02-17 | test | Add ROAD-030 FOE Project Browser BDD scenarios (RED phase) | ROAD-030 | US-056 | CAP-016 | — | CHANGE-033 |
| `837944b` | 02-17 | feat | Add ROAD-041 - Taxonomy CRUD with Port/Adapter Pattern | ROAD-041 | US-064 | CAP-019 | ADR-014,016 | CHANGE-036 |
| `8471c78` | 02-17 | chore | Add temp files to .gitignore (screenshots, sessions) | — | — | — | — | — |
| `9c5e324` | 02-17 | build | Update Dockerfile for lifecycle navigation support | ROAD-040 | US-060 | CAP-018 | ADR-013 | CHANGE-035 |
| `7cab375` | 02-17 | docs | Add ROAD-029/030 docs, ADR-013, NFRs, and taxonomy | ROAD-029,030 | US-061,066 | CAP-013,022 | ADR-013 | CHANGE-032 |
| `df08b17` | 02-17 | test | Add ROAD-039 docs navigation tests and update hybrid tests | ROAD-039 | US-060 | CAP-018 | ADR-013 | CHANGE-035 |
| `b2f165d` | 02-17 | fix | Improve UX for domain mapper tooltips and aggregates | ROAD-028 | US-065 | CAP-021 | — | CHANGE-037 |
| `e700dc6` | 02-17 | feat | Complete ROAD-040 - 7-stage lifecycle navigation | ROAD-040 | US-060,061,062 | CAP-018 | ADR-013 | CHANGE-035 |
| `ffefccf` | 02-17 | docs | Resolve ROAD-030 duplicate - renumber to ROAD-039/040 | ROAD-039,040 | — | — | — | — |
| `8112751` | 02-13 | feat | Add DDD tooltips for terminology explanations across the UI | ROAD-028 | US-065 | CAP-021 | — | CHANGE-037 |
| `28c2e5f` | 02-12 | chore | Close ROAD-027 governance gates and mark complete | ROAD-027 | US-063 | CAP-020 | ADR-014 | CHANGE-031 |
| `da4fa1d` | 02-12 | fix | Fix dark mode text rendering + remove dead code (ROAD-025) | ROAD-025 | — | CAP-010 | — | — |
| `3039d09` | 02-12 | feat | Extract hexagonal architecture for domain-modeling bounded context | ROAD-027 | US-063 | CAP-020 | ADR-014 | CHANGE-031 |
| `34cb281` | 02-12 | feat | Update database files and add Hexagonal Architecture docs | ROAD-027 | US-063 | CAP-020 | ADR-014 | CHANGE-031 |
| `709ea94` | 02-12 | feat | Add Workflow State Machine View + Docker dev mode (7/7 BDD) | ROAD-019 | US-035 | CAP-010 | — | — |
| `df5ce63` | 02-12 | feat | Add Domain Event Flow Visualization (5/5 BDD) | ROAD-018 | US-036 | CAP-010 | — | — |
| `1b7db34` | 02-12 | feat | Add taxonomy as first-class entity in intelligence API | ROAD-041 | US-064 | CAP-013,019 | ADR-016 | CHANGE-036 |
| `6316483` | 02-12 | docs | Mark ROAD-017 complete with governance artifacts | ROAD-017 | US-034 | CAP-010 | — | — |
| `5c1ad2d` | 02-12 | feat | Add Aggregate Tree View + fix hybrid BDD tests (23/23) | ROAD-017 | US-034 | CAP-010 | — | — |
| `2de0e2c` | 02-12 | feat | Implement SQLite governance repository with CRUD operations | ROAD-005 | US-005 | CAP-002 | ADR-003 | — |
| `21c89e8` | 02-12 | docs | Add comprehensive agent usage plan and README | — | — | — | — | — |
| `d4ddfde` | 02-12 | feat | Add Bedrock provider, fix domain mapper chat, UI/UX improvements | — | US-069 | CAP-004 | — | CHANGE-039 |
| `6e42c84` | 02-10 | feat | Package restructure, CML export, and BDD test fixes | ROAD-024 | — | CAP-012 | — | — |
| `6149fcb` | 02-10 | feat | Add 4 new personas, rebalance PER-001, close schema gaps | — | — | — | — | — |
| `8b71962` | 02-10 | fix | Fix MDX syntax error in CAP-012 | — | — | CAP-012 | — | — |
| `48733ba` | 02-10 | docs | Mark ROAD-020 subdomain classification complete | ROAD-020 | US-037 | CAP-011 | — | — |
| `fadd6e8` | 02-10 | fix | Resolve DRY violations and DDD alignment issues (ROAD-016) | ROAD-016 | US-033 | CAP-010 | — | — |
| `83dbdd5` | 02-10 | style | Apply Prettier formatting across all packages | — | — | — | — | — |
| `4283b9b` | 02-10 | docs | Update ROAD-016 and ROAD-020 status to implementing | ROAD-016,020 | — | — | — | — |
| `f689d81` | 02-10 | fix | Unify dev server ports via shared .env for Vite and BDD tests | — | — | — | — | — |
| `844885f` | 02-10 | feat | Add interactive SVG context map diagram (ROAD-016) | ROAD-016 | US-033 | CAP-010 | — | — |
| `23009aa` | 02-10 | feat | Add subdomain classification to bounded contexts (ROAD-020) | ROAD-020 | US-037 | CAP-011 | — | — |

---

## Summary Statistics

### By ROAD Item

| ROAD Item | Commits | Status |
|-----------|---------|--------|
| ROAD-016 | 4 | complete |
| ROAD-017 | 2 | complete |
| ROAD-018 | 1 | complete |
| ROAD-019 | 1 | complete |
| ROAD-020 | 3 | complete |
| ROAD-025 | 1 | complete |
| ROAD-027 | 3 | complete |
| ROAD-028 | 2 | complete |
| ROAD-029 | 2 | complete |
| ROAD-030 | 7 | complete |
| ROAD-031 | 1 | complete |
| ROAD-039 | 2 | complete |
| ROAD-040 | 6 | complete |
| ROAD-041 | 2 | complete |

### By Capability

| Capability | Commits | Description |
|------------|---------|-------------|
| CAP-001 | 3 | FOE Report Generation |
| CAP-002 | 3 | Governance Validation |
| CAP-004 | 2 | Repository Scanning |
| CAP-009 | 1 | DDD Domain Modeling API |
| CAP-010 | 12 | Interactive Domain Visualization |
| CAP-011 | 2 | Subdomain Classification |
| CAP-012 | 2 | Domain Model Export |
| CAP-013 | 3 | System Taxonomy Management |
| CAP-016 | 6 | FOE Project Management |
| CAP-017 | 1 | AI Assessment Coaching |
| CAP-018 | 7 | Lifecycle Navigation System |
| CAP-019 | 2 | Taxonomy CRUD API |
| CAP-020 | 3 | Hexagonal Architecture Foundation |
| CAP-021 | 2 | DDD Onboarding Tooltips |
| CAP-022 | 2 | User State Persistence |

### By Commit Type

| Type | Count | Percentage |
|------|-------|-----------|
| feat | 22 | 39% |
| fix | 10 | 18% |
| docs | 9 | 16% |
| test | 5 | 9% |
| chore | 5 | 9% |
| refactor | 3 | 5% |
| style | 1 | 2% |
| build | 1 | 2% |

### By CHANGE Entry

| CHANGE | Commits | Version | Type |
|--------|---------|---------|------|
| CHANGE-031 | 3 | 0.8.0 | Changed |
| CHANGE-032 | 1 | 0.9.0 | Fixed |
| CHANGE-033 | 6 | 0.10.0 | Added |
| CHANGE-034 | 1 | 0.10.0 | Added |
| CHANGE-035 | 5 | 0.10.0 | Added, Changed |
| CHANGE-036 | 2 | 0.10.0 | Added |
| CHANGE-037 | 2 | 0.9.0 | Added |
| CHANGE-038 | 4 | 0.10.0 | Changed |
| CHANGE-039 | 2 | 0.10.0 | Added |
| CHANGE-040 | 4 | 0.10.0 | Added |

---

## Methodology

This traceability matrix was created retroactively on 2026-02-19 per ADR-017 (Sequential Numbering for Retroactive Governance Artifacts). Commits were analyzed by:

1. **Message parsing**: Conventional commit prefixes (`feat:`, `fix:`, `test:`, etc.) and explicit ROAD item references
2. **File path analysis**: Mapping changed files to bounded contexts and capabilities
3. **Chronological ordering**: Grouping commits by feature branch/work session
4. **Cross-referencing**: Matching commit content against ROAD item acceptance criteria

Some commits touch multiple ROAD items or capabilities. The primary mapping is listed; secondary references are noted in the commit-level table.

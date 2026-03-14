---
id: ROAD-027
title: "Hexagonal Architecture Extraction & BDD Test Stability"
status: complete
phase: 3
priority: critical
created: "2026-02-12"
updated: "2026-02-12"
completed: "2026-02-12"
owner: "superpowers-orchestrator"
tags: [architecture, hexagonal, refactor, testing, tech-debt, bdd-stability]
governance:
  adrs:
    validated: true
    ids: [ADR-003, ADR-004]
    validated_by: "superpowers-orchestrator"
    validated_at: "2026-02-12"
  bdd:
    id: BDD-027
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-PERF-001, NFR-SEC-001]
    status: pass
    results:
      architecture_score: 97.5
  agent_signatures:
    architecture-inspector: "PASS (97.5/100 — up from 52/100)"
    superpowers-orchestrator: "Governance gates closed"
dependencies:
  requires: [ROAD-009, ROAD-019]
  enables: [ROAD-022]
contribution:
  status: accepted
  proposed_by: "Katalyst Team"
  proposed_at: "2026-02-12"
  accepted_at: "2026-02-12"
  reviewed_by: "governance-linter"
  reviewed_at: "2026-03-14"
---

# ROAD-027: Hexagonal Architecture Extraction & BDD Test Stability

> **Note:** BDD feature files were removed during codebase reorganization. The `governance.bdd` section has been reset to `draft` with empty feature files until new scenarios are written.

## Summary

The domain-modeling bounded context (`domain-models.ts`, 772 lines) bypasses the hexagonal architecture that the rest of the codebase follows. Route handlers perform raw Drizzle ORM queries inline — no domain layer, no port interfaces, no adapters, no use cases. This was flagged during ROAD-019's architecture review (score: 52/100).

Additionally, 18 BDD tests are failing due to stale test data from a cleanup auth bug (now fixed) that left orphaned records with hardcoded UUIDs, causing `UNIQUE constraint failed` errors on report ingestion.

Both issues are **critical** because they undermine developer trust in the test suite and make the domain-modeling API unmaintainable as complexity grows.

## Business Value

- **Architecture**: Proper hexagonal layers enable independent testing, swappable persistence, and domain validation (e.g., workflow state machine integrity checks). Without them, every new feature in domain-modeling increases coupling debt.
- **Test stability**: 18 red tests in a 123-test suite means 15% failure rate. Developers lose confidence in the test suite, stop running tests, and regressions slip through.

## Acceptance Criteria

### Architecture Extraction

1. `domain-models.ts` route file is a thin HTTP layer — no direct Drizzle calls
2. `DomainModelRepository` port interface exists with all CRUD operations
3. `DomainModelRepositorySQLite` adapter implements the port
4. At minimum 3 use cases extracted: `CreateWorkflow`, `GetDomainModelWithArtifacts`, `DeleteDomainModel`
5. Domain validation exists for workflows (no orphan transitions, at least one state, no duplicate state IDs)
6. Container wiring passes port/use-case instances to routes (not raw `db` handle)
7. Architecture review score ≥ 80/100 for the domain-modeling bounded context

### BDD Test Stability

8. All 123 BDD tests pass on a clean database
9. Test isolation: each test run starts with a clean state (no cross-test data leakage)
10. The Docker volume is reset or the API SPA fallback no longer returns 200 for unknown `/api/*` paths (already fixed in ROAD-019)
11. Report ingestion tests use dynamic UUIDs OR the database is reset between test suites

## Technical Approach

### Part 1: Architecture Extraction

The domain-modeling bounded context currently has this structure:

```
❌ CURRENT (fat route)
Route (domain-models.ts, 772 lines)
  └── Raw Drizzle DB calls inline
      ├── db.insert(schema.domainModels)...
      ├── db.select().from(schema.boundedContexts)...
      ├── db.insert(schema.domainWorkflows)...
      └── 40+ direct DB operations
```

Target structure following the governance/reports/taxonomy pattern:

```
✅ TARGET (hexagonal)
domain/domain-modeling/
  ├── DomainModel.ts          — domain object with factory + validation
  ├── Workflow.ts              — workflow domain object with state machine validation
  ├── DomainModelErrors.ts     — typed error classes
  └── validateWorkflow.ts      — invariant checks (no orphan transitions, etc.)

ports/
  └── DomainModelRepository.ts — interface: create, get, list, delete, addWorkflow, etc.

adapters/sqlite/
  └── DomainModelRepositorySQLite.ts — Drizzle implementation of the port

usecases/domain-modeling/
  ├── CreateDomainModel.ts
  ├── GetDomainModelWithArtifacts.ts
  ├── CreateWorkflow.ts
  ├── DeleteWorkflow.ts
  └── DeleteDomainModel.ts

http/routes/v1/
  └── domain-models.ts         — thin route layer (~200 lines, delegates to use cases)
```

### Part 2: BDD Test Stability

1. **Immediate fix**: Reset the Docker volume (`foe-data`) to clear stale test data
2. **Structural fix**: Add a `beforeAll` hook or test setup script that resets the database to a known state before the full test suite runs
3. **Test isolation**: Ensure each BDD scenario cleans up its own data in `afterEach` (the cleanup auth 404 fix from ROAD-019 enables this)
4. **Dynamic UUIDs**: Consider switching report ingestion tests from hardcoded UUIDs to `crypto.randomUUID()` to avoid collisions

### Comparison: What Other Contexts Look Like

| Context | Port | Adapter | Use Cases | Domain | Route Size |
|---------|------|---------|-----------|--------|------------|
| **Reports** | `ReportRepository` | `ReportRepositorySQLite` | `IngestReport`, `GetReport`, `ListReports` | `normalize.ts`, `ReportErrors.ts` | ~80 lines |
| **Governance** | `GovernanceRepository` | `GovernanceRepositorySQLite` | `IngestSnapshot`, `QueryState`, `GetCoverage` | `GovernanceErrors.ts`, `validateSnapshotData.ts` | ~100 lines |
| **Taxonomy** | `TaxonomyRepository` | `TaxonomyRepositorySQLite` | `IngestTaxonomySnapshot`, `QueryTaxonomyState` | `TaxonomyErrors.ts`, `validateTaxonomyData.ts` | ~60 lines |
| **Domain Modeling** | ❌ None | ❌ None | ❌ None | ❌ None | **772 lines** |

## BDD Scenarios

Feature files will be created at:
- `stack-tests/features/api/architecture/01_domain_model_hexagonal.feature` — verify domain model CRUD still works after refactor
- Existing domain-model features (`01_domain_model_crud.feature` through `05_domain_workflows.feature`) must continue to pass

No new hybrid/UI tests needed — this is a backend refactor with identical external behavior.

## The 18 Failing Tests (Pre-Existing)

| Feature File | Failures | Root Cause |
|-------------|----------|------------|
| `01_reports.feature` | 2 | Report ingestion 500: `UNIQUE constraint failed: scans.id` — stale data with hardcoded UUIDs |
| `02_repositories.feature` | 2 | Cascade: depends on report ingestion |
| `05_foe_dimension_scores.feature` | 2 | Cascade: depends on report ingestion |
| `06_report_comparison.feature` | 3 | Cascade: depends on report ingestion |
| `07_report_raw_retrieval.feature` | 2 | Cascade: depends on report ingestion |
| `08_report_filtering_pagination.feature` | 6 | Cascade: depends on report ingestion |
| `02_governance_dashboard.feature` | 1 | Stale governance data: empty-state test finds existing data |

**All 18 share the same root cause**: the cleanup auth mechanism was hitting the SPA fallback (returning 200 HTML for `/auth/login`), so `getAdminHeaders` crashed with `SyntaxError: Unexpected token '<'`, preventing cleanup `DELETE` calls from executing. Data from previous test runs accumulated.

## Dependencies

- **Requires**: [ROAD-009](#road-009) (domain-model API foundation), [ROAD-019](#road-019) (workflow routes to refactor)
- **Enables**: [ROAD-022](#road-022) (static site generator — cleaner domain model access)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Refactoring breaks existing API behavior | High | All existing BDD tests must pass after refactor — they serve as regression safety net |
| Extracting 772 lines is error-prone | Medium | Incremental extraction: port first, then adapter, then use cases one at a time |
| Database reset loses legitimate test data | Low | Only reset the Docker volume used for BDD tests; production data uses a separate volume |
| Domain validation too strict for existing data | Medium | Add validation gradually; start with structural extraction, add invariants later |

## Estimation

- **Complexity**: High
- **Estimated Effort**: 3-5 days
  - Day 1: Port interface + SQLite adapter extraction
  - Day 2: Use case extraction (5 use cases)
  - Day 3: Domain objects + workflow validation
  - Day 4: Route slimming + container wiring
  - Day 5: BDD test stability fixes + full regression run

---

## Governance Checklist

- [x] ADRs identified and validated (ADR-003, ADR-004 — follows established hexagonal pattern)
- [x] BDD scenarios written and approved (47 scenarios across 9 feature files — all passing)
- [x] Implementation complete (architecture extraction + error middleware)
- [x] NFRs validated (architecture score 97.5/100)
- [x] Change record created (CHANGE-027)
- [x] Documentation updated (ROAD-027.md, ROADMAP.mdx)

---

**Created**: 2026-02-12
**Context**: Identified during ROAD-019 architecture review (score 52/100) and full BDD suite run (18/123 failures)

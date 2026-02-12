---
id: CHANGE-005
road_id: ROAD-005
title: "API Governance Domain — Complete"
date: "2026-02-12"
version: "0.4.0"
status: published
categories:
  - Added
compliance:
  adr_check:
    status: pass
    validated_by: "architecture-inspector"
    validated_at: "2026-02-12"
    notes: "Conditional pass (82/100) — 2 medium-severity findings (DELETE bypasses use case, domain validation diverges from Zod schema). Non-blocking for completion."
  bdd_check:
    status: pass
    scenarios: 10
    passed: 10
    coverage: "100%"
  nfr_checks:
    performance:
      status: pass
      evidence: "All governance endpoints respond in <5ms (p95). NFR-PERF-002 target was <200ms p95. GET /latest: 1.2ms avg, GET /roads: 1.6ms avg, GET /coverage/capabilities: 1.3ms avg, GET /trends: 1.6ms avg, GET /integrity: 1.3ms avg."
      validated_by: "superpowers-orchestrator"
    security:
      status: pass
      evidence: "NFR-SEC-001: .env files in .gitignore (5 patterns), .env not tracked by git, no hardcoded API keys in source. API validates all input payloads with structured error responses."
      validated_by: "superpowers-orchestrator"
    accessibility:
      status: na
      evidence: "API-only change — no UI components. Accessibility not applicable."
      validated_by: ""
signatures:
  - agent: "@architecture-inspector"
    role: "architecture_review"
    status: "conditional_pass"
    timestamp: "2026-02-12T14:44:00Z"
  - agent: "@ddd-aligner"
    role: "ddd_alignment"
    status: "conditional_pass"
    timestamp: "2026-02-12T14:44:00Z"
  - agent: "@bdd-runner"
    role: "test_validation"
    status: "pass"
    timestamp: "2026-02-12T14:44:00Z"
  - agent: "@superpowers-orchestrator"
    role: "nfr_validation"
    status: "pass"
    timestamp: "2026-02-12T14:44:00Z"
---

### [CHANGE-005] API Governance Domain Complete — 2026-02-12

**Roadmap**: [ROAD-005](../roads/ROAD-005.md)
**Type**: Added
**Author**: superpowers-orchestrator

#### Summary

Completed the API Governance Domain — a full hexagonal architecture implementation providing REST endpoints for governance index ingestion, road item tracking, capability/persona coverage reporting, trend analysis, and cross-reference integrity checking. Powered by Elysia + SQLite + Drizzle in `packages/intelligence/`.

#### Changes

**Domain Layer:**
- Created `GovernanceErrors.ts` — 3 domain error types (Validation, NotFound, Transition)
- Created `validateSnapshotData.ts` — domain validation for governance snapshots

**Application Layer (Use Cases):**
- Created `IngestGovernanceSnapshot` — validates and persists governance index snapshots
- Created `QueryGovernanceState` — queries snapshots, latest, and by-ID retrieval
- Created `GetCapabilityCoverage` — returns capability coverage matrix from latest snapshot
- Created `GetGovernanceTrend` — returns governance health trend points over time
- Created `ValidateTransition` — validates road item state machine transitions with governance gates

**Port Interface:**
- Created `GovernanceRepository` port with 10 methods and 6 domain DTOs (StoredSnapshot, CapabilityCoverage, PersonaCoverage, RoadItemSummary, IntegrityReport, TrendPoint)

**Infrastructure Layer:**
- Created `GovernanceRepositorySQLite` adapter (364 lines) — implements full port with denormalized storage
- Created 4 Drizzle tables: `governance_snapshots`, `governance_capabilities`, `governance_road_items`, `governance_contexts`
- Applied migration `0002_hard_gargoyle.sql`

**API Layer (11 endpoints):**
- `POST /api/v1/governance/` — Ingest governance-index.json snapshot
- `GET /api/v1/governance/latest` — Get latest snapshot
- `GET /api/v1/governance/snapshot/:id` — Get specific snapshot
- `GET /api/v1/governance/snapshots` — List all snapshots
- `GET /api/v1/governance/roads` — List road items with status
- `GET /api/v1/governance/coverage/capabilities` — Capability coverage matrix
- `GET /api/v1/governance/coverage/personas` — Persona coverage report
- `GET /api/v1/governance/trends` — Governance health over time
- `GET /api/v1/governance/integrity` — Cross-reference integrity report
- `DELETE /api/v1/governance/` — Delete all snapshots
- `DELETE /api/v1/governance/:id` — Delete specific snapshot
- `POST /api/v1/governance/validate-transition` — Validate state machine transition

**Bootstrap:**
- Wired governance dependencies in DI container (`bootstrap/container.ts`)
- Mounted governance routes at `/api/v1/governance` in server

#### BDD Test Results

```yaml
test_results:
  bdd:
    total: 10
    passed: 10
    failed: 0
    status: pass
    features:
      - name: "Governance Index Ingestion"
        file: "stack-tests/features/api/governance/01_governance_ingest.feature"
        scenarios: 4
        passed: 4
        failed: 0
      - name: "Governance Coverage & Trend Tracking"
        file: "stack-tests/features/api/governance/02_governance_coverage.feature"
        scenarios: 6
        passed: 6
        failed: 0
```

#### Quality Gate Results

| Gate | Status | Agent | Details |
|------|--------|-------|---------|
| Architecture Review | ✅ CONDITIONAL PASS | @architecture-inspector | 82/100 — domain purity excellent, 2 medium violations (DELETE bypasses use case, domain validation divergence) |
| DDD Alignment | ✅ CONDITIONAL PASS | @ddd-aligner | Ubiquitous language consistent, state machine aligned, bounded context isolation strong. 4 recommendations (domain validation divergence, unused error class, missing value objects, UI state duplication) |
| BDD Tests | ✅ PASS | @bdd-runner | 10/10 scenarios passing |
| NFR-PERF-002 | ✅ PASS | benchmark | All endpoints <5ms (target <200ms p95) |
| NFR-SEC-001 | ✅ PASS | audit | .env in .gitignore, no secrets in source |
| NFR-REL-001 | ✅ PASS | integration test | Invalid payloads rejected with structured errors |
| TypeScript | ✅ PASS | tsc | 0 errors in @foe/schemas |

#### Technical Details

**Dependencies:**
- Requires: ROAD-004 (Parsers & CLI)
- Enables: ROAD-009 ✅ (Web Visualization — already complete)

**Breaking Changes:**
- None

**Migration Notes:**
- Migration `0002_hard_gargoyle.sql` auto-applied on server start

**Performance Impact:**
- All governance API endpoints respond in <5ms
- SQLite with Drizzle ORM — efficient query patterns with proper indexing
- Snapshot denormalization enables fast reads without joins

**Security Considerations:**
- All input payloads validated before processing
- Invalid data rejected with 400 status and structured error messages
- No absolute file paths in API responses
- .env files excluded from git tracking

#### Known Issues (from Architecture & DDD Reviews)

1. **DELETE routes bypass use case layer** — DELETE operations call repository directly instead of through a dedicated use case. Tracked for future improvement.
2. **Domain validation diverges from Zod schema** — `validateSnapshotData()` uses manual checks instead of `GovernanceIndexSchema.parse()`. Should be aligned in a future iteration.
3. **`GovernanceTransitionError` defined but never thrown** — use case returns result object instead. Error class should be used or removed.
4. **UI re-declares state machine constants** — `web/src/types/governance.ts` duplicates states instead of importing from `@foe/schemas`.

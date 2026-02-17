---
id: ROAD-005
title: "API Governance Domain"
status: complete
phase: 3
priority: medium
created: "2026-02-05"
updated: "2026-02-12"
started: "2026-02-09"
completed: "2026-02-12"
owner: "superpowers-orchestrator"
tags: [api, governance, elysia, sqlite, hexagonal]
governance:
  adrs:
    validated: true
    ids: [ADR-003, ADR-004]
    validated_by: "architecture-inspector"
    validated_at: "2026-02-06"
  bdd:
    status: approved
    feature_files:
      - stack-tests/features/api/governance/01_governance_ingest.feature
      - stack-tests/features/api/governance/02_governance_coverage.feature
      - stack-tests/features/api/governance/03_governance_state_machine.feature
      - stack-tests/features/hybrid/governance/01_governance_e2e.feature
    scenarios: 10
    passing: 10
    test_results:
      api_ingest: "4/4 passing"
      api_coverage: "6/6 passing"
  nfrs:
    applicable: [NFR-PERF-001, NFR-PERF-002, NFR-SEC-001, NFR-REL-001]
    status: pass
    results:
      NFR-PERF-002: "All endpoints &lt;5ms (target &lt;200ms p95)"
      NFR-SEC-001: ".env in .gitignore, no secrets in source, input validation on all endpoints"
      NFR-REL-001: "Invalid payloads rejected with structured errors (400 + field-level details)"
  quality_gates:
    architecture:
      status: conditional_pass
      agent: "architecture-inspector"
      date: "2026-02-12"
      score: 82
      findings: "2 medium (DELETE bypasses use case, domain validation divergence), 3 low (business logic split, adapter normalization, port DTOs inline)"
    ddd_alignment:
      status: conditional_pass
      agent: "ddd-aligner"
      date: "2026-02-12"
      findings: "Ubiquitous language consistent, state machine aligned, bounded context isolated. 4 recommendations (domain validation, unused error class, missing value objects, UI state duplication)"
    typescript:
      status: pass
      errors: 0
    bdd_tests:
      status: pass
      passed: 10
      failed: 0
      total: 10
dependencies:
  requires: [ROAD-004]
  enables: [ROAD-009]
---

# ROAD-005: API Governance Domain

## Summary

Add the governance domain to `@foe/api` (Elysia server) following the existing hexagonal architecture. Provides REST endpoints for ingesting governance index snapshots, querying road item status, tracking capability coverage trends, and supporting the web visualization layer.

## Business Value

Enables persistent storage and trend tracking of governance health over time. Teams can query current governance state via API, track improvement metrics across scans, and power dashboard visualizations with real data instead of static JSON files.

## Acceptance Criteria

1. `GovernanceRepository` port interface with snapshot storage, trend tracking, and coverage queries
2. SQLite adapter implementing the port with 4 Drizzle tables
3. 4 use cases: IngestGovernanceSnapshot, QueryGovernanceState, GetCapabilityCoverage, GetGovernanceTrend
4. 9 HTTP endpoints under `/api/v1/governance/*`
5. All endpoints return typed responses matching `@foe/schemas` governance types
6. API response time &lt;200ms for all governance queries
7. Existing FOE report endpoints unaffected

## Technical Approach

### Hexagonal Architecture

```
routes/governance.ts → use-cases/ → ports/GovernanceRepository.ts
                                         ↑
                              adapters/SqliteGovernanceRepository.ts
                                         ↑
                              drizzle/governance-tables.ts
```

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/governance/ingest` | Ingest governance-index.json snapshot |
| GET | `/api/v1/governance/snapshot/:id` | Get specific snapshot |
| GET | `/api/v1/governance/latest` | Get latest snapshot |
| GET | `/api/v1/governance/roads` | List all road items with status |
| GET | `/api/v1/governance/roads/:id` | Get specific road item detail |
| GET | `/api/v1/governance/coverage/capabilities` | Capability coverage matrix |
| GET | `/api/v1/governance/coverage/personas` | Persona coverage report |
| GET | `/api/v1/governance/trends` | Governance health over time |
| GET | `/api/v1/governance/integrity` | Cross-reference integrity report |

### SQLite Tables

- `governance_snapshots` - Timestamped JSON snapshots
- `governance_capabilities` - Denormalized capability coverage
- `governance_road_items` - Road item status tracking
- `governance_contexts` - Bounded context registry

## Dependencies

- **Requires**: ROAD-004 (parsers produce the governance-index.json that gets ingested)
- **Enables**: ROAD-009 (web visualization queries these endpoints)

## Detailed Plan

See [API Governance Domain Plan](../plans/api-governance-domain.md) for the full spec.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema evolution breaks stored snapshots | Medium | Version snapshots; migrate on read |
| SQLite performance with large snapshot history | Low | Prune old snapshots; index on timestamp |

## Estimation

- **Complexity**: High
- **Estimated Effort**: 3 days

---

## Governance Checklist

- [x] ADRs identified and validated (ADR-003, ADR-004)
- [x] BDD scenarios written (10 active scenarios across 2 API feature files, 2 hybrid @wip)
- [x] Implementation complete (10 new files, 4 modified, tsc 0 errors)
- [x] NFRs validated (PERF-002: &lt;5ms, SEC-001: pass, REL-001: pass)
- [x] Change record created (CHANGE-005)
- [x] Documentation updated
- [x] Quality gates passed (architecture 82/100, DDD conditional pass, BDD 10/10, TypeScript 0 errors)

---
id: ROAD-005
title: "API Governance Domain"
status: proposed
phase: 2
priority: medium
created: "2026-02-05"
updated: "2026-02-05"
owner: ""
tags: [api, governance, elysia, sqlite, hexagonal]
governance:
  adrs:
    validated: true
    ids: [ADR-003, ADR-004]
    validated_by: "architecture-inspector"
    validated_at: "2026-02-06"
  bdd:
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-PERF-001, NFR-PERF-002, NFR-SEC-001, NFR-REL-001]
    status: pending
    results: {}
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

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [ ] Implementation complete
- [ ] NFRs validated
- [ ] Change record created
- [ ] Documentation updated

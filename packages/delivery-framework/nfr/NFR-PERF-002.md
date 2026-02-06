---
id: NFR-PERF-002
title: "API Response Time"
category: performance
priority: must
status: active
created: "2026-02-06"
updated: "2026-02-06"
owner: "Katalyst Team"
road_items: [ROAD-005]
---

# NFR-PERF-002: API Response Time

## Requirement

All governance API endpoints must respond within 200ms at the 95th percentile under normal load. The API must handle concurrent requests without degradation beyond acceptable thresholds.

## Rationale

The `@foe/api` serves data to:
1. The web UI (foe-web-ui) which renders dashboards, reports, and governance views
2. AI agents querying governance state during automated workflows
3. CI/CD pipelines ingesting governance snapshots

Slow API responses degrade the developer experience (loading spinners in dashboards), slow down agent workflows, and increase CI pipeline duration. The Elysia + Bun stack (ADR-004) was specifically chosen for its performance characteristics.

## Acceptance Criteria

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Response time (p50) | < 50 ms | Load test with k6 or autocannon |
| Response time (p95) | < 200 ms | Load test with k6 or autocannon |
| Response time (p99) | < 500 ms | Load test with k6 or autocannon |
| Concurrent connections | 50 simultaneous | Load test with sustained connections |
| Throughput | > 500 req/s | Load test on governance endpoints |
| JSON serialization overhead | < 10 ms | Per-request timing for large governance snapshots |
| Database query time | < 50 ms | Drizzle query timing for governance queries |
| Health check endpoint | < 10 ms | `/api/v1/health` response time |

## Test Strategy

### How to Validate

1. Start the API server with a seeded SQLite database (10 governance snapshots, 50 road items)
2. Run load tests against each governance endpoint category:
   - `GET /api/v1/governance/latest` (read latest snapshot)
   - `GET /api/v1/governance/roads` (list all road items)
   - `GET /api/v1/governance/coverage/capabilities` (capability matrix)
   - `GET /api/v1/governance/trends` (trend data over time)
   - `POST /api/v1/governance/ingest` (ingest new snapshot)
3. Measure p50/p95/p99 latencies and throughput
4. Verify that concurrent requests (50 connections) don't cause timeouts or errors
5. Check that SQLite WAL mode handles concurrent reads effectively

### Tools

- `k6` or `autocannon` for HTTP load testing
- Elysia's built-in request timing middleware
- SQLite `EXPLAIN QUERY PLAN` for slow query analysis
- `bun test` for integration test timing

## Current Status

| Environment | Status | Last Measured | Value |
|-------------|--------|---------------|-------|
| Development | Pending | - | - |
| Staging | Pending | - | - |
| Production | Pending | - | - |

## Evidence

Evidence of compliance will be recorded here as validation occurs.

## Related

- **ADRs**: ADR-003 (Hexagonal Architecture), ADR-004 (Elysia + Drizzle)
- **Road Items**: ROAD-005 (API Governance Domain)
- **BDD Scenarios**: API feature files in `stack-tests/features/api/`

---

**Template Version**: 1.0.0
**Last Updated**: 2026-02-06

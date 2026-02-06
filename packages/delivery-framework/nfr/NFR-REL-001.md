---
id: NFR-REL-001
title: "Schema Validation at Boundaries"
category: reliability
priority: must
status: active
created: "2026-02-06"
updated: "2026-02-06"
owner: "Katalyst Team"
road_items: [ROAD-002, ROAD-003, ROAD-004, ROAD-005]
---

# NFR-REL-001: Schema Validation at Boundaries

## Requirement

All data entering or leaving the system must be validated against Zod schemas at ingest boundaries. Invalid data must be rejected with structured, actionable error messages. Corrupt or malformed data must never propagate past the first validation point.

## Rationale

Data flows through multiple boundaries in the system:
1. **Markdown frontmatter** -> Parsers (governance artifacts, DDD artifacts, Field Guide methods)
2. **HTTP request bodies** -> API routes (scan triggers, report ingestion, governance snapshots)
3. **JSON file loading** -> Index consumers (methods-index.json, governance-index.json)
4. **Docker volume data** -> Scanner (repository files mounted at /repo)
5. **API responses** -> Web UI (report data, governance state)

Without validation at each boundary, a single malformed field in a markdown file could propagate through the entire pipeline -- corrupting the governance index, producing invalid API responses, and rendering incorrect dashboards. This is the core principle behind ADR-002 (Zod as single source of truth).

## Acceptance Criteria

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Boundary validation coverage | 100% of ingest points | Code audit: every `.parse()` or `.safeParse()` at boundaries |
| Invalid frontmatter rejection | Fails with field-level error details | Unit test: malformed frontmatter fixtures |
| Invalid API request rejection | 400 status with Zod error body | Integration test: invalid request payloads |
| Invalid JSON index rejection | Build fails with clear error | CLI test: corrupted index file |
| Error message quality | Contains field path + expected type | Manual review of error output samples |
| Schema alignment across packages | All packages use `@foe/schemas` types | Dependency audit: no local type redefinitions |
| Validation performance | < 5ms per document | Benchmark (per NFR-PERF-001) |
| Edge case handling | Graceful for empty, null, oversized inputs | Unit tests with edge case fixtures |

## Test Strategy

### How to Validate

1. **Audit all ingest points**: Search codebase for every location where external data enters the system:
   - Frontmatter parsers: `gray-matter` calls followed by `schema.parse()`
   - API routes: Elysia body/params/query validation
   - JSON file loaders: `JSON.parse()` followed by `schema.parse()`
   - Environment variables: validated at bootstrap
2. **Create invalid data fixtures**: For each schema, create fixtures with:
   - Missing required fields
   - Wrong types (string where number expected)
   - Invalid enum values
   - Malformed cross-reference IDs (e.g., `CAP-ABC` instead of `CAP-001`)
   - Oversized strings (>10KB for description fields)
   - Empty objects and null values
3. **Verify error messages**: Each validation failure must produce a Zod error that includes:
   - The field path (e.g., `governance.adrs.ids[0]`)
   - The expected type/format
   - The received value
4. **Verify no passthrough**: Intentionally corrupt a governance artifact and verify the corruption doesn't appear in the index, API, or web UI

### Tools

- `bun test` for unit tests with invalid fixtures
- `@esimplicity/stack-tests` for API integration tests with invalid payloads
- `zod.safeParse()` return value inspection
- Code search for unvalidated `JSON.parse()` calls (should be zero)

## Current Status

| Environment | Status | Last Measured | Value |
|-------------|--------|---------------|-------|
| @foe/schemas | Pending | - | - |
| @foe/field-guide-tools | Pending | - | - |
| @foe/api | Pending | - | - |

## Evidence

Evidence of compliance will be recorded here as validation occurs.

## Related

- **ADRs**: ADR-002 (Zod as Single Source of Truth)
- **Road Items**: ROAD-002 (Governance Schemas), ROAD-003 (DDD Schemas), ROAD-004 (Parsers & CLI), ROAD-005 (API)
- **BDD Scenarios**: Schema validation feature files

---

**Template Version**: 1.0.0
**Last Updated**: 2026-02-06

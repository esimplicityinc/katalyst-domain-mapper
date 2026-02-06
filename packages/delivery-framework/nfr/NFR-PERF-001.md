---
id: NFR-PERF-001
title: "Governance Index Build Performance"
category: performance
priority: must
status: active
created: "2026-02-06"
updated: "2026-02-06"
owner: "Katalyst Team"
road_items: [ROAD-004, ROAD-005, ROAD-009]
---

# NFR-PERF-001: Governance Index Build Performance

## Requirement

The governance index build process (`bunx foe-field-guide build:governance`) must complete within acceptable time limits to support CI/CD integration and developer workflows. Schema validation must be fast enough to run on every file save without perceptible delay.

## Rationale

The governance index is built:
1. In CI/CD on every push (blocking merge if it fails)
2. During Docker image builds (Stage 1 of multi-stage build, per ADR-007)
3. On developer machines during local development

Slow builds directly impact developer feedback loops (FOE Feedback dimension) and CI pipeline speed. The index builder processes all governance markdown files, validates frontmatter against Zod schemas, checks cross-references, and outputs a single JSON file.

## Acceptance Criteria

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Index build time (100 artifacts) | < 5 seconds | `time bunx foe-field-guide build:governance` with 100 test artifacts |
| Index build time (500 artifacts) | < 15 seconds | `time bunx foe-field-guide build:governance` with 500 test artifacts |
| Single schema validation | < 5 ms | `performance.now()` around `schema.parse()` in benchmark suite |
| CLI startup time | < 500 ms | `time bunx foe-field-guide --help` (cold start) |
| Output file size (100 artifacts) | < 500 KB | `ls -la governance-index.json` |
| Memory usage (100 artifacts) | < 256 MB | `node --max-old-space-size=256` constraint test |

## Test Strategy

### How to Validate

1. Create a benchmark fixture with 100 governance artifacts (mix of all 7 types + 4 DDD types)
2. Run `bunx foe-field-guide build:governance` and measure wall-clock time
3. Run individual schema validation benchmarks using `performance.now()` timing
4. Scale to 500 artifacts to verify linear (not exponential) scaling
5. Profile memory usage with `--max-old-space-size` constraint

### Tools

- `performance.now()` for sub-millisecond timing
- `time` command for CLI-level measurement
- `bun test` for benchmark test suites
- CI pipeline timing metrics (GitHub Actions step duration)

## Current Status

| Environment | Status | Last Measured | Value |
|-------------|--------|---------------|-------|
| Development | Pending | - | - |
| CI | Pending | - | - |
| Docker Build | Pending | - | - |

## Evidence

Evidence of compliance will be recorded here as validation occurs.

## Related

- **ADRs**: ADR-001 (Bun runtime), ADR-002 (Zod schemas), ADR-007 (Docker multi-stage builds)
- **Road Items**: ROAD-004 (Parsers & CLI), ROAD-005 (API), ROAD-009 (Web Visualization)
- **BDD Scenarios**: Performance benchmarks in CI pipeline

---

**Template Version**: 1.0.0
**Last Updated**: 2026-02-06

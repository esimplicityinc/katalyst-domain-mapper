---
id: ROAD-004
title: "Governance Parsers, Index Builder & CLI"
status: complete
phase: 2
priority: high
created: "2026-02-05"
updated: "2026-02-09"
owner: ""
tags: [parsers, cli, index-builder, field-guide-tools]
governance:
  adrs:
    validated: true
    ids: [ADR-001, ADR-009]
    validated_by: "architecture-inspector"
    validated_at: "2026-02-06"
  bdd:
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-PERF-001, NFR-REL-001, NFR-MAINT-001, NFR-MAINT-002]
    status: pending
    results: {}
dependencies:
  requires: [ROAD-002, ROAD-003]
  enables: [ROAD-005, ROAD-006, ROAD-008]
---

# ROAD-004: Governance Parsers, Index Builder & CLI

## Summary

Extend `@foe/field-guide-tools` with 11 new parsers (one per governance/DDD artifact type), a governance index builder that validates referential integrity across all cross-references, and 6 new CLI commands. This is the critical convergence point — Phases 4, 5, and 6 all depend on the output of this work.

## Business Value

Replaces ~1,500 lines of hand-written JS validation scripts with a single, schema-validated pipeline. Outputs a `governance-index.json` (~50-200KB) consumed by the API, scanner, and web UI. Enables automated governance validation in CI/CD.

## Acceptance Criteria

1. 11 new parsers in `packages/foe-field-guide-tools/src/parsers/governance/`
2. Each parser follows the existing `parseMethodFile()` pattern with snake_case → camelCase mapping
3. `governance-index.ts` builder validates referential integrity across all cross-references
4. Referential integrity report: orphaned references, missing targets, circular dependencies
5. 6 new CLI commands: `build:governance`, `build:all`, `validate:governance`, `validate:transitions`, `coverage:capabilities`, `coverage:personas`
6. Single `governance-index.json` output baked into scanner container at build time
7. All existing `build` and `validate` CLI commands continue working
8. Index build completes in &lt;5s for 100 artifacts

## Technical Approach

### New Parsers (~600 lines)

```
packages/foe-field-guide-tools/src/parsers/governance/
├── capability.ts
├── persona.ts
├── user-story.ts
├── use-case.ts
├── road-item.ts
├── adr.ts
├── nfr.ts
├── change-entry.ts
├── bounded-context.ts
├── aggregate.ts
├── value-object.ts
└── domain-event.ts
```

### Index Builder (~400 lines)

```
packages/foe-field-guide-tools/src/builders/
└── governance-index.ts         # Cross-reference validation + index generation
```

### CLI Commands (~200 lines)

Added to existing `packages/foe-field-guide-tools/src/cli.ts`:

| Command | Description |
|---------|-------------|
| `build:governance` | Parse all governance artifacts → `governance-index.json` |
| `build:all` | Run `build` + `build:governance` |
| `validate:governance` | Validate all frontmatter without building |
| `validate:transitions` | Check state machine transition validity |
| `coverage:capabilities` | Report capability coverage across road items |
| `coverage:personas` | Report persona coverage across user stories |

### Referential Integrity Checks

- Every `ROAD-XXX` reference in depends_on/blocked_by resolves
- Every `CAP-XXX` in governance.capabilities exists
- Every `PER-XXX` in user stories exists
- Every `CTX-xxx` in aggregates/events exists
- Every `AGG-xxx` in domain events exists
- Circular dependency detection in road item dependency graph

## Dependencies

- **Requires**: ROAD-002 (governance schemas), ROAD-003 (DDD schemas)
- **Enables**: ROAD-005 (API), ROAD-006 (scanner), ROAD-008 (integration)

## Detailed Plan

See [Parsers and Builders Plan](../plans/parsers-and-builders.md) for the full spec.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance degradation with large artifact sets | Medium | Profile early; use streaming parser if needed |
| Breaking existing CLI interface | High | Additive only; existing commands unchanged |
| Complex referential integrity edge cases | Medium | Start with simple checks; add circular dep detection later |

## Estimation

- **Complexity**: High
- **Estimated Effort**: 4 days

---

## Governance Checklist

- [x] ADRs identified and validated (ADR-001, ADR-009)
- [ ] BDD scenarios written and approved (deferred — validated via CLI integration test)
- [x] Implementation complete (16 new files, ~1,583 lines, 2026-02-09)
- [ ] NFRs validated (pending)
- [ ] Change record created
- [x] Documentation updated

## Quality Gate Results

| Gate | Status | Agent | Score |
|------|--------|-------|-------|
| Architecture Review | ✅ CONDITIONAL PASS | @architecture-inspector | 91/100 |
| DDD Alignment | ✅ CONDITIONAL PASS | @ddd-aligner | — |
| CLI Integration Test | ✅ PASS | build:governance | 93/93 files valid, 84.7 KB index |
| TypeScript Check | ⚠️ Pre-existing | tsc --noEmit | 14 pre-existing errors, 0 new |

## CLI Test Results

```
build:governance → 12 capabilities, 5 personas, 40 stories, 17 roads, 12 ADRs, 8 NFRs (78ms)
validate:governance → 93/93 files valid
```

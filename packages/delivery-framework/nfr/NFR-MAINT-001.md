---
id: NFR-MAINT-001
title: "Cross-Reference Referential Integrity"
category: maintainability
priority: must
status: active
created: "2026-02-06"
updated: "2026-02-06"
owner: "Katalyst Team"
road_items: [ROAD-004, ROAD-008]
---

# NFR-MAINT-001: Cross-Reference Referential Integrity

## Requirement

The governance index builder must validate all cross-references between governance and DDD artifacts. Every referenced ID must resolve to an existing artifact. Orphaned references, missing targets, and circular dependencies must be detected and reported with actionable error messages. CI builds must fail when integrity violations are found.

## Rationale

The governance system's value depends on the integrity of cross-references between artifacts:

```
PER-XXX.typical_capabilities[]  --> CAP-XXX
PER-XXX.related_stories[]       --> US-XXX
US-XXX.persona                  --> PER-XXX
US-XXX.capabilities[]           --> CAP-XXX
ROAD-XXX.governance.adrs.ids[]  --> ADR-XXX
ROAD-XXX.governance.nfrs[]      --> NFR-XXX
ROAD-XXX.depends_on[]           --> ROAD-XXX
CHANGE-XXX.road_id              --> ROAD-XXX
Aggregate.context               --> BoundedContext.slug
Aggregate.valueObjects[]        --> ValueObject.slug
DomainEvent.source_context      --> BoundedContext.slug
DomainEvent.consumedBy[]        --> BoundedContext.slug
```

A broken cross-reference (e.g., a ROAD item referencing `ADR-005` when no `ADR-005.md` exists) creates governance blind spots -- the artifact claims compliance but the evidence is missing. This undermines the entire governance workflow (ADR-008).

## Acceptance Criteria

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Orphaned reference count | 0 (CI-blocking) | `bunx foe-field-guide validate:governance` exit code |
| Missing target count | 0 (CI-blocking) | Governance index builder integrity report |
| Circular dependency detection | Detected and reported | ROAD item dependency graph analysis |
| Integrity check coverage | All 12+ cross-reference types | Code audit of integrity checker |
| Error message quality | Contains source file, field, target ID | Manual review of error output |
| Index build behavior on violation | Fails with non-zero exit code | Integration test: introduce broken reference |
| Validation speed | < 1 second for integrity checks | Timing within index build (per NFR-PERF-001) |
| Self-referential validation | Framework validates its own integrity | `bunx foe-field-guide validate:governance` on delivery-framework content |

## Test Strategy

### How to Validate

1. **Create integrity violation fixtures**:
   - ROAD item referencing non-existent ADR (`ADR-999`)
   - User story referencing non-existent persona (`PER-999`)
   - Aggregate referencing non-existent bounded context (`CTX-nonexistent`)
   - Circular ROAD item dependencies (`ROAD-001 depends on ROAD-002 depends on ROAD-001`)
   - Orphaned capability (referenced by nothing)
2. **Run integrity validation**: Execute `bunx foe-field-guide validate:governance` and verify:
   - Non-zero exit code for each violation type
   - Error messages identify the source file, field, and target ID
   - All 12+ cross-reference types are checked
3. **Self-referential test**: Run validation on the delivery framework's own content:
   - All ROAD items (ROAD-001 through ROAD-009) reference valid ADR and NFR IDs
   - All ADR/NFR IDs referenced in frontmatter exist as files
4. **CI integration**: Verify the governance linting step in CI fails on broken references

### Tools

- `bunx foe-field-guide validate:governance` CLI command
- `bun test` for unit tests with fixture files
- CI pipeline step with `--strict` flag
- Governance index JSON output inspection

## Current Status

| Environment | Status | Last Measured | Value |
|-------------|--------|---------------|-------|
| Development | Pending | - | - |
| CI | Pending | - | - |
| Self-referential | Pending | - | - |

## Evidence

Evidence of compliance will be recorded here as validation occurs.

## Related

- **ADRs**: ADR-008 (8-State Governance Workflow), ADR-009 (Markdown Frontmatter Format), ADR-010 (Progressive Replacement)
- **Road Items**: ROAD-004 (Parsers & Index Builder), ROAD-008 (Delivery Framework Integration)
- **BDD Scenarios**: Governance validation feature files in `stack-tests/features/api/`

---

**Template Version**: 1.0.0
**Last Updated**: 2026-02-06

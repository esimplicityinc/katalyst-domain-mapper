---
id: ROAD-002
title: "Governance Zod Schemas"
status: complete
phase: 1
priority: high
created: "2026-02-05"
updated: "2026-02-09"
owner: ""
tags: [schemas, zod, governance, validation]
governance:
  adrs:
    validated: true
    ids: [ADR-002, ADR-008, ADR-009]
    validated_by: "architecture-inspector"
    validated_at: "2026-02-06"
  bdd:
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-REL-001]
    status: pending
    results: {}
dependencies:
  requires: [ROAD-001]
  enables: [ROAD-004]
---

# ROAD-002: Governance Zod Schemas

## Summary

Create Zod validation schemas for all 7 governance artifact types in `@foe/schemas`. This replaces the hand-written JS validation in prima's `governance-linter.js` with type-safe, runtime-validated schemas that serve as the single source of truth across the entire pipeline.

## Business Value

Eliminates divergence between TypeScript types and runtime validation. Every governance artifact (capabilities, personas, user stories, use cases, road items, ADRs, NFRs, change entries) gets validated at ingest boundaries, preventing corrupt data from propagating through the system.

## Acceptance Criteria

1. 10 new schema files in `packages/foe-schemas/src/governance/`
2. `CapabilitySchema`, `PersonaSchema`, `UserStorySchema`, `UseCaseSchema` with cross-reference validation
3. `RoadItemSchema` with 8-state governance workflow encoded as Zod enum
4. `AdrSchema`, `NfrSchema`, `ChangeEntrySchema` with compliance section validation
5. `GovernanceIndexSchema` with reverse indices and referential integrity stats
6. All schemas export both Zod objects and inferred TypeScript types
7. 100% alignment with existing prima frontmatter conventions
8. Existing `@foe/schemas` build still passes

## Technical Approach

### New Files (~500 lines)

```
packages/foe-schemas/src/governance/
├── index.ts                    # Re-exports
├── common.ts                   # Shared enums (GovernanceStatus, Priority, etc.)
├── capability.ts               # CAP-XXX schema
├── persona.ts                  # PER-XXX schema
├── user-story.ts               # US-XXX schema
├── use-case.ts                 # UC-XXX schema
├── road-item.ts                # ROAD-XXX schema (8-state machine)
├── adr.ts                      # ADR-XXX schema
├── nfr.ts                      # NFR-XXX schema
├── change-entry.ts             # CHANGE-XXX schema
└── governance-index.ts         # GovernanceIndexSchema
```

### Key Design Decisions

- **State machine as enum**: `GovernanceStatusSchema = z.enum(['proposed', 'adr_validated', 'bdd_pending', ...])`
- **Cross-references as string IDs**: Validated format only (e.g., `z.string().regex(/^CAP-\d+$/)`); referential integrity checked at index build time, not schema level
- **Governance section**: Nested Zod objects for `adrs`, `bdd`, `nfrs` subsections
- **snake_case frontmatter → camelCase TypeScript**: Transformation happens in parsers (Phase 3), not schemas

## Dependencies

- **Requires**: ROAD-001 (delivery-framework must be set up)
- **Enables**: ROAD-004 (parsers need schemas to validate against)

## Detailed Plan

See [Governance Schemas Plan](../plans/governance-schemas.md) for the full spec with field-by-field definitions.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema strictness breaks existing prima frontmatter | High | Run schema against all 61 prima artifacts before releasing |
| Zod bundle size increase | Low | Tree-shaking; governance schemas only loaded when needed |

## Estimation

- **Complexity**: Medium
- **Estimated Effort**: 2 days

---

## Governance Checklist

- [x] ADRs identified and validated (ADR-002, ADR-008, ADR-009)
- [ ] BDD scenarios written and approved (deferred — schema-only, validated via tsc + build)
- [x] Implementation complete (16 files, 543 lines, 2026-02-09)
- [ ] NFRs validated (NFR-REL-001 pending)
- [ ] Change record created
- [x] Documentation updated

## Quality Gate Results

| Gate | Status | Agent | Score |
|------|--------|-------|-------|
| Architecture Review | ✅ CONDITIONAL PASS | @architecture-inspector | 92/100 |
| DDD Alignment | ✅ CONDITIONAL PASS | @ddd-aligner | — |
| TypeScript Check | ✅ PASS | tsc --noEmit | 0 errors |
| Build | ✅ PASS | bun build | 55 modules, 167.27 KB |

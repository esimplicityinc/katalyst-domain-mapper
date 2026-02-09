---
id: ROAD-003
title: "DDD Artifact Schemas"
status: complete
phase: 1
priority: high
created: "2026-02-05"
updated: "2026-02-09"
owner: ""
tags: [schemas, zod, ddd, domain-modeling]
governance:
  adrs:
    validated: true
    ids: [ADR-002, ADR-008, ADR-009, ADR-012]
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

# ROAD-003: DDD Artifact Schemas

## Summary

Create Zod schemas for 4 DDD artifact types: BoundedContext, Aggregate, ValueObject, and DomainEvent. This formalizes domain model knowledge — currently embedded only in agent prompts — into validated markdown frontmatter that can be parsed, indexed, and visualized.

## Business Value

Domain knowledge becomes a first-class, validated artifact rather than prose trapped in agent configurations. Teams can define bounded contexts, aggregates, value objects, and domain events as structured markdown files that are automatically validated, cross-referenced, and rendered on the docs site.

## Acceptance Criteria

1. 5 new schema files in `packages/foe-schemas/src/governance/ddd/`
2. `BoundedContextSchema` with upstream/downstream relationships, communication patterns, team ownership
3. `AggregateSchema` with invariants, commands, events published, bounded context reference
4. `ValueObjectSchema` with properties, validation rules, equality definition
5. `DomainEventSchema` with payload schema, source aggregate, subscriber contexts
6. Cross-reference IDs use slugs (`z.string().regex(/^[a-z0-9-]+$/)`) per ADR-012
7. Referential integrity deferred to index builder (ROAD-004)
8. Existing `@foe/schemas` build still passes

## Technical Approach

### New Files (~300 lines)

```
packages/foe-schemas/src/governance/ddd/
├── index.ts                    # Re-exports
├── bounded-context.ts          # Slug-based bounded context schema
├── aggregate.ts                # Slug-based aggregate schema
├── value-object.ts             # Slug-based value object schema
└── domain-event.ts             # Slug-based domain event schema
```

### Key Schema Fields

**BoundedContext:**
- `id`, `name`, `description`, `team`, `communication_pattern` (enum: partnership, shared_kernel, customer_supplier, conformist, anticorruption_layer, open_host, published_language, separate_ways)
- `upstream`, `downstream` (context ID arrays)
- `aggregates` (aggregate ID array)

**Aggregate:**
- `id`, `name`, `context` (context ID), `root_entity`, `invariants` (string array)
- `commands` (string array), `events_published` (event ID array)

**ValueObject:**
- `id`, `name`, `context` (context ID), `properties` (array of {name, type})
- `validation_rules` (string array), `equality` (description)

**DomainEvent:**
- `id`, `name`, `source_aggregate` (aggregate ID), `source_context` (context ID)
- `payload` (array of {name, type}), `subscribers` (context ID array)

## Dependencies

- **Requires**: ROAD-001 (delivery-framework must be set up)
- **Enables**: ROAD-004 (parsers need DDD schemas for validation)

## Detailed Plan

See [DDD Schemas Plan](../plans/ddd-schemas.md) for the full spec.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-engineering DDD frontmatter for early adoption | Medium | Keep fields optional where possible; strict mode is opt-in |
| Context map complexity | Low | Start with simple upstream/downstream; add ACL patterns later |

## Estimation

- **Complexity**: Medium
- **Estimated Effort**: 1.5 days

---

## Governance Checklist

- [x] ADRs identified and validated (ADR-002, ADR-008, ADR-009, ADR-012)
- [ ] BDD scenarios written and approved (deferred — schema-only, validated via tsc + build)
- [x] Implementation complete (5 files in governance/ddd/, 2026-02-09)
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

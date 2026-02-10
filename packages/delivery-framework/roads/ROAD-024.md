---
id: ROAD-024
title: "ContextMapper CML Export Adapter"
status: proposed
phase: 2
priority: high
created: 2026-02-10
governance:
  adrs:
    validated: false
  bdd:
    status: draft
  nfrs:
    applicable: []
    status: pending
---

# ROAD-024: ContextMapper CML Export Adapter

Create a Ports & Adapters pattern implementation that exports the Zod domain model to ContextMapper CML (Context Mapping Language) format. Enables using ContextMapper's visualization and architecture analysis tools while maintaining Zod schemas as the single source of truth.

## Status

**Current State**: Proposed

**Progress**: 0%

## Description

The ContextMapper CML Export Adapter implements a write-only (Phase 1) and optional read (Phase 2) adapter that transforms between the canonical Zod domain model and ContextMapper's CML DSL. This follows the Ports & Adapters architectural pattern where:

- **Zod schemas** = Canonical domain model (single source of truth)
- **CML** = External format consumed by ContextMapper tooling
- **CMLWriter** = Outbound adapter
- **CMLReader** = Inbound adapter (optional, Phase 2)

The adapter enables teams to use ContextMapper's mature visualization and analysis capabilities without abandoning the TypeScript/Bun-based governance pipeline.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ZOD DOMAIN MODEL                          │
│              (Canonical - Single Source of Truth)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │DomainModel   │  │BoundedContext│  │  Aggregate       │   │
│  │  - id        │  │  - slug      │  │  - rootEntity    │   │
│  │  - contexts  │  │  - type      │  │  - invariants    │   │
│  │  - aggregates│  │  - relationships│  - events       │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
           ┌─────────┴──────────┐
           │      PORT          │
           │  (DDD Repository)  │
           └─────────┬──────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────────┐ ┌─────────┐ ┌──────────────┐
│  CML Adapter │ │Mermaid  │ │ Future...    │
│              │ │Adapter  │ │              │
│ • toCML()    │ │         │ │ • PlantUML   │
│ • fromCML()  │ │         │ │ • GraphML    │
└──────┬───────┘ └────┬────┘ └──────┬───────┘
       │              │             │
       ▼              ▼             ▼
   ┌───────┐     ┌───────┐    ┌──────────┐
   │.cml   │     │.mmd   │    │  Other   │
   │files  │     │diagrams│   │ formats  │
   └───────┘     └───────┘    └──────────┘
```

## Schema Mapping

| Zod Schema | CML Concept |
|------------|-------------|
| `DomainModel` | ContextMap + BoundedContexts |
| `BoundedContext` | BoundedContext { } |
| `SubdomainType` | domainVisionStatement + type (Core/Supporting/Generic) |
| `CommunicationPattern` | Relationship roles: SK, OHS, ACL, CF, CS |
| `ContextRelationship` | Upstream-Downstream arrows |
| `Aggregate` | Aggregate with entities, value objects, commands, events |

## Example CML Output

```cml
ContextMap KatalystContextMap {
  type SYSTEM_LANDSCAPE
  state AS_IS
  
  contains ScanningContext
  contains FieldGuideContext
  contains ReportingContext
  contains GovernanceContext
  
  ScanningContext [D,ACL]<-[U,OHS,PL] FieldGuideContext {
    implementationTechnology = "JSON indices"
  }
  
  ScanningContext [D]<-[U] ReportingContext {
    implementationTechnology = "RESTful HTTP"
  }
  
  ReportingContext [D,CF]<-[U,OHS] FieldGuideContext
  
  GovernanceContext [PL] Separate-Ways ScanningContext
  GovernanceContext [PL] Separate-Ways FieldGuideContext
  GovernanceContext [PL] Separate-Ways ReportingContext
}

BoundedContext ScanningContext {
  type CORE_DOMAIN
  domainVisionStatement "Analyzes software repositories via AI agents orchestrated inside a Docker container. Produces scored FOE assessments."
  
  Aggregate ScanJob {
    Entity ScanJob {
      aggregateRoot
      UUID id
      String repositoryPath
      ScanStatus status
    }
  }
}

BoundedContext ReportingContext {
  type SUPPORTING_DOMAIN
  domainVisionStatement "Persists FOE reports into normalized SQLite tables, serves them via REST API, and renders interactive visualizations."
}
```

## Implementation Tasks

### Phase 1: Write-Only Adapter (Required)

- [ ] Create `CMLWriter` class in `@foe/field-guide-tools/src/adapters/cml/`
- [ ] Implement `generateContextMap()` — outputs ContextMap block with type, state, contains
- [ ] Implement `generateBoundedContext()` — outputs BoundedContext blocks with aggregates
- [ ] Implement relationship mapping (Upstream-Downstream, Customer-Supplier, Shared Kernel, etc.)
- [ ] Add CLI command: `export:cml` with `--input` and `--output` flags
- [ ] Create integration tests verifying valid CML output
- [ ] Document CLI usage in README

### Phase 2: Read Adapter (Stretch Goal)

- [ ] Research CML grammar (ANTLR grammar available)
- [ ] Implement `CMLReader` class for bidirectional sync
- [ ] Add CLI command: `import:cml` for round-trip testing
- [ ] Create validation tests comparing Zod → CML → Zod round-trip

## CLI Usage

```bash
# Export domain model to CML
bunx foe-field-guide export:cml \
  --input governance-index.json \
  --output context-map.cml

# Export with ContextMapper-compatible naming
bunx foe-field-guide export:cml \
  --input governance-index.json \
  --output context-map.cml \
  --format contextmapper

# Import CML back (Phase 2)
bunx foe-field-guide import:cml \
  --input context-map.cml \
  --output domain-model.json
```

## Integration with ContextMapper CLI

```bash
# Generate CML from Katalyst domain model
bunx foe-field-guide export:cml --input model.json --output katalyst.cml

# Generate diagrams using ContextMapper
docker run -v $(pwd):/workspace contextmapper/context-mapper-cli \
  generate-diagrams --input /workspace/katalyst.cml --output /workspace/diagrams/

# Generated outputs:
# - diagrams/context-map.png (visual context map)
# - diagrams/context-map.puml (PlantUML source)
# - diagrams/service-contracts.mdsl (MDSL microservice contracts)
```

## Dependencies

**Requires**:
- [ROAD-003: DDD Artifact Schemas](../ROAD-003) — Provides Zod schemas for domain model
- [ROAD-004: Governance Parsers, Index Builder & CLI](../ROAD-004) — Provides CLI infrastructure

**Enables**:
- [ROAD-016: Interactive Context Map Diagram](../ROAD-016) — Alternative diagram generation via ContextMapper
- [ROAD-021: Markdown Documentation Export](../ROAD-021) — Precedent for multi-format export pipeline

**Capabilities**:
- [CAP-012: Domain Model Export Pipeline](../../capabilities/CAP-012) — Adds CML as supported export format

## Related Documentation

- [ContextMapper CML Reference](https://contextmapper.org/docs/language-reference/)
- [ContextMap Patterns](https://contextmapper.org/docs/context-map/)
- [DDD Strategic Patterns in CML](https://contextmapper.org/docs/bounded-context/)

## NFR Considerations

- CML output must be valid according to ContextMapper's grammar
- Export must complete in <500ms for typical domain models (<50 contexts)
- No Java runtime required in core pipeline (Java only needed for ContextMapper CLI)

## Acceptance Criteria

1. `bunx foe-field-guide export:cml` successfully generates valid CML from governance index
2. Generated CML passes ContextMapper CLI validation without errors
3. All 4 bounded contexts (Scanning, Field Guide, Reporting, Governance) are correctly mapped
4. Relationships preserve DDD patterns (Customer-Supplier, Conformist, ACL, etc.)
5. Subdomain types (Core/Supporting/Generic) are correctly classified
6. Integration test exists and passes in CI

## Notes

- This is a **tooling/infrastructure** feature (Phase 2), not user-facing (Phase 3)
- The Zod domain model remains the single source of truth
- ContextMapper is an optional external tool; no Java dependency in core
- Follows Ports & Adapters pattern for extensibility (Mermaid, PlantUML adapters can follow)

---
id: ROAD-008
title: "Delivery Framework Integration"
status: proposed
phase: 2
priority: medium
created: "2026-02-05"
updated: "2026-02-05"
owner: ""
tags: [integration, migration, prima, progressive-replacement]
governance:
  adrs:
    validated: true
    ids: [ADR-005, ADR-009, ADR-010]
    validated_by: "architecture-inspector"
    validated_at: "2026-02-06"
  bdd:
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-MAINT-001]
    status: pending
    results: {}
dependencies:
  requires: [ROAD-004]
  enables: []
---

# ROAD-008: Delivery Framework Integration

## Summary

Replace the hand-written JS governance scripts in `packages/delivery-framework/scripts/` with the new `@foe/schemas` + `@foe/field-guide-tools` CLI pipeline. Create self-referential example domain content using the domain-mapper's own concepts as the first real governance artifacts. Migrate Docusaurus plugins to consume `governance-index.json`.

## Business Value

Validates the entire governance pipeline end-to-end by dogfooding it on the project itself. The delivery framework becomes a working example of its own governance model, demonstrating the 8-state workflow, cross-reference integrity, and DDD artifact management to adopters.

## Acceptance Criteria

1. Self-referential domain content created (~40-60 markdown files):
   - 3 bounded contexts (Scanning, FieldGuide, Reporting)
   - 4-5 aggregates (ScanReport, MethodIndex, GovernanceSnapshot, etc.)
   - 5-6 domain events
   - 6-8 value objects
   - 4-6 capabilities
   - Road items already created (this phase)
2. Docusaurus plugins updated to consume `governance-index.json` instead of hand-parsing
3. Justfile recipes updated from `node docs/scripts/*.js` to `bunx foe-field-guide` CLI
4. Old governance scripts marked as deprecated (kept for comparison, deleted in next release)
5. `bun run build` succeeds with new pipeline
6. Governance linter output matches old system for same input

## Technical Approach

### Progressive Replacement Strategy

```
Phase A: Create new pipeline (ROAD-002, 003, 004) ─ DONE BY THIS POINT
Phase B: Create example domain content (this ROAD)
Phase C: Run old + new systems in parallel, compare output
Phase D: Migrate plugins to new pipeline
Phase E: Delete old scripts
```

### Self-Referential Domain

The domain-mapper's own domain serves as example content:

**Bounded Contexts:**
- `CTX-scanning` - FOE repository scanning and AI-powered analysis
- `CTX-field-guide` - Method/observation indexing and keyword extraction
- `CTX-reporting` - Report generation, visualization, and persistence

**Aggregates:**
- `AGG-scan-report` (CTX-scanning) - Core scan with dimensions, findings, gaps
- `AGG-method-index` (CTX-field-guide) - Searchable method collection
- `AGG-governance-snapshot` (CTX-reporting) - Point-in-time governance state

### Plugin Migration

```diff
- const roadData = parseMarkdownFrontmatter(roadFiles);
+ const governanceIndex = require('./static/governance-index.json');
+ const roadData = governanceIndex.roadItems;
```

## Dependencies

- **Requires**: ROAD-004 (parsers + CLI must be functional)
- **Enables**: None (validates the pipeline)

## Detailed Plan

See [Prima Integration Plan](../plans/prima-integration.md) for the full migration guide.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| New system produces different output than old scripts | High | Run both in parallel; diff output before migrating |
| Self-referential domain too meta / confusing | Medium | Keep it simple; 3 contexts max |
| Plugin migration breaks Docusaurus build | Medium | Feature-flag: fall back to old parsing if index missing |

## Estimation

- **Complexity**: High
- **Estimated Effort**: 4 days

---

## Governance Checklist

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [ ] Implementation complete
- [ ] NFRs validated
- [ ] Change record created
- [ ] Documentation updated

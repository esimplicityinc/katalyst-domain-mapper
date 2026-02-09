---
id: ROAD-021
title: "Markdown Documentation Export"
status: proposed
phase: 3
priority: high
created: "2026-02-06"
updated: "2026-02-06"
owner: ""
tags: [web-ui, export, markdown, ddd, documentation]
governance:
  adrs:
    validated: false
    ids: []
    validated_by: ""
    validated_at: ""
  bdd:
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: []
    status: pending
    results: {}
dependencies:
  requires: [ROAD-009, ROAD-020]
  enables: [ROAD-022]
---

# ROAD-021: Markdown Documentation Export

## Summary

Build a markdown export pipeline that transforms the API-backed domain model into a downloadable zip of professional-quality DDD documentation files. Output quality matches hand-written documentation like the OPR project's `docs/domain/` directory.

## Business Value

Teams want domain documentation committed alongside code in version control. Manually writing and maintaining this documentation is tedious and error-prone. The export pipeline generates it from the structured API data, ensuring documentation is always synchronized with the domain model.

## Acceptance Criteria

1. "Export as Markdown" button in the domain mapper UI
2. Generates a `.zip` download containing 6+ files
3. `glossary.md` — Alphabetically sorted terms with definitions, aliases, context associations, and examples
4. `subdomains.md` — Classification table (Core/Supporting/Generic) with strategic implications
5. `context-map.md` — ASCII art diagram and relationship descriptions with DDD patterns
6. `bounded-contexts.md` — Context descriptions with responsibility, team ownership, source directory, and artifact counts
7. `aggregates.md` — Aggregate trees with entities, value objects, invariants, and commands
8. `domain-events.md` — Event catalog with trigger, effect, timing, payload, and consumer contexts
9. All files include a generated-by header with timestamp
10. Markdown is valid CommonMark with proper heading hierarchy

## Technical Approach

### New Files

```
packages/foe-web-ui/src/lib/export/
├── markdown-generator.ts         # Core markdown generation engine
├── glossary-exporter.ts          # Glossary markdown template
├── subdomains-exporter.ts        # Subdomain classification template
├── context-map-exporter.ts       # Context map with ASCII art
├── bounded-contexts-exporter.ts  # Context details template
├── aggregates-exporter.ts        # Aggregate structure template
├── domain-events-exporter.ts     # Event catalog template
└── zip-builder.ts                # Client-side zip generation (JSZip)
```

### ASCII Art Context Map

Generate an ASCII art diagram similar to:
```
          ┌─────────────────┐
          │  Core Context    │
          └────────┬────────┘
     ┌─────────────┼─────────────┐
     ▼             ▼             ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Support │  │ Support │  │ Generic │
└─────────┘  └─────────┘  └─────────┘
```

### Zip Generation

Uses JSZip library for client-side zip creation. No server-side processing needed — all markdown generated in the browser from the already-loaded `DomainModelFull` object.

## Dependencies

- **Requires**: ROAD-009 (API data source), ROAD-020 (subdomain classification for subdomains.md)
- **Enables**: ROAD-022 (static site generator extends the export concept)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| ASCII art breaks with long context names | Low | Truncate names in diagram; full names in text below |
| Large models produce huge markdown | Low | Paginate aggregates/events with table of contents |

## Estimation

- **Complexity**: Medium
- **Estimated Effort**: 3 days

---

## Governance Checklist

- [ ] ADRs identified and validated
- [ ] BDD scenarios written and approved
- [ ] Implementation complete
- [ ] NFRs validated
- [ ] Change record created
- [ ] Documentation updated

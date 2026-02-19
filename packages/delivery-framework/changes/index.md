---
sidebar_position: 1
id: changes-index
title: Change History
---

# Change History

Individual change records with full governance tracking. Each change includes compliance validation, agent signatures, and BDD test results.

## Recent Changes

<!-- AUTO-GENERATED: This section is updated automatically by @change-manager -->

### v0.10.0 (2026-02-17)

- [CHANGE-035](./CHANGE-035.md) — Lifecycle Navigation UI (ROAD-040)
- [CHANGE-033](./CHANGE-033.md) — FOE Project Browser (ROAD-030)
- [CHANGE-034](./CHANGE-034.md) — FOE Assessment Agent Chat (ROAD-031)
- [CHANGE-036](./CHANGE-036.md) — Taxonomy CRUD API (ROAD-041)
- [CHANGE-038](./CHANGE-038.md) — Domain Events Collapsible Groups
- [CHANGE-039](./CHANGE-039.md) — AWS Bedrock Scanner Support
- [CHANGE-040](./CHANGE-040.md) — Pre-commit Quality Hooks

### v0.9.0 (2026-02-13)

- [CHANGE-032](./CHANGE-032.md) — Model Selection Persistence (ROAD-029)
- [CHANGE-037](./CHANGE-037.md) — DDD Terminology Tooltips (ROAD-028)

### v0.8.0 (2026-02-12)

- [CHANGE-031](./CHANGE-031.md) — Hexagonal Architecture Extraction (ROAD-027)
- [CHANGE-027](./CHANGE-027.md) — Hexagonal Architecture Extraction & BDD Test Stability (ROAD-027)

## Change Format

Each change file includes:
- **Full governance frontmatter** (compliance checks, agent signatures)
- **BDD test results** (scenarios, pass/fail counts)
- **Implementation summary** by architectural layer
- **Breaking changes** (if any)
- **Migration notes** (if applicable)

## Status Legend

| Status | Description |
|--------|-------------|
| **draft** | Change in progress, not yet complete |
| **published** | Change complete, fully validated, and released |
| **archived** | Old change kept for historical reference |

## Categories

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Features marked for removal
- **Removed** - Deleted features
- **Fixed** - Bug fixes
- **Security** - Security improvements

## Compliance Requirements

Before a change can be marked as `published`:
- ADR compliance check: **pass**
- BDD scenarios: All passing
- NFR checks: Performance, Security, Accessibility all pass
- Agent signatures: Minimum 4 agents (architecture, BDD, code, NFR)

## Related

- [Roadmap](../roads/index.md) - Current development status
- [Template](./TEMPLATE.md) - Format for creating new changes

---

**Last Updated**: 2026-02-19
**Maintained By**: @change-manager agent

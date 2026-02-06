---
title: Architecture Decision Records (ADRs)
description: All architectural decisions for the project
last_updated: 2026-01-31
---

# Architecture Decision Records

This directory contains all architectural decisions for the project.

## Format

Each ADR is a separate Markdown file with YAML front matter:

```yaml
---
id: ADR-XXX
title: [Short Title]
status: accepted  # proposed | accepted | deprecated | superseded
category: [architecture | infrastructure | security | performance]
scope: project-wide
created: YYYY-MM-DD
---
```

## Categories

- **Architecture**: High-level design patterns (DDD, Hexagonal, etc.)
- **Infrastructure**: Deployment, runtime, database choices
- **Security**: Authentication, authorization, data protection
- **Performance**: Optimization strategies, caching, scalability

## Status Definitions

- **Proposed**: Under discussion, not yet accepted
- **Accepted**: Active governance rule - all changes must comply
- **Deprecated**: No longer recommended, but not actively harmful
- **Superseded**: Replaced by a newer ADR (see `superseded_by` field)

## Active Governance Rules

| ID | Title | Category | Status |
|----|-------|----------|--------|
| [ADR-001](./ADR-001.md) | Bun Workspaces as Package Manager and Runtime | Infrastructure | Accepted |
| [ADR-002](./ADR-002.md) | Zod as Single Source of Truth for Validation | Architecture | Accepted |
| [ADR-003](./ADR-003.md) | Hexagonal Architecture (Ports & Adapters) | Architecture | Accepted |
| [ADR-004](./ADR-004.md) | Elysia + Drizzle ORM on Bun for API Layer | Infrastructure | Accepted |
| [ADR-005](./ADR-005.md) | Docusaurus as Governance Documentation Platform | Infrastructure | Accepted |
| [ADR-006](./ADR-006.md) | OpenCode AI Agents for Multi-Agent Development | Architecture | Accepted |
| [ADR-007](./ADR-007.md) | Docker Multi-Stage Builds with Pre-Baked Indices | Infrastructure | Accepted |
| [ADR-008](./ADR-008.md) | 8-State Governance Workflow | Architecture | Accepted |
| [ADR-009](./ADR-009.md) | Markdown Frontmatter as Governance Artifact Format | Architecture | Accepted |
| [ADR-010](./ADR-010.md) | Progressive Replacement Strategy for Legacy Scripts | Architecture | Accepted |

## Governance

All accepted ADRs are active governance rules. Every change must comply with all accepted ADRs. See [Governance System](../governance/) for details.

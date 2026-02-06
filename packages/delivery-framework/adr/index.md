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

## Governance

All accepted ADRs are active governance rules. Every change must comply with all accepted ADRs. See [Governance System](../governance/) for details.

---
title: Behavior-Driven Development
description: BDD documentation and test scenarios
---

# Behavior-Driven Development (BDD)

Comprehensive BDD documentation including scenarios, Gherkin syntax, and test coverage.

## Overview

This section documents the BDD approach:

1. **[BDD Overview](./bdd-overview.md)** - Philosophy, workflow, and DDD integration
2. **[Gherkin Syntax](./gherkin-syntax.md)** - Reference guide for writing scenarios
3. **[Feature Index](./feature-index.md)** - All feature files organized by context

## Why BDD?

BDD bridges the gap between business requirements and technical implementation:

- **Shared Understanding** - Business and technical teams speak the same language
- **Living Documentation** - Feature files document system behavior
- **Regression Safety** - Automated tests catch breaking changes
- **DDD Alignment** - Tests use domain terminology from ubiquitous language
- **Quality Assurance** - Every feature has acceptance criteria

## Quick Start

```bash
# Run all BDD tests
just bdd-test

# Run tests for specific roadmap item
just bdd-roadmap ROAD-001

# Run smoke tests only
just bdd-tag @smoke
```

## Related

- [DDD Overview](../ddd/domain-overview.md) - Domain model that BDD tests verify
- [Road Items](../roads/index.md) - Features that BDD scenarios cover
- [Agents](../agents/index.md) - Agent coordination for BDD workflow

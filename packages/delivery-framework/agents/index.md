---
sidebar_position: 1
title: Multi-Agent System Overview
---

# Multi-Agent System

**Version**: 1.0.0
**Last Updated**: 2026-01-31

## What is the Multi-Agent System?

This project uses a **collaborative AI agent architecture** where specialized agents work together to develop, test, and maintain the codebase. Instead of a single AI doing everything, each agent has specific expertise, responsibilities, and autonomy levels.

## Why Multi-Agent Architecture?

### Traditional Single-Agent Approach
- One agent tries to do everything
- Context switching between tasks
- Easy to miss best practices
- Limited specialization

### Multi-Agent Approach
- Specialized expertise per domain
- Parallel execution of tasks
- Built-in quality gates
- Clear ownership and accountability

## Agent Categories

### Development Agents
Agents responsible for implementing features and maintaining infrastructure.

### Quality Agents
Agents responsible for testing, CI/CD, and code quality.

### Review Agents
Agents responsible for architecture compliance, DDD alignment, and UX review.

## Agent Coordination

Agents work together in coordinated workflows:

```
Main Orchestrator
    | delegates to
BDD Writer (asks permission)
    | creates scenarios
BDD Runner (tests fail - Red)
    | reports to
Code Writer
    | implements & delegates to
Architecture Inspector + DDD Aligner
    | approve & report to
BDD Runner (tests pass - Green)
    | reports to
CI Runner (full checks)
    | confirms to
Main Orchestrator
```

## Quick Start

### Running Tests with Agents

```bash
# BDD Runner executes all tests
just bdd-test

# Run tests for specific roadmap item
just bdd-roadmap ROAD-001

# Run smoke tests only
just bdd-tag @smoke
```

### Implementing a Feature

```bash
# 1. BDD Writer creates scenarios (with permission)
# 2. BDD Runner runs tests (Red phase)
just bdd-roadmap ROAD-001

# 3. Code Writer implements feature
# 4. Architecture Inspector + DDD Aligner review
# 5. BDD Runner runs tests again (Green phase)
just bdd-roadmap ROAD-001

# 6. CI Runner runs all checks
just check
```

## Next Steps

- Learn about individual agent responsibilities
- Understand the BDD Loop workflow
- Read the coordination guide

---

**Related Documentation**:
- [DDD Overview](../ddd/domain-overview.md)
- [Roadmap](../roads/index.md)
- [Changes](../changes/index.md)

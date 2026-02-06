---
sidebar_position: 1
title: BDD Overview
---

# Behavior-Driven Development (BDD) Overview

This project uses **Behavior-Driven Development (BDD)** to ensure all features are defined, tested, and implemented correctly. BDD bridges the gap between business requirements and technical implementation.

## What is BDD?

BDD is an agile software development technique that encourages collaboration among developers, QA, and non-technical participants in a software project. It extends Test-Driven Development (TDD) by writing test cases in a natural language that non-programmers can read.

## The BDD Cycle

This project follows a strict **Red-Green-Refactor** cycle:

### 1. Red Phase - Write Scenarios
Define expected behavior **before** writing any code. Tests should fail initially.

### 2. Green Phase - Implement Feature
Make tests pass by implementing the feature correctly.

### 3. Refactor Phase - Improve Code
Clean up code while keeping tests green.

## Our Approach

We integrate BDD with **Domain-Driven Design (DDD)** to ensure our tests reflect real business behavior.

### Key Benefits

1. **Shared Understanding** - Business and technical teams speak the same language
2. **Living Documentation** - Feature files document system behavior
3. **Regression Safety** - Automated tests catch breaking changes
4. **DDD Alignment** - Tests use domain terminology from ubiquitous language
5. **Quality Assurance** - Every feature has acceptance criteria

## Gherkin: The Language of BDD

We use **Gherkin** syntax to write scenarios in plain English:

```gherkin
Feature: Example Feature
  As a [role]
  I want to [action]
  So that [benefit]

  Scenario: Successfully complete an action
    Given a valid precondition
    When the user performs the action
    Then the expected outcome should occur
    And a confirmation should be recorded
```

## Feature Organization

BDD scenarios are organized by domain area:

```
stack-tests/features/
  api/          # API integration tests
  ui/           # UI acceptance tests
  hybrid/       # Full-stack tests
```

## Connecting DDD and BDD

BDD scenarios directly map to DDD concepts:

| DDD Concept | BDD Application |
|-------------|-----------------|
| **Bounded Context** | Feature file organization by domain area |
| **Ubiquitous Language** | Scenario vocabulary matches domain terms |
| **Aggregates** | Scenarios test aggregate behavior and invariants |
| **Domain Events** | Scenarios verify events are published |
| **Use Cases** | Each use case has corresponding feature file |

## Running BDD Tests

### Quick Commands

```bash
# Install dependencies
just bdd-install

# Run all BDD tests
just bdd-test

# Run tests for specific roadmap item
just bdd-roadmap ROAD-001

# Run with visible browser (UI tests)
just bdd-headed

# Generate test report
just bdd-report
```

### Test Categories

| Command | Description |
|---------|-------------|
| `just bdd-api` | API tests only |
| `just bdd-ui` | UI tests only |
| `just bdd-hybrid` | E2E tests only |
| `just bdd-tag @smoke` | Tests tagged with @smoke |
| `just bdd-gen` | Generate step definitions |

## The Complete Workflow

1. **Research Domain** - Review DDD Docs
2. **Draft Scenarios** - Use Ubiquitous Language
3. **User Review** - Refine Scenarios
4. **Create Feature File** - Tag with ROAD-XXX
5. **Run Tests** - RED Phase
6. **Implement Feature** - Domain -> App -> Infra
7. **Run Tests** - GREEN Phase
8. **Refactor Code** - Keep Tests Green
9. **Feature Complete**

## Next Steps

- [Learn Gherkin Syntax](./gherkin-syntax.md) - Full Gherkin reference guide
- [View Feature Index](./feature-index.md) - Browse all feature files

---

**Related**: [DDD Overview](../ddd/domain-overview.md) | [Ubiquitous Language](../ddd/ubiquitous-language.md) | [Use Cases](../ddd/use-cases.md)

---
title: Gherkin Syntax
---

# Gherkin Syntax Reference

A guide to writing BDD scenarios using Gherkin syntax.

## Structure

Follow Gherkin syntax for scenarios:

```gherkin
Feature: Feature Name
  As a [role]
  I want to [action]
  So that [benefit]

  Scenario: Scenario Name
    Given [context]
    When [action]
    Then [outcome]
```

## Keywords

| Keyword | Purpose |
|---------|---------|
| `Feature` | High-level description of a feature |
| `Scenario` | Specific test case |
| `Given` | Precondition or context |
| `When` | Action or trigger |
| `Then` | Expected outcome |
| `And` / `But` | Additional steps |
| `Background` | Common setup for all scenarios |
| `Scenario Outline` | Parameterized scenario |
| `Examples` | Data table for outline |

## Tags

Tags are used to organize and filter scenarios:

```gherkin
@capability:user-auth @context:identity @road:ROAD-001
Feature: User Authentication
```

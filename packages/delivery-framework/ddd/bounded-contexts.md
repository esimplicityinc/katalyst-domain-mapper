---
title: Bounded Contexts
---

# Bounded Contexts

The system is decomposed into bounded contexts, each with its own domain model, language, and responsibilities.

## Context Map Overview

```
+---------------------+
| Context A           |
|                     |
| - Responsibility 1  |
| - Responsibility 2  |
+----------+----------+
           |
           v
+---------------------+        +---------------------+
| Context B           |<------>| Context C           |
|                     |        |                     |
| - Responsibility 1  |        | - Responsibility 1  |
| - Responsibility 2  |        | - Responsibility 2  |
+---------------------+        +---------------------+
```

---

## Context Template

### Responsibility

Describe what this context is responsible for.

### Core Concepts

- **Concept One**: Description
- **Concept Two**: Description

### Key Aggregates

- **AggregateOne**: Root aggregate description

### Public Events

- `EventOne`
- `EventTwo`

### Relationships

- **Upstream from**: Other contexts
- **Downstream from**: Other contexts

### Boundaries

- Does NOT handle X (delegates to Context Y)
- Does NOT handle Z (delegates to Context W)

---

## Context Integration Patterns

### Shared Kernel
- Tightly coupled contexts that share domain objects

### Customer-Supplier
- Upstream context provides data to downstream context

### Partnership
- Contexts that collaborate as equals

---

## Context-Specific Languages

Each context has terminology that may differ:

| Concept | Context A | Context B | Context C |
|---------|-----------|-----------|-----------|
| Term 1 | Meaning A | Meaning B | Meaning C |

This is intentional - each context uses language natural to its domain.

---

## BDD Test Coverage

Each bounded context should have comprehensive BDD test coverage:

| Bounded Context | Feature Files | Scenarios | Status |
|----------------|---------------|-----------|--------|
| **Context A** | 0 files | 0 scenarios | Pending |
| **Context B** | 0 files | 0 scenarios | Pending |

See the [Feature Index](../bdd/feature-index.md) for complete test details.

## Related Documentation

### DDD
- [Domain Overview](./domain-overview.md) - Domain vision and scope
- [Ubiquitous Language](./ubiquitous-language.md) - Domain terminology
- [Context Map](./context-map.md) - Visual context relationships

### BDD Testing
- [BDD Overview](../bdd/bdd-overview.md) - Testing approach
- [Feature Index](../bdd/feature-index.md) - Browse all test scenarios

---

**Next**: [Ubiquitous Language](./ubiquitous-language.md)

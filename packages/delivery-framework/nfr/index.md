---
title: Non-Functional Requirements (NFRs)
description: Performance, security, and quality requirements for the project
last_updated: 2026-01-31
---

# Non-Functional Requirements

This directory contains all non-functional requirements (NFRs) for the project. NFRs define the quality attributes, constraints, and operational characteristics of the system.

## Format

Each NFR is a separate Markdown file with YAML front matter:

```yaml
---
id: NFR-XXX
title: [Short Title]
category: [performance | security | reliability | scalability | maintainability | accessibility]
priority: must  # must | should | could
status: active   # active | pending | deprecated
---
```

## Categories

### Performance
Response times, throughput, resource usage, and efficiency requirements.

### Security
Authentication, authorization, data protection, and compliance requirements.

### Reliability
Availability, fault tolerance, disaster recovery, and data integrity.

### Scalability
Horizontal and vertical scaling capabilities and limits.

### Maintainability
Code quality, documentation, test coverage, and operational ease.

### Accessibility
WCAG compliance, keyboard navigation, and assistive technology support.

## Priority Definitions

- **Must**: Critical requirement that must be met for system acceptance
- **Should**: Important requirement that should be met if possible
- **Could**: Desirable requirement that can be deferred if necessary

## Active Requirements

| ID | Title | Category | Priority |
|----|-------|----------|----------|
| [NFR-PERF-001](./NFR-PERF-001.md) | Governance Index Build Performance | Performance | Must |
| [NFR-PERF-002](./NFR-PERF-002.md) | API Response Time | Performance | Must |
| [NFR-SEC-001](./NFR-SEC-001.md) | API Key and Credential Protection | Security | Must |
| [NFR-A11Y-001](./NFR-A11Y-001.md) | WCAG 2.1 AA Compliance for Web UIs | Accessibility | Should |
| [NFR-REL-001](./NFR-REL-001.md) | Schema Validation at Boundaries | Reliability | Must |
| [NFR-MAINT-001](./NFR-MAINT-001.md) | Cross-Reference Referential Integrity | Maintainability | Must |
| [NFR-MAINT-002](./NFR-MAINT-002.md) | Backward-Compatible CLI | Maintainability | Should |

## Governance

All active NFRs are validated during the implementation phase. See [Governance System](../governance/) for details on the NFR validation process.

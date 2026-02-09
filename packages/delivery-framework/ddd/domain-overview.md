---
title: Domain Overview
---

# Domain Overview

## Vision

Katalyst Domain Mapper assesses **Flow Optimized Engineering (FOE)** practices in software repositories. It combines deterministic code analysis with AI-powered insights to produce comprehensive assessments across three dimensions:

- **Understanding** (35% weight) — System clarity, architecture quality, documentation, domain modeling
- **Feedback** (35% weight) — CI/CD speed, test coverage, deployment frequency, learning cycles
- **Confidence** (30% weight) — Test automation, static analysis, contract testing, stability

The system generates actionable reports that identify strengths, gaps, and provide prioritized recommendations — each linked to specific Field Guide methods that teams can adopt to improve.

## Core Domain

**Scanning** is the core domain. The ability to analyze a repository and produce a scored FOE report is the primary business differentiator. This is where the unique value lies — the AI-powered combination of 5 specialist agents (CI, Tests, Architecture, Domain, Documentation) orchestrated to produce a unified assessment with cognitive triangle diagnosis.

| Aspect | Detail |
|--------|--------|
| **Package** | `packages/foe-scanner/` |
| **Delivery** | Dockerized container with OpenCode AI agents |
| **Output** | `FOEReport` validated by `FOEReportSchema` (Zod) |
| **Competitive moat** | AI agent orchestration + Field Guide method linking |

## Supporting Subdomains

### Reporting (Storage + Visualization)
Persists FOE reports into normalized SQLite tables, serves them via REST API, and renders interactive visualizations in a React web UI. Also manages DDD domain model CRUD (bounded contexts, aggregates, value objects, domain events, glossary terms).

| Aspect | Detail |
|--------|--------|
| **Packages** | `packages/foe-api/` + `packages/foe-web-ui/` |
| **Key schemas** | `DomainModelSchema`, `BoundedContextSchema`, `AggregateSchema`, `ValueObjectSchema`, `DomainEventSchema`, `GlossaryTermSchema` |
| **Ports** | `ReportRepository`, `ScanJobRepository`, `ScanRunner`, `Logger` |

### Field Guide (Knowledge Base)
Parses, validates, and indexes 65+ methods and 39+ observations from markdown files. Provides keyword-based search across methods from FOE and external frameworks (DORA, DDD, BDD, Team Topologies, TDD, Continuous Delivery, Double Diamond).

| Aspect | Detail |
|--------|--------|
| **Package** | `packages/foe-field-guide-tools/` |
| **Key schemas** | `MethodSchema`, `ObservationSchema`, `MethodsIndexSchema`, `FieldGuideSchema` |
| **Output** | `methods-index.json`, `observations-index.json` (baked into scanner container at build time) |

### Governance (Delivery Process Tracking)
Tracks road items, capabilities, personas, NFRs, ADRs, change entries, and user stories. Provides the infrastructure for governing domain modeling decisions and tracking the delivery process itself.

| Aspect | Detail |
|--------|--------|
| **Package** | `packages/delivery-framework/` |
| **Artifacts** | Markdown files with structured frontmatter (ROAD-xxx, CAP-xxx, PER-xxx, ADR-xxx, NFR-xxx) |

## Domain Type

**Analytical + Operational**

- **Analytical**: Analyze repositories to produce scored assessments with evidence-backed findings, gap identification, and cognitive triangle diagnosis.
- **Operational**: Persist reports, track improvement over time via score trends, manage domain models, and govern delivery process through structured artifacts.

The system does NOT process transactions, handle payments, or manage user accounts. It is fundamentally an assessment and knowledge management tool.

## Key Problems Solved

1. **No standardized way to assess engineering practices** — Teams lack a consistent, repeatable method to evaluate their engineering maturity across understanding, feedback, and confidence. The scanner provides a structured 0–100 scoring framework with subscores and evidence.

2. **Assessment knowledge scattered in docs and tribal knowledge** — Best practices exist in disparate sources (DORA reports, DDD books, team wikis). The Field Guide consolidates 65+ methods from 7+ frameworks into a searchable, indexed catalog with maturity levels.

3. **No connection between assessment findings and actionable improvement methods** — Traditional audits identify problems but don't prescribe solutions. Every finding and recommendation in an FOE Report links directly to Field Guide methods via `MethodReferenceSchema`, creating a bridge from diagnosis to action.

4. **No governance trail for domain modeling decisions** — Domain models evolve but decisions aren't tracked. The governance subdomain provides ADRs, road items, and change entries that create an auditable trail of why the domain model looks the way it does.

## Success Metrics

- **Assessment accuracy** — FOE reports validated against expert manual assessments. Target: ≥80% agreement on maturity level classification.
- **Coverage** — Percentage of repository surface area analyzed (files, test files, ADRs, CI configs). Tracked via `MethodologySchema` fields (`filesAnalyzed`, `testFilesAnalyzed`, `adrsAnalyzed`).
- **Actionability** — Percentage of recommendations linked to specific Field Guide methods. Target: 100% of recommendations include at least one `MethodReference`.
- **Cycle time** — Time from assessment → team adopts improvement → re-assessment shows score increase. Tracked via `ScoreTrendPoint` (repository score over time).
- **Schema validation rate** — Reports that pass `FOEReportSchema.parse()` without errors. Target: 100%.

## Domain Boundaries

### In Scope

- **FOE assessment** — Repository scanning, dimension scoring, cognitive triangle diagnosis
- **Method catalog** — Field Guide indexing, keyword extraction, external framework integration
- **Report visualization** — Web UI with radial charts, triangle diagrams, expandable findings
- **Report persistence** — Normalized storage, filtering, comparison, score trends
- **Domain model management** — CRUD for bounded contexts, aggregates, value objects, domain events, glossary terms
- **Governance infrastructure** — Road items, capabilities, personas, ADRs, NFRs, change tracking
- **Schema validation** — Zod-based runtime validation for all data boundaries

### Out of Scope

- **CI/CD pipeline execution** — The scanner *analyzes* pipelines but does not run them
- **Code modification / auto-remediation** — Reports recommend changes but do not apply them
- **Team management** — No user accounts, roles, permissions, or team structures
- **Incident management** — No integration with PagerDuty, OpsGenie, etc.
- **Real-time monitoring** — The system is assessment-oriented, not observability-oriented

## Strategic Domain Patterns

Following DDD strategic patterns:

1. **Core Domain — Scanning**: The AI-powered analysis engine. This is where investment in sophistication pays off. The 5 specialist agents + orchestrator pattern is the unique competitive advantage.

2. **Supporting Subdomain — Reporting**: Necessary infrastructure to persist and visualize scan results. Uses well-understood patterns (REST API, React UI, SQLite). Follows hexagonal architecture with ports (`ReportRepository`, `ScanJobRepository`) and adapters (`SqliteReportRepository`, `DockerScanRunner`).

3. **Supporting Subdomain — Field Guide**: Reference data management. Deterministic parsers and builders that convert markdown into searchable indices. Low complexity, high value — provides the vocabulary that makes recommendations actionable.

4. **Generic Subdomain — Governance**: Standard delivery tracking patterns (road items, ADRs) that could apply to any project. The governance infrastructure itself is generic; its *content* (what gets tracked) is domain-specific.

## Ubiquitous Language Foundation

Key terms used consistently across code, documentation, and communication:

| Term | Definition | Code Reference |
|------|-----------|----------------|
| **FOE Report** | A scored assessment of a repository's engineering practices across 3 dimensions | `FOEReportSchema` in `@foe/schemas` |
| **Dimension** | One of 3 assessment axes: Understanding (35%), Feedback (35%), Confidence (30%) | `DimensionScoreSchema` |
| **Cognitive Triangle** | Diagnosis of balance between 3 dimensions with minimum thresholds (U≥35, F≥40, C≥30) | `TriangleDiagnosisSchema` |
| **Maturity Level** | Scored classification: Hypothesized (0–25), Emerging (26–50), Practicing (51–75), Optimized (76–100) | `MaturityLevelSchema` |
| **Method** | A documented engineering practice with evidence and maturity levels (65+ methods) | `MethodSchema` |
| **Observation** | A documented finding from real-world projects with evidence (39+ observations) | `ObservationSchema` |
| **Scan Job** | An in-progress analysis of a repository, tracked through queued→running→completed/failed | `ScanJob` in `foe-api/src/domain/scan/` |
| **Domain Model** | A container aggregating bounded contexts, aggregates, value objects, events, glossary | `DomainModelSchema` |
| **Road Item** | A planned unit of work with governance tracking (ROAD-xxx) | Markdown frontmatter |
| **Bounded Context** | A self-contained domain area with its own model, language, and responsibilities | `BoundedContextSchema` |
| **Aggregate** | A cluster of domain objects with a root entity that enforces invariants | `AggregateSchema` |

See [Ubiquitous Language](./ubiquitous-language.md) for the complete glossary.

---

## Related Documentation

### DDD
- [Bounded Contexts](./bounded-contexts.md) - Domain decomposition
- [Ubiquitous Language](./ubiquitous-language.md) - Domain terminology
- [Use Cases](./use-cases.md) - System interactions

### BDD Testing
- [BDD Overview](../bdd/bdd-overview.md) - Testing philosophy
- [Feature Index](../bdd/feature-index.md) - Test coverage by domain

---

**Next**: [Bounded Contexts](./bounded-contexts.md)

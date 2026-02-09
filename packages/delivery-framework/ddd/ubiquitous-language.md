---
title: Ubiquitous Language
---

# Ubiquitous Language

This glossary defines the terms used consistently across code, documentation, API contracts, BDD scenarios, and team communication in the Katalyst Domain Mapper project. Every term here has a precise meaning — using the correct term prevents ambiguity and ensures all contexts share a common understanding.

> **Rule**: If a term appears in this glossary, use it exactly as defined. If you need a concept not listed here, propose it as a glossary addition rather than inventing ad-hoc terminology.

---

## Core Domain Terms

These terms are fundamental to the Scanning and Reporting contexts — the heart of what the system does.

| Term | Definition | Context(s) | Code Reference |
|------|-----------|------------|----------------|
| **FOE Report** | A complete, scored assessment of a software repository's engineering practices across 3 dimensions. Contains overall score, maturity level, dimension scores, findings, strengths, recommendations, triangle diagnosis, and methodology. Immutable once ingested. | Scanning, Reporting | `FOEReportSchema` in `@foe/schemas/src/scan/report.ts` |
| **Dimension** | One of 3 assessment axes that compose the overall FOE score. Each dimension has a score (0–100), confidence level, color, and 4 subscores (each max 25 points). The three dimensions are: **Understanding** (35% weight), **Feedback** (35% weight), **Confidence** (30% weight). | Scanning, Reporting | `DimensionScoreSchema` in `@foe/schemas/src/scan/dimension.ts` |
| **Understanding** | The dimension measuring system clarity: architecture quality, documentation, domain modeling, and code readability. Weight: 35%. | Scanning, Reporting | `DimensionScoreSchema` (name: `'Understanding'`) |
| **Feedback** | The dimension measuring learning speed: CI/CD pipeline speed, test coverage, deployment frequency, and feedback loop investments. Weight: 35%. | Scanning, Reporting | `DimensionScoreSchema` (name: `'Feedback'`) |
| **Confidence** | The dimension measuring reliability assurance: test automation, static analysis, contract testing, and stability indicators. Weight: 30%. | Scanning, Reporting | `DimensionScoreSchema` (name: `'Confidence'`) |
| **Cognitive Triangle** | A diagnosis of the balance between the 3 dimensions. Determines cycle health (`virtuous`, `at-risk`, or `vicious`) based on minimum thresholds: Understanding ≥ 35, Feedback ≥ 40, Confidence ≥ 30. Identifies the weakest principle and prescribes a specific intervention. | Scanning, Reporting | `TriangleDiagnosisSchema` in `@foe/schemas/src/scan/triangle-diagnosis.ts` |
| **Cycle Health** | The state of the cognitive triangle: **virtuous** (all dimensions above thresholds), **at-risk** (one dimension near threshold), or **vicious** (one or more below threshold). | Scanning, Reporting | `CycleHealthSchema` — enum: `'virtuous' \| 'at-risk' \| 'vicious'` |
| **Maturity Level** | A classification derived from the overall score: **Hypothesized** (0–25), **Emerging** (26–50), **Practicing** (51–75), **Optimized** (76–100). Applies to both FOE reports and individual methods. | All | `MaturityLevelSchema` in `@foe/schemas/src/scan/common.ts` |
| **SubScore** | A scored sub-area within a dimension. Each dimension has exactly 4 subscores, each with a max of 25 points. Contains evidence (what was found), gaps (what's missing), optional deductions, and optional method references. | Scanning, Reporting | `SubScoreSchema` in `@foe/schemas/src/scan/subscore.ts` |
| **Finding** | A gap, issue, or critical failure identified during a scan. Has area, severity (`critical \| high \| medium \| low`), title, evidence, impact, recommendation, optional location, and linked methods. | Scanning, Reporting | `FindingSchema` in `@foe/schemas/src/scan/finding.ts` |
| **Strength** | A positive aspect of the repository identified during a scan. Has area, evidence, and optional caveat. | Scanning, Reporting | `StrengthSchema` in `@foe/schemas/src/scan/strength.ts` |
| **Recommendation** | An actionable improvement suggestion with priority (`immediate \| short-term \| medium-term`), impact level, description, linked methods, and optional learning path URL. | Scanning, Reporting | `RecommendationSchema` in `@foe/schemas/src/scan/recommendation.ts` |
| **Scan Job** | An in-progress analysis of a repository. Tracks status transitions: `queued → running → completed \| failed`. Created when a scan is triggered, updated as the scanner progresses. | Scanning, Reporting | `ScanJob` in `foe-api/src/domain/scan/Scan.ts`, `scanJobs` table |
| **Methodology** | Metadata about how a scan was conducted: files analyzed, test files found, ADRs counted, whether coverage reports were found, and confidence notes. | Scanning, Reporting | `MethodologySchema` in `@foe/schemas/src/scan/methodology.ts` |
| **Method Reference** | A link from a finding, recommendation, or subscore to a specific Field Guide method. Contains method ID, title, maturity, relevance (`primary \| secondary`), and optional URL. | Scanning, Reporting | `MethodReferenceSchema` in `@foe/schemas/src/scan/method-reference.ts` |
| **Assessment Mode** | The strictness level of a scan: **standard** (normal scoring) or **critical** (stricter thresholds for production-critical systems). | Scanning | `AssessmentModeSchema` — enum: `'standard' \| 'critical'` |
| **Score Trend** | A time-series of a repository's scores across multiple scans. Each point includes overall score plus per-dimension scores. Used to track improvement over time. | Reporting | `ScoreTrendPoint` in `foe-api/src/ports/ReportRepository.ts` |
| **Repository** | A tracked software project with metadata: name, URL, tech stack, monorepo flag, scan history. Created automatically during report ingestion. | Reporting | `repositories` table in `foe-api/src/db/schema.ts` |

---

## Field Guide Terms

These terms belong to the Field Guide context — the knowledge base that makes assessments actionable.

| Term | Definition | Context(s) | Code Reference |
|------|-----------|------------|----------------|
| **Method** | A documented engineering practice identified by `M{NNN}` (e.g., `M111`). Has title, optional description, maturity level, field guide association, linked observations, extracted keywords, and source path. The catalog includes 65+ methods from FOE and 7 external frameworks. | Field Guide, Scanning | `MethodSchema` in `@foe/schemas/src/field-guide/method.ts` |
| **Observation** | A documented finding from real-world projects identified by `O{NNN}` (e.g., `O157`). Has status (`in-progress \| completed`), source type (`internal \| external`), linked methods, and optional external source metadata. The catalog includes 39+ observations. | Field Guide | `ObservationSchema` in `@foe/schemas/src/field-guide/observation.ts` |
| **Method Maturity** | The maturity level of a method within the FOE framework: **hypothesized** (theoretical), **observing** (being tested), **validated** (proven in practice), **proven** (widely adopted). Distinct from FOE Report maturity levels. | Field Guide | `MethodMaturitySchema` — enum: `'hypothesized' \| 'observing' \| 'validated' \| 'proven'` |
| **Keyword** | A term extracted from method titles and content, used for auto-linking scan findings to relevant methods. 625+ keywords are indexed. Normalized to lowercase for matching. | Field Guide | `keywordIndex` in `MethodsIndexSchema` |
| **External Framework** | A methodology external to FOE whose methods are adopted into the catalog: DORA, DDD, BDD, Team Topologies, TDD, Continuous Delivery, Double Diamond. Each adopted method gets a FOE-specific maturity assessment. | Field Guide | `ExternalMethodInfoSchema` in `@foe/schemas/src/field-guide/method.ts` |
| **Methods Index** | The build-time JSON artifact containing all methods keyed by ID, keyword index, field guide index, and framework index. Generated by `@foe/field-guide-tools` and baked into the scanner Docker image. | Field Guide | `MethodsIndexSchema` in `@foe/schemas/src/field-guide/methods-index.ts` |
| **Field Guide** | A named collection of methods (e.g., "testing", "agentic-coding"). Has ID, title, description, adopted methods from external frameworks, and a sidebar ID for Docusaurus navigation. | Field Guide | `FieldGuideSchema` in `@foe/schemas/src/field-guide/field-guide.ts` |

---

## Domain Modeling Terms

These terms belong to the Reporting context's DDD modeling capability — the system modeling its own domain.

| Term | Definition | Context(s) | Code Reference |
|------|-----------|------------|----------------|
| **Domain Model** | The top-level container for all DDD artifacts belonging to a single project. Aggregates bounded contexts, aggregates, value objects, domain events, and glossary terms. Identified by UUID. | Reporting | `DomainModelSchema` in `@foe/schemas/src/ddd/domain-model.ts`, `domainModels` table |
| **Bounded Context** | A self-contained domain area with its own model, language, and responsibilities. Has slug, title, responsibility, source directory, team ownership, status (`draft \| stable \| deprecated`), and relationships to other contexts. | Reporting | `BoundedContextSchema` in `@foe/schemas/src/ddd/bounded-context.ts`, `boundedContexts` table |
| **Aggregate** | A cluster of domain objects treated as a unit with a root entity. Has slug, root entity, child entities, value objects, events, commands, invariants, source file, and status (`draft \| implemented \| deprecated`). | Reporting | `AggregateSchema` in `@foe/schemas/src/ddd/aggregate.ts`, `aggregates` table |
| **Value Object** | An immutable domain primitive defined by its properties rather than identity. Has slug, typed properties, validation rules, immutability flag, and source file. | Reporting | `ValueObjectSchema` in `@foe/schemas/src/ddd/value-object.ts`, `valueObjects` table |
| **Domain Event** | A significant occurrence in the domain that other parts of the system may react to. Has slug, payload fields, consumers, triggers, side effects, and optional aggregate association. | Reporting | `DomainEventSchema` in `@foe/schemas/src/ddd/domain-event.ts`, `domainEvents` table |
| **Glossary Term** | A defined term within the ubiquitous language. Has term name, definition, aliases, examples, related terms, optional context scope, and source. | Reporting | `GlossaryTermSchema` in `@foe/schemas/src/ddd/glossary.ts`, `glossaryTerms` table |
| **Invariant** | A business rule that must always be true for an aggregate. Has description, enforcement flag, and optional enforcement location (code path). | Reporting | `InvariantSchema` in `@foe/schemas/src/ddd/aggregate.ts` |
| **Context Relationship** | A typed relationship between bounded contexts: `upstream \| downstream \| partnership \| shared-kernel \| separate-ways`. Includes communication pattern and description. | Reporting | `ContextRelationshipSchema` in `@foe/schemas/src/ddd/bounded-context.ts` |
| **Communication Pattern** | How two bounded contexts integrate: `domain-events`, `shared-kernel`, `anti-corruption-layer`, `open-host-service`, `conformist`, `partnership`, `customer-supplier`, or `separate-ways`. | Reporting | `CommunicationPatternSchema` in `@foe/schemas/src/ddd/bounded-context.ts` |

---

## Governance Terms

These terms belong to the Governance context — the delivery process infrastructure.

| Term | Definition | Context(s) | Code Reference |
|------|-----------|------------|----------------|
| **Road Item** | A planned unit of work with governance tracking, identified by `ROAD-xxx`. Contains title, description, status, priority, linked capabilities, acceptance criteria, and estimated effort. Lives as markdown in `packages/delivery-framework/roadmap/`. | Governance | Markdown frontmatter |
| **Capability** | A system function that delivers value to one or more personas, identified by `CAP-xxx`. Maps to road items that implement it. Lives in `packages/delivery-framework/capabilities/`. | Governance | Markdown frontmatter |
| **Persona** | An actor archetype who interacts with the system, identified by `PER-xxx`. Has name, role, goals, and pain points. Used in user stories and BDD scenarios. Lives in `packages/delivery-framework/personas/`. | Governance | Markdown frontmatter |
| **User Story** | A narrative describing what a persona needs and why, following "As a [persona], I want [goal], so that [benefit]" format. Embedded in road items or standalone. | Governance | Markdown content |
| **ADR** | Architecture Decision Record identified by `ADR-xxx`. Documents context, decision, consequences, and status for a key technical decision. Provides the "why" behind architectural choices. | Governance | Markdown frontmatter |
| **NFR** | Non-Functional Requirement identified by `NFR-xxx`. Specifies a quality attribute (performance, security, accessibility, reliability) with measurable acceptance criteria. | Governance | Markdown frontmatter |
| **Change Entry** | A record of changes made to the system, identified by `CHANGE-xxx`. Tracks what changed, when, why, and who approved it. Provides an audit trail. | Governance | Markdown frontmatter |
| **Governance Snapshot** | A point-in-time capture of all governance artifact states — road items, capabilities, ADRs, NFRs — for compliance auditing and progress tracking. | Governance | Planned (ROAD-002+) |
| **Governance Artifact** | Any structured document managed by the Governance context: road items, capabilities, personas, ADRs, NFRs, change entries, user stories. All use markdown with validated frontmatter. | Governance | (collective term) |

---

## Technical Infrastructure Terms

These terms describe the system's technical architecture rather than business domain concepts.

| Term | Definition | Context(s) | Code Reference |
|------|-----------|------------|----------------|
| **Port** | An interface defining what the domain needs from the outside world (hexagonal architecture). Examples: `ReportRepository`, `ScanJobRepository`, `ScanRunner`, `Logger`. | Reporting | `foe-api/src/ports/` directory |
| **Adapter** | A concrete implementation of a port. Examples: `SqliteReportRepository`, `DockerScanRunner`. | Reporting | `foe-api/src/adapters/` directory |
| **Use Case** | An application service that orchestrates domain logic. Examples: `IngestReport`, `GetReport`, `ListReports`, `CompareReports`, `TriggerScan`, `GetScanStatus`. | Reporting | `foe-api/src/usecases/` directory |
| **Shared Kernel** | The `@foe/schemas` package — Zod validation schemas shared across all TypeScript contexts. Defines the canonical data structures for the entire system. | All | `packages/foe-schemas/` |
| **Scanner Container** | The Docker image containing OpenCode CLI + 6 AI agents (1 orchestrator + 5 specialists). Runs in batch mode, outputs JSON to stdout. | Scanning | `packages/foe-scanner/Dockerfile` |

---

## Anti-Language (Terms to Avoid)

These terms are ambiguous, overloaded, or misaligned with the domain. Use the preferred term instead.

| Avoid | Use Instead | Reason |
|-------|------------|--------|
| scan result | **FOE Report** | "Result" is too generic — an FOE Report is a specific, structured artifact with schema validation |
| practice, technique | **Method** | "Method" is the Field Guide's term for a documented engineering practice with ID, maturity, and observations |
| finding, note, insight | **Observation** | "Observation" is the Field Guide's term for a documented real-world finding with evidence and linked methods |
| health triangle | **Cognitive Triangle** | "Cognitive" emphasizes the human reasoning factor — understanding, feedback, and confidence are cognitive processes |
| ticket, task, issue, story | **Road Item** | "Road Item" conveys the roadmap/journey metaphor and avoids tool-specific language (Jira ticket, GitHub issue) |
| feature, module, service | **Capability** | "Capability" conveys a system function that delivers value, not an implementation artifact |
| user type, role, actor | **Persona** | "Persona" conveys an archetype with goals and pain points, not just a permission level |
| document, file, spec | **Governance Artifact** | "Artifact" conveys a formal, structured document with validated frontmatter and lifecycle tracking |
| health, status | **Cycle Health** | Specifically refers to the cognitive triangle's state (`virtuous \| at-risk \| vicious`), not generic system health |
| score, rating, grade | **Overall Score** or **Dimension Score** | Be specific — "score" alone is ambiguous. Always qualify: overall score (0–100), dimension score, subscore |
| test, check | **Scan** | The system performs "scans" (comprehensive assessments), not individual tests or checks |
| category, type, kind | **Dimension** | The 3 assessment axes are "dimensions," not categories. Each has weight, subscores, and confidence. |
| link, reference | **Method Reference** | When connecting findings to methods, use "Method Reference" — it's a typed object with relevance and URL |
| level, tier, stage | **Maturity Level** | The 4-tier classification (Hypothesized → Optimized) is a "Maturity Level," not a generic level |
| data model, schema | **Domain Model** | In the DDD modeling context, "Domain Model" is the container for bounded contexts, aggregates, etc. "Schema" refers to Zod validation schemas. |
| context, area, zone | **Bounded Context** | Use the full term "Bounded Context" to be precise about DDD semantics. "Context" alone is ambiguous. |

---

## Term Evolution

As the system evolves, new terms may be needed. Follow this process:

1. **Propose**: Add the term to a road item or ADR with proposed definition
2. **Review**: Discuss with the team to ensure it doesn't conflict with existing terms
3. **Add**: Update this glossary, the `GlossaryTermSchema` API, and any relevant BDD scenarios
4. **Enforce**: Use the term consistently in code (variable names, schema fields), documentation, and conversation

---

## Related Documentation

### DDD
- [Domain Overview](./domain-overview.md) - Domain vision and scope
- [Bounded Contexts](./bounded-contexts.md) - Domain decomposition
- [Use Cases](./use-cases.md) - System interactions

### BDD Testing
- [BDD Overview](../bdd/bdd-overview.md) - Testing approach
- [Feature Index](../bdd/feature-index.md) - Browse all test scenarios

---

**Previous**: [Bounded Contexts](./bounded-contexts.md)

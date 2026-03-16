# Schema Plan: EntityBase Refactor + Practice Areas

> **Status:** Proposed
> **Date:** 2026-03-16
> **Scope:** Full-stack (schemas, database, repository, use cases, API, seed data)
> **Prerequisite:** Greenfield -- no backward compatibility constraints

---

## Table of Contents

1. [Motivation](#1-motivation)
2. [Design Decisions](#2-design-decisions)
3. [Part 1: EntityBase -- Universal Foundation](#3-part-1-entitybase--universal-foundation)
4. [Part 2: Practice Areas Data Model](#4-part-2-practice-areas-data-model)
5. [Part 3: Adoption Layer](#5-part-3-adoption-layer)
6. [Part 4: Snapshot & Index Updates](#6-part-4-snapshot--index-updates)
7. [Part 5: Canonical Seed Data](#7-part-5-canonical-seed-data)
8. [Part 6: Implementation Checklist](#8-part-6-implementation-checklist)
9. [Part 7: Ubiquitous Language Additions](#9-part-7-ubiquitous-language-additions)
10. [Appendix A: Existing Extension Cleanup](#10-appendix-a-existing-extension-cleanup)
11. [Appendix B: Competency Dependency DAG Reference](#11-appendix-b-competency-dependency-dag-reference)

---

## 1. Motivation

The Katalyst system currently has **Methods** (65+ FOE/external engineering practices), **Teams** (with Team Topologies types, members, owned nodes), and a **Scanner** (assesses repositories against methods). What is missing is the bridge between teams/individuals and the methods they practice.

There is no way to:

- Group related methods into practice areas (Testing, CI/CD, DevOps, etc.)
- Track which competencies a team or individual has adopted, at what level
- Model cross-competency dependencies (e.g., "DevOps IaC requires AWS knowledge")
- Link scanner evidence to declared adoption levels
- Track individual skill assessments with gauges and assessor verification

Additionally, an audit of the existing entity schemas revealed inconsistencies that should be resolved before adding new entity types:

| Problem | Current State |
|---------|--------------|
| Double `contribution` | Both the base `TaxonomyNode` and every extension carry `ContributionSchema` |
| Triple timestamps | Base has `createdAt`/`updatedAt` (unvalidated strings), Contribution has its own `createdAt`/`updatedAt` (ISO 8601), some extensions add a third `created`/`updated` |
| Scattered owners | `owners[]` on base, `owner` on RoadItem, `teamOwnership`/`ownerTeam` on BoundedContext, `validatedBy` on UserType |
| ID duplication | Governance IDs stored in both `labels` (on base) and `tag` (on extensions) |
| No shared base for infrastructure | Teams, Persons, Tools, Stages have no lifecycle, no consistent identity pattern |

This plan addresses both: clean up the foundation, then build the practice area model on top of it.

---

## 2. Design Decisions

These decisions were made during planning and are locked in:

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | Keep the name **Practice Area** (not "Discipline") | Familiar terminology from the reference competency model; avoids collision with existing FOE terms |
| D2 | Pillars are **value objects** embedded in Practice Area | 6 standard pillars (Strategy, Standards, Frameworks, Libraries, Processes, Measures) don't need their own lifecycle |
| D3 | Model cross-competency dependencies as a **DAG** with cycle detection | The reference data shows chains 4 levels deep spanning multiple practice areas (e.g., Observability Advanced requires DevOps IaC Basic requires AWS Intermediate). Long-term sanity requires graph-aware validation. |
| D4 | Include **individual adoption** alongside team adoption | Tracks per-person skill assessments with 4-point gauge (strong/improving/weak/none), assessor verification, and governance roles (lead/advocate/sme/member) |
| D5 | Pre-seed **7 canonical practice areas** but allow extending | Canonical areas map to scanner agents; users add custom ones with `canonical: false` |
| D6 | **Hybrid scanner integration** | Teams manually declare adoption; scanner provides evidence that confirms, challenges, or is neutral to declared levels |
| D7 | **Refactor everything to EntityBase first** | Extract a shared foundation so tree nodes, infrastructure items, and bridge records all share the same identity + lifecycle core |
| D8 | **Unify all entities** -- infrastructure schemas (Team, Person, Tool, etc.) also get EntityBase | Ensures consistent serialization across YAML/docdb, relational DB, and graph storage |
| D9 | Bridge entities (TeamAdoption, IndividualAdoption) use **EntityBase** but not TaxonomyNode | They don't have a place in the tree hierarchy (no `nodeType`, `fqtn`, `parentNode`) but share the identity + lifecycle core |
| D10 | **4-tier adoption maturity**: `aware`, `learning`, `practicing`, `mastered` | Provides meaningful progression without collision with FOE report maturity levels |

---

## 3. Part 1: EntityBase -- Universal Foundation

### 3.1 EntityBaseSchema

Every entity in the system -- tree nodes, infrastructure items, bridge records -- composes from this shared core.

**File:** `packages/foe-schemas/src/taxonomy/entity-base.ts` (NEW)

```typescript
import { z } from "zod";
import { TaxonomyNodeNamePattern } from "./common.js";
import { ContributionSchema } from "./contribution.js";

export const EntityBaseSchema = z.object({
  // ── Identity ──
  id:          z.string().uuid(),
  name:        TaxonomyNodeNamePattern,              // kebab-case slug, max 63 chars

  // ── Metadata ──
  description: z.string().nullable().default(null),
  labels:      z.record(z.string()).default({}),     // governance IDs, tags, key-value pairs

  // ── Ownership & Dependencies ──
  owners:      z.array(z.string()).default([]),       // person/team name refs
  dependsOn:   z.array(z.string()).default([]),       // cross-entity dependency refs

  // ── Timestamps (single source of truth, ISO 8601 validated) ──
  createdAt:   z.string().datetime(),
  updatedAt:   z.string().datetime(),

  // ── Lifecycle (single instance -- never duplicated in extensions) ──
  contribution: ContributionSchema,
});

export type EntityBase = z.infer<typeof EntityBaseSchema>;
```

**10 fields.** Every entity in the entire system starts here.

### 3.2 Slimmed ContributionSchema

Timestamps removed -- they are owned by EntityBase.

**File:** `packages/foe-schemas/src/taxonomy/contribution.ts` (MODIFIED)

```typescript
import { z } from "zod";

export const ContributionStatusSchema = z.enum([
  "draft",
  "proposed",
  "rejected",
  "accepted",
  "deprecated",
  "superseded",
]);

export type ContributionStatus = z.infer<typeof ContributionStatusSchema>;

export const ContributionSchema = z.object({
  status:         ContributionStatusSchema.default("draft"),
  version:        z.number().int().positive().default(1),
  supersedes:     z.string().nullable().default(null),   // "ITEM-ID@vN"
  supersededBy:   z.string().nullable().default(null),   // "ITEM-ID@vN"
  submittedAt:    z.string().datetime().nullable().default(null),
  submittedBy:    z.string().nullable().default(null),
  reviewedAt:     z.string().datetime().nullable().default(null),
  reviewedBy:     z.string().nullable().default(null),
  reviewFeedback: z.string().nullable().default(null),
  // NOTE: createdAt/updatedAt REMOVED -- owned by EntityBase
});

export type Contribution = z.infer<typeof ContributionSchema>;
```

**State machine** (unchanged):

```
draft → proposed → accepted | rejected
                   accepted → deprecated | superseded
                   rejected → draft
                   deprecated → draft
                   superseded → (terminal)
```

### 3.3 Three Composition Patterns

All three patterns build on `EntityBaseSchema`:

#### Pattern A: Tree Nodes (TaxonomyNode)

For entities that live in the taxonomy hierarchy (DDD, governance, practice areas).

**File:** `packages/foe-schemas/src/taxonomy/taxonomy-node.ts` (MODIFIED)

```typescript
export const TaxonomyNodeSchema = EntityBaseSchema.extend({
  nodeType:     TaxonomyNodeTypeSchema,
  fqtn:         z.string(),                             // fully-qualified taxonomy name
  parentNode:   z.string().nullable().default(null),    // parent node ref
  environments: z.array(z.string()).default([]),
  path:         z.string().default(""),
});
```

**Total fields:** 10 (EntityBase) + 5 (tree) = **15 fields**

#### Pattern B: Infrastructure Items

For teams, persons, tools, stages, etc. -- entities that aren't tree nodes but need full lifecycle.

```typescript
// Example: TaxonomyTeamSchema
export const TaxonomyTeamSchema = EntityBaseSchema.extend({
  displayName:           z.string(),
  teamType:              TeamTopologyTypeSchema,
  focusArea:             z.string().nullable().default(null),
  communicationChannels: z.array(z.string()).default([]),
  ownedNodes:            z.array(z.string()).default([]),
  members:               z.array(TaxonomyTeamMembershipSchema).default([]),
});
```

**Total fields:** 10 (EntityBase) + N (type-specific)

#### Pattern C: Bridge Records

For entities that connect two other entities (adoption records).

```typescript
// Example: TeamAdoptionSchema
export const TeamAdoptionSchema = EntityBaseSchema.extend({
  teamName:           z.string(),
  practiceAreaId:     PracticeAreaIdPattern,
  adoptionLevel:      AdoptionLevelSchema,
  // ... bridge-specific fields
});
```

**Total fields:** 10 (EntityBase) + N (bridge-specific)

### 3.4 Extension Schema Rules

These rules apply to ALL extension schemas (existing and new):

| Rule | Description |
|------|-------------|
| **No `contribution` field** | The base entity's `contribution` is the single lifecycle tracker |
| **No `createdAt` / `updatedAt`** | The base entity owns timestamps |
| **No `tag` field** | Governance IDs go in `labels` on the base entity. Use `getGovernanceId(entity)` helper. |
| **No redundant `owner`** | Use the base entity's `owners[]`. No extension-level `owner`, `teamOwnership`, `ownerTeam`. |
| **Domain-specific status allowed** | Extension can define its own status enum (e.g., RoadItem's 8-state workflow). Only activates after `contribution.status === "accepted"`. |
| **Domain-specific dates allowed** | Must be explicitly named (e.g., `started`, `completed`, `dateDocumented`), never generic `created`/`updated`. |
| **`title` is standard for governance** | Governance extensions carry `title`. DDD extensions use `name` from the base entity. |

### 3.5 Infrastructure Schema Refactoring

All infrastructure schemas gain EntityBase fields:

| Schema | Current Fields | After Refactor |
|--------|---------------|----------------|
| `TaxonomyTeamSchema` | name, displayName, teamType, description, focusArea, communicationChannels, ownedNodes, members | EntityBase + displayName, teamType, focusArea, communicationChannels, ownedNodes, members |
| `TaxonomyPersonSchema` | name, displayName, email, role, avatarUrl | EntityBase + displayName, email, role, avatarUrl |
| `TaxonomyToolSchema` | name, description, actions | EntityBase + actions |
| `TaxonomyStageSchema` | name, description, dependsOn | EntityBase (description and dependsOn already in base) |
| `TaxonomyActionSchema` | name, description, type, command, tags | EntityBase + type, command, tags |
| `TaxonomyEnvironmentSchema` | name, description, parentEnvironment, promotionTargets, templateReplacements | EntityBase + parentEnvironment, promotionTargets, templateReplacements |
| `TaxonomyLayerTypeSchema` | name, description | EntityBase only (no extra fields needed) |
| `TaxonomyTeamMembershipSchema` | personName, role | **NOT refactored** -- this is a pure value object (no identity) |
| `TaxonomyCapabilitySchema` | name, type, description | EntityBase + type |
| `TaxonomyCapabilityRelSchema` | source, target, type, description | EntityBase + source, target, type |

**Note:** `TaxonomyTeamMembershipSchema` stays as-is. It's a value object embedded in Team, not a standalone entity. Same rule applies to other pure value objects (PracticeAreaPillar, Skill, CompetencyLevelDef, etc.).

---

## 4. Part 2: Practice Areas Data Model

### 4.1 New ID Patterns

**File:** `packages/foe-schemas/src/taxonomy/common.ts` (MODIFIED)

```typescript
export const PracticeAreaIdPattern = z.string().regex(/^PA-\d{3,}$/);
export const CompetencyIdPattern  = z.string().regex(/^COMP-\d{3,}$/);
```

### 4.2 New Node Types

**File:** `packages/foe-schemas/src/taxonomy/taxonomy-node.ts` (MODIFIED)

Add to `TaxonomyNodeTypeSchema`:

```typescript
export const TaxonomyNodeTypeSchema = z.enum([
  // ── Infrastructure (base node only) ──
  "system", "subsystem", "stack", "library", "layer", "user", "org_unit",
  // ── DDD domain modeling ──
  "bounded_context", "aggregate", "value_object", "domain_event", "glossary_term",
  // ── Governance lifecycle ──
  "capability", "user_type", "user_story", "use_case", "road_item", "adr", "nfr", "change_entry",
  // ── Practice Areas (NEW) ──
  "practice_area",
  "competency",
]);
```

### 4.3 Practice Area Extension

**File:** `packages/foe-schemas/src/taxonomy/extensions/practice-area.ts` (NEW)

```typescript
import { z } from "zod";
import { CompetencyIdPattern } from "../common.js";

// ── Pillar Type ────────────────────────────────────────────────────────────
// The 6 structural facets of every practice area.
export const PillarTypeSchema = z.enum([
  "strategy",    // Why this practice area matters
  "standards",   // Quality requirements teams must follow
  "frameworks",  // Organizational principles for implementation
  "libraries",   // Reusable artifacts (code, templates, modules)
  "processes",   // Standard workflows for doing this work
  "measures",    // How teams are assessed for maturity
]);

export type PillarType = z.infer<typeof PillarTypeSchema>;

// ── Practice Area Pillar (value object) ────────────────────────────────────
export const PracticeAreaPillarSchema = z.object({
  type:         PillarTypeSchema,
  title:        z.string(),
  description:  z.string(),
  content:      z.string().nullable().default(null),   // optional markdown body
  artifactRefs: z.array(z.string()).default([]),        // refs to ADRs, NFRs, ROAD items
});

export type PracticeAreaPillar = z.infer<typeof PracticeAreaPillarSchema>;

// ── Practice Area Extension ────────────────────────────────────────────────
// Carries practice-area-specific fields for taxonomy nodes with
// nodeType: "practice_area". The base TaxonomyNode provides id, name,
// description, owners, labels (including governance-id PA-xxx), etc.
export const PracticeAreaExtSchema = z.object({
  title:        z.string(),
  canonical:    z.boolean().default(false),              // true = pre-seeded, false = user-defined
  pillars:      z.array(PracticeAreaPillarSchema).default([]),
  competencies: z.array(CompetencyIdPattern).default([]),  // child competency refs
  methods:      z.array(z.string().regex(/^M\d{3,}$/)).default([]),  // FOE Method refs
  tools:        z.array(z.string()).default([]),          // TaxonomyTool name refs
});

export type PracticeAreaExt = z.infer<typeof PracticeAreaExtSchema>;
```

### 4.4 Competency Extension

**File:** `packages/foe-schemas/src/taxonomy/extensions/competency.ts` (NEW)

```typescript
import { z } from "zod";
import { CompetencyIdPattern, PracticeAreaIdPattern } from "../common.js";

// ── Competency Level ───────────────────────────────────────────────────────
export const CompetencyLevelSchema = z.enum(["basic", "intermediate", "advanced"]);
export type CompetencyLevel = z.infer<typeof CompetencyLevelSchema>;

// ── Competency Type ────────────────────────────────────────────────────────
// "practice" = methodology knowledge (how you do things)
// "system"   = platform/technology knowledge (specific tools/infrastructure)
export const CompetencyTypeSchema = z.enum(["practice", "system"]);
export type CompetencyType = z.infer<typeof CompetencyTypeSchema>;

// ── Skill (value object) ──────────────────────────────────────────────────
// A specific, assessable ability within a competency at a particular level.
export const SkillSchema = z.object({
  name:        z.string(),                                          // e.g., "Can write Gherkin scenarios"
  description: z.string(),                                          // detailed explanation
  level:       CompetencyLevelSchema,                               // which tier this skill belongs to
  methodRef:   z.string().regex(/^M\d{3,}$/).nullable().default(null),  // optional FOE Method link
  toolRef:     z.string().nullable().default(null),                 // optional TaxonomyTool name
  resourceUrl: z.string().url().nullable().default(null),           // optional learning resource
});

export type Skill = z.infer<typeof SkillSchema>;

// ── Competency Level Definition (value object) ────────────────────────────
// Describes what achieving a particular level means for this competency.
export const CompetencyLevelDefSchema = z.object({
  level:       CompetencyLevelSchema,
  description: z.string(),                                          // what achieving this level means
  skillCount:  z.number().int().nonnegative(),                      // number of skills at this level
});

export type CompetencyLevelDef = z.infer<typeof CompetencyLevelDefSchema>;

// ── Competency Dependency (value object) ──────────────────────────────────
// A prerequisite relationship between competency levels. Can cross practice
// area boundaries (e.g., "DevOps IaC Basic requires AWS General Intermediate").
// All dependencies form a DAG -- cycles are rejected at validation time.
export const CompetencyDependencySchema = z.object({
  competencyId:   CompetencyIdPattern,                              // the prerequisite competency
  requiredLevel:  CompetencyLevelSchema,                            // minimum level required
  dependencyType: CompetencyTypeSchema,                             // practice or system
  notes:          z.string().nullable().default(null),              // optional context
});

export type CompetencyDependency = z.infer<typeof CompetencyDependencySchema>;

// ── Competency Extension ──────────────────────────────────────────────────
// Carries competency-specific fields for taxonomy nodes with
// nodeType: "competency". The base TaxonomyNode provides id, name,
// description, owners, labels (including governance-id COMP-xxx), etc.
export const CompetencyExtSchema = z.object({
  title:            z.string(),
  practiceAreaId:   PracticeAreaIdPattern,                          // parent practice area
  competencyType:   CompetencyTypeSchema,
  skills:           z.array(SkillSchema).default([]),
  levelDefinitions: z.tuple([
    CompetencyLevelDefSchema,   // basic
    CompetencyLevelDefSchema,   // intermediate
    CompetencyLevelDefSchema,   // advanced
  ]),
  dependencies:     z.array(CompetencyDependencySchema).default([]),
});

export type CompetencyExt = z.infer<typeof CompetencyExtSchema>;
```

---

## 5. Part 3: Adoption Layer

### 5.1 Adoption Schemas

**File:** `packages/foe-schemas/src/taxonomy/adoption.ts` (NEW)

```typescript
import { z } from "zod";
import { CompetencyIdPattern, PracticeAreaIdPattern } from "./common.js";
import { EntityBaseSchema } from "./entity-base.js";
import { CompetencyLevelSchema } from "./extensions/competency.js";

// ── Adoption Enums ─────────────────────────────────────────────────────────

// Team-level maturity in a practice area.
export const AdoptionLevelSchema = z.enum([
  "aware",       // knows it exists, exploring
  "learning",    // actively building skills
  "practicing",  // applying consistently
  "mastered",    // embedded in culture, teaching others
]);
export type AdoptionLevel = z.infer<typeof AdoptionLevelSchema>;

// Assessment completion status (shared by team and individual).
export const AssessmentStatusSchema = z.enum([
  "not_started",    // no assessment begun
  "in_progress",    // partially assessed
  "self_assessed",  // self-declared, awaiting verification
  "verified",       // formally verified by assessor
]);
export type AssessmentStatus = z.infer<typeof AssessmentStatusSchema>;

// How scanner evidence relates to declared adoption.
export const EvidenceTypeSchema = z.enum([
  "confirms",    // scanner supports the declared level
  "challenges",  // scanner contradicts the declared level
  "neutral",     // scanner found relevant data, inconclusive
]);
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

// Individual skill proficiency gauge.
export const SkillGaugeSchema = z.enum([
  "strong",      // fully proficient
  "improving",   // growing capability
  "weak",        // minimal capability
  "none",        // no capability
]);
export type SkillGauge = z.infer<typeof SkillGaugeSchema>;

// Governance role within a practice area.
export const AdoptionRoleSchema = z.enum([
  "lead",       // implements practice across all teams, defines artifacts
  "advocate",   // champions the practice on a specific team
  "sme",        // subject matter expert, can certify system competencies
  "member",     // participating, building skills
]);
export type AdoptionRole = z.infer<typeof AdoptionRoleSchema>;

// ── Shared Value Objects ───────────────────────────────────────────────────

// Per-competency progress tracking (used by both team and individual).
export const CompetencyProgressSchema = z.object({
  competencyId: CompetencyIdPattern,
  level:        CompetencyLevelSchema,
  status:       AssessmentStatusSchema,
  assessedAt:   z.string().datetime().nullable().default(null),
  assessedBy:   z.string().nullable().default(null),   // person name
});
export type CompetencyProgress = z.infer<typeof CompetencyProgressSchema>;

// A scanner finding linked to an adoption record.
export const ScanEvidenceSchema = z.object({
  reportId:       z.string().uuid(),                    // ref to FOE Report
  scanDate:       z.string().datetime(),
  methodId:       z.string().regex(/^M\d{3,}$/),       // which method was evidenced
  evidenceType:   EvidenceTypeSchema,
  detail:         z.string(),                           // finding text
  dimensionScore: z.number().min(0).max(100).nullable().default(null),
});
export type ScanEvidence = z.infer<typeof ScanEvidenceSchema>;

// Per-skill assessment for an individual (gauge + assessor + date).
export const SkillAssessmentSchema = z.object({
  competencyId: CompetencyIdPattern,
  skillName:    z.string(),                             // matches Skill.name
  gauge:        SkillGaugeSchema,
  status:       AssessmentStatusSchema,
  assessor:     z.string().nullable().default(null),    // person name (null = self)
  assessedAt:   z.string().datetime().nullable().default(null),
});
export type SkillAssessment = z.infer<typeof SkillAssessmentSchema>;

// ── Bridge Entities ────────────────────────────────────────────────────────

// Team Adoption: bridges Team ↔ Practice Area.
export const TeamAdoptionSchema = EntityBaseSchema.extend({
  teamName:           z.string(),                       // ref to TaxonomyTeam.name
  practiceAreaId:     PracticeAreaIdPattern,
  adoptionLevel:      AdoptionLevelSchema,
  adoptedAt:          z.string().datetime(),
  lastAssessedAt:     z.string().datetime().nullable().default(null),
  assessedBy:         z.string().nullable().default(null),
  competencyProgress: z.array(CompetencyProgressSchema).default([]),
  scanEvidence:       z.array(ScanEvidenceSchema).default([]),
  notes:              z.string().nullable().default(null),
});
export type TeamAdoption = z.infer<typeof TeamAdoptionSchema>;

// Individual Adoption: bridges Person ↔ Practice Area.
export const IndividualAdoptionSchema = EntityBaseSchema.extend({
  personName:         z.string(),                       // ref to TaxonomyPerson.name
  practiceAreaId:     PracticeAreaIdPattern,
  role:               AdoptionRoleSchema,
  competencyProgress: z.array(CompetencyProgressSchema).default([]),
  skillAssessments:   z.array(SkillAssessmentSchema).default([]),
  notes:              z.string().nullable().default(null),
});
export type IndividualAdoption = z.infer<typeof IndividualAdoptionSchema>;
```

### 5.2 Adoption Level Semantics

| Level | Team Meaning | Individual Meaning |
|-------|-------------|-------------------|
| `aware` | Team knows the practice area exists, has discussed it | Person is aware of the competencies, has not started assessment |
| `learning` | Team is actively building skills, some members training | Person is working through skills, some self-assessed |
| `practicing` | Team applies the practice consistently in daily work | Person applies skills independently, most verified |
| `mastered` | Practice is embedded in team culture, team teaches others | Person is expert, can assess and teach others |

### 5.3 Assessment Flow

Individual skill assessments follow this workflow:

```
not_started → in_progress → self_assessed → verified
                  ↑                              │
                  └──── (assessor requests redo) ─┘
```

- **not_started**: Skill has not been attempted
- **in_progress**: Person is working on the skill
- **self_assessed**: Person declares proficiency (sets gauge), awaiting verification
- **verified**: Assessor (advocate or SME) has reviewed and signed off

### 5.4 Scanner Evidence Flow

```
1. Team creates TeamAdoption for PA-002 (CI/CD), declares adoptionLevel: "practicing"
2. Scanner runs on the team's repository → produces FOE Report
3. System matches report's MethodReferences to PA-002's methods[]
4. For each match, creates ScanEvidence entry:
   - M111 (Deployment Frequency) found with strong metrics → evidenceType: "confirms"
   - M112 (Deployment Pipeline) found with no caching → evidenceType: "challenges"
5. Dashboard shows team their declared level alongside evidence
```

---

## 6. Part 4: Snapshot & Index Updates

### 6.1 NodeExtensionsSchema

**File:** `packages/foe-schemas/src/taxonomy/taxonomy-snapshot.ts` (MODIFIED)

Add to `NodeExtensionsSchema`:

```typescript
export const NodeExtensionsSchema = z.object({
  // ── Existing ──
  boundedContexts: z.record(BoundedContextExtSchema).default({}),
  aggregates:      z.record(AggregateExtSchema).default({}),
  valueObjects:    z.record(ValueObjectExtSchema).default({}),
  domainEvents:    z.record(DomainEventExtSchema).default({}),
  glossaryTerms:   z.record(GlossaryTermExtSchema).default({}),
  capabilities:    z.record(CapabilityExtSchema).default({}),
  userTypes:       z.record(UserTypeExtSchema).default({}),
  userStories:     z.record(UserStoryExtSchema).default({}),
  useCases:        z.record(UseCaseExtSchema).default({}),
  roadItems:       z.record(RoadItemExtSchema).default({}),
  adrs:            z.record(AdrExtSchema).default({}),
  nfrs:            z.record(NfrExtSchema).default({}),
  changeEntries:   z.record(ChangeEntryExtSchema).default({}),

  // ── NEW: Practice Areas ──
  practiceAreas:   z.record(PracticeAreaExtSchema).default({}),
  competencies:    z.record(CompetencyExtSchema).default({}),
});
```

### 6.2 Snapshot-Level Collections

Add alongside `teams` and `persons`:

```typescript
export const TaxonomySnapshotSchema = z.object({
  // ... existing fields ...
  teams:               z.record(TaxonomyTeamSchema).default({}),
  persons:             z.record(TaxonomyPersonSchema).default({}),

  // ── NEW: Adoption records ──
  teamAdoptions:       z.record(TeamAdoptionSchema).default({}),
  individualAdoptions: z.record(IndividualAdoptionSchema).default({}),

  // ... rest of snapshot ...
});
```

### 6.3 Reverse Indices

Add to `ReverseIndicesSchema`:

```typescript
byPracticeArea: z.record(z.object({
  competencies: z.array(CompetencyIdPattern),
  teams:        z.array(z.string()),          // team names with adoptions
  methods:      z.array(z.string()),          // M-xxx refs
})).default({}),

byTeam: z.record(z.object({
  practiceAreas:  z.array(PracticeAreaIdPattern),
  adoptionLevels: z.record(PracticeAreaIdPattern, AdoptionLevelSchema),
})).default({}),
```

### 6.4 Statistics

Add to `TaxonomyStatsSchema`:

```typescript
totalPracticeAreas:       z.number().int().default(0),
totalCompetencies:        z.number().int().default(0),
totalTeamAdoptions:       z.number().int().default(0),
totalIndividualAdoptions: z.number().int().default(0),
```

Add to `TaxonomyPluginSummarySchema`:

```typescript
practiceAreas:       z.number().int().nonnegative().default(0),
competencies:        z.number().int().nonnegative().default(0),
teamAdoptions:       z.number().int().nonnegative().default(0),
individualAdoptions: z.number().int().nonnegative().default(0),
```

---

## 7. Part 5: Canonical Seed Data

### 7.1 Pre-Seeded Practice Areas

| ID | Title | Scanner Agent | Dimension(s) | Key Methods |
|----|-------|---------------|-------------- |-------------|
| PA-001 | Testing | foe-scanner-tests | Feedback + Confidence | M121 (Executable Specifications), M126 (Gherkin), M127 (Given-When-Then), M145 (Consumer Contract Testing), M152 (Test-Driven Agent Development), M155 (Verification Before Completion) |
| PA-002 | CI/CD | foe-scanner-ci | Feedback | M111 (Deployment Frequency), M112 (Deployment Pipeline), M124 (Fast Flow), M130 (Lead Time for Changes), M140 (Trunk-Based Development), M146 (Early Feedback Loop Investment) |
| PA-003 | DevOps | foe-scanner-ci | Feedback + Confidence | M112 (Deployment Pipeline), M140 (Trunk-Based Development) |
| PA-004 | Development | foe-scanner-arch | All 3 | M150 (Service Boundary Extraction), M151 (System Over Individuals), M153 (True Microservices), M154 (Understanding-First Protocol Adoption) |
| PA-005 | Observability | (cross-cutting) | Feedback + Confidence | M146 (Early Feedback Loop Investment) |
| PA-006 | Domain Modeling | foe-scanner-domain | Understanding | M118 (Enabling Team), M136 (Team Cognitive Load), M147 (Knowledge Distribution as Reliability) |
| PA-007 | Documentation | foe-scanner-docs | Understanding | M147 (Knowledge Distribution as Reliability), M151 (System Over Individuals), M159 (Use Governed AI Coding Agents) |

All canonical practice areas have `canonical: true`. Users can create additional practice areas (Security, Data Engineering, Incident Management, HCD, etc.) with `canonical: false`.

### 7.2 Seed File Format

Practice area seed files live in `packages/delivery-framework/practice-areas/` as markdown with YAML frontmatter:

```yaml
---
practiceAreaId: PA-001
title: Testing
canonical: true
competencies:
  - COMP-001  # BDD
  - COMP-002  # Contract Testing
  - COMP-003  # Unit Testing
  - COMP-004  # Performance Testing
methods:
  - M121
  - M126
  - M127
  - M145
  - M152
  - M155
tools:
  - playwright
  - cucumber
  - jest
  - vitest
pillars:
  - type: strategy
    title: Testing Strategy
    description: Why and how the team approaches testing
  - type: standards
    title: Testing Standards
    description: Quality requirements for test coverage, naming, structure
  - type: frameworks
    title: Testing Frameworks
    description: Organizational principles for test pyramid, BDD, etc.
  - type: libraries
    title: Testing Libraries
    description: Shared test utilities, fixtures, helpers
  - type: processes
    title: Testing Processes
    description: Standard workflows for writing, reviewing, running tests
  - type: measures
    title: Testing Measures
    description: Coverage metrics, change failure rate, test execution time
---

# Testing

The Testing practice area covers all aspects of validating systems...
```

---

## 8. Part 6: Implementation Checklist

### Phase 0: Foundation Refactor (EntityBase + Contribution cleanup)

| # | File | Change | Priority |
|---|------|--------|----------|
| 0a | `packages/foe-schemas/src/taxonomy/entity-base.ts` | **NEW.** `EntityBaseSchema` (10 fields) | Critical |
| 0b | `packages/foe-schemas/src/taxonomy/contribution.ts` | Remove `createdAt`/`updatedAt` from `ContributionSchema` | Critical |
| 0c | `packages/foe-schemas/src/taxonomy/taxonomy-node.ts` | Refactor `TaxonomyNodeSchema` to `EntityBaseSchema.extend({...})`. Refactor all 7+ infrastructure schemas to `EntityBaseSchema.extend({...})`. Add `practice_area`, `competency` to `TaxonomyNodeTypeSchema`. | Critical |
| 0d | All 13 files in `src/taxonomy/extensions/` | Remove `contribution` from every extension. Remove redundant `created`/`updated`/`tag`/`owner` fields. See [Appendix A](#10-appendix-a-existing-extension-cleanup). | Critical |
| 0e | `src/taxonomy/extensions/index.ts` | Add exports for new extensions | Critical |
| 0f | `src/taxonomy/stored/governance.ts` | Remove `contribution` from stored types (lives on base entity now) | Critical |
| 0g | `src/taxonomy/stored/domain-model.ts` | Remove `contribution` from stored types | Critical |
| 0h | `src/taxonomy/index.ts` | Export `entity-base.ts` and `adoption.ts` | Critical |
| 0i | `packages/intelligence/api/db/schema.ts` | Rebuild all Drizzle tables with EntityBase columns. Infrastructure tables gain lifecycle. Extension tables lose `contribution` column. | Critical |
| 0j | Run `drizzle-kit generate` | Fresh migration (greenfield, replaces all 12 existing) | Critical |
| 0k | `packages/intelligence/api/ports/TaxonomyRepository.ts` | Update interfaces for new base shape | Critical |
| 0l | `packages/intelligence/api/adapters/sqlite/TaxonomyRepositorySQLite.ts` | Update row mappers, simplify contribution handling | Critical |
| 0m | `packages/intelligence/api/domain/taxonomy/validateTaxonomyData.ts` | Update validated interfaces for EntityBase shape | Critical |
| 0n | `packages/intelligence/api/usecases/contribution/TypeRouter.ts` | Simplify -- contribution always on base entity | Critical |

### Phase 1: Practice Area Schemas

| # | File | Change |
|---|------|--------|
| 1a | `packages/foe-schemas/src/taxonomy/common.ts` | Add `PracticeAreaIdPattern`, `CompetencyIdPattern` |
| 1b | `packages/foe-schemas/src/taxonomy/extensions/practice-area.ts` | **NEW.** `PillarTypeSchema`, `PracticeAreaPillarSchema`, `PracticeAreaExtSchema` |
| 1c | `packages/foe-schemas/src/taxonomy/extensions/competency.ts` | **NEW.** `SkillSchema`, `CompetencyLevelDefSchema`, `CompetencyDependencySchema`, `CompetencyExtSchema` |
| 1d | `packages/foe-schemas/src/taxonomy/adoption.ts` | **NEW.** All adoption enums, value objects, `TeamAdoptionSchema`, `IndividualAdoptionSchema` |
| 1e | `packages/foe-schemas/src/taxonomy/taxonomy-snapshot.ts` | Add practice area extensions, adoption collections, reverse indices, stats |
| 1f | `packages/foe-schemas/src/taxonomy/stored/practice-area.ts` | **NEW.** `StoredPracticeArea`, `CreatePracticeAreaInput`, `UpdatePracticeAreaInput` |
| 1g | `packages/foe-schemas/src/taxonomy/stored/competency.ts` | **NEW.** `StoredCompetency`, `CreateCompetencyInput`, `UpdateCompetencyInput` |
| 1h | `packages/foe-schemas/src/taxonomy/stored/adoption.ts` | **NEW.** Stored/Create/Update types for TeamAdoption and IndividualAdoption |
| 1i | `packages/foe-schemas/src/taxonomy/index.ts` | Export all new files |

### Phase 2: Database

| # | File | Change |
|---|------|--------|
| 2a | `packages/intelligence/api/db/schema.ts` | Add 7 new tables: `practice_areas`, `competencies`, `competency_skills`, `team_adoptions`, `individual_adoptions`, `skill_assessments`, `scan_evidence` |
| 2b | Run `drizzle-kit generate` | Migration for new tables |

#### Table Definitions

**`practice_areas`** (snapshot-scoped):
- `id` TEXT PK (composite: `snapshotId:name`)
- `snapshot_id` TEXT FK → `taxonomy_snapshots.id` CASCADE
- EntityBase columns: `name`, `description`, `labels`, `owners`, `depends_on`, `created_at`, `updated_at`, `contribution` (JSON)
- Extension columns: `title`, `canonical`, `pillars` (JSON), `competencies` (JSON), `methods` (JSON), `tools` (JSON)

**`competencies`** (snapshot-scoped):
- `id` TEXT PK (composite: `snapshotId:name`)
- `snapshot_id` TEXT FK → `taxonomy_snapshots.id` CASCADE
- EntityBase columns
- Extension columns: `title`, `practice_area_id`, `competency_type`, `skills` (JSON), `level_definitions` (JSON), `dependencies` (JSON)

**`team_adoptions`** (snapshot-scoped):
- `id` TEXT PK (composite: `snapshotId:name`)
- `snapshot_id` TEXT FK → `taxonomy_snapshots.id` CASCADE
- EntityBase columns
- Bridge columns: `team_name`, `practice_area_id`, `adoption_level`, `adopted_at`, `last_assessed_at`, `assessed_by`, `competency_progress` (JSON), `scan_evidence` (JSON), `notes`

**`individual_adoptions`** (snapshot-scoped):
- `id` TEXT PK (composite: `snapshotId:name`)
- `snapshot_id` TEXT FK → `taxonomy_snapshots.id` CASCADE
- EntityBase columns
- Bridge columns: `person_name`, `practice_area_id`, `role`, `competency_progress` (JSON), `skill_assessments` (JSON), `notes`

### Phase 3: Domain & Repository

| # | File | Change |
|---|------|--------|
| 3a | `api/ports/TaxonomyRepository.ts` | Add methods: `listPracticeAreas()`, `getPracticeAreaById()`, `createPracticeArea()`, `updatePracticeArea()`, `deletePracticeArea()`, `listCompetencies(practiceAreaId?)`, `getCompetencyById()`, `createCompetency()`, `updateCompetency()`, `deleteCompetency()`, `listTeamAdoptions(teamName?)`, `getTeamAdoption(teamName, practiceAreaId)`, `createTeamAdoption()`, `updateTeamAdoption()`, `deleteTeamAdoption()`, `addScanEvidence(teamAdoptionId, evidence)`, `listIndividualAdoptions(personName?)`, `getIndividualAdoption(personName, practiceAreaId)`, `createIndividualAdoption()`, `updateIndividualAdoption()`, `deleteIndividualAdoption()`, `upsertSkillAssessment(individualAdoptionId, assessment)` |
| 3b | `api/adapters/sqlite/TaxonomyRepositorySQLite.ts` | Implement all new methods + row mappers |
| 3c | `api/domain/taxonomy/validateTaxonomyData.ts` | Add validated interfaces and parsing for practice areas, competencies, adoptions |
| 3d | `api/domain/taxonomy/validateDependencyDag.ts` | **NEW.** Topological sort (Kahn's algorithm), cycle detection, transitive chain resolution. Called on create/update of any competency with dependencies. |

#### DAG Validation Detail

```typescript
// api/domain/taxonomy/validateDependencyDag.ts

interface DagValidationResult {
  valid: boolean;
  cycle?: string[];           // competency IDs forming the cycle
  topologicalOrder: string[]; // valid ordering if no cycle
}

// Called on competency create/update:
function validateDependencyDag(
  competencies: Map<string, CompetencyDependency[]>
): DagValidationResult;

// Query helper -- returns full prerequisite chain:
function getPrerequisiteChain(
  competencyId: string,
  level: CompetencyLevel,
  competencies: Map<string, CompetencyExt>
): CompetencyDependency[];
```

### Phase 4: Use Cases

| # | File | Change |
|---|------|--------|
| 4a | `api/usecases/taxonomy/ManagePracticeAreas.ts` | **NEW.** CRUD orchestration. Validates competency refs exist. |
| 4b | `api/usecases/taxonomy/ManageCompetencies.ts` | **NEW.** CRUD + DAG validation on create/update. Rejects cycles. |
| 4c | `api/usecases/taxonomy/ManageAdoptions.ts` | **NEW.** Team + Individual adoption CRUD. Competency progress updates. Scan evidence linking. Skill assessment upsert. |
| 4d | `api/usecases/contribution/TypeRouter.ts` | Add `practice_area`, `competency`, `team_adoption`, `individual_adoption` to `RoutableItemType` and `create()` switch |

### Phase 5: API Routes

| # | File | Change |
|---|------|--------|
| 5a | `api/http/routes/v1/practice-areas.ts` | **NEW.** Endpoints below. |
| 5b | `api/http/routes/v1/competencies.ts` | **NEW.** Endpoints below. |
| 5c | `api/http/routes/v1/team-adoptions.ts` | **NEW.** Endpoints below. |
| 5d | `api/http/routes/v1/individual-adoptions.ts` | **NEW.** Endpoints below. |
| 5e | `api/http/server.ts` | Register 4 new route groups under `/api/v1` |
| 5f | `api/bootstrap/container.ts` | Wire `ManagePracticeAreas`, `ManageCompetencies`, `ManageAdoptions` use cases |

#### API Endpoints

**Practice Areas** (`/api/v1/taxonomy/practice-areas`):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all practice areas |
| GET | `/:id` | Get practice area by ID |
| POST | `/` | Create practice area |
| PUT | `/:id` | Update practice area |
| DELETE | `/:id` | Delete practice area |
| GET | `/:id/competencies` | List competencies in a practice area |

**Competencies** (`/api/v1/taxonomy/competencies`):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all competencies (optional `?practiceAreaId=` filter) |
| GET | `/:id` | Get competency by ID |
| POST | `/` | Create competency (validates DAG) |
| PUT | `/:id` | Update competency (validates DAG) |
| DELETE | `/:id` | Delete competency |
| GET | `/:id/prerequisites` | Get full prerequisite chain |

**Team Adoptions** (`/api/v1/taxonomy/teams/:name/adoptions`):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List team's adoptions |
| GET | `/:practiceAreaId` | Get adoption detail |
| POST | `/` | Create adoption |
| PUT | `/:practiceAreaId` | Update adoption (level, progress) |
| DELETE | `/:practiceAreaId` | Delete adoption |
| POST | `/:practiceAreaId/evidence` | Add scan evidence |
| GET | `/:practiceAreaId/evidence` | List scan evidence |

**Individual Adoptions** (`/api/v1/taxonomy/persons/:name/adoptions`):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List person's adoptions |
| GET | `/:practiceAreaId` | Get adoption detail |
| POST | `/` | Create adoption |
| PUT | `/:practiceAreaId` | Update adoption (role, progress) |
| DELETE | `/:practiceAreaId` | Delete adoption |
| PUT | `/:practiceAreaId/skills/:skillName` | Upsert skill assessment |
| GET | `/:practiceAreaId/skills` | List skill assessments |

### Phase 6: Canonical Seed Data

| # | File | Change |
|---|------|--------|
| 6a | `packages/delivery-framework/practice-areas/PA-001.md` through `PA-007.md` | **NEW.** 7 canonical practice area files |
| 6b | `packages/vocabulary/src/parsers/governance/practice-area.ts` | **NEW.** Parser for practice area markdown frontmatter |
| 6c | `packages/vocabulary/src/parsers/governance/competency.ts` | **NEW.** Parser for competency markdown frontmatter |
| 6d | `packages/vocabulary/src/builders/governance-index.ts` | Register new parsers |

### Phase 7: Graph Schema (can defer)

| # | File | Change |
|---|------|--------|
| 7a | `packages/foe-schemas/src/graph/nodes.ts` | Add `PracticeArea`, `Competency`, `TeamAdoption`, `IndividualAdoption` node types to `GraphNodeSchema` union |
| 7b | `packages/foe-schemas/src/graph/relationships.ts` | Add relationships: `HAS_COMPETENCY` (PracticeArea → Competency), `DEPENDS_ON_COMPETENCY` (Competency → Competency), `ADOPTED_BY` (PracticeArea → Team/Person), `ASSESSED_IN` (Person → Competency), `EVIDENCED_BY` (TeamAdoption → Scan) |
| 7c | `packages/foe-schemas/src/graph/queries.ts` | Add Cypher templates for practice area queries |

---

## 9. Part 7: Ubiquitous Language Additions

Add these to `packages/delivery-framework/ddd/ubiquitous-language.md`:

### New Core Terms

| Term | Definition | Context(s) | Code Reference |
|------|-----------|------------|----------------|
| **Entity Base** | The universal foundation for all entities in the system. Provides identity (`id`, `name`), metadata (`description`, `labels`), ownership (`owners`, `dependsOn`), timestamps (`createdAt`, `updatedAt`), and lifecycle (`contribution`). Every tree node, infrastructure item, and bridge record composes from Entity Base. | All | `EntityBaseSchema` in `@foe/schemas/src/taxonomy/entity-base.ts` |
| **Practice Area** | A universal category of engineering practice (e.g., Testing, CI/CD, DevOps). Contains competencies, references methods and tools. Has 6 standard pillars. Canonical practice areas ship pre-seeded; users can add custom ones. Identified by `PA-xxx`. | Governance, Field Guide | `PracticeAreaExtSchema` in `@foe/schemas/src/taxonomy/extensions/practice-area.ts` |
| **Pillar** | One of 6 structural facets of a practice area: Strategy, Standards, Frameworks, Libraries, Processes, Measures. Value object embedded in a Practice Area. | Governance | `PracticeAreaPillarSchema` in `@foe/schemas/src/taxonomy/extensions/practice-area.ts` |
| **Competency** | A named grouping of related skills within a practice area, organized into 3 proficiency levels (basic, intermediate, advanced). Can have cross-competency dependencies forming a DAG. Typed as `practice` (methodology) or `system` (platform/technology). Identified by `COMP-xxx`. | Governance, Scanning | `CompetencyExtSchema` in `@foe/schemas/src/taxonomy/extensions/competency.ts` |
| **Skill** | A specific, assessable ability within a competency at a particular level. May link to a Method or Tool. Value object embedded in a Competency. | Governance | `SkillSchema` in `@foe/schemas/src/taxonomy/extensions/competency.ts` |
| **Competency Level** | A proficiency tier within a competency: `basic` (foundational knowledge), `intermediate` (independent application), `advanced` (expert, can teach others). | Governance | `CompetencyLevelSchema` in `@foe/schemas/src/taxonomy/extensions/competency.ts` |
| **Competency Dependency** | A prerequisite relationship between competency levels, potentially crossing practice area boundaries. All dependencies form a directed acyclic graph (DAG) validated at write time. | Governance | `CompetencyDependencySchema` in `@foe/schemas/src/taxonomy/extensions/competency.ts` |
| **Adoption Level** | A team's overall maturity in a practice area: `aware` (exploring), `learning` (actively building skills), `practicing` (applying consistently), `mastered` (embedded in culture, teaching others). | Governance | `AdoptionLevelSchema` in `@foe/schemas/src/taxonomy/adoption.ts` |
| **Team Adoption** | Bridge record connecting a Team to a Practice Area, tracking adoption level, competency progress, and scanner evidence. | Governance, Scanning | `TeamAdoptionSchema` in `@foe/schemas/src/taxonomy/adoption.ts` |
| **Individual Adoption** | Bridge record connecting a Person to a Practice Area, tracking competency progress, per-skill assessments, and governance role. | Governance | `IndividualAdoptionSchema` in `@foe/schemas/src/taxonomy/adoption.ts` |
| **Skill Gauge** | The proficiency rating for an individual's specific skill: `strong` (fully proficient), `improving` (growing capability), `weak` (minimal capability), `none` (no capability). | Governance | `SkillGaugeSchema` in `@foe/schemas/src/taxonomy/adoption.ts` |
| **Adoption Role** | A person's governance function within a practice area: `lead` (implements across teams), `advocate` (champions on a team), `sme` (certifies system knowledge), `member` (participating). | Governance | `AdoptionRoleSchema` in `@foe/schemas/src/taxonomy/adoption.ts` |
| **Scan Evidence** | A finding from an FOE Report linked to a team's adoption record. Typed as `confirms` (supports declared level), `challenges` (contradicts it), or `neutral` (inconclusive). | Scanning, Governance | `ScanEvidenceSchema` in `@foe/schemas/src/taxonomy/adoption.ts` |
| **Assessment Status** | The completion state of a competency or skill assessment: `not_started`, `in_progress`, `self_assessed` (awaiting verification), `verified` (formally signed off by assessor). | Governance | `AssessmentStatusSchema` in `@foe/schemas/src/taxonomy/adoption.ts` |

### Anti-Language Updates

| Avoid | Use Instead | Reason |
|-------|------------|--------|
| discipline, category, domain | **Practice Area** | "Practice Area" is the established term for a category of engineering practice |
| skill group, knowledge area | **Competency** | "Competency" conveys a group of related skills with proficiency levels |
| tier, stage | **Competency Level** | Specifically basic/intermediate/advanced within a competency |
| prerequisite, requirement | **Competency Dependency** | "Dependency" conveys the DAG structure and is consistent with `dependsOn` on Entity Base |
| maturity (for team adoption) | **Adoption Level** | Avoids collision with FOE Report maturity levels (Hypothesized/Emerging/Practicing/Optimized) |
| team practice, practice assignment | **Team Adoption** | "Adoption" conveys the voluntary, progressive nature of the relationship |
| profile (for individual tracking) | **Individual Adoption** | Consistent with Team Adoption terminology |
| rating, grade | **Skill Gauge** | "Gauge" conveys measurement rather than judgment |
| designation, position | **Adoption Role** | Specifically lead/advocate/sme/member within a practice area |
| proof, verification | **Scan Evidence** | "Evidence" conveys data-driven support rather than absolute proof |
| base class, abstract entity | **Entity Base** | "Entity Base" is the Katalyst term for the universal schema foundation |

---

## 10. Appendix A: Existing Extension Cleanup

Every existing extension schema needs these changes during the Phase 0 refactor:

| Extension | Remove `contribution` | Remove timestamps | Remove `tag` | Remove owner fields | Other |
|-----------|----------------------|-------------------|--------------|--------------------|----|
| **BoundedContext** | Yes | N/A (had none) | N/A | Remove `teamOwnership`, `ownerTeam` → use base `owners[]` | -- |
| **Aggregate** | Yes | N/A | N/A | N/A | -- |
| **ValueObject** | Yes | N/A | N/A | N/A | -- |
| **DomainEvent** | Yes | N/A | N/A | N/A | -- |
| **GlossaryTerm** | Yes | N/A | N/A | N/A | -- |
| **Capability** | Yes | N/A | Remove `tag` → use `labels` | N/A | -- |
| **UserType** | Yes | Remove `created`, `updated` | Remove `tag` → use `labels` | Remove `validatedBy` → use `contribution.reviewedBy` | -- |
| **UserStory** | Yes | N/A | N/A | N/A | -- |
| **UseCase** | Yes | N/A | N/A | N/A | -- |
| **RoadItem** | Yes | Remove `created`, `updated` (keep `started`, `completed`) | N/A | Remove `owner` → use base `owners[]` | -- |
| **ADR** | Yes | Remove `created`, `updated` | N/A | N/A | -- |
| **NFR** | Yes | Remove `created` | N/A | N/A | -- |
| **ChangeEntry** | Yes | N/A (has `date` which is domain-specific, keep it) | N/A | N/A | -- |

---

## 11. Appendix B: Competency Dependency DAG Reference

Real-world cross-competency dependencies from the reference competency model, demonstrating why DAG support is essential:

### Explicit Cross-Practice-Area Dependencies

| Source Competency + Level | Depends On | Type |
|--------------------------|------------|------|
| DevOps IaC - Basic | AWS General - Intermediate | system |
| DevOps IaC - Basic | Development - Basic | practice |
| DevOps IaC - Advanced | CI/CD GHA - Intermediate | practice |
| Observability - Basic | AWS General - Basic | system |
| Observability - Intermediate | DevOps IaC - Basic | practice |
| Observability - Intermediate | AWS General - Intermediate | system |
| CI/CD - Basic | GitHub - Basic | system |
| CI/CD - Intermediate | GitHub - Intermediate | system |
| CI/CD - Intermediate | DevOps K8s - Basic | practice |

### Deepest Transitive Chain (4 levels, 3 practice areas + 1 system)

```
Observability Advanced
  └─ Observability Intermediate
       ├─ Observability Basic
       │    └─ AWS General Basic (system)
       ├─ DevOps IaC Basic (practice)
       │    ├─ AWS General Intermediate (system)
       │    │    └─ AWS General Basic (system)
       │    └─ Development Basic (practice)
       └─ AWS General Intermediate (system)
            └─ AWS General Basic (system)
```

### DAG Validation Rules

1. **No cycles** -- If competency A depends on B which depends on C which depends on A, reject on create/update
2. **No self-references** -- A competency cannot depend on itself at any level
3. **Referenced competency must exist** -- All `competencyId` refs in dependencies must resolve to existing competencies
4. **Level ordering respected** -- Within the same competency, Basic < Intermediate < Advanced (implicit, not stored as explicit dependencies)
5. **Cross-practice-area is allowed** -- Dependencies can span practice area boundaries (this is the whole point)

---

*End of plan.*

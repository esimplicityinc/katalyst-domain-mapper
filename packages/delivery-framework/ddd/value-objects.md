---
title: Value Objects
---

# Value Objects

Value objects are immutable domain primitives defined by their attributes, not by identity. Two value objects with the same properties are considered equal. In Katalyst Domain Mapper, most value objects are implemented as Zod schemas rather than traditional OOP classes — the schema *is* the validation rule, and immutability is guaranteed by TypeScript's `z.infer<>` output types (readonly by convention).

> **Design Decision**: UUIDs are used for entity identity (aggregate roots, entities). Slugs (`/^[a-z0-9-]+$/`) are used for human-readable, URL-safe identifiers on child entities within aggregates.

---

## Value Object Catalog

| Value Object | Context | Properties | Validation | Equality |
|---|---|---|---|---|
| **DimensionScore** | Reporting | `score: number`, `name: enum`, `max: 100`, `confidence: enum`, `color: string`, `subscores: SubScore[4]` | score 0–100; exactly 4 subscores; each subscore 0–25 | `name === other.name && score === other.score` |
| **MaturityLevel** | All | `level: enum` | `'Hypothesized' \| 'Emerging' \| 'Practicing' \| 'Optimized'` | `level === other.level` |
| **TriangleDiagnosis** | Reporting | `cycleHealth: enum`, `pattern: string`, `weakestPrinciple: enum`, `intervention: string`, `thresholds?: object` | cycleHealth ∈ {virtuous, at-risk, vicious}; weakestPrinciple ∈ {feedback, understanding, confidence}; thresholds: U≥35, F≥40, C≥30 for healthy | all fields equal |
| **ReportId** | Reporting | `value: string` | `z.string().uuid()` | `value === other.value` |
| **DomainModelId** | Reporting | `value: string` | `z.string().uuid()` | `value === other.value` |
| **ContextId** | Reporting | `value: string` | `z.string().uuid()` | `value === other.value` |
| **AggregateId** | Reporting | `value: string` | `z.string().uuid()` | `value === other.value` |
| **Slug** | All | `value: string` | `z.string().regex(/^[a-z0-9-]+$/)` | `value === other.value` |
| **Keyword** | Field Guide | `term: string` | non-empty string, ≥3 chars, lowercase | `term === other.term` |
| **FrameworkRef** | Field Guide | `framework: string`, `method: string` | both non-empty strings | `framework + method` |
| **FoeRelevance** | Field Guide | `dimension: enum`, `maturity: enum` | maturity ∈ {hypothesized, observing, validated, proven} | `dimension + maturity` |
| **MethodReference** | Reporting | `methodId: string`, `title: string`, `maturity: enum`, `relevance: enum` | methodId matches `/^M\d{3,}$/`; relevance ∈ {primary, secondary} | `methodId === other.methodId` |
| **SubScore** | Reporting | `name: string`, `score: number`, `max: 25`, `confidence: enum`, `evidence: string[]`, `gaps: string[]` | score 0–25; max always 25 | `name === other.name && score === other.score` |
| **Finding** | Reporting | `id: string`, `area: string`, `severity: enum`, `title: string`, `evidence: string`, `impact: string`, `recommendation: string` | severity ∈ {critical, high, medium, low} | `id === other.id` |
| **Strength** | Reporting | `id: string`, `area: string`, `evidence: string`, `caveat?: string` | id non-empty | `id === other.id` |
| **Recommendation** | Reporting | `id: string`, `priority: enum`, `title: string`, `description: string`, `impact: enum` | priority ∈ {immediate, short-term, medium-term}; impact ∈ {high, medium, low} | `id === other.id` |
| **ArtifactCounts** | Governance | `roads: number`, `adrs: number`, `nfrs: number`, `caps: number`, `changes: number` | all ≥ 0 (nonnegative integers) | all fields equal |
| **IntegrityResult** | Governance | `passed: boolean`, `violations: Violation[]` | violations array may be empty when passed=true | `passed + violations.length` |

---

## Detailed Definitions

### DimensionScore

Represents a scored FOE dimension (Feedback, Understanding, or Confidence). The top-level score is the sum of 4 subscores, each capped at 25 points.

```typescript
// packages/foe-schemas/src/scan/dimension.ts
export const DimensionScoreSchema = z.object({
  name: z.enum(['Feedback', 'Understanding', 'Confidence']),
  score: z.number().min(0).max(100),
  max: z.literal(100),
  confidence: ConfidenceSchema,    // 'high' | 'medium' | 'low'
  color: z.string(),               // UI visualization color
  subscores: z.array(SubScoreSchema).length(4),
});
```

**Validation rules**:
- `score` must be 0–100
- `max` is always the literal `100`
- Exactly 4 subscores required (enforced by `.length(4)`)
- Each subscore has `max: 25` (literal)

### MaturityLevel

The overall maturity classification. Used across all contexts to categorize methods, reports, and observations.

```typescript
// packages/foe-schemas/src/scan/common.ts
export const MaturityLevelSchema = z.enum([
  'Hypothesized',  // 0–25
  'Emerging',      // 26–50
  'Practicing',    // 51–75
  'Optimized',     // 76–100
]);

// Helper to derive maturity from score:
export function calculateMaturityLevel(score: number): MaturityLevel {
  if (score >= 76) return 'Optimized';
  if (score >= 51) return 'Practicing';
  if (score >= 26) return 'Emerging';
  return 'Hypothesized';
}
```

**Note**: The Field Guide context uses a separate but related maturity enum for methods:

```typescript
// packages/foe-schemas/src/field-guide/method.ts
export const MethodMaturitySchema = z.enum([
  'hypothesized',  // lowercase — different enum!
  'observing',
  'validated',
  'proven',
]);
```

### TriangleDiagnosis

The cognitive triangle health assessment. Determines whether the three FOE dimensions are in balance.

```typescript
// packages/foe-schemas/src/scan/triangle-diagnosis.ts
export const TriangleDiagnosisSchema = z.object({
  cycleHealth: z.enum(['virtuous', 'at-risk', 'vicious']),
  pattern: z.string(),           // e.g., "Feedback without Understanding"
  weakestPrinciple: z.enum(['feedback', 'understanding', 'confidence']),
  intervention: z.string(),      // FOE-specific recommendation
  thresholds: z.object({
    understanding: z.number().default(35),
    feedback: z.number().default(40),
    confidence: z.number().default(30),
  }).optional(),
});
```

**Health thresholds** (from AGENTS.md and scanner orchestrator):

| Dimension | Minimum Threshold | Pattern if Below |
|-----------|------------------|-----------------|
| Understanding | ≥ 35 | "Confident Ignorance" |
| Feedback | ≥ 40 | "Analysis Paralysis" |
| Confidence | ≥ 30 | "Knowledge without Action" |

A report is "virtuous" when all dimensions meet their thresholds, "at-risk" when one is below, and "vicious" when multiple are below or all are under 40.

### ReportId / DomainModelId / ContextId / AggregateId

UUID-based identity value objects. All use the same validation:

```typescript
z.string().uuid()  // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

**Equality**: Strict string comparison. Two IDs are equal if and only if their UUID strings are identical.

### Slug

Human-readable, URL-safe identifier used for bounded contexts, aggregates, value objects, and domain events within the DDD model.

```typescript
// Used in BoundedContextSchema, AggregateSchema, ValueObjectSchema, DomainEventSchema
slug: z.string().regex(/^[a-z0-9-]+$/)
// Examples: "scanning", "foe-report", "dimension-score", "scan-completed"
```

**Validation**: Lowercase alphanumeric characters and hyphens only. No spaces, underscores, or uppercase letters.

### Keyword

Extracted from method titles and body content by the keyword extraction algorithm.

```typescript
// packages/foe-field-guide-tools/src/builders/keywords.ts
export function extractKeywords(title: string, bodyContent: string): string[] {
  // Algorithm:
  // 1. Tokenize title (weighted 2×) and body text
  // 2. Lowercase, filter words < 3 chars
  // 3. Remove stop words
  // 4. Sort by frequency (descending)
  // 5. Return top 20
}
```

**Validation**: Non-empty string, at least 3 characters, lowercase. Stored as `z.array(z.string())` in the `MethodSchema`.

### FrameworkRef (ExternalMethodInfo)

Links a method to its source external framework.

```typescript
// packages/foe-schemas/src/field-guide/method.ts
export const ExternalMethodInfoSchema = z.object({
  framework: z.string(),  // "dora", "ddd", "bdd", "team-topologies", "tdd", "continuous-delivery"
  method: z.string(),      // slug within the framework, e.g., "deployment-frequency"
});
```

**Supported frameworks**: DORA, DDD, BDD, Team Topologies, TDD, Continuous Delivery, Double Diamond.

### MethodReference

Embedded in scan findings and recommendations to link back to Field Guide methods.

```typescript
// packages/foe-schemas/src/scan/method-reference.ts
export const MethodReferenceSchema = z.object({
  methodId: z.string().regex(/^M\d{3,}$/),
  title: z.string(),
  maturity: MethodMaturitySchema,
  fieldGuide: z.string().optional(),
  external: z.object({
    framework: z.string(),
    method: z.string(),
  }).optional(),
  relevance: z.enum(['primary', 'secondary']),
  linkUrl: z.string().optional(),
});
```

### SubScore

A scored sub-area within a dimension. Each dimension has exactly 4 subscores, each contributing up to 25 points.

```typescript
// packages/foe-schemas/src/scan/subscore.ts
export const SubScoreSchema = z.object({
  name: z.string(),                        // e.g., "CI Pipeline Speed"
  score: z.number().min(0).max(25),
  max: z.literal(25),
  confidence: ConfidenceSchema,
  evidence: z.array(z.string()),
  gaps: z.array(z.string()),
  deductions: z.array(DeductionSchema).optional(),
  methods: z.array(MethodReferenceSchema).optional(),
});
```

### ArtifactCounts (Governance — planned)

```typescript
// Planned: packages/foe-schemas/src/governance/snapshot.ts
export const ArtifactCountsSchema = z.object({
  roads: z.number().int().nonnegative(),
  adrs: z.number().int().nonnegative(),
  nfrs: z.number().int().nonnegative(),
  capabilities: z.number().int().nonnegative(),
  changes: z.number().int().nonnegative(),
});
```

---

## Immutability Guarantee

In this codebase, immutability is achieved through two mechanisms:

1. **Zod schemas produce readonly types**: `z.infer<typeof Schema>` generates TypeScript types. By convention, all schema outputs are treated as immutable — mutations create new objects via spread or `Object.assign`.

2. **Database persistence is insert-only for value objects**: Value objects within an aggregate are stored as JSON columns (e.g., `invariants`, `properties`, `evidence`). Updates replace the entire JSON blob rather than mutating individual fields.

### Example: Creating a new TriangleDiagnosis

```typescript
// ✅ Correct: create a new object
function diagnose(feedback: number, understanding: number, confidence: number): TriangleDiagnosis {
  const isHealthy = feedback >= 40 && understanding >= 35 && confidence >= 30;
  return {
    cycleHealth: isHealthy ? 'virtuous' : 'at-risk',
    pattern: isHealthy ? 'Balanced FOE' : `Weakest: ${weakest}`,
    weakestPrinciple: findWeakest(feedback, understanding, confidence),
    intervention: isHealthy ? 'Continue strengthening' : `Focus on ${weakest}`,
    thresholds: { understanding: 35, feedback: 40, confidence: 30 },
  };
}

// ❌ Wrong: mutating an existing diagnosis
diagnosis.cycleHealth = 'vicious';  // Don't do this
```

---

## Enum Value Objects Summary

Several value objects are simple enums. Here they are collected for quick reference:

| Enum | Values | Schema Location |
|------|--------|----------------|
| MaturityLevel | Hypothesized, Emerging, Practicing, Optimized | `scan/common.ts` |
| MethodMaturity | hypothesized, observing, validated, proven | `field-guide/method.ts` |
| Confidence | high, medium, low | `scan/common.ts` |
| Severity | critical, high, medium, low | `scan/common.ts` |
| Priority | immediate, short-term, medium-term | `scan/common.ts` |
| Impact | high, medium, low | `scan/common.ts` |
| CycleHealth | virtuous, at-risk, vicious | `scan/triangle-diagnosis.ts` |
| FOEPrinciple | feedback, understanding, confidence | `scan/triangle-diagnosis.ts` |
| AssessmentMode | standard, critical | `scan/common.ts` |
| Relevance | primary, secondary | `scan/method-reference.ts` |
| ObservationStatus | in-progress, completed | `field-guide/observation.ts` |
| ObservationSourceType | internal, external | `field-guide/observation.ts` |
| CommunicationPattern | domain-events, shared-kernel, anti-corruption-layer, open-host-service, conformist, partnership, customer-supplier, separate-ways | `ddd/bounded-context.ts` |
| ContextStatus | draft, stable, deprecated | `ddd/bounded-context.ts` |
| AggregateStatus | draft, implemented, deprecated | `ddd/aggregate.ts` |

# Phase 1: Governance Schemas

**Package:** `packages/foe-schemas/src/governance/`
**Depends on:** Nothing (foundation layer)
**Consumed by:** Phase 3 (parsers), Phase 4 (API), Phase 5 (scanner)

## Objective

Create Zod validation schemas for all 7 governance artifact types defined in prima-delivery-demonstrator's frontmatter conventions. These become the **canonical, runtime-validated** type definitions that replace prima's hand-written JavaScript validation rules in `governance-linter.js`.

## Source of Truth

The frontmatter schemas are derived from:
- Prima's `docs/roads/ROAD-TEMPLATE.md` (road item frontmatter)
- Prima's `docs/adr/ADR-TEMPLATE.md` (ADR frontmatter)
- Prima's `docs/nfr/NFR-TEMPLATE.md` (NFR frontmatter)
- Prima's `docs/changes/TEMPLATE.md` (change entry frontmatter)
- Prima's `docs/scripts/governance-linter.js` lines 22-66 (valid statuses, IDs, state machine transitions)

## Files to Create

### `packages/foe-schemas/src/governance/common.ts`

Shared enums and patterns used across governance artifacts.

```typescript
// ID pattern validators (regex-based)
export const CapabilityIdPattern = z.string().regex(/^CAP-\d{3,}$/);
export const PersonaIdPattern = z.string().regex(/^PER-\d{3,}$/);
export const UserStoryIdPattern = z.string().regex(/^US-\d{3,}$/);
export const UseCaseIdPattern = z.string().regex(/^UC-\d{3,}$/);
export const RoadItemIdPattern = z.string().regex(/^ROAD-\d{3,}$/);
export const AdrIdPattern = z.string().regex(/^ADR-\d{3,}$/);
export const NfrIdPattern = z.string().regex(/^NFR-[A-Z]+-\d{3,}$/);
export const ChangeIdPattern = z.string().regex(/^CHANGE-\d{3,}$/);

// Shared enums
export const PrioritySchema = z.enum(['high', 'medium', 'low']);
export const GovernancePhaseSchema = z.number().int().min(0).max(3);
```

### `packages/foe-schemas/src/governance/capability.ts`

Maps to prima's CAP-XXX frontmatter (from governance-linter.js lines 36-39):

```typescript
export const CapabilitySchema = z.object({
  id: CapabilityIdPattern,           // "CAP-001"
  title: z.string(),                  // "Authentication"
  tag: z.string().regex(/^@CAP-\d+$/), // "@CAP-001"
  category: z.enum([
    'Security', 'Observability', 'Communication', 'Business'
  ]),
  status: z.enum(['planned', 'stable', 'deprecated']),
  description: z.string().optional(),
  path: z.string(),                   // relative file path
});
```

### `packages/foe-schemas/src/governance/persona.ts`

Maps to prima's PER-XXX frontmatter (from governance-linter.js lines 50-56):

```typescript
export const PersonaSchema = z.object({
  id: PersonaIdPattern,               // "PER-001"
  name: z.string(),
  tag: z.string().regex(/^@PER-\d+$/),
  type: z.enum(['human', 'bot', 'system', 'external_api']),
  status: z.enum(['draft', 'approved', 'deprecated']),
  archetype: z.enum([
    'creator', 'operator', 'administrator', 'consumer', 'integrator'
  ]),
  description: z.string().optional(),
  goals: z.array(z.string()).default([]),
  painPoints: z.array(z.string()).default([]),
  behaviors: z.array(z.string()).default([]),
  typicalCapabilities: z.array(CapabilityIdPattern).default([]),
  technicalProfile: z.object({
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    integrationType: z.enum(['web_ui', 'api', 'sdk', 'webhook', 'cli']),
    frequency: z.enum(['daily', 'weekly', 'occasional']),
  }).optional(),
  relatedStories: z.array(UserStoryIdPattern).default([]),
  relatedPersonas: z.array(PersonaIdPattern).default([]),
  created: z.string().optional(),     // ISO 8601 date
  updated: z.string().optional(),
  validatedBy: z.string().optional(), // "@agent-name"
  path: z.string(),
});
```

### `packages/foe-schemas/src/governance/user-story.ts`

```typescript
export const UserStorySchema = z.object({
  id: UserStoryIdPattern,             // "US-001"
  title: z.string(),
  persona: PersonaIdPattern,          // "PER-001" — cross-ref validated at index build
  status: z.enum(['draft', 'approved', 'implementing', 'complete', 'deprecated']),
  capabilities: z.array(CapabilityIdPattern).min(1),
  useCases: z.array(UseCaseIdPattern).default([]),
  acceptanceCriteria: z.array(z.string()).default([]),
  path: z.string(),
});
```

### `packages/foe-schemas/src/governance/use-case.ts`

```typescript
export const UseCaseSchema = z.object({
  id: UseCaseIdPattern,               // "UC-001"
  title: z.string(),
  description: z.string().optional(),
  actors: z.array(PersonaIdPattern).default([]),
  preconditions: z.array(z.string()).default([]),
  postconditions: z.array(z.string()).default([]),
  mainFlow: z.array(z.string()).default([]),
  alternativeFlows: z.array(z.string()).default([]),
  path: z.string(),
});
```

### `packages/foe-schemas/src/governance/road-item.ts`

The most complex schema. Encodes prima's 8-state governance workflow with conditional validation rules.

```typescript
// 8-state machine (from governance-linter.js lines 58-66)
export const RoadStatusSchema = z.enum([
  'proposed',
  'adr_validated',
  'bdd_pending',
  'bdd_complete',
  'implementing',
  'nfr_validating',
  'nfr_blocked',
  'complete',
]);

// Valid state transitions
export const STATE_MACHINE_TRANSITIONS: Record<string, string[]> = {
  proposed: ['adr_validated'],
  adr_validated: ['bdd_pending'],
  bdd_pending: ['bdd_complete'],
  bdd_complete: ['implementing'],
  implementing: ['nfr_validating'],
  nfr_validating: ['complete', 'nfr_blocked'],
  nfr_blocked: ['nfr_validating'],
  complete: [],
};

// Governance sub-schemas
export const AdrGovernanceSchema = z.object({
  validated: z.boolean().default(false),
  validatedBy: z.string().default(''),
  validatedAt: z.string().default(''),
  complianceCheck: z.array(z.object({
    adr: AdrIdPattern,
    compliant: z.boolean(),
    notes: z.string().default(''),
  })).default([]),
});

export const BddGovernanceSchema = z.object({
  status: z.enum(['draft', 'approved']).default('draft'),
  approvedBy: z.array(z.object({
    agent: z.string(),
    timestamp: z.string(),
  })).default([]),
  testResults: z.object({
    total: z.number().int().default(0),
    passed: z.number().int().default(0),
    failed: z.number().int().default(0),
    coverage: z.string().default('0%'),
  }).default({}),
});

export const NfrGovernanceSchema = z.object({
  applicable: z.array(NfrIdPattern).default([]),
  status: z.enum(['pending', 'validating', 'pass', 'fail']).default('pending'),
  results: z.record(z.object({
    status: z.enum(['pending', 'pass', 'fail']),
    evidence: z.string().default(''),
    validatedBy: z.string().default(''),
    timestamp: z.string().default(''),
  })).default({}),
});

export const RoadItemSchema = z.object({
  id: RoadItemIdPattern,
  title: z.string(),
  status: RoadStatusSchema,
  phase: GovernancePhaseSchema,
  priority: PrioritySchema,
  created: z.string(),                // ISO 8601 date
  updated: z.string(),
  started: z.string().default(''),
  completed: z.string().default(''),
  dependsOn: z.array(RoadItemIdPattern).default([]),
  blockedBy: z.array(RoadItemIdPattern).default([]),
  blocks: z.array(RoadItemIdPattern).default([]),
  governance: z.object({
    adrs: AdrGovernanceSchema,
    bdd: BddGovernanceSchema,
    nfrs: NfrGovernanceSchema,
    capabilities: z.array(CapabilityIdPattern).default([]),
  }),
  path: z.string(),
});

// Helper: validate a state transition
export function validateTransition(from: string, to: string): boolean {
  const allowed = STATE_MACHINE_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// Helper: get valid next states
export function getNextStates(current: string): string[] {
  return STATE_MACHINE_TRANSITIONS[current] ?? [];
}
```

### `packages/foe-schemas/src/governance/adr.ts`

```typescript
export const AdrStatusSchema = z.enum([
  'proposed', 'accepted', 'deprecated', 'superseded'
]);

export const AdrCategorySchema = z.enum([
  'architecture', 'infrastructure', 'security', 'performance'
]);

export const AdrSchema = z.object({
  id: AdrIdPattern,                   // "ADR-001"
  title: z.string(),
  status: AdrStatusSchema,
  category: AdrCategorySchema,
  scope: z.string().default('project-wide'),
  created: z.string(),
  updated: z.string(),
  supersededBy: AdrIdPattern.optional(),
  path: z.string(),
});
```

### `packages/foe-schemas/src/governance/nfr.ts`

```typescript
export const NfrCategorySchema = z.enum([
  'performance', 'security', 'accessibility',
  'reliability', 'scalability', 'maintainability',
]);

export const NfrSchema = z.object({
  id: NfrIdPattern,                   // "NFR-PERF-001"
  title: z.string(),
  category: NfrCategorySchema,
  priority: PrioritySchema,
  status: z.enum(['active', 'deprecated']),
  created: z.string(),
  threshold: z.string().optional(),   // e.g., "< 200ms response time"
  measurement: z.string().optional(), // How to measure
  path: z.string(),
});
```

### `packages/foe-schemas/src/governance/change-entry.ts`

```typescript
export const ChangeStatusSchema = z.enum(['draft', 'published', 'archived']);
export const ChangeCategorySchema = z.enum([
  'Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'
]);

export const ComplianceCheckSchema = z.object({
  status: z.enum(['pending', 'pass', 'fail']),
  validatedBy: z.string().default(''),
  validatedAt: z.string().default(''),
  notes: z.string().default(''),
});

export const NfrCheckSchema = z.object({
  status: z.enum(['pending', 'pass', 'fail', 'na']),
  evidence: z.string().default(''),
  validatedBy: z.string().default(''),
});

export const AgentSignatureSchema = z.object({
  agent: z.string(),                  // "@architecture-inspector"
  role: z.string(),                   // "adr_validation"
  status: z.enum(['approved', 'rejected', 'pending']),
  timestamp: z.string(),             // ISO 8601
});

export const ChangeEntrySchema = z.object({
  id: ChangeIdPattern,                // "CHANGE-001"
  roadId: RoadItemIdPattern,          // "ROAD-009" — cross-ref validated at index build
  title: z.string(),
  date: z.string(),                   // ISO 8601
  version: z.string(),               // semver
  status: ChangeStatusSchema,
  categories: z.array(ChangeCategorySchema).min(1),
  compliance: z.object({
    adrCheck: ComplianceCheckSchema,
    bddCheck: z.object({
      status: z.enum(['pending', 'pass', 'fail']),
      scenarios: z.number().int().default(0),
      passed: z.number().int().default(0),
      coverage: z.string().default('0%'),
    }),
    nfrChecks: z.object({
      performance: NfrCheckSchema,
      security: NfrCheckSchema,
      accessibility: NfrCheckSchema,
    }),
  }),
  signatures: z.array(AgentSignatureSchema).default([]),
  path: z.string(),
});
```

### `packages/foe-schemas/src/governance/governance-index.ts`

Shape of the generated governance index JSON (consumed by API, scanner, and web UIs):

```typescript
export const GovernanceIndexSchema = z.object({
  version: z.string(),
  generated: z.string(),             // ISO 8601 timestamp

  // Primary artifact collections (keyed by ID)
  capabilities: z.record(CapabilitySchema),
  personas: z.record(PersonaSchema),
  userStories: z.record(UserStorySchema),
  useCases: z.record(UseCaseSchema),
  roadItems: z.record(RoadItemSchema),
  adrs: z.record(AdrSchema),
  nfrs: z.record(NfrSchema),
  changeEntries: z.record(ChangeEntrySchema),

  // Reverse indices for fast lookups
  byCapability: z.record(z.object({
    personas: z.array(PersonaIdPattern),
    stories: z.array(UserStoryIdPattern),
    roads: z.array(RoadItemIdPattern),
  })),
  byPersona: z.record(z.object({
    stories: z.array(UserStoryIdPattern),
    capabilities: z.array(CapabilityIdPattern),
  })),
  byRoad: z.record(z.object({
    adrs: z.array(AdrIdPattern),
    changes: z.array(ChangeIdPattern),
    capabilities: z.array(CapabilityIdPattern),
    nfrs: z.array(NfrIdPattern),
  })),

  // Statistics
  stats: z.object({
    totalCapabilities: z.number().int(),
    totalPersonas: z.number().int(),
    totalStories: z.number().int(),
    totalUseCases: z.number().int(),
    totalRoadItems: z.number().int(),
    totalAdrs: z.number().int(),
    totalNfrs: z.number().int(),
    totalChanges: z.number().int(),
    roadsByStatus: z.record(z.number().int()),
    roadsByPhase: z.record(z.number().int()),
    referentialIntegrity: z.object({
      valid: z.boolean(),
      errors: z.array(z.string()),
    }),
  }),
});

export type GovernanceIndex = z.infer<typeof GovernanceIndexSchema>;

// Helper functions
export function getRoadsByCapability(index: GovernanceIndex, capId: string): string[] { ... }
export function getPersonasByCapability(index: GovernanceIndex, capId: string): string[] { ... }
export function getCapabilityCoverage(index: GovernanceIndex): Record<string, number> { ... }
```

### `packages/foe-schemas/src/governance/index.ts`

Barrel export:

```typescript
export * from './common.js';
export * from './capability.js';
export * from './persona.js';
export * from './user-story.js';
export * from './use-case.js';
export * from './road-item.js';
export * from './adr.js';
export * from './nfr.js';
export * from './change-entry.js';
export * from './governance-index.js';
```

## Files to Modify

### `packages/foe-schemas/package.json`

Add path export:

```json
"./governance": {
  "types": "./dist/governance/index.d.ts",
  "default": "./dist/index.js"
}
```

### `packages/foe-schemas/src/index.ts`

Add:

```typescript
export * as governance from './governance/index.js';
```

## Validation Rules Ported from Prima

These rules from `governance-linter.js` are now encoded in Zod schemas:

| Prima Rule (JS) | Zod Equivalent |
|-----------------|----------------|
| `VALID_ROAD_STATUSES` array (line 22-31) | `RoadStatusSchema` enum |
| `VALID_ADR_STATUSES` array (line 33) | `AdrStatusSchema` enum |
| `STATE_MACHINE_TRANSITIONS` object (line 58-66) | `STATE_MACHINE_TRANSITIONS` + `validateTransition()` |
| `VALID_PERSONA_TYPES` array (line 54) | `PersonaSchema.type` enum |
| `VALID_PERSONA_ARCHETYPES` array (line 56) | `PersonaSchema.archetype` enum |
| Regex ID validation (e.g., `/^ROAD-\d+$/`) | `RoadItemIdPattern` regex |
| Conditional governance fields by status (lines 108-200) | Handled by parser-level validation (see Phase 3) |

## Testing

Each schema should have a test file in `packages/foe-schemas/src/governance/__tests__/`:

- `capability.test.ts` — valid/invalid CAP frontmatter
- `road-item.test.ts` — state machine transitions, governance block validation
- `change-entry.test.ts` — signature validation, compliance checks
- `governance-index.test.ts` — index shape validation, helper functions

# Phase 2: DDD Artifact Schemas

**Package:** `packages/foe-schemas/src/governance/ddd/`
**Depends on:** Phase 1 (governance common types)
**Consumed by:** Phase 3 (parsers), Phase 4 (API), Phase 5 (scanner)

## Objective

Create Zod schemas for DDD domain model artifacts so that Bounded Contexts, Aggregates, Value Objects, and Domain Events become **first-class markdown files with validated frontmatter** — just like Capabilities and Road Items.

## Source of Truth

The DDD model is currently defined in agent prompts within prima-delivery-demonstrator:
- `.opencode/agents/ddd-aligner.md` — 4 bounded contexts, 5 aggregates, 15+ value objects, 12+ domain events, ubiquitous language, invariants
- `.opencode/agents/bdd-writer.md` — feature file organization by bounded context

These will be formalized into markdown files with frontmatter schemas that any project can adopt.

## Files to Create

### `packages/foe-schemas/src/governance/ddd/bounded-context.ts`

```typescript
export const BoundedContextSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),     // "bot-identity", "promise-market"
  title: z.string(),                            // "Bot Identity & Reputation"
  description: z.string().optional(),
  responsibility: z.string(),                   // Core single responsibility
  sourceDirectory: z.string().optional(),       // "src/bot-identity/"
  aggregates: z.array(z.string()).default([]),  // Aggregate slugs
  communicationPattern: z.enum([
    'domain-events', 'shared-kernel', 'anti-corruption-layer',
    'open-host-service', 'conformist',
  ]).default('domain-events'),
  upstreamContexts: z.array(z.string()).default([]),   // Context slugs this consumes from
  downstreamContexts: z.array(z.string()).default([]), // Context slugs that consume from this
  teamOwnership: z.string().optional(),         // Team Topologies alignment
  status: z.enum(['draft', 'stable', 'deprecated']).default('draft'),
  path: z.string(),
});

export type BoundedContext = z.infer<typeof BoundedContextSchema>;
```

**Example frontmatter** (`docs/ddd/contexts/token-management.md`):

```yaml
---
slug: token-management
title: "Token Management"
responsibility: "Wallets, transfers, escrow, stakes"
sourceDirectory: "src/token-management/"
aggregates:
  - wallet
  - escrow-account
communicationPattern: domain-events
upstreamContexts:
  - promise-market
downstreamContexts:
  - settlement-verification
status: stable
---
```

### `packages/foe-schemas/src/governance/ddd/aggregate.ts`

```typescript
export const InvariantSchema = z.object({
  description: z.string(),
  enforced: z.boolean().default(false),          // Is this enforced in code?
  enforcementLocation: z.string().optional(),    // File path where enforced
});

export const AggregateSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),       // "escrow-account"
  title: z.string(),                              // "EscrowAccount"
  context: z.string(),                            // BoundedContext slug — cross-ref validated
  rootEntity: z.string(),                         // "EscrowAccount"
  entities: z.array(z.string()).default([]),      // Child entity names
  valueObjects: z.array(z.string()).default([]),  // ValueObject slugs — cross-ref validated
  events: z.array(z.string()).default([]),        // DomainEvent slugs — cross-ref validated
  invariants: z.array(InvariantSchema).default([]),
  commands: z.array(z.string()).default([]),      // Command names (e.g., "CreateEscrow", "ReleaseEscrow")
  sourceFile: z.string().optional(),              // Path to source code
  status: z.enum(['draft', 'implemented', 'deprecated']).default('draft'),
  path: z.string(),
});

export type Aggregate = z.infer<typeof AggregateSchema>;
```

**Example frontmatter** (`docs/ddd/aggregates/escrow-account.md`):

```yaml
---
slug: escrow-account
title: "EscrowAccount"
context: token-management
rootEntity: "EscrowAccount"
entities: []
valueObjects:
  - token-amount
  - escrow-state
  - escrow-id
events:
  - escrow-created
  - escrow-released
  - escrow-returned
  - escrow-disputed
invariants:
  - description: "Can only be created with a Promise"
    enforced: false
  - description: "Amount must match promise price"
    enforced: false
  - description: "Cannot release without verification"
    enforced: false
commands:
  - CreateEscrow
  - ReleaseEscrow
  - ReturnEscrow
  - DisputeEscrow
status: draft
---
```

### `packages/foe-schemas/src/governance/ddd/value-object.ts`

```typescript
export const ValueObjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),       // "token-amount"
  title: z.string(),                              // "TokenAmount"
  context: z.string(),                            // BoundedContext slug
  description: z.string().optional(),
  properties: z.array(z.object({
    name: z.string(),
    type: z.string(),                             // "number", "string", "UUID", etc.
    constraints: z.string().optional(),           // ">= 0", "SHA-256 hash", etc.
  })).default([]),
  validationRules: z.array(z.string()).default([]),  // "Must be >= 0", "Immutable after creation"
  immutable: z.boolean().default(true),
  sourceFile: z.string().optional(),
  path: z.string(),
});

export type ValueObject = z.infer<typeof ValueObjectSchema>;
```

**Example frontmatter** (`docs/ddd/value-objects/token-amount.md`):

```yaml
---
slug: token-amount
title: "TokenAmount"
context: token-management
description: "Immutable representation of a token quantity"
properties:
  - name: value
    type: number
    constraints: ">= 0"
  - name: currency
    type: string
    constraints: "3-letter code"
validationRules:
  - "Must be >= 0"
  - "Immutable after creation"
immutable: true
---
```

### `packages/foe-schemas/src/governance/ddd/domain-event.ts`

```typescript
export const DomainEventSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),       // "escrow-created"
  title: z.string(),                              // "EscrowCreated"
  context: z.string(),                            // BoundedContext slug — origin context
  aggregate: z.string().optional(),               // Aggregate slug that emits this event
  description: z.string().optional(),
  payload: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
  })).default([]),
  consumedBy: z.array(z.string()).default([]),   // BoundedContext slugs that subscribe
  triggers: z.array(z.string()).default([]),      // What command/action triggers this event
  sideEffects: z.array(z.string()).default([]),  // What happens when consumed
  sourceFile: z.string().optional(),
  path: z.string(),
});

export type DomainEvent = z.infer<typeof DomainEventSchema>;
```

**Example frontmatter** (`docs/ddd/events/escrow-created.md`):

```yaml
---
slug: escrow-created
title: "EscrowCreated"
context: token-management
aggregate: escrow-account
description: "Emitted when consumer funds are placed in escrow for a promise"
payload:
  - name: escrowId
    type: UUID
    description: "Unique escrow account identifier"
  - name: promiseId
    type: UUID
    description: "The promise this escrow secures"
  - name: amount
    type: TokenAmount
    description: "Locked token amount"
  - name: consumerId
    type: BotId
    description: "Consumer who funded the escrow"
consumedBy:
  - settlement-verification
  - promise-market
triggers:
  - "Consumer accepts a promise via PromiseAccepted event"
sideEffects:
  - "Settlement context begins monitoring for execution proof"
  - "Promise market updates promise state to Accepted"
---
```

### `packages/foe-schemas/src/governance/ddd/index.ts`

```typescript
export * from './bounded-context.js';
export * from './aggregate.js';
export * from './value-object.js';
export * from './domain-event.js';
```

## Files to Modify

### `packages/foe-schemas/src/governance/index.ts`

Add:

```typescript
export * from './ddd/index.js';
```

### `packages/foe-schemas/src/governance/governance-index.ts`

Extend the GovernanceIndexSchema to include DDD artifacts:

```typescript
// Add to GovernanceIndexSchema:
boundedContexts: z.record(BoundedContextSchema),
aggregates: z.record(AggregateSchema),
valueObjects: z.record(ValueObjectSchema),
domainEvents: z.record(DomainEventSchema),

// Add DDD reverse indices:
byContext: z.record(z.object({
  aggregates: z.array(z.string()),   // Aggregate slugs
  events: z.array(z.string()),       // DomainEvent slugs
  valueObjects: z.array(z.string()), // ValueObject slugs
  roads: z.array(RoadItemIdPattern), // Road items referencing this context
})),
byAggregate: z.record(z.object({
  context: z.string(),
  valueObjects: z.array(z.string()),
  events: z.array(z.string()),
})),

// Add to stats:
totalContexts: z.number().int(),
totalAggregates: z.number().int(),
totalValueObjects: z.number().int(),
totalDomainEvents: z.number().int(),
```

## Cross-Reference Validation (at build time, not schema time)

These cross-references are **not** enforced by Zod schemas directly (since schemas validate individual files). They are enforced by the governance index builder in Phase 3:

| Field | Must Reference |
|-------|----------------|
| `Aggregate.context` | Existing `BoundedContext.slug` |
| `Aggregate.valueObjects[]` | Existing `ValueObject.slug` values |
| `Aggregate.events[]` | Existing `DomainEvent.slug` values |
| `ValueObject.context` | Existing `BoundedContext.slug` |
| `DomainEvent.context` | Existing `BoundedContext.slug` |
| `DomainEvent.aggregate` | Existing `Aggregate.slug` |
| `DomainEvent.consumedBy[]` | Existing `BoundedContext.slug` values |
| `BoundedContext.aggregates[]` | Existing `Aggregate.slug` values |
| `BoundedContext.upstreamContexts[]` | Existing `BoundedContext.slug` values |
| `BoundedContext.downstreamContexts[]` | Existing `BoundedContext.slug` values |

## Expected Directory Layout (in consuming projects)

```
docs/ddd/
├── contexts/
│   ├── bot-identity.md
│   ├── promise-market.md
│   ├── token-management.md
│   └── settlement-verification.md
├── aggregates/
│   ├── bot-account.md
│   ├── promise.md
│   ├── wallet.md
│   ├── escrow-account.md
│   └── settlement-case.md
├── value-objects/
│   ├── bot-id.md
│   ├── reputation-score.md
│   ├── token-amount.md
│   ├── escrow-state.md
│   └── ...
└── events/
    ├── bot-registered.md
    ├── promise-accepted.md
    ├── escrow-created.md
    ├── escrow-released.md
    └── ...
```

## Testing

Test files in `packages/foe-schemas/src/governance/ddd/__tests__/`:

- `bounded-context.test.ts` — slug validation, communication pattern enum
- `aggregate.test.ts` — invariant schema, commands list
- `value-object.test.ts` — property constraints, immutability flag
- `domain-event.test.ts` — payload schema, consumer validation

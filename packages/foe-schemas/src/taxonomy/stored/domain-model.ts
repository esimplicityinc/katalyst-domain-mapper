import { z } from "zod";

// ── Stored Domain Model ────────────────────────────────────────────────────

export const StoredDomainModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StoredDomainModel = z.infer<typeof StoredDomainModelSchema>;

// ── Context Relationship ───────────────────────────────────────────────────

const ContextRelationshipSchema = z
  .object({
    targetContext: z.string().optional(),
    targetContextId: z.string().optional(),
    type: z.enum([
      "upstream",
      "downstream",
      "partnership",
      "shared-kernel",
      "separate-ways",
      "conformist",
      "anticorruption-layer",
      "customer-supplier",
      "published-language",
    ]),
    communicationPattern: z
      .enum([
        "domain-events",
        "shared-kernel",
        "anti-corruption-layer",
        "open-host-service",
        "conformist",
        "partnership",
        "customer-supplier",
        "separate-ways",
      ])
      .optional(),
    description: z.string().optional(),
  })
  .transform((r) => ({
    targetContext: r.targetContext ?? "",
    targetContextId: r.targetContextId ?? r.targetContext ?? "",
    type: r.type,
    communicationPattern: r.communicationPattern,
    description: r.description,
  }));

// ── Stored Bounded Context ─────────────────────────────────────────────────

export const StoredBoundedContextSchema = z.object({
  id: z.string(),
  domainModelId: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().default(null),
  responsibility: z.string(),
  sourceDirectory: z.string().nullable().default(null),
  teamOwnership: z.string().nullable().default(null),
  ownerTeam: z.string().nullable().default(null),
  status: z.string().default("active"),
  subdomainType: z
    .enum(["core", "supporting", "generic"])
    .nullable()
    .default(null),
  contextType: z
    .enum(["internal", "external-system", "human-process", "unknown"])
    .nullable()
    .default(null),
  taxonomyNode: z.string().nullable().default(null),
  relationships: z.array(ContextRelationshipSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StoredBoundedContext = z.infer<typeof StoredBoundedContextSchema>;

// ── Invariant ──────────────────────────────────────────────────────────────

const InvariantSchema = z
  .object({
    rule: z.string().optional(),
    description: z.string().optional(),
    enforced: z.boolean().default(false),
    enforcementLocation: z.string().optional(),
  })
  .transform((i) => ({
    rule: i.rule ?? "",
    description: i.description ?? "",
    enforced: i.enforced,
    enforcementLocation: i.enforcementLocation,
  }));

// ── Stored Aggregate ───────────────────────────────────────────────────────

export const StoredAggregateSchema = z.object({
  id: z.string(),
  domainModelId: z.string(),
  contextId: z.string(),
  slug: z.string(),
  title: z.string(),
  rootEntity: z.string(),
  entities: z.array(z.string()).default([]),
  valueObjects: z.array(z.string()).default([]),
  events: z.array(z.string()).default([]),
  commands: z.array(z.string()).default([]),
  invariants: z.array(InvariantSchema).default([]),
  sourceFile: z.string().nullable().default(null),
  status: z.string().default("active"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StoredAggregate = z.infer<typeof StoredAggregateSchema>;

// ── Stored Domain Event ────────────────────────────────────────────────────

export const StoredDomainEventSchema = z.object({
  id: z.string(),
  domainModelId: z.string(),
  contextId: z.string(),
  aggregateId: z.string().nullable().default(null),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().default(null),
  payload: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        description: z.string().optional(),
      }),
    )
    .default([]),
  consumedBy: z.array(z.string()).default([]),
  triggers: z.array(z.string()).default([]),
  sideEffects: z.array(z.string()).default([]),
  sourceFile: z.string().nullable().default(null),
  sourceCapabilityId: z.string().nullable().default(null),
  targetCapabilityIds: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StoredDomainEvent = z.infer<typeof StoredDomainEventSchema>;

// ── Stored Value Object ────────────────────────────────────────────────────

const PropertySchema = z
  .object({
    name: z.string(),
    type: z.string(),
    constraints: z.string().optional(),
    description: z.string().optional(),
  })
  .transform((p) => ({
    name: p.name,
    type: p.type,
    constraints: p.constraints,
    description: p.description,
  }));

export const StoredValueObjectSchema = z.object({
  id: z.string(),
  domainModelId: z.string(),
  contextId: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().default(null),
  properties: z.array(PropertySchema).default([]),
  validationRules: z.array(z.string()).default([]),
  immutable: z.boolean().default(true),
  sourceFile: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StoredValueObject = z.infer<typeof StoredValueObjectSchema>;

// ── Stored Glossary Term ───────────────────────────────────────────────────

export const StoredGlossaryTermSchema = z.object({
  id: z.string(),
  domainModelId: z.string(),
  contextId: z.string().nullable().default(null),
  term: z.string(),
  definition: z.string(),
  aliases: z.array(z.string()).default([]),
  examples: z.array(z.string()).default([]),
  relatedTerms: z.array(z.string()).default([]),
  source: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StoredGlossaryTerm = z.infer<typeof StoredGlossaryTermSchema>;

// ── Workflow State & Transition ─────────────────────────────────────────────

export const WorkflowStateSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  isTerminal: z.boolean().optional(),
  isError: z.boolean().optional(),
  timestampField: z.string().optional(),
});
export type WorkflowState = z.infer<typeof WorkflowStateSchema>;

export const WorkflowTransitionSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string(),
  isAsync: z.boolean().default(false),
});
export type WorkflowTransition = z.infer<typeof WorkflowTransitionSchema>;

// ── Stored Workflow ────────────────────────────────────────────────────────

export const StoredWorkflowSchema = z.object({
  id: z.string(),
  domainModelId: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().default(null),
  contextIds: z.array(z.string()).default([]),
  states: z.array(WorkflowStateSchema).default([]),
  transitions: z.array(WorkflowTransitionSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StoredWorkflow = z.infer<typeof StoredWorkflowSchema>;

// ── Domain Model With Artifacts ────────────────────────────────────────────

export const DomainModelWithArtifactsSchema = StoredDomainModelSchema.extend({
  boundedContexts: z.array(StoredBoundedContextSchema).default([]),
  aggregates: z.array(StoredAggregateSchema).default([]),
  valueObjects: z.array(StoredValueObjectSchema).default([]),
  domainEvents: z.array(StoredDomainEventSchema).default([]),
  glossaryTerms: z.array(StoredGlossaryTermSchema).default([]),
  workflows: z.array(StoredWorkflowSchema).default([]),
});
export type DomainModelWithArtifacts = z.infer<
  typeof DomainModelWithArtifactsSchema
>;

// ── Create/Update Inputs ───────────────────────────────────────────────────

export const CreateDomainModelInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});
export type CreateDomainModelInput = z.infer<
  typeof CreateDomainModelInputSchema
>;

export const UpdateDomainModelInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});
export type UpdateDomainModelInput = z.infer<
  typeof UpdateDomainModelInputSchema
>;

export const CreateBoundedContextInputSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  responsibility: z.string(),
  sourceDirectory: z.string().optional(),
  teamOwnership: z.string().optional(),
  ownerTeam: z.string().optional(),
  status: z.string().optional(),
  subdomainType: z.string().optional(),
  contextType: z.string().optional(),
  taxonomyNode: z.string().optional(),
  relationships: z.array(z.unknown()).optional(),
});
export type CreateBoundedContextInput = z.infer<
  typeof CreateBoundedContextInputSchema
>;

export const UpdateBoundedContextInputSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  responsibility: z.string(),
  sourceDirectory: z.string().optional(),
  teamOwnership: z.string().optional(),
  ownerTeam: z.string().optional(),
  status: z.string().optional(),
  subdomainType: z.string().optional(),
  contextType: z.string().optional(),
  taxonomyNode: z.string().optional(),
  relationships: z.array(z.unknown()).optional(),
});
export type UpdateBoundedContextInput = z.infer<
  typeof UpdateBoundedContextInputSchema
>;

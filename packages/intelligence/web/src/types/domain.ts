// ── DDD Domain Model types ─────────────────────────────────────────────────
// Re-exported from @foe/schemas — the single source of truth.
// Web UI components import these types for rendering domain model data.

import { taxonomy } from "@foe/schemas";

// ── Core domain model types ────────────────────────────────────────────────

export type DomainModel = taxonomy.StoredDomainModel;
export type BoundedContext = taxonomy.StoredBoundedContext;
export type Aggregate = taxonomy.StoredAggregate;
export type DomainEvent = taxonomy.StoredDomainEvent;
export type ValueObject = taxonomy.StoredValueObject;
export type GlossaryTerm = taxonomy.StoredGlossaryTerm;
export type DomainWorkflow = taxonomy.StoredWorkflow;
export type DomainModelFull = taxonomy.DomainModelWithArtifacts;

// ── Sub-types ──────────────────────────────────────────────────────────────

export type SubdomainType = taxonomy.SubdomainType;
export type ContextRelationship = taxonomy.ContextRelationship;
export type EventPayloadField = taxonomy.EventPayloadField;
export type WorkflowState = taxonomy.WorkflowState;
export type WorkflowTransition = taxonomy.WorkflowTransition;

// ── Invariant (both `rule` and `description` available after Zod transform)
export type AggregateInvariant = taxonomy.Invariant;

// ── Value Object Property (both `constraints` and `description` available)
export type ValueObjectProperty = taxonomy.ValueObjectProperty;

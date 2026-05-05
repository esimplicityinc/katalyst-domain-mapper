/**
 * Domain types for Katalyst Bard AppKit client.
 *
 * These are simplified versions of the @foe/schemas types,
 * defined locally to avoid depending on the monorepo package.
 */

// ── Domain Model ──────────────────────────────────────────────────────────

export interface DomainModel {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainModelFull extends DomainModel {
  boundedContexts: BoundedContext[];
  aggregates: Aggregate[];
  domainEvents: DomainEvent[];
  valueObjects: ValueObject[];
  glossaryTerms: GlossaryTerm[];
  workflows: DomainWorkflow[];
}

export type SubdomainType = 'core' | 'supporting' | 'generic';

// ── Bounded Context ──────────────────────────────────────────────────────

export interface BoundedContext {
  id: string;
  slug: string;
  title: string;
  responsibility: string;
  description?: string | null;
  sourceDirectory?: string | null;
  teamOwnership?: string | null;
  status?: string | null;
  subdomainType?: 'core' | 'supporting' | 'generic' | null;
  relationships?: ContextRelationship[];
}

export interface ContextRelationship {
  type: string;
  targetContextId: string;
  description?: string;
}

// ── Aggregate ────────────────────────────────────────────────────────────

export interface Aggregate {
  id: string;
  contextId: string;
  slug: string;
  title: string;
  rootEntity: string;
  entities: string[];
  valueObjects: string[];
  events: string[];
  commands: string[];
  invariants: AggregateInvariant[];
  sourceFile?: string | null;
  status?: string | null;
}

export interface AggregateInvariant {
  rule: string;
  description?: string;
  enforced?: boolean;
  enforcementLocation?: string;
}

// ── Domain Event ─────────────────────────────────────────────────────────

export interface DomainEvent {
  id: string;
  contextId: string;
  aggregateId?: string | null;
  slug: string;
  title: string;
  description?: string | null;
  payload: EventPayloadField[];
  consumedBy: string[];
  triggers: string[];
  sideEffects: string[];
  sourceFile?: string | null;
}

export interface EventPayloadField {
  name: string;
  type: string;
  description?: string;
}

// ── Value Object ─────────────────────────────────────────────────────────

export interface ValueObject {
  id: string;
  contextId: string;
  slug: string;
  title: string;
  description?: string | null;
  properties: ValueObjectProperty[];
  validationRules: string[];
  immutable: boolean;
  sourceFile?: string | null;
}

export interface ValueObjectProperty {
  name: string;
  type: string;
  description?: string;
  constraints?: string[];
}

// ── Glossary Term ────────────────────────────────────────────────────────

export interface GlossaryTerm {
  id: string;
  contextId?: string | null;
  term: string;
  definition: string;
  aliases: string[];
  examples: string[];
  relatedTerms: string[];
  source?: string | null;
}

// ── Workflow ─────────────────────────────────────────────────────────────

export interface DomainWorkflow {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  contextIds?: string[];
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface WorkflowState {
  id?: string;
  name: string;
  description?: string;
  isTerminal?: boolean;
  isError?: boolean;
  timestampField?: string;
  x?: number;
  y?: number;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  trigger?: string;
  guard?: string;
  label?: string;
  isAsync?: boolean;
}

// ── Contributions ────────────────────────────────────────────────────────

export interface ContributionItem {
  _id: string;
  itemType: string;
  title: string;
  contribution: {
    status: string;
    submittedBy?: string;
    reviewedBy?: string;
    feedback?: string;
    version?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ContributionCounts {
  myDrafts: number;
  pendingReview: number;
  rejected: number;
  accepted: number;
  total: number;
}

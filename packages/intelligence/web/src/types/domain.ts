// ── DDD Domain Model types ─────────────────────────────────────────────────
// These mirror the API response shapes from packages/foe-api domain-models routes.

export interface DomainModel {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SubdomainType = "core" | "supporting" | "generic";

export interface BoundedContext {
  id: string;
  domainModelId: string;
  slug: string;
  title: string;
  description: string | null;
  responsibility: string;
  sourceDirectory: string | null;
  teamOwnership: string | null;
  status: string | null;
  subdomainType: SubdomainType | null;
  relationships: ContextRelationship[];
  createdAt: string;
  updatedAt: string;
}

export interface ContextRelationship {
  targetContextId: string;
  type:
    | "upstream"
    | "downstream"
    | "conformist"
    | "anticorruption-layer"
    | "shared-kernel"
    | "customer-supplier"
    | "partnership"
    | "published-language";
  description?: string;
}

export interface Aggregate {
  id: string;
  domainModelId: string;
  contextId: string;
  slug: string;
  title: string;
  rootEntity: string;
  entities: string[];
  valueObjects: string[];
  events: string[];
  commands: string[];
  invariants: AggregateInvariant[];
  sourceFile: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AggregateInvariant {
  rule: string;
  description?: string;
}

export interface DomainEvent {
  id: string;
  domainModelId: string;
  contextId: string;
  aggregateId: string | null;
  slug: string;
  title: string;
  description: string | null;
  payload: EventPayloadField[];
  consumedBy: string[];
  triggers: string[];
  sideEffects: string[];
  sourceFile: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventPayloadField {
  name: string;
  type: string;
  description?: string;
}

export interface ValueObject {
  id: string;
  domainModelId: string;
  contextId: string;
  slug: string;
  title: string;
  description: string | null;
  properties: ValueObjectProperty[];
  validationRules: string[];
  immutable: boolean;
  sourceFile: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ValueObjectProperty {
  name: string;
  type: string;
  description?: string;
}

export interface GlossaryTerm {
  id: string;
  domainModelId: string;
  contextId: string | null;
  term: string;
  definition: string;
  aliases: string[];
  examples: string[];
  relatedTerms: string[];
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Workflow / State Machine types ──────────────────────────────────────────

export interface WorkflowState {
  id: string;
  name: string;
  description?: string;
  x: number;
  y: number;
  isTerminal: boolean;
  isError: boolean;
  timestampField?: string;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  label: string;
  isAsync: boolean;
}

export interface DomainWorkflow {
  id: string;
  domainModelId: string;
  slug: string;
  title: string;
  description: string | null;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  createdAt: string;
  updatedAt: string;
}

// ── Full domain model with all artifacts ───────────────────────────────────

export interface DomainModelFull extends DomainModel {
  boundedContexts: BoundedContext[];
  aggregates: Aggregate[];
  domainEvents: DomainEvent[];
  valueObjects: ValueObject[];
  glossaryTerms: GlossaryTerm[];
  workflows: DomainWorkflow[];
}

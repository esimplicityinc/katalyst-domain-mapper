// ── Stored DTOs (what comes back from the database) ─────────────────────────

export interface StoredDomainModel {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredBoundedContext {
  id: string;
  domainModelId: string;
  slug: string;
  title: string;
  description: string | null;
  responsibility: string;
  sourceDirectory: string | null;
  teamOwnership: string | null;
  status: string;
  subdomainType: string | null;
  relationships: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredAggregate {
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
  invariants: unknown[];
  sourceFile: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredDomainEvent {
  id: string;
  domainModelId: string;
  contextId: string;
  aggregateId: string | null;
  slug: string;
  title: string;
  description: string | null;
  payload: unknown[];
  consumedBy: string[];
  triggers: string[];
  sideEffects: string[];
  sourceFile: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredValueObject {
  id: string;
  domainModelId: string;
  contextId: string;
  slug: string;
  title: string;
  description: string | null;
  properties: unknown[];
  validationRules: string[];
  immutable: boolean;
  sourceFile: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredGlossaryTerm {
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

export interface StoredWorkflow {
  id: string;
  domainModelId: string;
  slug: string;
  title: string;
  description: string | null;
  states: unknown[];
  transitions: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface DomainModelWithArtifacts extends StoredDomainModel {
  boundedContexts: StoredBoundedContext[];
  aggregates: StoredAggregate[];
  valueObjects: StoredValueObject[];
  domainEvents: StoredDomainEvent[];
  glossaryTerms: StoredGlossaryTerm[];
  workflows: StoredWorkflow[];
}

// ── Input DTOs (request body fields only — no id, no timestamps) ────────────

export interface CreateDomainModelInput {
  name: string;
  description?: string;
}

export interface CreateBoundedContextInput {
  slug: string;
  title: string;
  description?: string;
  responsibility: string;
  sourceDirectory?: string;
  teamOwnership?: string;
  status?: string;
  subdomainType?: string;
  relationships?: unknown[];
}

export interface UpdateBoundedContextInput {
  slug: string;
  title: string;
  description?: string;
  responsibility: string;
  sourceDirectory?: string;
  teamOwnership?: string;
  status?: string;
  subdomainType?: string;
  relationships?: unknown[];
}

export interface CreateAggregateInput {
  contextId: string;
  slug: string;
  title: string;
  rootEntity: string;
  entities?: string[];
  valueObjects?: string[];
  events?: string[];
  commands?: string[];
  invariants?: unknown[];
  sourceFile?: string;
  status?: string;
}

export interface UpdateAggregateInput {
  slug: string;
  title: string;
  rootEntity: string;
  entities?: string[];
  valueObjects?: string[];
  events?: string[];
  commands?: string[];
  invariants?: unknown[];
  sourceFile?: string;
  status?: string;
}

export interface CreateDomainEventInput {
  contextId: string;
  aggregateId?: string;
  slug: string;
  title: string;
  description?: string;
  payload?: unknown[];
  consumedBy?: string[];
  triggers?: string[];
  sideEffects?: string[];
  sourceFile?: string;
}

export interface UpdateDomainEventInput {
  slug: string;
  title: string;
  description?: string;
  payload?: unknown[];
  consumedBy?: string[];
  triggers?: string[];
  sideEffects?: string[];
  sourceFile?: string;
}

export interface CreateValueObjectInput {
  contextId: string;
  slug: string;
  title: string;
  description?: string;
  properties?: unknown[];
  validationRules?: string[];
  immutable?: boolean;
  sourceFile?: string;
}

export interface UpdateValueObjectInput {
  slug: string;
  title: string;
  description?: string;
  properties?: unknown[];
  validationRules?: string[];
  immutable?: boolean;
  sourceFile?: string;
}

export interface CreateGlossaryTermInput {
  contextId?: string;
  term: string;
  definition: string;
  aliases?: string[];
  examples?: string[];
  relatedTerms?: string[];
  source?: string;
}

export interface CreateWorkflowInput {
  slug: string;
  title: string;
  description?: string;
  states?: unknown[];
  transitions?: unknown[];
}

// ── Port Interface ──────────────────────────────────────────────────────────

export interface DomainModelRepository {
  // Domain Models
  create(input: CreateDomainModelInput): Promise<StoredDomainModel>;
  list(): Promise<StoredDomainModel[]>;
  getById(id: string): Promise<DomainModelWithArtifacts | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;

  // Bounded Contexts
  addBoundedContext(
    modelId: string,
    input: CreateBoundedContextInput,
  ): Promise<StoredBoundedContext>;
  updateBoundedContext(
    ctxId: string,
    input: UpdateBoundedContextInput,
  ): Promise<void>;
  deleteBoundedContext(ctxId: string): Promise<void>;

  // Aggregates
  addAggregate(
    modelId: string,
    input: CreateAggregateInput,
  ): Promise<StoredAggregate>;
  updateAggregate(aggId: string, input: UpdateAggregateInput): Promise<void>;
  deleteAggregate(aggId: string): Promise<void>;

  // Domain Events
  addDomainEvent(
    modelId: string,
    input: CreateDomainEventInput,
  ): Promise<StoredDomainEvent>;
  updateDomainEvent(
    eventId: string,
    input: UpdateDomainEventInput,
  ): Promise<void>;
  deleteDomainEvent(eventId: string): Promise<void>;

  // Value Objects
  addValueObject(
    modelId: string,
    input: CreateValueObjectInput,
  ): Promise<StoredValueObject>;
  updateValueObject(
    voId: string,
    input: UpdateValueObjectInput,
  ): Promise<void>;
  deleteValueObject(voId: string): Promise<void>;

  // Glossary
  addGlossaryTerm(
    modelId: string,
    input: CreateGlossaryTermInput,
  ): Promise<StoredGlossaryTerm>;
  listGlossaryTerms(modelId: string): Promise<StoredGlossaryTerm[]>;
  deleteGlossaryTerm(termId: string): Promise<void>;

  // Workflows
  addWorkflow(
    modelId: string,
    input: CreateWorkflowInput,
  ): Promise<StoredWorkflow>;
  listWorkflows(modelId: string): Promise<StoredWorkflow[]>;
  deleteWorkflow(wfId: string): Promise<void>;
}

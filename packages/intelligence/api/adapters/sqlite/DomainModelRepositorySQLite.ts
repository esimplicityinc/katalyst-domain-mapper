import { eq } from "drizzle-orm";
import type {
  DomainModelRepository,
  StoredDomainModel,
  StoredBoundedContext,
  StoredAggregate,
  StoredDomainEvent,
  StoredValueObject,
  StoredGlossaryTerm,
  StoredWorkflow,
  DomainModelWithArtifacts,
  CreateDomainModelInput,
  CreateBoundedContextInput,
  UpdateBoundedContextInput,
  CreateAggregateInput,
  UpdateAggregateInput,
  CreateDomainEventInput,
  UpdateDomainEventInput,
  CreateValueObjectInput,
  UpdateValueObjectInput,
  CreateGlossaryTermInput,
  CreateWorkflowInput,
} from "../../ports/DomainModelRepository.js";
import type { DrizzleDB } from "../../db/client.js";
import * as schema from "../../db/schema.js";

export class DomainModelRepositorySQLite implements DomainModelRepository {
  constructor(private db: DrizzleDB) {}

  // ── Domain Models ───────────────────────────────────────────────────────────

  async create(input: CreateDomainModelInput): Promise<StoredDomainModel> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    this.db
      .insert(schema.domainModels)
      .values({
        id,
        name: input.name,
        description: input.description ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    return { id, name: input.name, description: input.description ?? null, createdAt: now, updatedAt: now };
  }

  async list(): Promise<StoredDomainModel[]> {
    return this.db.select().from(schema.domainModels).all();
  }

  async getById(id: string): Promise<DomainModelWithArtifacts | null> {
    const model = this.db
      .select()
      .from(schema.domainModels)
      .where(eq(schema.domainModels.id, id))
      .get();
    if (!model) return null;

    const contexts = this.db
      .select()
      .from(schema.boundedContexts)
      .where(eq(schema.boundedContexts.domainModelId, id))
      .all();
    const aggs = this.db
      .select()
      .from(schema.aggregates)
      .where(eq(schema.aggregates.domainModelId, id))
      .all();
    const vos = this.db
      .select()
      .from(schema.valueObjects)
      .where(eq(schema.valueObjects.domainModelId, id))
      .all();
    const events = this.db
      .select()
      .from(schema.domainEvents)
      .where(eq(schema.domainEvents.domainModelId, id))
      .all();
    const glossary = this.db
      .select()
      .from(schema.glossaryTerms)
      .where(eq(schema.glossaryTerms.domainModelId, id))
      .all();
    const workflows = this.db
      .select()
      .from(schema.domainWorkflows)
      .where(eq(schema.domainWorkflows.domainModelId, id))
      .all();

    return {
      ...model,
      boundedContexts: contexts as StoredBoundedContext[],
      aggregates: aggs as StoredAggregate[],
      valueObjects: vos as StoredValueObject[],
      domainEvents: events as StoredDomainEvent[],
      glossaryTerms: glossary as StoredGlossaryTerm[],
      workflows: workflows as StoredWorkflow[],
    };
  }

  async delete(id: string): Promise<boolean> {
    const existing = this.db
      .select({ id: schema.domainModels.id })
      .from(schema.domainModels)
      .where(eq(schema.domainModels.id, id))
      .get();
    if (!existing) return false;

    this.db
      .delete(schema.domainModels)
      .where(eq(schema.domainModels.id, id))
      .run();
    return true;
  }

  async exists(id: string): Promise<boolean> {
    const row = this.db
      .select({ id: schema.domainModels.id })
      .from(schema.domainModels)
      .where(eq(schema.domainModels.id, id))
      .get();
    return !!row;
  }

  // ── Bounded Contexts ────────────────────────────────────────────────────────

  async addBoundedContext(
    modelId: string,
    input: CreateBoundedContextInput,
  ): Promise<StoredBoundedContext> {
    const now = new Date().toISOString();
    const ctxId = crypto.randomUUID();
    const values = {
      id: ctxId,
      domainModelId: modelId,
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      responsibility: input.responsibility,
      sourceDirectory: input.sourceDirectory ?? null,
      teamOwnership: input.teamOwnership ?? null,
      status: input.status ?? "draft",
      subdomainType: input.subdomainType ?? null,
      contextType: input.contextType ?? "internal",
      taxonomyNode: input.taxonomyNode ?? null,
      relationships: input.relationships ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.boundedContexts).values(values).run();
    return values as StoredBoundedContext;
  }

  async updateBoundedContext(
    ctxId: string,
    input: UpdateBoundedContextInput,
  ): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(schema.boundedContexts)
      .set({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        responsibility: input.responsibility,
        sourceDirectory: input.sourceDirectory ?? null,
        teamOwnership: input.teamOwnership ?? null,
        status: input.status ?? "draft",
        subdomainType: input.subdomainType ?? null,
        contextType: input.contextType ?? "internal",
        taxonomyNode: input.taxonomyNode ?? null,
        relationships: input.relationships ?? [],
        updatedAt: now,
      })
      .where(eq(schema.boundedContexts.id, ctxId))
      .run();
  }

  async deleteBoundedContext(ctxId: string): Promise<void> {
    this.db
      .delete(schema.boundedContexts)
      .where(eq(schema.boundedContexts.id, ctxId))
      .run();
  }

  // ── Aggregates ──────────────────────────────────────────────────────────────

  async addAggregate(
    modelId: string,
    input: CreateAggregateInput,
  ): Promise<StoredAggregate> {
    const now = new Date().toISOString();
    const aggId = crypto.randomUUID();
    const values = {
      id: aggId,
      domainModelId: modelId,
      contextId: input.contextId,
      slug: input.slug,
      title: input.title,
      rootEntity: input.rootEntity,
      entities: input.entities ?? [],
      valueObjects: input.valueObjects ?? [],
      events: input.events ?? [],
      commands: input.commands ?? [],
      invariants: input.invariants ?? [],
      sourceFile: input.sourceFile ?? null,
      status: input.status ?? "draft",
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.aggregates).values(values).run();
    return values as StoredAggregate;
  }

  async updateAggregate(
    aggId: string,
    input: UpdateAggregateInput,
  ): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(schema.aggregates)
      .set({
        slug: input.slug,
        title: input.title,
        rootEntity: input.rootEntity,
        entities: input.entities ?? [],
        valueObjects: input.valueObjects ?? [],
        events: input.events ?? [],
        commands: input.commands ?? [],
        invariants: input.invariants ?? [],
        sourceFile: input.sourceFile ?? null,
        status: input.status ?? "draft",
        updatedAt: now,
      })
      .where(eq(schema.aggregates.id, aggId))
      .run();
  }

  async deleteAggregate(aggId: string): Promise<void> {
    this.db
      .delete(schema.aggregates)
      .where(eq(schema.aggregates.id, aggId))
      .run();
  }

  // ── Domain Events ───────────────────────────────────────────────────────────

  async addDomainEvent(
    modelId: string,
    input: CreateDomainEventInput,
  ): Promise<StoredDomainEvent> {
    const now = new Date().toISOString();
    const eventId = crypto.randomUUID();
    const values = {
      id: eventId,
      domainModelId: modelId,
      contextId: input.contextId,
      aggregateId: input.aggregateId ?? null,
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      payload: input.payload ?? [],
      consumedBy: input.consumedBy ?? [],
      triggers: input.triggers ?? [],
      sideEffects: input.sideEffects ?? [],
      sourceFile: input.sourceFile ?? null,
      sourceCapabilityId: input.sourceCapabilityId ?? null,
      targetCapabilityIds: input.targetCapabilityIds ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.domainEvents).values(values).run();
    return values as StoredDomainEvent;
  }

  async updateDomainEvent(
    eventId: string,
    input: UpdateDomainEventInput,
  ): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(schema.domainEvents)
      .set({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        payload: input.payload ?? [],
        consumedBy: input.consumedBy ?? [],
        triggers: input.triggers ?? [],
        sideEffects: input.sideEffects ?? [],
        sourceFile: input.sourceFile ?? null,
        sourceCapabilityId: input.sourceCapabilityId ?? null,
        targetCapabilityIds: input.targetCapabilityIds ?? [],
        updatedAt: now,
      })
      .where(eq(schema.domainEvents.id, eventId))
      .run();
  }

  async deleteDomainEvent(eventId: string): Promise<void> {
    this.db
      .delete(schema.domainEvents)
      .where(eq(schema.domainEvents.id, eventId))
      .run();
  }

  // ── Value Objects ───────────────────────────────────────────────────────────

  async addValueObject(
    modelId: string,
    input: CreateValueObjectInput,
  ): Promise<StoredValueObject> {
    const now = new Date().toISOString();
    const voId = crypto.randomUUID();
    const values = {
      id: voId,
      domainModelId: modelId,
      contextId: input.contextId,
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      properties: input.properties ?? [],
      validationRules: input.validationRules ?? [],
      immutable: input.immutable ?? true,
      sourceFile: input.sourceFile ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.valueObjects).values(values).run();
    return values as StoredValueObject;
  }

  async updateValueObject(
    voId: string,
    input: UpdateValueObjectInput,
  ): Promise<void> {
    const now = new Date().toISOString();
    this.db
      .update(schema.valueObjects)
      .set({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        properties: input.properties ?? [],
        validationRules: input.validationRules ?? [],
        immutable: input.immutable ?? true,
        sourceFile: input.sourceFile ?? null,
        updatedAt: now,
      })
      .where(eq(schema.valueObjects.id, voId))
      .run();
  }

  async deleteValueObject(voId: string): Promise<void> {
    this.db
      .delete(schema.valueObjects)
      .where(eq(schema.valueObjects.id, voId))
      .run();
  }

  // ── Glossary ────────────────────────────────────────────────────────────────

  async addGlossaryTerm(
    modelId: string,
    input: CreateGlossaryTermInput,
  ): Promise<StoredGlossaryTerm> {
    const now = new Date().toISOString();
    const termId = crypto.randomUUID();
    const values = {
      id: termId,
      domainModelId: modelId,
      contextId: input.contextId ?? null,
      term: input.term,
      definition: input.definition,
      aliases: input.aliases ?? [],
      examples: input.examples ?? [],
      relatedTerms: input.relatedTerms ?? [],
      source: input.source ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.glossaryTerms).values(values).run();
    return values as StoredGlossaryTerm;
  }

  async listGlossaryTerms(modelId: string): Promise<StoredGlossaryTerm[]> {
    return this.db
      .select()
      .from(schema.glossaryTerms)
      .where(eq(schema.glossaryTerms.domainModelId, modelId))
      .all() as StoredGlossaryTerm[];
  }

  async deleteGlossaryTerm(termId: string): Promise<void> {
    this.db
      .delete(schema.glossaryTerms)
      .where(eq(schema.glossaryTerms.id, termId))
      .run();
  }

  // ── Workflows ───────────────────────────────────────────────────────────────

  async addWorkflow(
    modelId: string,
    input: CreateWorkflowInput,
  ): Promise<StoredWorkflow> {
    const now = new Date().toISOString();
    const wfId = crypto.randomUUID();
    const values = {
      id: wfId,
      domainModelId: modelId,
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      contextIds: input.contextIds ?? [],
      states: input.states ?? [],
      transitions: input.transitions ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(schema.domainWorkflows).values(values).run();
    return values as StoredWorkflow;
  }

  async listWorkflows(modelId: string): Promise<StoredWorkflow[]> {
    return this.db
      .select()
      .from(schema.domainWorkflows)
      .where(eq(schema.domainWorkflows.domainModelId, modelId))
      .all() as StoredWorkflow[];
  }

  async deleteWorkflow(wfId: string): Promise<void> {
    this.db
      .delete(schema.domainWorkflows)
      .where(eq(schema.domainWorkflows.id, wfId))
      .run();
  }
}

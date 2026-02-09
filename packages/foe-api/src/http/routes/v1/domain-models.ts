import Elysia, { t } from "elysia";
import { eq } from "drizzle-orm";
import type { DrizzleDB } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";

export function createDomainModelRoutes(deps: { db: DrizzleDB }) {
  const { db } = deps;

  return new Elysia({ prefix: "/domain-models" })

    // ── Domain Models CRUD ────────────────────────────────────────────────

    .post("/", ({ body }) => {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      db.insert(schema.domainModels).values({
        id,
        name: body.name,
        description: body.description ?? null,
        createdAt: now,
        updatedAt: now,
      }).run();
      return { id, name: body.name, createdAt: now };
    }, {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
      }),
      detail: { summary: "Create a domain model", tags: ["Domain Models"] },
    })

    .get("/", () => {
      return db.select().from(schema.domainModels).all();
    }, {
      detail: { summary: "List domain models", tags: ["Domain Models"] },
    })

    .get("/:id", ({ params, set }) => {
      const model = db.select().from(schema.domainModels)
        .where(eq(schema.domainModels.id, params.id)).get();
      if (!model) { set.status = 404; return { error: "Domain model not found" }; }

      const contexts = db.select().from(schema.boundedContexts)
        .where(eq(schema.boundedContexts.domainModelId, params.id)).all();
      const aggs = db.select().from(schema.aggregates)
        .where(eq(schema.aggregates.domainModelId, params.id)).all();
      const vos = db.select().from(schema.valueObjects)
        .where(eq(schema.valueObjects.domainModelId, params.id)).all();
      const events = db.select().from(schema.domainEvents)
        .where(eq(schema.domainEvents.domainModelId, params.id)).all();
      const glossary = db.select().from(schema.glossaryTerms)
        .where(eq(schema.glossaryTerms.domainModelId, params.id)).all();

      return { ...model, boundedContexts: contexts, aggregates: aggs, valueObjects: vos, domainEvents: events, glossaryTerms: glossary };
    }, {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Get domain model with all artifacts", tags: ["Domain Models"] },
    })

    .delete("/:id", ({ params, set }) => {
      const existing = db.select({ id: schema.domainModels.id }).from(schema.domainModels)
        .where(eq(schema.domainModels.id, params.id)).get();
      if (!existing) { set.status = 404; return { error: "Domain model not found" }; }
      db.delete(schema.domainModels).where(eq(schema.domainModels.id, params.id)).run();
      return { message: "Deleted" };
    }, {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Delete a domain model", tags: ["Domain Models"] },
    })

    // ── Bounded Contexts ──────────────────────────────────────────────────

    .post("/:id/contexts", ({ params, body, set }) => {
      const model = db.select({ id: schema.domainModels.id }).from(schema.domainModels)
        .where(eq(schema.domainModels.id, params.id)).get();
      if (!model) { set.status = 404; return { error: "Domain model not found" }; }

      const now = new Date().toISOString();
      const ctxId = crypto.randomUUID();
      db.insert(schema.boundedContexts).values({
        id: ctxId,
        domainModelId: params.id,
        slug: body.slug,
        title: body.title,
        description: body.description ?? null,
        responsibility: body.responsibility,
        sourceDirectory: body.sourceDirectory ?? null,
        teamOwnership: body.teamOwnership ?? null,
        status: body.status ?? "draft",
        relationships: body.relationships ?? [],
        createdAt: now,
        updatedAt: now,
      }).run();
      return { id: ctxId, slug: body.slug, title: body.title };
    }, {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        slug: t.String(),
        title: t.String(),
        description: t.Optional(t.String()),
        responsibility: t.String(),
        sourceDirectory: t.Optional(t.String()),
        teamOwnership: t.Optional(t.String()),
        status: t.Optional(t.String()),
        relationships: t.Optional(t.Array(t.Any())),
      }),
      detail: { summary: "Add bounded context", tags: ["Domain Models"] },
    })

    .put("/:id/contexts/:ctxId", ({ params, body }) => {
      const now = new Date().toISOString();
      db.update(schema.boundedContexts).set({
        slug: body.slug,
        title: body.title,
        description: body.description ?? null,
        responsibility: body.responsibility,
        sourceDirectory: body.sourceDirectory ?? null,
        teamOwnership: body.teamOwnership ?? null,
        status: body.status ?? "draft",
        relationships: body.relationships ?? [],
        updatedAt: now,
      }).where(eq(schema.boundedContexts.id, params.ctxId)).run();
      return { id: params.ctxId, updated: true };
    }, {
      params: t.Object({ id: t.String(), ctxId: t.String() }),
      body: t.Object({
        slug: t.String(),
        title: t.String(),
        description: t.Optional(t.String()),
        responsibility: t.String(),
        sourceDirectory: t.Optional(t.String()),
        teamOwnership: t.Optional(t.String()),
        status: t.Optional(t.String()),
        relationships: t.Optional(t.Array(t.Any())),
      }),
      detail: { summary: "Update bounded context", tags: ["Domain Models"] },
    })

    .delete("/:id/contexts/:ctxId", ({ params }) => {
      db.delete(schema.boundedContexts).where(eq(schema.boundedContexts.id, params.ctxId)).run();
      return { message: "Deleted" };
    }, {
      params: t.Object({ id: t.String(), ctxId: t.String() }),
      detail: { summary: "Delete bounded context", tags: ["Domain Models"] },
    })

    // ── Aggregates ────────────────────────────────────────────────────────

    .post("/:id/aggregates", ({ params, body, set }) => {
      const model = db.select({ id: schema.domainModels.id }).from(schema.domainModels)
        .where(eq(schema.domainModels.id, params.id)).get();
      if (!model) { set.status = 404; return { error: "Domain model not found" }; }

      const now = new Date().toISOString();
      const aggId = crypto.randomUUID();
      db.insert(schema.aggregates).values({
        id: aggId,
        domainModelId: params.id,
        contextId: body.contextId,
        slug: body.slug,
        title: body.title,
        rootEntity: body.rootEntity,
        entities: body.entities ?? [],
        valueObjects: body.valueObjects ?? [],
        events: body.events ?? [],
        commands: body.commands ?? [],
        invariants: body.invariants ?? [],
        sourceFile: body.sourceFile ?? null,
        status: body.status ?? "draft",
        createdAt: now,
        updatedAt: now,
      }).run();
      return { id: aggId, slug: body.slug, title: body.title };
    }, {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        contextId: t.String(),
        slug: t.String(),
        title: t.String(),
        rootEntity: t.String(),
        entities: t.Optional(t.Array(t.String())),
        valueObjects: t.Optional(t.Array(t.String())),
        events: t.Optional(t.Array(t.String())),
        commands: t.Optional(t.Array(t.String())),
        invariants: t.Optional(t.Array(t.Any())),
        sourceFile: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
      detail: { summary: "Add aggregate", tags: ["Domain Models"] },
    })

    // ── Domain Events ─────────────────────────────────────────────────────

    .post("/:id/events", ({ params, body, set }) => {
      const model = db.select({ id: schema.domainModels.id }).from(schema.domainModels)
        .where(eq(schema.domainModels.id, params.id)).get();
      if (!model) { set.status = 404; return { error: "Domain model not found" }; }

      const now = new Date().toISOString();
      const eventId = crypto.randomUUID();
      db.insert(schema.domainEvents).values({
        id: eventId,
        domainModelId: params.id,
        contextId: body.contextId,
        aggregateId: body.aggregateId ?? null,
        slug: body.slug,
        title: body.title,
        description: body.description ?? null,
        payload: body.payload ?? [],
        consumedBy: body.consumedBy ?? [],
        triggers: body.triggers ?? [],
        sideEffects: body.sideEffects ?? [],
        sourceFile: body.sourceFile ?? null,
        createdAt: now,
        updatedAt: now,
      }).run();
      return { id: eventId, slug: body.slug, title: body.title };
    }, {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        contextId: t.String(),
        aggregateId: t.Optional(t.String()),
        slug: t.String(),
        title: t.String(),
        description: t.Optional(t.String()),
        payload: t.Optional(t.Array(t.Any())),
        consumedBy: t.Optional(t.Array(t.String())),
        triggers: t.Optional(t.Array(t.String())),
        sideEffects: t.Optional(t.Array(t.String())),
        sourceFile: t.Optional(t.String()),
      }),
      detail: { summary: "Add domain event", tags: ["Domain Models"] },
    })

    // ── Value Objects ─────────────────────────────────────────────────────

    .post("/:id/value-objects", ({ params, body, set }) => {
      const model = db.select({ id: schema.domainModels.id }).from(schema.domainModels)
        .where(eq(schema.domainModels.id, params.id)).get();
      if (!model) { set.status = 404; return { error: "Domain model not found" }; }

      const now = new Date().toISOString();
      const voId = crypto.randomUUID();
      db.insert(schema.valueObjects).values({
        id: voId,
        domainModelId: params.id,
        contextId: body.contextId,
        slug: body.slug,
        title: body.title,
        description: body.description ?? null,
        properties: body.properties ?? [],
        validationRules: body.validationRules ?? [],
        immutable: body.immutable ?? true,
        sourceFile: body.sourceFile ?? null,
        createdAt: now,
        updatedAt: now,
      }).run();
      return { id: voId, slug: body.slug, title: body.title };
    }, {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        contextId: t.String(),
        slug: t.String(),
        title: t.String(),
        description: t.Optional(t.String()),
        properties: t.Optional(t.Array(t.Any())),
        validationRules: t.Optional(t.Array(t.String())),
        immutable: t.Optional(t.Boolean()),
        sourceFile: t.Optional(t.String()),
      }),
      detail: { summary: "Add value object", tags: ["Domain Models"] },
    })

    // ── Glossary ──────────────────────────────────────────────────────────

    .post("/:id/glossary", ({ params, body, set }) => {
      const model = db.select({ id: schema.domainModels.id }).from(schema.domainModels)
        .where(eq(schema.domainModels.id, params.id)).get();
      if (!model) { set.status = 404; return { error: "Domain model not found" }; }

      const now = new Date().toISOString();
      const termId = crypto.randomUUID();
      db.insert(schema.glossaryTerms).values({
        id: termId,
        domainModelId: params.id,
        contextId: body.contextId ?? null,
        term: body.term,
        definition: body.definition,
        aliases: body.aliases ?? [],
        examples: body.examples ?? [],
        relatedTerms: body.relatedTerms ?? [],
        source: body.source ?? null,
        createdAt: now,
        updatedAt: now,
      }).run();
      return { id: termId, term: body.term };
    }, {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        contextId: t.Optional(t.String()),
        term: t.String(),
        definition: t.String(),
        aliases: t.Optional(t.Array(t.String())),
        examples: t.Optional(t.Array(t.String())),
        relatedTerms: t.Optional(t.Array(t.String())),
        source: t.Optional(t.String()),
      }),
      detail: { summary: "Add glossary term", tags: ["Domain Models"] },
    })

    .get("/:id/glossary", ({ params }) => {
      return db.select().from(schema.glossaryTerms)
        .where(eq(schema.glossaryTerms.domainModelId, params.id)).all();
    }, {
      params: t.Object({ id: t.String() }),
      detail: { summary: "List glossary terms", tags: ["Domain Models"] },
    });
}

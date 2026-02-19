import Elysia, { t } from "elysia";
import type { CreateDomainModel } from "../../../usecases/domain-model/CreateDomainModel.js";
import type { GetDomainModel } from "../../../usecases/domain-model/GetDomainModel.js";
import type { ListDomainModels } from "../../../usecases/domain-model/ListDomainModels.js";
import type { DeleteDomainModel } from "../../../usecases/domain-model/DeleteDomainModel.js";
import type { ManageBoundedContexts } from "../../../usecases/domain-model/ManageBoundedContexts.js";
import type { ManageArtifacts } from "../../../usecases/domain-model/ManageArtifacts.js";
import type { ManageGlossary } from "../../../usecases/domain-model/ManageGlossary.js";
import type { ManageWorkflows } from "../../../usecases/domain-model/ManageWorkflows.js";

export function createDomainModelRoutes(deps: {
  createDomainModel: CreateDomainModel;
  getDomainModel: GetDomainModel;
  listDomainModels: ListDomainModels;
  deleteDomainModel: DeleteDomainModel;
  manageBoundedContexts: ManageBoundedContexts;
  manageArtifacts: ManageArtifacts;
  manageGlossary: ManageGlossary;
  manageWorkflows: ManageWorkflows;
}) {
  return (
    new Elysia({ prefix: "/domain-models" })

      // ── Domain Models CRUD ────────────────────────────────────────────────

      .post(
        "/",
        async ({ body }) => {
          return deps.createDomainModel.execute(body);
        },
        {
          body: t.Object({
            name: t.String(),
            description: t.Optional(t.String()),
          }),
          detail: { summary: "Create a domain model", tags: ["Domain Models"] },
        },
      )

      .get(
        "/",
        async () => {
          return deps.listDomainModels.execute();
        },
        {
          detail: { summary: "List domain models", tags: ["Domain Models"] },
        },
      )

      .get(
        "/:id",
        async ({ params }) => {
          return deps.getDomainModel.execute(params.id);
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Get domain model with all artifacts",
            tags: ["Domain Models"],
          },
        },
      )

      .delete(
        "/:id",
        async ({ params }) => {
          return deps.deleteDomainModel.execute(params.id);
        },
        {
          params: t.Object({ id: t.String() }),
          detail: { summary: "Delete a domain model", tags: ["Domain Models"] },
        },
      )

      // ── Bounded Contexts ──────────────────────────────────────────────────

      .post(
        "/:id/contexts",
        async ({ params, body }) => {
          const ctx = await deps.manageBoundedContexts.add(params.id, body);
          return {
            id: ctx.id,
            slug: ctx.slug,
            title: ctx.title,
            subdomainType: ctx.subdomainType,
          };
        },
        {
          params: t.Object({ id: t.String() }),
          body: t.Object({
            slug: t.String(),
            title: t.String(),
            description: t.Optional(t.String()),
            responsibility: t.String(),
            sourceDirectory: t.Optional(t.String()),
            teamOwnership: t.Optional(t.String()),
            status: t.Optional(t.String()),
            subdomainType: t.Optional(t.String()),
            contextType: t.Optional(t.String()),
            taxonomyNode: t.Optional(t.String()),
            relationships: t.Optional(t.Array(t.Any())),
          }),
          detail: { summary: "Add bounded context", tags: ["Domain Models"] },
        },
      )

      .put(
        "/:id/contexts/:ctxId",
        async ({ params, body }) => {
          return deps.manageBoundedContexts.update(params.ctxId, body);
        },
        {
          params: t.Object({ id: t.String(), ctxId: t.String() }),
          body: t.Object({
            slug: t.String(),
            title: t.String(),
            description: t.Optional(t.String()),
            responsibility: t.String(),
            sourceDirectory: t.Optional(t.String()),
            teamOwnership: t.Optional(t.String()),
            status: t.Optional(t.String()),
            subdomainType: t.Optional(
              t.Union([
                t.Literal("core"),
                t.Literal("supporting"),
                t.Literal("generic"),
              ]),
            ),
            contextType: t.Optional(t.String()),
            taxonomyNode: t.Optional(t.String()),
            relationships: t.Optional(t.Array(t.Any())),
          }),
          detail: {
            summary: "Update bounded context",
            tags: ["Domain Models"],
          },
        },
      )

      .delete(
        "/:id/contexts/:ctxId",
        async ({ params }) => {
          return deps.manageBoundedContexts.delete(params.ctxId);
        },
        {
          params: t.Object({ id: t.String(), ctxId: t.String() }),
          detail: {
            summary: "Delete bounded context",
            tags: ["Domain Models"],
          },
        },
      )

      // ── Aggregates ────────────────────────────────────────────────────────

      .post(
        "/:id/aggregates",
        async ({ params, body }) => {
          return deps.manageArtifacts.addAggregate(params.id, body);
        },
        {
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
        },
      )

      .put(
        "/:id/aggregates/:aggId",
        async ({ params, body }) => {
          return deps.manageArtifacts.updateAggregate(params.aggId, body);
        },
        {
          params: t.Object({ id: t.String(), aggId: t.String() }),
          body: t.Object({
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
          detail: {
            summary: "Update aggregate",
            tags: ["Domain Models"],
          },
        },
      )

      .delete(
        "/:id/aggregates/:aggId",
        async ({ params }) => {
          return deps.manageArtifacts.deleteAggregate(params.aggId);
        },
        {
          params: t.Object({ id: t.String(), aggId: t.String() }),
          detail: {
            summary: "Delete aggregate",
            tags: ["Domain Models"],
          },
        },
      )

      // ── Domain Events ─────────────────────────────────────────────────────

      .post(
        "/:id/events",
        async ({ params, body }) => {
          return deps.manageArtifacts.addDomainEvent(params.id, body);
        },
        {
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
            sourceCapabilityId: t.Optional(t.String()),
            targetCapabilityIds: t.Optional(t.Array(t.String())),
          }),
          detail: { summary: "Add domain event", tags: ["Domain Models"] },
        },
      )

      .put(
        "/:id/events/:eventId",
        async ({ params, body }) => {
          return deps.manageArtifacts.updateDomainEvent(params.eventId, body);
        },
        {
          params: t.Object({ id: t.String(), eventId: t.String() }),
          body: t.Object({
            slug: t.String(),
            title: t.String(),
            description: t.Optional(t.String()),
            payload: t.Optional(t.Array(t.Any())),
            consumedBy: t.Optional(t.Array(t.String())),
            triggers: t.Optional(t.Array(t.String())),
            sideEffects: t.Optional(t.Array(t.String())),
            sourceFile: t.Optional(t.String()),
            sourceCapabilityId: t.Optional(t.String()),
            targetCapabilityIds: t.Optional(t.Array(t.String())),
          }),
          detail: {
            summary: "Update domain event",
            tags: ["Domain Models"],
          },
        },
      )

      .delete(
        "/:id/events/:eventId",
        async ({ params }) => {
          return deps.manageArtifacts.deleteDomainEvent(params.eventId);
        },
        {
          params: t.Object({ id: t.String(), eventId: t.String() }),
          detail: {
            summary: "Delete domain event",
            tags: ["Domain Models"],
          },
        },
      )

      // ── Value Objects ─────────────────────────────────────────────────────

      .post(
        "/:id/value-objects",
        async ({ params, body }) => {
          return deps.manageArtifacts.addValueObject(params.id, body);
        },
        {
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
        },
      )

      .put(
        "/:id/value-objects/:voId",
        async ({ params, body }) => {
          return deps.manageArtifacts.updateValueObject(params.voId, body);
        },
        {
          params: t.Object({ id: t.String(), voId: t.String() }),
          body: t.Object({
            slug: t.String(),
            title: t.String(),
            description: t.Optional(t.String()),
            properties: t.Optional(t.Array(t.Any())),
            validationRules: t.Optional(t.Array(t.String())),
            immutable: t.Optional(t.Boolean()),
            sourceFile: t.Optional(t.String()),
          }),
          detail: {
            summary: "Update value object",
            tags: ["Domain Models"],
          },
        },
      )

      .delete(
        "/:id/value-objects/:voId",
        async ({ params }) => {
          return deps.manageArtifacts.deleteValueObject(params.voId);
        },
        {
          params: t.Object({ id: t.String(), voId: t.String() }),
          detail: {
            summary: "Delete value object",
            tags: ["Domain Models"],
          },
        },
      )

      // ── Glossary ──────────────────────────────────────────────────────────

      .post(
        "/:id/glossary",
        async ({ params, body }) => {
          return deps.manageGlossary.add(params.id, body);
        },
        {
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
        },
      )

      .get(
        "/:id/glossary",
        async ({ params }) => {
          return deps.manageGlossary.list(params.id);
        },
        {
          params: t.Object({ id: t.String() }),
          detail: { summary: "List glossary terms", tags: ["Domain Models"] },
        },
      )

      .delete(
        "/:id/glossary/:termId",
        async ({ params }) => {
          return deps.manageGlossary.delete(params.termId);
        },
        {
          params: t.Object({ id: t.String(), termId: t.String() }),
          detail: {
            summary: "Delete glossary term",
            tags: ["Domain Models"],
          },
        },
      )

      // ── Workflows ─────────────────────────────────────────────────────────

      .post(
        "/:id/workflows",
        async ({ params, body }) => {
          return deps.manageWorkflows.add(params.id, body);
        },
        {
          params: t.Object({ id: t.String() }),
          body: t.Object({
            slug: t.String(),
            title: t.String(),
            description: t.Optional(t.String()),
            contextIds: t.Optional(t.Array(t.String())),
            states: t.Optional(t.Array(t.Any())),
            transitions: t.Optional(t.Array(t.Any())),
          }),
          detail: { summary: "Add workflow", tags: ["Domain Models"] },
        },
      )

      .get(
        "/:id/workflows",
        async ({ params }) => {
          return deps.manageWorkflows.list(params.id);
        },
        {
          params: t.Object({ id: t.String() }),
          detail: { summary: "List workflows", tags: ["Domain Models"] },
        },
      )

      .delete(
        "/:id/workflows/:wfId",
        async ({ params }) => {
          return deps.manageWorkflows.delete(params.wfId);
        },
        {
          params: t.Object({ id: t.String(), wfId: t.String() }),
          detail: {
            summary: "Delete workflow",
            tags: ["Domain Models"],
          },
        },
      )
  );
}

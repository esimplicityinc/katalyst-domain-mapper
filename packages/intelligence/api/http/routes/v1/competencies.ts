import Elysia, { t } from "elysia";
import type { ManageCompetencies } from "../../../usecases/taxonomy/ManageCompetencies.js";
import {
  CreateCompetencyInputSchema,
  UpdateCompetencyInputSchema,
} from "@foe/schemas/taxonomy";

export function createCompetencyRoutes(deps: {
  manageCompetencies: ManageCompetencies;
}) {
  return (
    new Elysia({ prefix: "/taxonomy/competencies" })

      // GET / — List all competencies (optional practiceAreaId filter)
      .get(
        "/",
        async ({ query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          return deps.manageCompetencies.list(
            query.snapshotId,
            query.practiceAreaId ?? undefined,
          );
        },
        {
          query: t.Object({
            snapshotId: t.Optional(t.String()),
            practiceAreaId: t.Optional(t.String()),
          }),
          detail: {
            summary:
              "List competencies with optional practice area filter",
            tags: ["Taxonomy - Competencies"],
          },
        },
      )

      // GET /:id — Get competency by ID
      .get(
        "/:id",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const result = await deps.manageCompetencies.getById(
            query.snapshotId,
            params.id,
          );
          if (!result) {
            set.status = 404;
            return { error: `Competency not found: ${params.id}` };
          }
          return result;
        },
        {
          params: t.Object({ id: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Get a competency by ID",
            tags: ["Taxonomy - Competencies"],
          },
        },
      )

      // POST / — Create competency (validates DAG)
      .post(
        "/",
        async ({ body, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const parsed = CreateCompetencyInputSchema.safeParse(body);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.flatten() };
          }
          try {
            const result = await deps.manageCompetencies.create(
              query.snapshotId,
              parsed.data,
            );
            set.status = 201;
            return result;
          } catch (err: unknown) {
            set.status = 400;
            return {
              error:
                err instanceof Error
                  ? err.message
                  : "Failed to create competency",
            };
          }
        },
        {
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Create a new competency (validates dependency DAG)",
            tags: ["Taxonomy - Competencies"],
          },
        },
      )

      // PUT /:id — Update competency (validates DAG)
      .put(
        "/:id",
        async ({ params, body, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const parsed = UpdateCompetencyInputSchema.safeParse(body);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.flatten() };
          }
          try {
            const result = await deps.manageCompetencies.update(
              query.snapshotId,
              params.id,
              parsed.data,
            );
            return result;
          } catch (err: unknown) {
            // Use 404 for not-found, 400 for DAG validation errors
            const message =
              err instanceof Error ? err.message : `Competency not found: ${params.id}`;
            set.status = message.includes("not found") ? 404 : 400;
            return { error: message };
          }
        },
        {
          params: t.Object({ id: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Update a competency (validates dependency DAG)",
            tags: ["Taxonomy - Competencies"],
          },
        },
      )

      // DELETE /:id — Delete competency
      .delete(
        "/:id",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          try {
            await deps.manageCompetencies.delete(
              query.snapshotId,
              params.id,
            );
            return { message: "Competency deleted", id: params.id };
          } catch (err: unknown) {
            set.status = 404;
            return {
              error:
                err instanceof Error
                  ? err.message
                  : `Competency not found: ${params.id}`,
            };
          }
        },
        {
          params: t.Object({ id: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Delete a competency",
            tags: ["Taxonomy - Competencies"],
          },
        },
      )

      // GET /:id/prerequisites — Get prerequisite chain
      .get(
        "/:id/prerequisites",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          try {
            const chain = await deps.manageCompetencies.getPrerequisites(
              query.snapshotId,
              params.id,
            );
            return { competencyId: params.id, prerequisites: chain };
          } catch (err: unknown) {
            set.status = 400;
            return {
              error:
                err instanceof Error
                  ? err.message
                  : "Failed to resolve prerequisites",
            };
          }
        },
        {
          params: t.Object({ id: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Get prerequisite chain for a competency",
            tags: ["Taxonomy - Competencies"],
          },
        },
      )
  );
}

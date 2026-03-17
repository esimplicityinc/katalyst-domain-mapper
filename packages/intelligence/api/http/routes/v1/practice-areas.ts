import Elysia, { t } from "elysia";
import type { ManagePracticeAreas } from "../../../usecases/taxonomy/ManagePracticeAreas.js";
import {
  CreatePracticeAreaInputSchema,
  UpdatePracticeAreaInputSchema,
} from "@foe/schemas/taxonomy";

export function createPracticeAreaRoutes(deps: {
  managePracticeAreas: ManagePracticeAreas;
}) {
  return (
    new Elysia({ prefix: "/taxonomy/practice-areas" })

      // GET / — List all practice areas for a snapshot
      .get(
        "/",
        async ({ query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          return deps.managePracticeAreas.list(query.snapshotId);
        },
        {
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "List all practice areas for a taxonomy snapshot",
            tags: ["Taxonomy - Practice Areas"],
          },
        },
      )

      // GET /:id — Get practice area by ID
      .get(
        "/:id",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const result = await deps.managePracticeAreas.getById(
            query.snapshotId,
            params.id,
          );
          if (!result) {
            set.status = 404;
            return { error: `Practice area not found: ${params.id}` };
          }
          return result;
        },
        {
          params: t.Object({ id: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Get a practice area by ID",
            tags: ["Taxonomy - Practice Areas"],
          },
        },
      )

      // POST / — Create practice area
      .post(
        "/",
        async ({ body, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const parsed = CreatePracticeAreaInputSchema.safeParse(body);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.flatten() };
          }
          try {
            const result = await deps.managePracticeAreas.create(
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
                  : "Failed to create practice area",
            };
          }
        },
        {
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Create a new practice area",
            tags: ["Taxonomy - Practice Areas"],
          },
        },
      )

      // PUT /:id — Update practice area
      .put(
        "/:id",
        async ({ params, body, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const parsed = UpdatePracticeAreaInputSchema.safeParse(body);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.flatten() };
          }
          try {
            const result = await deps.managePracticeAreas.update(
              query.snapshotId,
              params.id,
              parsed.data,
            );
            return result;
          } catch (err: unknown) {
            set.status = 404;
            return {
              error:
                err instanceof Error
                  ? err.message
                  : `Practice area not found: ${params.id}`,
            };
          }
        },
        {
          params: t.Object({ id: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Update a practice area",
            tags: ["Taxonomy - Practice Areas"],
          },
        },
      )

      // DELETE /:id — Delete practice area
      .delete(
        "/:id",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          try {
            await deps.managePracticeAreas.delete(
              query.snapshotId,
              params.id,
            );
            return { message: "Practice area deleted", id: params.id };
          } catch (err: unknown) {
            set.status = 404;
            return {
              error:
                err instanceof Error
                  ? err.message
                  : `Practice area not found: ${params.id}`,
            };
          }
        },
        {
          params: t.Object({ id: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Delete a practice area",
            tags: ["Taxonomy - Practice Areas"],
          },
        },
      )

      // GET /:id/competencies — List competencies for a practice area
      .get(
        "/:id/competencies",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          return deps.managePracticeAreas.listCompetencies(
            query.snapshotId,
            params.id,
          );
        },
        {
          params: t.Object({ id: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "List competencies for a practice area",
            tags: ["Taxonomy - Practice Areas"],
          },
        },
      )
  );
}

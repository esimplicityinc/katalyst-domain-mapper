import Elysia, { t } from "elysia";
import type { ManageAdoptions } from "../../../usecases/taxonomy/ManageAdoptions.js";
import {
  CreateIndividualAdoptionInputSchema,
  UpdateIndividualAdoptionInputSchema,
} from "@foe/schemas/taxonomy";

export function createIndividualAdoptionRoutes(deps: {
  manageAdoptions: ManageAdoptions;
}) {
  return (
    new Elysia({ prefix: "/taxonomy/persons/:personName/adoptions" })

      // GET / — List person's adoptions
      .get(
        "/",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          return deps.manageAdoptions.listIndividualAdoptions(
            query.snapshotId,
            params.personName,
          );
        },
        {
          params: t.Object({ personName: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "List adoptions for a person",
            tags: ["Taxonomy - Individual Adoptions"],
          },
        },
      )

      // GET /:practiceAreaId — Get individual adoption detail
      .get(
        "/:practiceAreaId",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const result = await deps.manageAdoptions.getIndividualAdoption(
            query.snapshotId,
            params.personName,
            params.practiceAreaId,
          );
          if (!result) {
            set.status = 404;
            return {
              error: `Adoption not found for person ${params.personName} / practice area ${params.practiceAreaId}`,
            };
          }
          return result;
        },
        {
          params: t.Object({
            personName: t.String(),
            practiceAreaId: t.String(),
          }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Get a person's adoption for a specific practice area",
            tags: ["Taxonomy - Individual Adoptions"],
          },
        },
      )

      // POST / — Create individual adoption
      .post(
        "/",
        async ({ params, body, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          // Merge personName from path into body
          const merged = { ...body as Record<string, unknown>, personName: params.personName };
          const parsed = CreateIndividualAdoptionInputSchema.safeParse(merged);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.flatten() };
          }
          try {
            const result = await deps.manageAdoptions.createIndividualAdoption(
              query.snapshotId,
              parsed.data,
            );
            set.status = 201;
            return result;
          } catch (err: unknown) {
            set.status = 409;
            return {
              error:
                err instanceof Error
                  ? err.message
                  : "Failed to create individual adoption",
            };
          }
        },
        {
          params: t.Object({ personName: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Create an adoption for a person",
            tags: ["Taxonomy - Individual Adoptions"],
          },
        },
      )

      // PUT /:practiceAreaId — Update individual adoption
      .put(
        "/:practiceAreaId",
        async ({ params, body, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const parsed = UpdateIndividualAdoptionInputSchema.safeParse(body);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.flatten() };
          }
          // Look up the adoption to get its internal ID
          const existing = await deps.manageAdoptions.getIndividualAdoption(
            query.snapshotId,
            params.personName,
            params.practiceAreaId,
          );
          if (!existing) {
            set.status = 404;
            return {
              error: `Adoption not found for person ${params.personName} / practice area ${params.practiceAreaId}`,
            };
          }
          try {
            const result = await deps.manageAdoptions.updateIndividualAdoption(
              query.snapshotId,
              existing.id,
              parsed.data,
            );
            return result;
          } catch (err: unknown) {
            set.status = 400;
            return {
              error:
                err instanceof Error
                  ? err.message
                  : "Failed to update individual adoption",
            };
          }
        },
        {
          params: t.Object({
            personName: t.String(),
            practiceAreaId: t.String(),
          }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Update a person's adoption for a specific practice area",
            tags: ["Taxonomy - Individual Adoptions"],
          },
        },
      )

      // DELETE /:practiceAreaId — Delete individual adoption
      .delete(
        "/:practiceAreaId",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const existing = await deps.manageAdoptions.getIndividualAdoption(
            query.snapshotId,
            params.personName,
            params.practiceAreaId,
          );
          if (!existing) {
            set.status = 404;
            return {
              error: `Adoption not found for person ${params.personName} / practice area ${params.practiceAreaId}`,
            };
          }
          try {
            await deps.manageAdoptions.deleteIndividualAdoption(
              query.snapshotId,
              existing.id,
            );
            return {
              message: "Individual adoption deleted",
              personName: params.personName,
              practiceAreaId: params.practiceAreaId,
            };
          } catch (err: unknown) {
            set.status = 400;
            return {
              error:
                err instanceof Error
                  ? err.message
                  : "Failed to delete individual adoption",
            };
          }
        },
        {
          params: t.Object({
            personName: t.String(),
            practiceAreaId: t.String(),
          }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Delete a person's adoption for a specific practice area",
            tags: ["Taxonomy - Individual Adoptions"],
          },
        },
      )
  );
}

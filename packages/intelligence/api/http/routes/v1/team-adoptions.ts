import Elysia, { t } from "elysia";
import type { ManageAdoptions } from "../../../usecases/taxonomy/ManageAdoptions.js";
import {
  CreateTeamAdoptionInputSchema,
  UpdateTeamAdoptionInputSchema,
} from "@foe/schemas/taxonomy";

export function createTeamAdoptionRoutes(deps: {
  manageAdoptions: ManageAdoptions;
}) {
  return (
    new Elysia({ prefix: "/taxonomy/teams/:name/adoptions" })

      // GET / — List team's adoptions
      .get(
        "/",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          return deps.manageAdoptions.listTeamAdoptions(
            query.snapshotId,
            params.name,
          );
        },
        {
          params: t.Object({ name: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "List adoptions for a team",
            tags: ["Taxonomy - Team Adoptions"],
          },
        },
      )

      // GET /:practiceAreaId — Get team adoption detail
      .get(
        "/:practiceAreaId",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const result = await deps.manageAdoptions.getTeamAdoption(
            query.snapshotId,
            params.name,
            params.practiceAreaId,
          );
          if (!result) {
            set.status = 404;
            return {
              error: `Adoption not found for team ${params.name} / practice area ${params.practiceAreaId}`,
            };
          }
          return result;
        },
        {
          params: t.Object({
            name: t.String(),
            practiceAreaId: t.String(),
          }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Get a team's adoption for a specific practice area",
            tags: ["Taxonomy - Team Adoptions"],
          },
        },
      )

      // POST / — Create team adoption
      .post(
        "/",
        async ({ params, body, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          // Merge teamName from path into body
          const merged = { ...body as Record<string, unknown>, teamName: params.name };
          const parsed = CreateTeamAdoptionInputSchema.safeParse(merged);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.flatten() };
          }
          try {
            const result = await deps.manageAdoptions.createTeamAdoption(
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
                  : "Failed to create team adoption",
            };
          }
        },
        {
          params: t.Object({ name: t.String() }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Create an adoption for a team",
            tags: ["Taxonomy - Team Adoptions"],
          },
        },
      )

      // PUT /:practiceAreaId — Update team adoption
      .put(
        "/:practiceAreaId",
        async ({ params, body, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const parsed = UpdateTeamAdoptionInputSchema.safeParse(body);
          if (!parsed.success) {
            set.status = 400;
            return { error: parsed.error.flatten() };
          }
          // Look up the adoption to get its internal ID
          const existing = await deps.manageAdoptions.getTeamAdoption(
            query.snapshotId,
            params.name,
            params.practiceAreaId,
          );
          if (!existing) {
            set.status = 404;
            return {
              error: `Adoption not found for team ${params.name} / practice area ${params.practiceAreaId}`,
            };
          }
          try {
            const result = await deps.manageAdoptions.updateTeamAdoption(
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
                  : "Failed to update team adoption",
            };
          }
        },
        {
          params: t.Object({
            name: t.String(),
            practiceAreaId: t.String(),
          }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Update a team's adoption for a specific practice area",
            tags: ["Taxonomy - Team Adoptions"],
          },
        },
      )

      // DELETE /:practiceAreaId — Delete team adoption
      .delete(
        "/:practiceAreaId",
        async ({ params, query, set }) => {
          if (!query.snapshotId) {
            set.status = 400;
            return { error: "snapshotId is required" };
          }
          const existing = await deps.manageAdoptions.getTeamAdoption(
            query.snapshotId,
            params.name,
            params.practiceAreaId,
          );
          if (!existing) {
            set.status = 404;
            return {
              error: `Adoption not found for team ${params.name} / practice area ${params.practiceAreaId}`,
            };
          }
          try {
            await deps.manageAdoptions.deleteTeamAdoption(
              query.snapshotId,
              existing.id,
            );
            return {
              message: "Team adoption deleted",
              teamName: params.name,
              practiceAreaId: params.practiceAreaId,
            };
          } catch (err: unknown) {
            set.status = 400;
            return {
              error:
                err instanceof Error
                  ? err.message
                  : "Failed to delete team adoption",
            };
          }
        },
        {
          params: t.Object({
            name: t.String(),
            practiceAreaId: t.String(),
          }),
          query: t.Object({
            snapshotId: t.Optional(t.String()),
          }),
          detail: {
            summary: "Delete a team's adoption for a specific practice area",
            tags: ["Taxonomy - Team Adoptions"],
          },
        },
      )
  );
}

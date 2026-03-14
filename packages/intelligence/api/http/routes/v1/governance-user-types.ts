import Elysia, { t } from "elysia";
import type { TaxonomyRepository, StoredUserType } from "../../../ports/TaxonomyRepository.js";

type CreateUserTypeBody = Omit<StoredUserType, 'storyCount' | 'capabilityCount'>;
type UpdateUserTypeBody = Partial<Omit<StoredUserType, 'id' | 'storyCount' | 'capabilityCount'>>;

export function createGovernanceUserTypeRoutes(deps: {
  governanceRepo: TaxonomyRepository;
}) {
  return (
    new Elysia({ prefix: "/taxonomy/user-types" })

      // GET / — List all user types
      .get(
        "/",
        async () => {
          return deps.governanceRepo.listUserTypes();
        },
        {
          detail: {
            summary: "List all user types from the latest governance snapshot",
            tags: ["Governance - User Types"],
          },
        },
      )

      // GET /:id — Get user type by ID
      .get(
        "/:id",
        async ({ params, set }) => {
          const userType = await deps.governanceRepo.getUserTypeById(params.id);
          if (!userType) {
            set.status = 404;
            return { error: `User type not found: ${params.id}` };
          }
          return userType;
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Get a user type by ID (UT-XXX)",
            tags: ["Governance - User Types"],
          },
        },
      )

      // POST / — Create user type
      .post(
        "/",
        async ({ body, set }) => {
          try {
            const userType = await deps.governanceRepo.createUserType(body as CreateUserTypeBody);
            set.status = 201;
            return userType;
          } catch (err: unknown) {
            set.status = 400;
            return { error: err instanceof Error ? err.message : "Failed to create user type" };
          }
        },
        {
          detail: {
            summary: "Create a new user type",
            tags: ["Governance - User Types"],
          },
        },
      )

      // PUT /:id — Update user type
      .put(
        "/:id",
        async ({ params, body, set }) => {
          const userType = await deps.governanceRepo.updateUserType(params.id, body as UpdateUserTypeBody);
          if (!userType) {
            set.status = 404;
            return { error: `User type not found: ${params.id}` };
          }
          return userType;
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Update a user type",
            tags: ["Governance - User Types"],
          },
        },
      )

      // DELETE /:id — Delete user type
      .delete(
        "/:id",
        async ({ params, set }) => {
          const deleted = await deps.governanceRepo.deleteUserType(params.id);
          if (!deleted) {
            set.status = 404;
            return { error: `User type not found: ${params.id}` };
          }
          return { message: "User type deleted", id: params.id };
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Delete a user type",
            tags: ["Governance - User Types"],
          },
        },
      )
  );
}

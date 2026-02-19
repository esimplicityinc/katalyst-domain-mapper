import Elysia, { t } from "elysia";
import type { GovernanceRepository, StoredUserStory } from "../../../ports/GovernanceRepository.js";

type UpdateUserStoryBody = Partial<Omit<StoredUserStory, 'id'>>;

export function createGovernanceUserStoryRoutes(deps: {
  governanceRepo: GovernanceRepository;
}) {
  return (
    new Elysia({ prefix: "/governance/user-stories" })

      // GET / — List all user stories
      .get(
        "/",
        async ({ query }) => {
          const stories = await deps.governanceRepo.listUserStories();
          // Optional filter by persona
          if (query.persona) {
            return stories.filter((s) => s.persona === query.persona);
          }
          // Optional filter by status
          if (query.status) {
            return stories.filter((s) => s.status === query.status);
          }
          return stories;
        },
        {
          query: t.Object({
            persona: t.Optional(t.String()),
            status: t.Optional(t.String()),
          }),
          detail: {
            summary: "List all user stories from the latest governance snapshot",
            tags: ["Governance - User Stories"],
          },
        },
      )

      // GET /:id — Get user story by ID
      .get(
        "/:id",
        async ({ params, set }) => {
          const story = await deps.governanceRepo.getUserStoryById(params.id);
          if (!story) {
            set.status = 404;
            return { error: `User story not found: ${params.id}` };
          }
          return story;
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Get a user story by ID (US-XXX)",
            tags: ["Governance - User Stories"],
          },
        },
      )

      // POST / — Create user story
      .post(
        "/",
        async ({ body, set }) => {
          try {
            const story = await deps.governanceRepo.createUserStory(body as StoredUserStory);
            set.status = 201;
            return story;
          } catch (err: unknown) {
            set.status = 400;
            return { error: err instanceof Error ? err.message : "Failed to create user story" };
          }
        },
        {
          detail: {
            summary: "Create a new user story",
            tags: ["Governance - User Stories"],
          },
        },
      )

      // PUT /:id — Update user story
      .put(
        "/:id",
        async ({ params, body, set }) => {
          const story = await deps.governanceRepo.updateUserStory(params.id, body as UpdateUserStoryBody);
          if (!story) {
            set.status = 404;
            return { error: `User story not found: ${params.id}` };
          }
          return story;
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Update a user story",
            tags: ["Governance - User Stories"],
          },
        },
      )

      // DELETE /:id — Delete user story
      .delete(
        "/:id",
        async ({ params, set }) => {
          const deleted = await deps.governanceRepo.deleteUserStory(params.id);
          if (!deleted) {
            set.status = 404;
            return { error: `User story not found: ${params.id}` };
          }
          return { message: "User story deleted", id: params.id };
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Delete a user story",
            tags: ["Governance - User Stories"],
          },
        },
      )
  );
}

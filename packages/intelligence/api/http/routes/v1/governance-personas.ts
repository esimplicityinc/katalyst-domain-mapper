import Elysia, { t } from "elysia";
import type { GovernanceRepository, StoredPersona } from "../../../ports/GovernanceRepository.js";

type CreatePersonaBody = Omit<StoredPersona, 'storyCount' | 'capabilityCount'>;
type UpdatePersonaBody = Partial<Omit<StoredPersona, 'id' | 'storyCount' | 'capabilityCount'>>;

export function createGovernancePersonaRoutes(deps: {
  governanceRepo: GovernanceRepository;
}) {
  return (
    new Elysia({ prefix: "/governance/personas" })

      // GET / — List all personas
      .get(
        "/",
        async () => {
          return deps.governanceRepo.listPersonas();
        },
        {
          detail: {
            summary: "List all personas from the latest governance snapshot",
            tags: ["Governance - Personas"],
          },
        },
      )

      // GET /:id — Get persona by ID
      .get(
        "/:id",
        async ({ params, set }) => {
          const persona = await deps.governanceRepo.getPersonaById(params.id);
          if (!persona) {
            set.status = 404;
            return { error: `Persona not found: ${params.id}` };
          }
          return persona;
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Get a persona by ID (PER-XXX)",
            tags: ["Governance - Personas"],
          },
        },
      )

      // POST / — Create persona
      .post(
        "/",
        async ({ body, set }) => {
          try {
            const persona = await deps.governanceRepo.createPersona(body as CreatePersonaBody);
            set.status = 201;
            return persona;
          } catch (err: unknown) {
            set.status = 400;
            return { error: err instanceof Error ? err.message : "Failed to create persona" };
          }
        },
        {
          detail: {
            summary: "Create a new persona",
            tags: ["Governance - Personas"],
          },
        },
      )

      // PUT /:id — Update persona
      .put(
        "/:id",
        async ({ params, body, set }) => {
          const persona = await deps.governanceRepo.updatePersona(params.id, body as UpdatePersonaBody);
          if (!persona) {
            set.status = 404;
            return { error: `Persona not found: ${params.id}` };
          }
          return persona;
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Update a persona",
            tags: ["Governance - Personas"],
          },
        },
      )

      // DELETE /:id — Delete persona
      .delete(
        "/:id",
        async ({ params, set }) => {
          const deleted = await deps.governanceRepo.deletePersona(params.id);
          if (!deleted) {
            set.status = 404;
            return { error: `Persona not found: ${params.id}` };
          }
          return { message: "Persona deleted", id: params.id };
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Delete a persona",
            tags: ["Governance - Personas"],
          },
        },
      )
  );
}

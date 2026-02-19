import Elysia, { t } from "elysia";
import type { GovernanceRepository, StoredCapability } from "../../../ports/GovernanceRepository.js";

type CreateCapabilityBody = Omit<StoredCapability, 'roadCount' | 'storyCount'>;
type UpdateCapabilityBody = Partial<Omit<StoredCapability, 'id' | 'roadCount' | 'storyCount'>>;

export function createGovernanceCapabilityRoutes(deps: {
  governanceRepo: GovernanceRepository;
}) {
  return (
    new Elysia({ prefix: "/governance/capabilities" })

      // GET / — List all capabilities from latest snapshot
      .get(
        "/",
        async () => {
          return deps.governanceRepo.listCapabilities();
        },
        {
          detail: {
            summary: "List all capabilities from the latest governance snapshot",
            tags: ["Governance - Capabilities"],
          },
        },
      )

      // GET /:id — Get capability by ID
      .get(
        "/:id",
        async ({ params, set }) => {
          const cap = await deps.governanceRepo.getCapabilityById(params.id);
          if (!cap) {
            set.status = 404;
            return { error: `Capability not found: ${params.id}` };
          }
          return cap;
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Get a capability by ID (CAP-XXX)",
            tags: ["Governance - Capabilities"],
          },
        },
      )

      // POST / — Create capability
      .post(
        "/",
        async ({ body, set }) => {
          try {
            const cap = await deps.governanceRepo.createCapability(body as CreateCapabilityBody);
            set.status = 201;
            return cap;
          } catch (err: unknown) {
            set.status = 400;
            return { error: err instanceof Error ? err.message : "Failed to create capability" };
          }
        },
        {
          detail: {
            summary: "Create a new capability",
            tags: ["Governance - Capabilities"],
          },
        },
      )

      // PUT /:id — Update capability
      .put(
        "/:id",
        async ({ params, body, set }) => {
          const cap = await deps.governanceRepo.updateCapability(params.id, body as UpdateCapabilityBody);
          if (!cap) {
            set.status = 404;
            return { error: `Capability not found: ${params.id}` };
          }
          return cap;
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Update a capability",
            tags: ["Governance - Capabilities"],
          },
        },
      )

      // DELETE /:id — Delete capability
      .delete(
        "/:id",
        async ({ params, set }) => {
          const deleted = await deps.governanceRepo.deleteCapability(params.id);
          if (!deleted) {
            set.status = 404;
            return { error: `Capability not found: ${params.id}` };
          }
          return { message: "Capability deleted", id: params.id };
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Delete a capability",
            tags: ["Governance - Capabilities"],
          },
        },
      )
  );
}

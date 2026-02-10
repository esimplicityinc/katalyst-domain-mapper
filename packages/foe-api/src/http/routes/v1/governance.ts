import Elysia, { t } from "elysia";
import type { IngestGovernanceSnapshot } from "../../../usecases/governance/IngestGovernanceSnapshot.js";
import type { QueryGovernanceState } from "../../../usecases/governance/QueryGovernanceState.js";
import type { GetCapabilityCoverage } from "../../../usecases/governance/GetCapabilityCoverage.js";
import type { GetGovernanceTrend } from "../../../usecases/governance/GetGovernanceTrend.js";
import type { ValidateTransition } from "../../../usecases/governance/ValidateTransition.js";
import type { GovernanceRepository } from "../../../ports/GovernanceRepository.js";
import { GovernanceNotFoundError } from "../../../domain/governance/GovernanceErrors.js";

export function createGovernanceRoutes(deps: {
  ingestGovernanceSnapshot: IngestGovernanceSnapshot;
  queryGovernanceState: QueryGovernanceState;
  getCapabilityCoverage: GetCapabilityCoverage;
  getGovernanceTrend: GetGovernanceTrend;
  governanceRepo: GovernanceRepository;
  validateTransition: ValidateTransition;
}) {
  return new Elysia({ prefix: "/governance" })

    // POST / — Ingest governance-index.json
    .post(
      "/",
      async ({ body }) => {
        const snapshot = await deps.ingestGovernanceSnapshot.execute(body);
        return snapshot;
      },
      {
        detail: { summary: "Ingest a governance index snapshot", tags: ["Governance"] },
      }
    )

    // GET /latest — Latest snapshot
    .get(
      "/latest",
      async ({ set }) => {
        const snapshot = await deps.queryGovernanceState.getLatest();
        if (!snapshot) {
          set.status = 404;
          return { error: "No governance snapshots found" };
        }
        return snapshot;
      },
      {
        detail: { summary: "Get the latest governance snapshot", tags: ["Governance"] },
      }
    )

    // GET /snapshots — List all snapshots
    .get(
      "/snapshots",
      async () => {
        return deps.queryGovernanceState.listSnapshots();
      },
      {
        detail: { summary: "List all governance snapshots", tags: ["Governance"] },
      }
    )

    // GET /snapshot/:id — Specific snapshot
    .get(
      "/snapshot/:id",
      async ({ params, set }) => {
        const snapshot = await deps.queryGovernanceState.getById(params.id);
        if (!snapshot) {
          throw new GovernanceNotFoundError(params.id);
        }
        return snapshot;
      },
      {
        params: t.Object({ id: t.String() }),
        detail: { summary: "Get a governance snapshot by ID", tags: ["Governance"] },
      }
    )

    // GET /roads — List road items (with ?status= filter)
    .get(
      "/roads",
      async ({ query }) => {
        const statusFilter = query.status ?? undefined;
        return deps.queryGovernanceState.getRoadItems(statusFilter);
      },
      {
        query: t.Object({
          status: t.Optional(t.String()),
        }),
        detail: { summary: "List road items with optional status filter", tags: ["Governance"] },
      }
    )

    // GET /coverage/capabilities — Capability coverage
    .get(
      "/coverage/capabilities",
      async () => {
        return deps.getCapabilityCoverage.getCapabilities();
      },
      {
        detail: { summary: "Get capability coverage report", tags: ["Governance"] },
      }
    )

    // GET /coverage/personas — Persona coverage
    .get(
      "/coverage/personas",
      async () => {
        return deps.getCapabilityCoverage.getPersonas();
      },
      {
        detail: { summary: "Get persona coverage report", tags: ["Governance"] },
      }
    )

    // GET /trends — Health trends
    .get(
      "/trends",
      async ({ query }) => {
        const limit = query.limit ? Number(query.limit) : undefined;
        return deps.getGovernanceTrend.execute(limit);
      },
      {
        query: t.Object({
          limit: t.Optional(t.String()),
        }),
        detail: { summary: "Get governance health trends", tags: ["Governance"] },
      }
    )

    // GET /integrity — Cross-reference integrity
    .get(
      "/integrity",
      async () => {
        return deps.queryGovernanceState.getIntegrity();
      },
      {
        detail: { summary: "Get cross-reference integrity report", tags: ["Governance"] },
      }
    )

    // DELETE / — Delete ALL snapshots (for BDD test isolation)
    .delete(
      "/",
      async () => {
        const snapshots = await deps.queryGovernanceState.listSnapshots();
        let deleted = 0;
        for (const snapshot of snapshots) {
          const ok = await deps.governanceRepo.deleteSnapshot(snapshot.id);
          if (ok) deleted++;
        }
        return { message: `Deleted ${deleted} governance snapshots`, count: deleted };
      },
      {
        detail: { summary: "Delete all governance snapshots", tags: ["Governance"] },
      }
    )

    // DELETE /:id — Delete snapshot (for BDD cleanup)
    .delete(
      "/:id",
      async ({ params, set }) => {
        const deleted = await deps.governanceRepo.deleteSnapshot(params.id);
        if (!deleted) {
          set.status = 404;
          return { error: `Governance snapshot not found: ${params.id}` };
        }
        return { message: "Governance snapshot deleted" };
      },
      {
        params: t.Object({ id: t.String() }),
        detail: { summary: "Delete a governance snapshot", tags: ["Governance"] },
      }
    )

    // POST /validate-transition — State machine validation
    .post(
      "/validate-transition",
      async ({ body, set }) => {
        const input = body as {
          roadId: string;
          currentStatus: string;
          targetStatus: string;
          governance: {
            adrs?: { validated?: boolean };
            bdd?: { status?: string };
            nfrs?: { status?: string };
          };
        };

        const result = deps.validateTransition.execute(input);

        if (!result.valid) {
          set.status = 400;
        }

        return result;
      },
      {
        detail: { summary: "Validate a road item state transition", tags: ["Governance"] },
      }
    );
}

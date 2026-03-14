import Elysia, { t } from "elysia";
import type { IngestTaxonomySnapshot } from "../../../usecases/taxonomy/IngestTaxonomySnapshot.js";
import type { QueryTaxonomyState } from "../../../usecases/taxonomy/QueryTaxonomyState.js";
import type { TaxonomyRepository } from "../../../ports/TaxonomyRepository.js";
import { TaxonomyNotFoundError } from "../../../domain/taxonomy/TaxonomyErrors.js";

export function createTaxonomyRoutes(deps: {
  ingestTaxonomySnapshot: IngestTaxonomySnapshot;
  queryTaxonomyState: QueryTaxonomyState;
  taxonomyRepo: TaxonomyRepository;
}) {
  return (
    new Elysia({ prefix: "/taxonomy" })

      // POST /snapshots/ — Ingest taxonomy snapshot
      .post(
        "/snapshots/",
        async ({ body }) => {
          const snapshot = await deps.ingestTaxonomySnapshot.execute(body);
          return snapshot;
        },
        {
          detail: {
            summary: "Ingest a taxonomy snapshot",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /snapshots/latest — Latest snapshot
      .get(
        "/snapshots/latest",
        async ({ set }) => {
          const snapshot = await deps.queryTaxonomyState.getLatest();
          if (!snapshot) {
            set.status = 404;
            return { error: "No taxonomy snapshots found" };
          }
          return snapshot;
        },
        {
          detail: {
            summary: "Get the latest taxonomy snapshot",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /snapshots/ — List all snapshots
      .get(
        "/snapshots/",
        async ({ query }) => {
          const limit = query.limit ? Number(query.limit) : undefined;
          return deps.queryTaxonomyState.listSnapshots(limit);
        },
        {
          query: t.Object({
            limit: t.Optional(t.String()),
          }),
          detail: {
            summary: "List all taxonomy snapshots",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /snapshots/:id — Specific snapshot
      .get(
        "/snapshots/:id",
        async ({ params }) => {
          const snapshot = await deps.queryTaxonomyState.getById(params.id);
          if (!snapshot) {
            throw new TaxonomyNotFoundError(params.id);
          }
          return snapshot;
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Get a taxonomy snapshot by ID",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /nodes — List nodes with optional type filter
      .get(
        "/nodes",
        async ({ query }) => {
          const typeFilter = query.type ?? undefined;
          return deps.queryTaxonomyState.getNodes(typeFilter);
        },
        {
          query: t.Object({
            type: t.Optional(t.String()),
          }),
          detail: {
            summary: "List taxonomy nodes with optional type filter",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /hierarchy — Tree-structured response
      .get(
        "/hierarchy",
        async () => {
          return deps.queryTaxonomyState.getHierarchy();
        },
        {
          detail: {
            summary: "Get taxonomy hierarchy as a tree",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /environments — All environments
      .get(
        "/environments",
        async () => {
          return deps.queryTaxonomyState.getEnvironments();
        },
        {
          detail: {
            summary: "Get taxonomy environments",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /plugins — Plugin counts
      .get(
        "/plugins",
        async () => {
          return deps.queryTaxonomyState.getPluginSummary();
        },
        {
          detail: {
            summary: "Get taxonomy plugin summary",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /nodes/:name/capabilities — Capabilities for a node
      .get(
        "/nodes/:name/capabilities",
        async ({ params }) => {
          const capabilities =
            await deps.queryTaxonomyState.getCapabilitiesForNode(params.name);
          return { node: params.name, capabilities };
        },
        {
          params: t.Object({ name: t.String() }),
          detail: {
            summary: "Get capabilities mapped to a taxonomy node",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /capabilities/tree — Capability hierarchy tree (latest snapshot)
      .get(
        "/capabilities/tree",
        async ({ set }) => {
          const tree = await deps.queryTaxonomyState.getCapabilityTree();
          if (tree.roots.length === 0 && tree.byName.size === 0) {
            set.status = 404;
            return { error: "No taxonomy capabilities found" };
          }
          return {
            roots: tree.roots,
            byName: Object.fromEntries(tree.byName),
          };
        },
        {
          detail: {
            summary: "Get capability hierarchy tree for the latest snapshot",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /capabilities/tree/:snapshotId — Capability hierarchy tree for a specific snapshot
      .get(
        "/capabilities/tree/:snapshotId",
        async ({ params, set }) => {
          const tree = await deps.queryTaxonomyState.getCapabilityTreeBySnapshotId(params.snapshotId);
          if (tree.roots.length === 0 && tree.byName.size === 0) {
            set.status = 404;
            return { error: `No taxonomy capabilities found for snapshot: ${params.snapshotId}` };
          }
          return {
            roots: tree.roots,
            byName: Object.fromEntries(tree.byName),
          };
        },
        {
          params: t.Object({ snapshotId: t.String() }),
          detail: {
            summary: "Get capability hierarchy tree for a specific snapshot",
            tags: ["Taxonomy"],
          },
        },
      )

      // DELETE /snapshots/ — Delete ALL snapshots
      .delete(
        "/snapshots/",
        async () => {
          const snapshots = await deps.queryTaxonomyState.listSnapshots();
          let deleted = 0;
          for (const snapshot of snapshots) {
            const ok = await deps.taxonomyRepo.deleteTaxonomySnapshot(snapshot.id);
            if (ok) deleted++;
          }
          return {
            message: `Deleted ${deleted} taxonomy snapshots`,
            count: deleted,
          };
        },
        {
          detail: {
            summary: "Delete all taxonomy snapshots",
            tags: ["Taxonomy"],
          },
        },
      )

      // DELETE /snapshots/:id — Delete specific snapshot
      .delete(
        "/snapshots/:id",
        async ({ params, set }) => {
          const deleted = await deps.taxonomyRepo.deleteTaxonomySnapshot(params.id);
          if (!deleted) {
            set.status = 404;
            return { error: `Taxonomy snapshot not found: ${params.id}` };
          }
          return { message: "Taxonomy snapshot deleted" };
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Delete a taxonomy snapshot",
            tags: ["Taxonomy"],
          },
        },
      )

      // ── Team & Person endpoints ──────────────────────────────────────────

      // GET /teams — List all teams from latest snapshot
      .get(
        "/teams",
        async () => {
          return deps.taxonomyRepo.getTeams();
        },
        {
          detail: {
            summary: "List all teams from the latest taxonomy snapshot",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /teams/:name — Get a team by name with full member details
      .get(
        "/teams/:name",
        async ({ params, set }) => {
          const team = await deps.taxonomyRepo.getTeamByName(params.name);
          if (!team) {
            set.status = 404;
            return { error: `Team not found: ${params.name}` };
          }
          return team;
        },
        {
          params: t.Object({ name: t.String() }),
          detail: {
            summary: "Get a team by name with members",
            tags: ["Taxonomy"],
          },
        },
      )

      // GET /persons — List all persons from latest snapshot with team memberships
      .get(
        "/persons",
        async () => {
          return deps.taxonomyRepo.getPersons();
        },
        {
          detail: {
            summary: "List all persons from the latest taxonomy snapshot",
            tags: ["Taxonomy"],
          },
        },
      )
  );
}

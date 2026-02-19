/**
 * Landscape API Routes
 *
 * Endpoints for the Business Landscape visualization that merges
 * taxonomy, governance, and domain model data.
 */

import Elysia, { t } from "elysia";
import type { QueryTaxonomyState } from "../../../usecases/taxonomy/QueryTaxonomyState.js";
import type { QueryGovernanceState } from "../../../usecases/governance/QueryGovernanceState.js";
import type { GetDomainModel } from "../../../usecases/domain-model/GetDomainModel.js";
import type { TaxonomyRepository, TaxonomyHierarchy, StoredTaxonomySnapshot } from "../../../ports/TaxonomyRepository.js";
import type { GovernanceRepository, StoredSnapshot } from "../../../ports/GovernanceRepository.js";
import type { ValidatedSnapshotData } from "../../../domain/governance/validateSnapshotData.js";
import type {
  LandscapeGraph,
  LandscapeCapability,
  LandscapeCapabilityNode,
  ResolvedContext,
  LandscapeEvent,
  LandscapePersona,
  LandscapeUserStory,
  LandscapeWorkflow,
} from "../../../types/landscape.js";
import {
  buildContextLookup,
  resolveEventConsumers,
  inferUnknownSystems,
} from "../../../utils/landscape-resolver.js";

// ── Augmented repo types ───────────────────────────────────────────────────

type GovernanceRepoDeps = GovernanceRepository & {
  getLatestSnapshotByProject?: (project: string) => Promise<StoredSnapshot | null>;
  getRawIndex?: (snapshotId: string) => Promise<ValidatedSnapshotData | null>;
};

type TaxonomyRepoDeps = TaxonomyRepository & {
  getHierarchyBySnapshotId?: (id: string) => Promise<TaxonomyHierarchy>;
  listSnapshots?: (limit?: number) => Promise<StoredTaxonomySnapshot[]>;
};

interface LandscapeDeps {
  queryTaxonomyState: QueryTaxonomyState;
  queryGovernanceState: QueryGovernanceState;
  getDomainModel: GetDomainModel;
  governanceRepo: GovernanceRepoDeps;
  taxonomyRepo: TaxonomyRepoDeps;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toCapabilityNode(
  node: { name: string; description: string; tag: string | null; declaredStatus: "planned" | "stable" | "deprecated"; derivedStatus: "planned" | "stable" | "deprecated"; taxonomyNodes: string[]; children: unknown[] },
): LandscapeCapabilityNode {
  return {
    id: node.name,
    name: node.name,
    description: node.description,
    tag: node.tag,
    status: node.declaredStatus,
    derivedStatus: node.derivedStatus,
    taxonomyNodes: node.taxonomyNodes,
    children: (node.children as typeof node[]).map(toCapabilityNode),
  };
}

// ── Routes ─────────────────────────────────────────────────────────────────

export function createLandscapeRoutes(deps: LandscapeDeps) {
  return new Elysia({ prefix: "/landscape" })
    /**
     * GET /landscape/:domainModelId
     *
     * Get complete business landscape graph for a domain model.
     * Merges taxonomy, governance, and domain model data.
     */
    .get(
      "/:domainModelId",
      async ({ params }) => {
        const { domainModelId } = params;

        // Fetch the domain model
        const domainModel = await deps.getDomainModel.execute(domainModelId);
        if (!domainModel) {
          throw new Error(`Domain model ${domainModelId} not found`);
        }

        // Derive root system names from bounded context taxonomyNode FQTNs
        const systemNames = new Set<string>();
        for (const ctx of domainModel.boundedContexts) {
          const tn = ctx.taxonomyNode;
          if (tn && tn !== "taxonomy_node") {
            systemNames.add(tn.split(".")[0]);
          }
        }

        // Find the taxonomy snapshot whose nodes include these system names
        let taxonomySnapshot: StoredTaxonomySnapshot | null = null;
        let taxonomyHierarchy: TaxonomyHierarchy | null = null;
        let governanceSnapshot: StoredSnapshot | null = null;
        let governanceRawIndex: ValidatedSnapshotData | null = null;

        if (systemNames.size > 0) {
          const taxSnapshots = await deps.taxonomyRepo.listSnapshots?.(50) ?? [];
          for (const snap of taxSnapshots) {
            const hier = await deps.taxonomyRepo.getHierarchyBySnapshotId?.(snap.id).catch(() => null);
            if (!hier) continue;
            const snapSystemNames = new Set(hier.systems.map((s) => s.name));
            const hasMatch = [...systemNames].some((name) => snapSystemNames.has(name));
            if (hasMatch) {
              taxonomySnapshot = snap;
              taxonomyHierarchy = hier;
              governanceSnapshot = await deps.governanceRepo.getLatestSnapshotByProject?.(snap.project).catch(() => null) ?? null;
              if (governanceSnapshot) {
                governanceRawIndex = await deps.governanceRepo.getRawIndex?.(governanceSnapshot.id).catch(() => null) ?? null;
              }
              break;
            }
          }

          // Fallback: latest taxonomy
          if (!taxonomyHierarchy) {
            taxonomySnapshot = await deps.queryTaxonomyState.getLatest().catch(() => null);
            taxonomyHierarchy = taxonomySnapshot
              ? await deps.taxonomyRepo.getHierarchyBySnapshotId?.(taxonomySnapshot.id).catch(() => null) ?? null
              : null;
          }
        } else {
          // No taxonomy nodes on contexts — fall back to latest
          taxonomySnapshot = await deps.queryTaxonomyState.getLatest().catch(() => null);
          taxonomyHierarchy = taxonomySnapshot
            ? await deps.taxonomyRepo.getHierarchyBySnapshotId?.(taxonomySnapshot.id).catch(() => null) ?? null
            : null;
        }

        // Fallback: latest governance
        if (!governanceSnapshot) {
          governanceSnapshot = await deps.queryGovernanceState.getLatest().catch(() => null);
          governanceRawIndex = governanceSnapshot
            ? await deps.governanceRepo.getRawIndex?.(governanceSnapshot.id).catch(() => null) ?? null
            : null;
        }

        // ── 1. Resolved contexts ───────────────────────────────────────────
        const VALID_CONTEXT_TYPES = ["internal", "external-system", "human-process", "unknown"];
        const contexts: ResolvedContext[] = domainModel.boundedContexts.map((ctx) => ({
          id: ctx.id,
          slug: ctx.slug,
          title: ctx.title,
          contextType: (VALID_CONTEXT_TYPES.includes(ctx.contextType ?? "") ? ctx.contextType : "internal") as ResolvedContext["contextType"],
          taxonomyNode: (ctx.taxonomyNode && ctx.taxonomyNode !== "taxonomy_node") ? ctx.taxonomyNode : undefined,
          subdomainType: ctx.subdomainType as ResolvedContext["subdomainType"],
          teamOwnership: ctx.teamOwnership ?? undefined,
        }));

        const contextLookup = buildContextLookup(contexts);

        // ── 2. Events ──────────────────────────────────────────────────────
        const events: LandscapeEvent[] = domainModel.domainEvents.map((event) => {
          const { resolved, unresolved } = resolveEventConsumers(
            event.consumedBy ?? [],
            contextLookup,
          );
          const sourceContext = contextLookup.byId.get(event.contextId);
          return {
            id: event.id,
            slug: event.slug,
            title: event.title,
            sourceContextId: event.contextId,
            sourceContextSlug: sourceContext?.slug ?? "",
            consumedBy: event.consumedBy ?? [],
            resolvedConsumers: resolved,
            unresolvedConsumers: unresolved,
            triggers: event.triggers ?? [],
            sideEffects: event.sideEffects ?? [],
            payload: (event.payload as LandscapeEvent["payload"]) ?? [],
            sourceCapabilityId: event.sourceCapabilityId ?? undefined,
            targetCapabilityIds: event.targetCapabilityIds ?? [],
          };
        });

        // ── 3. Infer unknown systems ───────────────────────────────────────
        const inferredSystems = inferUnknownSystems(
          events.map((e) => ({ id: e.id, consumedBy: e.consumedBy })),
          contextLookup,
        );

        // ── 4. Load taxonomy capability tree ──────────────────────────────
        // Build both a flat list and a tree view from taxonomy capabilities.
        // Governance CAP-XXX capabilities that share a tag with a taxonomy
        // capability are merged (taxonomy wins for hierarchy; governance adds
        // roadCount / storyCount metadata).
        let capabilityTree: LandscapeCapabilityNode[] = [];
        const taxCapByName = new Map<string, {
          name: string; description: string; tag: string | null;
          declaredStatus: "planned" | "stable" | "deprecated";
          derivedStatus: "planned" | "stable" | "deprecated";
          taxonomyNodes: string[]; parentName: string | null;
          children: unknown[];
        }>();

        if (taxonomySnapshot) {
          const tree = await deps.taxonomyRepo
            .getCapabilityTreeBySnapshotId(taxonomySnapshot.id)
            .catch(() => null);

          if (tree) {
            // Convert tree roots to LandscapeCapabilityNode[]
            capabilityTree = tree.roots.map((r) => toCapabilityNode(
              r as { name: string; description: string; tag: string | null; declaredStatus: "planned" | "stable" | "deprecated"; derivedStatus: "planned" | "stable" | "deprecated"; taxonomyNodes: string[]; children: unknown[] },
            ));

            // Flatten to map for merging
            for (const [name, node] of tree.byName) {
              taxCapByName.set(name, {
                name: node.name,
                description: node.description,
                tag: node.tag,
                declaredStatus: node.declaredStatus,
                derivedStatus: node.derivedStatus,
                taxonomyNodes: node.taxonomyNodes,
                parentName: null, // will be resolved via parentCapability
                children: node.children,
              });
            }
            // Resolve parentName by checking children relationships in byName
            for (const [parentName, parentNode] of tree.byName) {
              for (const child of parentNode.children as { name: string }[]) {
                const childEntry = taxCapByName.get(child.name);
                if (childEntry) childEntry.parentName = parentName;
              }
            }
          }
        }

        // ── 5. Build merged capability flat list ──────────────────────────
        // Index governance caps by tag for merge lookup
        const govCapsByTag = new Map<string, Record<string, unknown>>();
        const govRawCaps: Record<string, unknown>[] = governanceRawIndex?.capabilities
          ? Object.values(governanceRawIndex.capabilities as Record<string, unknown>) as Record<string, unknown>[]
          : [];

        for (const cap of govRawCaps) {
          const tag = cap["tag"] as string | undefined;
          if (tag) govCapsByTag.set(tag, cap);
        }

        // Also index by CAP-XXX id for cases where taxonomy tag = governance id
        const govCapsById = new Map<string, Record<string, unknown>>();
        for (const cap of govRawCaps) {
          const id = cap["id"] as string | undefined;
          if (id) govCapsById.set(id, cap);
        }

        const capabilities: LandscapeCapability[] = [];
        const emittedCapNames = new Set<string>();

        // First: taxonomy capabilities (possibly merged with governance)
        for (const [, tc] of taxCapByName) {
          const govMatch = (tc.tag ? govCapsById.get(tc.tag) ?? govCapsByTag.get(tc.tag) : null);
          emittedCapNames.add(tc.name);
          if (tc.tag) emittedCapNames.add(tc.tag);

          const validStatus = (s: unknown): "planned" | "stable" | "deprecated" =>
            s === "planned" || s === "stable" || s === "deprecated" ? s : "stable";

          capabilities.push({
            id: tc.tag ?? tc.name, // prefer tag (CAP-XXX) for backward-compat
            name: (govMatch?.["title"] as string | undefined) ?? tc.name,
            category: (govMatch?.["category"] as string | undefined) ?? (tc.taxonomyNodes[0] ?? ""),
            taxonomyNode: tc.taxonomyNodes[0],
            tag: tc.tag ?? undefined,
            status: govMatch ? validStatus(govMatch["status"]) : tc.declaredStatus,
            derivedStatus: tc.derivedStatus,
            source: govMatch ? "merged" : "taxonomy",
            parentName: tc.parentName,
            taxonomyNodes: tc.taxonomyNodes,
          });
        }

        // Second: governance-only capabilities (not matched to any taxonomy cap)
        for (const cap of govRawCaps) {
          const capId = cap["id"] as string | undefined;
          const capTag = cap["tag"] as string | undefined;
          if (!capId) continue;
          // Skip if already emitted via taxonomy merge
          if (emittedCapNames.has(capId) || (capTag && emittedCapNames.has(capTag))) continue;

          const validStatus = (s: unknown): "planned" | "stable" | "deprecated" =>
            s === "planned" || s === "stable" || s === "deprecated" ? s : "stable";

          capabilities.push({
            id: capId,
            name: (cap["title"] as string | undefined) ?? capId,
            category: (cap["category"] as string | undefined) ?? "",
            taxonomyNode: cap["taxonomyNode"] as string | undefined,
            tag: capTag,
            status: validStatus(cap["status"]),
            derivedStatus: validStatus(cap["status"]),
            source: "governance",
            parentName: null,
            taxonomyNodes: [],
          });
        }

        // ── 6. Build capsByTaxNode for workflow inference ──────────────────
        const capsByTaxNode = new Map<string, string[]>();
        for (const cap of capabilities) {
          if (!cap.taxonomyNode) continue;
          const parts = cap.taxonomyNode.split(".");
          for (let i = 1; i <= parts.length; i++) {
            const prefix = parts.slice(0, i).join(".");
            if (!capsByTaxNode.has(prefix)) capsByTaxNode.set(prefix, []);
            capsByTaxNode.get(prefix)!.push(cap.id);
          }
        }

        // ── 7. Workflows ───────────────────────────────────────────────────
        const workflows: LandscapeWorkflow[] = domainModel.workflows.map((wf) => {
          const ctxIds: string[] = wf.contextIds ?? [];
          const seen = new Set<string>();
          const capabilityIds: string[] = [];
          for (const cid of ctxIds) {
            const ctx = contextLookup.byId.get(cid);
            if (!ctx?.taxonomyNode) continue;
            for (const capId of capsByTaxNode.get(ctx.taxonomyNode) ?? []) {
              if (!seen.has(capId)) { seen.add(capId); capabilityIds.push(capId); }
            }
          }
          return {
            id: wf.id,
            slug: wf.slug,
            title: wf.title,
            description: wf.description ?? undefined,
            contextIds: ctxIds,
            capabilityIds,
            states: (wf.states as LandscapeWorkflow["states"]) ?? [],
            transitions: (wf.transitions as LandscapeWorkflow["transitions"]) ?? [],
          };
        });

        // ── 8. Personas ────────────────────────────────────────────────────
        const personas: LandscapePersona[] = governanceRawIndex?.personas
          ? Object.values(governanceRawIndex.personas as Record<string, unknown>).map((p) => {
              const persona = p as Record<string, unknown>;
              return {
                id: persona["id"] as string,
                name: persona["name"] as string,
                type: (persona["type"] ?? "human") as LandscapePersona["type"],
                archetype: persona["archetype"] as string | undefined,
                typicalCapabilities: (persona["typicalCapabilities"] as string[]) ?? [],
                tag: (persona["tag"] as string) ?? "",
              };
            })
          : [];

        // ── 9. User stories ────────────────────────────────────────────────
        const userStories: LandscapeUserStory[] = governanceRawIndex?.userStories
          ? Object.values(governanceRawIndex.userStories as Record<string, unknown>).map((s) => {
              const story = s as Record<string, unknown>;
              return {
                id: story["id"] as string,
                title: story["title"] as string,
                persona: story["persona"] as string,
                capabilities: (story["capabilities"] as string[]) ?? [],
                status: (story["status"] ?? "draft") as LandscapeUserStory["status"],
              };
            })
          : [];

        // ── 10. System hierarchy ───────────────────────────────────────────
        const systems = (taxonomyHierarchy?.systems ?? []) as LandscapeGraph["systems"];

        // ── 11. Assemble landscape graph ───────────────────────────────────
        const landscape: LandscapeGraph = {
          systems,
          contexts,
          events,
          workflows,
          capabilities,
          capabilityTree,
          personas,
          userStories,
          inferredSystems,
          domainModelId: domainModel.id,
          taxonomySnapshotId: taxonomySnapshot?.id,
          governanceSnapshotId: governanceSnapshot?.id,
          generatedAt: new Date().toISOString(),
        };

        return landscape;
      },
      {
        params: t.Object({
          domainModelId: t.String(),
        }),
      },
    );
}

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
import type {
  LandscapeGraph,
  ResolvedContext,
  LandscapeEvent,
  LandscapeCapability,
  LandscapePersona,
  LandscapeUserStory,
  LandscapeWorkflow,
} from "../../../types/landscape.js";
import {
  buildContextLookup,
  resolveEventConsumers,
  inferUnknownSystems,
} from "../../../utils/landscape-resolver.js";

interface LandscapeDeps {
  queryTaxonomyState: QueryTaxonomyState;
  queryGovernanceState: QueryGovernanceState;
  getDomainModel: GetDomainModel;
  governanceRepo: any; // Will have getRawIndex
  taxonomyRepo: any; // Will have getHierarchy
}

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

        // First fetch the domain model to get its bounded contexts
        const domainModel = await deps.getDomainModel.execute(domainModelId);

        if (!domainModel) {
          throw new Error(`Domain model ${domainModelId} not found`);
        }

        // Derive the project name by finding which taxonomy snapshot contains
        // the system names referenced by this model's bounded contexts.
        // Extract root system names from bounded context taxonomyNode FQTNs.
        const systemNames = new Set<string>();
        for (const ctx of domainModel.boundedContexts) {
          const tn = ctx.taxonomyNode;
          if (tn && tn !== "taxonomy_node") {
            // Root system is the first segment of the FQTN (e.g. "prima" from "prima.engine.aiox")
            systemNames.add(tn.split(".")[0]);
          }
        }

        // Find the taxonomy snapshot whose nodes include these system names
        let taxonomySnapshot = null;
        let taxonomyHierarchy = null;
        let governanceSnapshot = null;
        let governanceRawIndex = null;

        if (systemNames.size > 0) {
          // List recent taxonomy snapshots and find one whose project matches
          const taxSnapshots = await deps.taxonomyRepo.listSnapshots(50);
          for (const snap of taxSnapshots) {
            // Check if this snapshot's nodes contain any of our system names
            const nodes = deps.db
              ? null // Not available directly, try by project matching
              : null;

            // Try matching by looking at taxonomy nodes for this snapshot
            taxonomySnapshot = snap;
            taxonomyHierarchy = await deps.taxonomyRepo.getHierarchyBySnapshotId?.(snap.id).catch(() => null);
            if (taxonomyHierarchy) {
              const snapSystemNames = new Set(
                taxonomyHierarchy.systems.map((s: any) => s.name)
              );
              // Check if any of our system names are in this snapshot
              const hasMatch = [...systemNames].some((name) => snapSystemNames.has(name));
              if (hasMatch) {
                // Found matching taxonomy snapshot — now find governance by same project
                governanceSnapshot = await deps.governanceRepo.getLatestSnapshotByProject?.(snap.project).catch(() => null);
                if (governanceSnapshot) {
                  governanceRawIndex = await deps.governanceRepo.getRawIndex?.(governanceSnapshot.id).catch(() => null);
                }
                break;
              }
            }
          }

          // If no match found via hierarchy, fall back to latest
          if (!taxonomyHierarchy) {
            taxonomySnapshot = await deps.queryTaxonomyState.getLatest().catch(() => null);
            taxonomyHierarchy = taxonomySnapshot
              ? await deps.taxonomyRepo.getHierarchy().catch(() => null)
              : null;
          }
        } else {
          // No taxonomy nodes on contexts — fall back to latest
          taxonomySnapshot = await deps.queryTaxonomyState.getLatest().catch(() => null);
          taxonomyHierarchy = taxonomySnapshot
            ? await deps.taxonomyRepo.getHierarchy().catch(() => null)
            : null;
        }

        // If governance wasn't found via project match, fall back to latest
        if (!governanceSnapshot) {
          governanceSnapshot = await deps.queryGovernanceState.getLatest().catch(() => null);
          governanceRawIndex = governanceSnapshot
            ? await deps.governanceRepo.getRawIndex?.(governanceSnapshot.id).catch(() => null)
            : null;
        }

        // 1. Build resolved contexts
        const VALID_CONTEXT_TYPES = ["internal", "external-system", "human-process", "unknown"];
        const contexts: ResolvedContext[] = domainModel.boundedContexts.map((ctx: any) => ({
          id: ctx.id,
          slug: ctx.slug,
          title: ctx.title,
          contextType: VALID_CONTEXT_TYPES.includes(ctx.contextType) ? ctx.contextType : "internal",
          taxonomyNode: (ctx.taxonomyNode && ctx.taxonomyNode !== "taxonomy_node") ? ctx.taxonomyNode : undefined,
          subdomainType: ctx.subdomainType,
          teamOwnership: ctx.teamOwnership,
        }));

        const contextLookup = buildContextLookup(contexts);

        // 2. Build landscape events with resolution
        const events: LandscapeEvent[] = domainModel.domainEvents.map((event: any) => {
          const { resolved, unresolved } = resolveEventConsumers(
            event.consumedBy || [],
            contextLookup
          );

          const sourceContext = contextLookup.byId.get(event.contextId);

          return {
            id: event.id,
            slug: event.slug,
            title: event.title,
            sourceContextId: event.contextId,
            sourceContextSlug: sourceContext?.slug || "",
            consumedBy: event.consumedBy || [],
            resolvedConsumers: resolved,
            unresolvedConsumers: unresolved,
            triggers: event.triggers || [],
            sideEffects: event.sideEffects || [],
            payload: event.payload || [],
            sourceCapabilityId: event.sourceCapabilityId || undefined,
            targetCapabilityIds: event.targetCapabilityIds || [],
          };
        });

        // 3. Infer unknown systems
        const inferredSystems = inferUnknownSystems(
          events.map((e) => ({ id: e.id, consumedBy: e.consumedBy })),
          contextLookup
        );

        // 4. Build workflows (with inferred capabilityIds)
        // For each workflow, find capabilities whose taxonomyNode matches
        // or is a parent/child of the workflow's context taxonomyNodes.
        const capsByTaxNode = new Map<string, string[]>(); // taxonomyNode -> capId[]

        // Pre-build cap lookup after capabilities are built (step 5 moved up)
        const capabilities: LandscapeCapability[] = governanceRawIndex?.capabilities
          ? Object.values(governanceRawIndex.capabilities).map((cap: any) => ({
              id: cap.id,
              name: cap.title,
              category: cap.category,
              taxonomyNode: cap.taxonomyNode,
              tag: cap.tag,
              status: cap.status,
            }))
          : [];

        for (const cap of capabilities) {
          if (!cap.taxonomyNode) continue;
          // Index by exact FQTN and all ancestor FQTNs
          const parts = cap.taxonomyNode.split(".");
          for (let i = 1; i <= parts.length; i++) {
            const prefix = parts.slice(0, i).join(".");
            if (!capsByTaxNode.has(prefix)) capsByTaxNode.set(prefix, []);
            capsByTaxNode.get(prefix)!.push(cap.id);
          }
        }

        const workflows: LandscapeWorkflow[] = domainModel.workflows.map((wf: any) => {
          const ctxIds: string[] = wf.contextIds || [];

          // For each context in the workflow, find capabilities on that context's taxonomy node
          const seen = new Set<string>();
          const capabilityIds: string[] = [];
          for (const cid of ctxIds) {
            const ctx = contextLookup.byId.get(cid);
            if (!ctx?.taxonomyNode) continue;
            const caps = capsByTaxNode.get(ctx.taxonomyNode) || [];
            for (const capId of caps) {
              if (!seen.has(capId)) {
                seen.add(capId);
                capabilityIds.push(capId);
              }
            }
          }

          return {
            id: wf.id,
            slug: wf.slug,
            title: wf.title,
            description: wf.description,
            contextIds: ctxIds,
            capabilityIds,
            states: wf.states || [],
            transitions: wf.transitions || [],
          };
        });

        // 5. Build personas (from governance)
        const personas: LandscapePersona[] = governanceRawIndex?.personas
          ? Object.values(governanceRawIndex.personas).map((persona: any) => ({
              id: persona.id,
              name: persona.name,
              type: persona.type,
              archetype: persona.archetype,
              typicalCapabilities: persona.typicalCapabilities || [],
              tag: persona.tag,
            }))
          : [];

        // 6. Build user stories (from governance)
        const userStories: LandscapeUserStory[] = governanceRawIndex?.userStories
          ? Object.values(governanceRawIndex.userStories).map((story: any) => ({
              id: story.id,
              title: story.title,
              persona: story.persona,
              capabilities: story.capabilities || [],
              status: story.status,
            }))
          : [];

        // 7. Build system hierarchy (from taxonomy)
        const systems = taxonomyHierarchy?.systems || [];

        // 8. Assemble the complete landscape graph
        const landscape: LandscapeGraph = {
          systems,
          contexts,
          events,
          workflows,
          capabilities,
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
      }
    );
}

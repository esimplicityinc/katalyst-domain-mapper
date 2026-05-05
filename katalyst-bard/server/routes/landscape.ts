import type { Application } from 'express';

interface AppKit {
  lakebase: {
    query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface ContextLookup {
  byId: Map<string, { id: string; slug: string; title: string; taxonomyNode?: string }>;
  bySlug: Map<string, { id: string; slug: string; title: string; taxonomyNode?: string }>;
}

function buildContextLookup(
  contexts: { id: string; slug: string; title: string; taxonomyNode?: string }[]
): ContextLookup {
  const byId = new Map<string, { id: string; slug: string; title: string; taxonomyNode?: string }>();
  const bySlug = new Map<string, { id: string; slug: string; title: string; taxonomyNode?: string }>();
  for (const ctx of contexts) {
    byId.set(ctx.id, ctx);
    bySlug.set(ctx.slug, ctx);
  }
  return { byId, bySlug };
}

function resolveEventConsumers(
  consumedBy: string[],
  lookup: ContextLookup
): { resolved: string[]; unresolved: string[] } {
  const resolved: string[] = [];
  const unresolved: string[] = [];
  for (const ref of consumedBy) {
    if (lookup.bySlug.has(ref) || lookup.byId.has(ref)) {
      resolved.push(ref);
    } else {
      unresolved.push(ref);
    }
  }
  return { resolved, unresolved };
}

function inferUnknownSystems(
  events: { id: string; consumedBy: string[] }[],
  lookup: ContextLookup
): string[] {
  const unknowns = new Set<string>();
  for (const event of events) {
    for (const ref of event.consumedBy) {
      if (!lookup.bySlug.has(ref) && !lookup.byId.has(ref)) {
        unknowns.add(ref);
      }
    }
  }
  return [...unknowns];
}

// ── Capability tree helpers ──────────────────────────────────────────────────

interface CapNode {
  name: string;
  description: string;
  tag: string | null;
  parent_capability: string | null;
  taxonomyNodes: string[];
  children: CapNode[];
}

function buildCapabilityTree(
  caps: Record<string, unknown>[],
  capRels: Record<string, unknown>[]
): { roots: CapNode[]; byName: Map<string, CapNode> } {
  // Build taxonomy node lookup from capability rels
  const capTaxonomyNodes = new Map<string, string[]>();
  for (const rel of capRels) {
    const capNames = rel.capabilities as string[] | undefined;
    for (const capName of capNames ?? []) {
      if (!capTaxonomyNodes.has(capName)) capTaxonomyNodes.set(capName, []);
      capTaxonomyNodes.get(capName)!.push(rel.node as string);
    }
  }

  const byName = new Map<string, CapNode>();
  for (const cap of caps) {
    byName.set(cap.name as string, {
      name: cap.name as string,
      description: (cap.description as string) ?? '',
      tag: (cap.tag as string) ?? null,
      parent_capability: (cap.parent_capability as string) ?? null,
      taxonomyNodes: capTaxonomyNodes.get(cap.name as string) ?? [],
      children: [],
    });
  }

  const roots: CapNode[] = [];
  for (const node of byName.values()) {
    if (node.parent_capability && byName.has(node.parent_capability)) {
      byName.get(node.parent_capability)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return { roots, byName };
}

// ── Routes ───────────────────────────────────────────────────────────────────

export async function setupLandscapeRoutes(appkit: AppKit) {
  const q = appkit.lakebase.query.bind(appkit.lakebase);

  appkit.server.extend((app) => {
    /**
     * GET /landscape/:domainModelId
     *
     * Get complete business landscape graph for a domain model.
     * Merges taxonomy, governance, and domain model data.
     */
    app.get('/api/v1/landscape/:domainModelId', async (req, res) => {
      try {
        const domainModelId = req.params.domainModelId;

        // 1. Fetch the domain model
        const { rows: modelRows } = await q(
          `SELECT * FROM katalyst.domain_models WHERE id = $1`,
          [domainModelId]
        );
        if (modelRows.length === 0) {
          res.status(404).json({ error: `Domain model not found: ${domainModelId}` });
          return;
        }

        // 2. Fetch all domain model children
        const [ctxRes, eventsRes, workflowsRes] = await Promise.all([
          q(`SELECT * FROM katalyst.bounded_contexts WHERE domain_model_id = $1 ORDER BY title`, [domainModelId]),
          q(`SELECT * FROM katalyst.domain_events WHERE domain_model_id = $1 ORDER BY title`, [domainModelId]),
          q(`SELECT * FROM katalyst.domain_workflows WHERE domain_model_id = $1 ORDER BY title`, [domainModelId]),
        ]);

        const boundedContexts = ctxRes.rows;
        const domainEvents = eventsRes.rows;
        const domainWorkflows = workflowsRes.rows;

        // 3. Build resolved contexts
        const VALID_CONTEXT_TYPES = ['internal', 'external-system', 'human-process', 'unknown'];
        const contexts = boundedContexts.map((ctx) => ({
          id: ctx.id as string,
          slug: ctx.slug as string,
          title: ctx.title as string,
          contextType: VALID_CONTEXT_TYPES.includes((ctx.context_type as string) ?? '')
            ? (ctx.context_type as string)
            : 'internal',
          taxonomyNode:
            ctx.taxonomy_node && ctx.taxonomy_node !== 'taxonomy_node'
              ? (ctx.taxonomy_node as string)
              : undefined,
          subdomainType: (ctx.subdomain_type as string) ?? undefined,
          teamOwnership: (ctx.team_ownership as string) ?? undefined,
          ownerTeam: (ctx.owner_team as string) ?? undefined,
        }));

        const contextLookup = buildContextLookup(contexts);

        // 4. Build events
        const events = domainEvents.map((event) => {
          const consumedBy = (event.consumed_by as string[]) ?? [];
          const { resolved, unresolved } = resolveEventConsumers(consumedBy, contextLookup);
          const sourceContext = contextLookup.byId.get(event.context_id as string);

          return {
            id: event.id as string,
            slug: event.slug as string,
            title: event.title as string,
            sourceContextId: event.context_id as string,
            sourceContextSlug: sourceContext?.slug ?? '',
            consumedBy,
            resolvedConsumers: resolved,
            unresolvedConsumers: unresolved,
            triggers: (event.triggers as string[]) ?? [],
            sideEffects: (event.side_effects as string[]) ?? [],
            payload: (event.payload as unknown[]) ?? [],
            sourceCapabilityId: (event.source_capability_id as string) ?? undefined,
            targetCapabilityIds: (event.target_capability_ids as string[]) ?? [],
          };
        });

        // 5. Infer unknown systems from unresolved consumer references
        const inferredSystems = inferUnknownSystems(
          events.map((e) => ({ id: e.id, consumedBy: e.consumedBy })),
          contextLookup
        );

        // 6. Find matching taxonomy snapshot
        // Derive root system names from bounded context taxonomy FQTNs
        const systemNames = new Set<string>();
        for (const ctx of contexts) {
          if (ctx.taxonomyNode) {
            systemNames.add(ctx.taxonomyNode.split('.')[0]);
          }
        }

        let taxonomySnapshotId: string | null = null;
        let taxonomyNodes: Record<string, unknown>[] = [];
        let taxonomyCapabilities: Record<string, unknown>[] = [];
        let taxonomyCapRels: Record<string, unknown>[] = [];

        // Try to find a taxonomy snapshot that matches the system names
        if (systemNames.size > 0) {
          const { rows: taxSnaps } = await q(
            `SELECT id FROM katalyst.taxonomy_snapshots ORDER BY created_at DESC LIMIT 10`
          );
          for (const snap of taxSnaps) {
            const snapId = snap.id as string;
            const { rows: sysNodes } = await q(
              `SELECT name FROM katalyst.taxonomy_nodes WHERE snapshot_id = $1 AND node_type = 'system'`,
              [snapId]
            );
            const snapSystems = new Set(sysNodes.map((n) => n.name as string));
            const hasMatch = [...systemNames].some((name) => snapSystems.has(name));
            if (hasMatch) {
              taxonomySnapshotId = snapId;
              break;
            }
          }
        }

        // Fallback to latest taxonomy snapshot
        if (!taxonomySnapshotId) {
          const { rows: latestSnap } = await q(
            `SELECT id FROM katalyst.taxonomy_snapshots ORDER BY created_at DESC LIMIT 1`
          );
          if (latestSnap.length > 0) {
            taxonomySnapshotId = latestSnap[0].id as string;
          }
        }

        // Load taxonomy nodes and capabilities from selected snapshot
        if (taxonomySnapshotId) {
          const [nodesRes, capsRes, relsRes] = await Promise.all([
            q(`SELECT * FROM katalyst.taxonomy_nodes WHERE snapshot_id = $1 ORDER BY name`, [taxonomySnapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_capabilities WHERE snapshot_id = $1 ORDER BY name`, [taxonomySnapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_capability_rels WHERE snapshot_id = $1`, [taxonomySnapshotId]),
          ]);
          taxonomyNodes = nodesRes.rows;
          taxonomyCapabilities = capsRes.rows;
          taxonomyCapRels = relsRes.rows;
        }

        // Build capability tree from taxonomy capabilities
        const capTree = taxonomyCapabilities.length > 0
          ? buildCapabilityTree(taxonomyCapabilities, taxonomyCapRels)
          : { roots: [], byName: new Map<string, CapNode>() };

        // 7. Find matching governance snapshot
        let governanceSnapshotId: string | null = null;
        let govCaps: Record<string, unknown>[] = [];
        let govUserTypes: Record<string, unknown>[] = [];
        let govUserStories: Record<string, unknown>[] = [];

        // Try matching by project name from the taxonomy snapshot
        if (taxonomySnapshotId) {
          const { rows: taxSnapRow } = await q(
            `SELECT project FROM katalyst.taxonomy_snapshots WHERE id = $1`,
            [taxonomySnapshotId]
          );
          if (taxSnapRow.length > 0) {
            const { rows: govSnaps } = await q(
              `SELECT id FROM katalyst.governance_snapshots WHERE project = $1 ORDER BY created_at DESC LIMIT 1`,
              [taxSnapRow[0].project]
            );
            if (govSnaps.length > 0) {
              governanceSnapshotId = govSnaps[0].id as string;
            }
          }
        }

        // Fallback to latest governance snapshot
        if (!governanceSnapshotId) {
          const { rows: latestGov } = await q(
            `SELECT id FROM katalyst.governance_snapshots ORDER BY created_at DESC LIMIT 1`
          );
          if (latestGov.length > 0) {
            governanceSnapshotId = latestGov[0].id as string;
          }
        }

        // Load governance data
        if (governanceSnapshotId) {
          const [capsRes, utRes, usRes] = await Promise.all([
            q(`SELECT * FROM katalyst.governance_capabilities WHERE snapshot_id = $1`, [governanceSnapshotId]),
            q(`SELECT * FROM katalyst.governance_user_types WHERE snapshot_id = $1`, [governanceSnapshotId]),
            q(`SELECT * FROM katalyst.governance_user_stories WHERE snapshot_id = $1`, [governanceSnapshotId]),
          ]);
          govCaps = capsRes.rows;
          govUserTypes = utRes.rows;
          govUserStories = usRes.rows;
        }

        // 8. Merge capabilities: taxonomy + governance
        const govCapsByTag = new Map<string, Record<string, unknown>>();
        const govCapsById = new Map<string, Record<string, unknown>>();
        for (const cap of govCaps) {
          const tag = cap.taxonomy_node as string | undefined;
          if (tag) govCapsByTag.set(tag, cap);
          const capId = cap.capability_id as string | undefined;
          if (capId) govCapsById.set(capId, cap);
        }

        const capabilities: Record<string, unknown>[] = [];
        const emittedCapNames = new Set<string>();

        // Taxonomy capabilities (possibly merged with governance)
        for (const [, tc] of capTree.byName) {
          const govMatch = tc.tag ? (govCapsById.get(tc.tag) ?? govCapsByTag.get(tc.tag)) : null;
          emittedCapNames.add(tc.name);
          if (tc.tag) emittedCapNames.add(tc.tag);

          const govTaxNode = (govMatch?.taxonomy_node as string) ?? undefined;
          const mergedTaxNode = govTaxNode || tc.taxonomyNodes[0];
          const mergedTaxNodes = govTaxNode
            ? [govTaxNode, ...tc.taxonomyNodes.filter((n) => n !== govTaxNode)]
            : tc.taxonomyNodes;

          capabilities.push({
            id: tc.tag ?? tc.name,
            name: (govMatch?.title as string) ?? tc.name,
            category: (govMatch?.category as string) ?? (tc.taxonomyNodes[0] ?? ''),
            taxonomyNode: mergedTaxNode,
            tag: tc.tag ?? undefined,
            status: (govMatch?.status as string) ?? 'stable',
            source: govMatch ? 'merged' : 'taxonomy',
            parentName: tc.parent_capability,
            taxonomyNodes: mergedTaxNodes,
          });
        }

        // Governance-only capabilities
        for (const cap of govCaps) {
          const capId = cap.capability_id as string | undefined;
          if (!capId) continue;
          if (emittedCapNames.has(capId)) continue;
          capabilities.push({
            id: capId,
            name: (cap.title as string) ?? capId,
            category: (cap.category as string) ?? '',
            taxonomyNode: (cap.taxonomy_node as string) ?? undefined,
            tag: capId,
            status: (cap.status as string) ?? 'stable',
            source: 'governance',
            parentName: (cap.parent_capability as string) ?? null,
            taxonomyNodes: cap.taxonomy_node ? [cap.taxonomy_node as string] : [],
          });
        }

        // 9. Build capsByTaxNode for workflow inference
        const capsByTaxNode = new Map<string, string[]>();
        for (const cap of capabilities) {
          const taxNode = cap.taxonomyNode as string | undefined;
          if (!taxNode) continue;
          const parts = taxNode.split('.');
          for (let i = 1; i <= parts.length; i++) {
            const prefix = parts.slice(0, i).join('.');
            if (!capsByTaxNode.has(prefix)) capsByTaxNode.set(prefix, []);
            capsByTaxNode.get(prefix)!.push(cap.id as string);
          }
        }

        // 10. Build workflows
        const workflows = domainWorkflows.map((wf) => {
          const ctxIds = (wf.context_ids as string[]) ?? [];
          const seen = new Set<string>();
          const capabilityIds: string[] = [];
          for (const cid of ctxIds) {
            const ctx = contextLookup.byId.get(cid);
            if (!ctx?.taxonomyNode) continue;
            for (const capId of capsByTaxNode.get(ctx.taxonomyNode) ?? []) {
              if (!seen.has(capId)) {
                seen.add(capId);
                capabilityIds.push(capId);
              }
            }
          }
          return {
            id: wf.id as string,
            slug: wf.slug as string,
            title: wf.title as string,
            description: (wf.description as string) ?? undefined,
            contextIds: ctxIds,
            capabilityIds,
            states: (wf.states as unknown[]) ?? [],
            transitions: (wf.transitions as unknown[]) ?? [],
          };
        });

        // 11. User types
        const userTypes = govUserTypes.map((ut) => ({
          id: ut.user_type_id as string,
          name: ut.name as string,
          type: (ut.type as string) ?? 'human',
          archetype: (ut.archetype as string) ?? undefined,
          typicalCapabilities: (ut.typical_capabilities as string[]) ?? [],
          tag: '',
        }));

        // 12. User stories
        const userStories = govUserStories.map((s) => ({
          id: s.story_id as string,
          title: s.title as string,
          userType: s.user_type as string,
          capabilities: (s.capabilities as string[]) ?? [],
          status: (s.status as string) ?? 'draft',
        }));

        // 13. System hierarchy from taxonomy nodes
        const systems = taxonomyNodes
          .filter((n) => n.node_type === 'system')
          .map((s) => ({
            name: s.name as string,
            description: (s.description as string) ?? '',
            fqtn: s.fqtn as string,
          }));

        // 14. Build capability tree nodes for response
        function mapCapTreeNode(node: CapNode): Record<string, unknown> {
          return {
            id: node.name,
            name: node.name,
            description: node.description,
            tag: node.tag,
            taxonomyNodes: node.taxonomyNodes,
            children: node.children.map(mapCapTreeNode),
          };
        }
        const capabilityTree = capTree.roots.map(mapCapTreeNode);

        // 15. Assemble and return landscape graph
        res.json({
          systems,
          contexts,
          events,
          workflows,
          capabilities,
          capabilityTree,
          userTypes,
          userStories,
          inferredSystems,
          domainModelId,
          taxonomySnapshotId,
          governanceSnapshotId,
          generatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to build landscape graph:', err);
        res.status(500).json({ error: 'Failed to build landscape graph' });
      }
    });
  });
}

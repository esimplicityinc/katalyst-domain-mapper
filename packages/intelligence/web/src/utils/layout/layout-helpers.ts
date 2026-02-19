/**
 * Shared layout helpers used by all layout engines.
 *
 * Extracts common logic so each engine only needs to produce
 * raw node positions — the path & positions assembly is shared.
 */

import type {
  LandscapeGraph,
  LandscapePositions,
  GroupBox,
  Position,
  PathData,
  SystemBounds,
  ResolvedContext,
  TaxonomySystemNode,
  PersonaWorkflowDot,
  PersonaStoryLine,
  UserStoryBox,
  CollapsedPersonaGroup,
} from "../../types/landscape.js";

/* ── constants ──────────────────────────────────────────────────────── */

export const CTX_R = 44;
export const CTX_W = 120;
export const CTX_H = 100;
export const INFERRED_W = 160;
export const INFERRED_H = 70;
export const CAP_SIZE = 30;
export const PERSONA_SIZE = 40;

/* ── legacy grouping (used by Dagre / D3-Force) ─────────────────────── */

export function groupKey(ctx: ResolvedContext): string {
  if (ctx.contextType === "external-system") return "external";
  if (ctx.subdomainType === "core") return "core";
  if (ctx.subdomainType === "supporting") return "supporting";
  return "generic";
}

export const GROUP_META: Record<string, { label: string; order: number }> = {
  core: { label: "Core Domain", order: 0 },
  supporting: { label: "Supporting", order: 1 },
  generic: { label: "Generic", order: 2 },
  external: { label: "External Systems", order: 3 },
};

export function groupContexts(contexts: ResolvedContext[]): Map<string, ResolvedContext[]> {
  const groups = new Map<string, ResolvedContext[]>();
  for (const ctx of contexts) {
    const key = groupKey(ctx);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ctx);
  }
  return groups;
}

/* ── taxonomy-aware grouping (used by ELK) ──────────────────────────── */

/**
 * Find the deepest matching taxonomy node for a context's taxonomyNode FQTN.
 * Returns the FQTN of the matched node, or undefined if no match.
 *
 * A context with taxonomyNode "durham-water.billing-services.infosend-gateway"
 * will match the node with fqtn "durham-water.billing-services.infosend-gateway"
 * first, then fall back to "durham-water.billing-services", then "durham-water".
 */
export function resolveContextToSystemFqtn(
  ctx: ResolvedContext,
  fqtnSet: Set<string>,
): string | undefined {
  if (!ctx.taxonomyNode) return undefined;

  // Try exact match first
  if (fqtnSet.has(ctx.taxonomyNode)) return ctx.taxonomyNode;

  // Walk up the FQTN chain
  const parts = ctx.taxonomyNode.split(".");
  for (let i = parts.length - 1; i >= 1; i--) {
    const candidate = parts.slice(0, i).join(".");
    if (fqtnSet.has(candidate)) return candidate;
  }

  return undefined;
}

/**
 * Build a flat set of all FQTNs from a taxonomy tree.
 */
export function collectAllFqtns(systems: TaxonomySystemNode[]): Set<string> {
  const fqtns = new Set<string>();
  function walk(node: TaxonomySystemNode) {
    fqtns.add(node.fqtn);
    for (const child of node.children || []) walk(child);
  }
  for (const sys of systems) walk(sys);
  return fqtns;
}

/**
 * Group contexts by their resolved taxonomy node FQTN.
 * Contexts that don't match any taxonomy node go into "__unassigned__".
 */
export function groupContextsByTaxonomy(
  contexts: ResolvedContext[],
  systems: TaxonomySystemNode[],
): Map<string, ResolvedContext[]> {
  const fqtnSet = collectAllFqtns(systems);
  const groups = new Map<string, ResolvedContext[]>();

  for (const ctx of contexts) {
    const fqtn = resolveContextToSystemFqtn(ctx, fqtnSet) || "__unassigned__";
    if (!groups.has(fqtn)) groups.set(fqtn, []);
    groups.get(fqtn)!.push(ctx);
  }

  return groups;
}

/**
 * Convert ELK output SystemBounds (from walkNodes) into a recursive tree
 * matching the taxonomy hierarchy.
 */
export function buildSystemBoundsTree(
  systems: TaxonomySystemNode[],
  boundsMap: Map<string, { x: number; y: number; w: number; h: number }>,
  depth = 0,
): SystemBounds[] {
  const result: SystemBounds[] = [];

  for (const sys of systems) {
    const b = boundsMap.get(`sys-${sys.fqtn}`);
    if (!b) continue;

    const children = sys.children?.length
      ? buildSystemBoundsTree(sys.children, boundsMap, depth + 1)
      : undefined;

    result.push({
      x: b.x,
      y: b.y,
      width: b.w,
      height: b.h,
      name: sys.name,
      fqtn: sys.fqtn,
      nodeType: sys.nodeType,
      depth,
      children,
    });
  }

  return result;
}

/* ── path helpers ───────────────────────────────────────────────────── */

export function curvedPath(x1: number, y1: number, x2: number, y2: number, curvature = 0.3): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = x1 + dx * 0.5 - dy * curvature;
  const cy = y1 + dy * 0.5 + dx * curvature;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

/* ── positions assembly ─────────────────────────────────────────────── */

/**
 * Compute persona-workflow dots:
 * For each workflow, find personas whose typicalCapabilities overlap
 * with the workflow's capabilityIds. Each overlap = one animated dot.
 */
export function computePersonaWorkflowDots(
  graph: LandscapeGraph,
): PersonaWorkflowDot[] {
  const dots: PersonaWorkflowDot[] = [];

  for (const wf of graph.workflows) {
    const wfCaps = new Set(wf.capabilityIds || []);
    if (wfCaps.size === 0) continue;

    // Collect personas that interact with this workflow
    const matchingPersonas: Array<{ persona: typeof graph.personas[0]; pIdx: number }> = [];
    for (let pIdx = 0; pIdx < graph.personas.length; pIdx++) {
      const persona = graph.personas[pIdx];
      const pCaps = persona.typicalCapabilities || [];
      const hasOverlap = pCaps.some((capId) => wfCaps.has(capId));
      if (hasOverlap) {
        matchingPersonas.push({ persona, pIdx });
      }
    }

    // Create dots with stagger info
    for (let si = 0; si < matchingPersonas.length; si++) {
      const { persona, pIdx } = matchingPersonas[si];
      dots.push({
        personaId: persona.id,
        personaName: persona.name,
        personaIndex: pIdx,
        workflowId: wf.id,
        workflowSlug: wf.slug,
        staggerIndex: si,
        totalOnWorkflow: matchingPersonas.length,
      });
    }
  }

  return dots;
}

/**
 * Compute which event edges belong to which workflows.
 * An event edge belongs to a workflow if:
 *   - The event's source context is in the workflow's contextIds, AND
 *   - The specific consumer's context is also in the workflow's contextIds
 *
 * Returns Map<eventEdgeKey, workflowId[]>
 */
export function computeEventWorkflowMap(
  graph: LandscapeGraph,
): Map<string, string[]> {
  const map = new Map<string, string[]>();

  // Build workflow context sets for fast lookup
  const wfContextSets = graph.workflows.map((wf) => ({
    id: wf.id,
    ctxSet: new Set(wf.contextIds),
  }));

  for (const event of graph.events) {
    // Check resolved consumers
    event.resolvedConsumers.forEach((consumer, ci) => {
      const edgeKey = `${event.id}-r${ci}`;
      const matchingWfs: string[] = [];

      for (const { id, ctxSet } of wfContextSets) {
        if (ctxSet.has(event.sourceContextId) && consumer.contextId && ctxSet.has(consumer.contextId)) {
          matchingWfs.push(id);
        }
      }

      if (matchingWfs.length > 0) {
        map.set(edgeKey, matchingWfs);
      }
    });

    // Unresolved consumers never belong to workflows (they go to unknown systems)
  }

  return map;
}

/**
 * Build chained event-edge paths per workflow for dot animation.
 * Prepends story→capability segments so dots start from user stories,
 * then ride through event flows cap-to-cap.
 */
function buildWorkflowEventChains(
  graph: LandscapeGraph,
  eventPaths: Map<string, PathData>,
  eventWorkflowMap: Map<string, string[]>,
  storyLines: PersonaStoryLine[],
): Map<string, PathData> {
  const chains = new Map<string, PathData>();

  // Build lookup: capabilityId → story lines that target it
  const storyLinesByCap = new Map<string, PersonaStoryLine[]>();
  for (const sl of storyLines) {
    if (sl.userStoryStatus === "implementing") continue; // skip WIP
    if (!storyLinesByCap.has(sl.capabilityId)) storyLinesByCap.set(sl.capabilityId, []);
    storyLinesByCap.get(sl.capabilityId)!.push(sl);
  }

  for (const wf of graph.workflows) {
    // Collect event edge keys and paths belonging to this workflow
    const edgesForWf: Array<{ key: string; path: PathData }> = [];

    for (const [edgeKey, wfIds] of eventWorkflowMap) {
      if (wfIds.includes(wf.id)) {
        const p = eventPaths.get(edgeKey);
        if (p) edgesForWf.push({ key: edgeKey, path: p });
      }
    }

    if (edgesForWf.length === 0) continue;

    // Order edges by their source position (left-to-right, then top-to-bottom)
    edgesForWf.sort((a, b) => {
      const ap = a.path.points?.[0];
      const bp = b.path.points?.[0];
      if (!ap || !bp) return 0;
      return ap.x - bp.x || ap.y - bp.y;
    });

    // Find story lines that lead into the chain.
    // A story line qualifies if its target capability position matches
    // the source position of ANY event edge in this workflow,
    // and the story's persona interacts with this workflow.
    const wfCaps = new Set(wf.capabilityIds || []);
    const storyPrefixes: PathData[] = [];
    const addedStories = new Set<string>(); // Dedupe by story+cap

    // Collect all source capability IDs from the workflow's event edges
    const sourceCapIds = new Set<string>();
    for (const edge of edgesForWf) {
      // The source point of each edge is a capability position.
      // Find which capability it belongs to by checking capabilityPositions.
      // Since we don't have capabilityPositions here, match by looking at
      // event → sourceCapabilityId for events in this workflow.
      const eventId = edge.key.replace(/-r\d+$/, "");
      const event = graph.events.find(e => e.id === eventId);
      if (event?.sourceCapabilityId) sourceCapIds.add(event.sourceCapabilityId);
    }

    for (const capId of sourceCapIds) {
      const sls = storyLinesByCap.get(capId) || [];
      for (const sl of sls) {
        const dedupeKey = `${sl.userStoryId}-${sl.capabilityId}`;
        if (addedStories.has(dedupeKey)) continue;
        // Check if this persona interacts with this workflow
        const persona = graph.personas.find(p => p.id === sl.personaId);
        if (!persona) continue;
        const pCaps = persona.typicalCapabilities || [];
        if (pCaps.some(c => wfCaps.has(c))) {
          storyPrefixes.push(sl.path);
          addedStories.add(dedupeKey);
        }
      }
    }

    // Sort story prefixes left-to-right so dot starts from leftmost story
    storyPrefixes.sort((a, b) => {
      const ax = a.points?.[0]?.x ?? 0;
      const bx = b.points?.[0]?.x ?? 0;
      return ax - bx;
    });

    // Concatenate: story line paths first, then event edge paths
    const allSegments = [...storyPrefixes, ...edgesForWf.map(e => e.path)];
    const compoundD = allSegments.map((s) => s.d).join(" ");
    const allPoints = allSegments.flatMap((s) => s.points || []);

    chains.set(wf.id, { d: compoundD, points: allPoints });
  }

  return chains;
}

/**
 * Compute context overlay bounding boxes by finding which taxonomy nodes
 * each context spans. A context overlays the smallest taxonomy node(s)
 * that contain capabilities referenced by that context's events.
 */
function computeContextOverlays(
  graph: LandscapeGraph,
  systemBounds: Map<string, SystemBounds>,
): Map<string, import("../../types/landscape.js").ContextOverlay> {
  const overlays = new Map();
  const fqtnSet = collectAllFqtns(graph.systems);

  for (const ctx of graph.contexts) {
    // Find taxonomy node FQTN for this context
    const fqtn = resolveContextToSystemFqtn(ctx, fqtnSet);
    
    if (fqtn && systemBounds.has(fqtn)) {
      const bounds = systemBounds.get(fqtn)!;
      overlays.set(ctx.id, {
        contextId: ctx.id,
        title: ctx.title,
        contextType: ctx.contextType,
        subdomainType: ctx.subdomainType,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        spansTaxonomyNodes: [fqtn],
      });
    } else {
      // Fallback: create a small overlay at origin
      overlays.set(ctx.id, {
        contextId: ctx.id,
        title: ctx.title,
        contextType: ctx.contextType,
        subdomainType: ctx.subdomainType,
        x: 50,
        y: 50,
        width: 150,
        height: 100,
        spansTaxonomyNodes: [],
      });
    }
  }

  return overlays;
}

/**
 * Compute user story boxes and persona→story→capability lines.
 * Story boxes are positioned to the right of their persona.
 * Lines route from the story box right edge to capability positions.
 */
function computePersonaStoryData(
  graph: LandscapeGraph,
  personaPositions: Map<string, Position>,
  capabilityPositions: Map<string, Position>,
): { lines: PersonaStoryLine[]; boxes: UserStoryBox[] } {
  const STORY_BOX_X = 200;   // Story box left edge (room for persona names to the left)
  const STORY_BOX_W = 220;   // Story box width
  const STORY_BOX_H = 28;    // Story box height
  const STORY_GAP = 6;       // Vertical gap between story boxes

  const lines: PersonaStoryLine[] = [];
  const boxes: UserStoryBox[] = [];
  const personaIndex = new Map<string, number>();
  graph.personas.forEach((p, i) => personaIndex.set(p.id, i));

  // Group stories by persona
  const storiesByPersona = new Map<string, typeof graph.userStories>();
  for (const story of graph.userStories) {
    if (!storiesByPersona.has(story.persona)) storiesByPersona.set(story.persona, []);
    storiesByPersona.get(story.persona)!.push(story);
  }

  for (const persona of graph.personas) {
    const pPos = personaPositions.get(persona.id);
    if (!pPos) continue;

    const pIdx = personaIndex.get(persona.id) ?? 0;
    const stories = storiesByPersona.get(persona.id) || [];

    // Stack stories vertically centered on persona Y
    const groupHeight = stories.length * (STORY_BOX_H + STORY_GAP) - STORY_GAP;
    const startY = pPos.y - groupHeight / 2;

    stories.forEach((story, si) => {
      const boxY = startY + si * (STORY_BOX_H + STORY_GAP);
      const boxCenterY = boxY + STORY_BOX_H / 2;
      const boxRightX = STORY_BOX_X + STORY_BOX_W;

      boxes.push({
        id: story.id,
        title: story.title,
        personaId: persona.id,
        personaIndex: pIdx,
        capabilities: story.capabilities,
        status: story.status,
        x: STORY_BOX_X,
        y: boxY,
        width: STORY_BOX_W,
        height: STORY_BOX_H,
      });

      // Create a curved line from story box right edge to each capability
      // Use both persona index and capability index to separate overlapping lines.
      // Lines going to distant caps get more curvature (wider arc) while
      // nearby caps get gentler curves.
      for (let ci = 0; ci < story.capabilities.length; ci++) {
        const capId = story.capabilities[ci];
        const cPos = capabilityPositions.get(capId);
        if (!cPos) continue;

        const storyBoxPos = { x: boxRightX, y: boxCenterY };
        // Spread curvature by persona + story + capability indices
        // Keep it subtle so lines don't arc wildly
        const baseAngle = (pIdx * 0.02) + (si * 0.015) + (ci * 0.03);
        // Lines going further right get slightly less curvature to prevent wild arcs
        const dist = Math.abs(cPos.x - boxRightX);
        const distFactor = Math.min(1, 400 / Math.max(dist, 100));
        const curvature = (0.08 + baseAngle) * distFactor;

        lines.push({
          personaId: persona.id,
          personaIndex: pIdx,
          userStoryId: story.id,
          userStoryTitle: story.title,
          userStoryStatus: story.status,
          capabilityId: capId,
          storyBoxPos,
          path: {
            d: curvedPath(boxRightX, boxCenterY, cPos.x, cPos.y, curvature),
            points: [storyBoxPos, cPos],
          },
        });
      }
    });
  }

  return { lines, boxes };
}

/* ── Collapsed persona group computation ──────────────────────────── */

/** Height of a collapsed group box */
export const COLLAPSED_GROUP_H = 36;
/** Vertical gap between collapsed persona groups */
export const COLLAPSED_PERSONA_GAP = 20;

/**
 * Compute collapsed persona groups, their connection lines to capabilities,
 * and the tighter persona positions used in collapsed mode.
 *
 * Each persona gets a single group box. Lines go from the group box
 * right edge to each unique capability across all the persona's stories.
 */
function computeCollapsedPersonaData(
  graph: LandscapeGraph,
  collapsedPersonaPositions: Map<string, Position>,
  capabilityPositions: Map<string, Position>,
): {
  groups: CollapsedPersonaGroup[];
  lines: PersonaStoryLine[];
  boxes: UserStoryBox[];
} {
  const STORY_BOX_X = 200;
  const STORY_BOX_W = 220;

  const groups: CollapsedPersonaGroup[] = [];
  const lines: PersonaStoryLine[] = [];
  const boxes: UserStoryBox[] = [];
  const personaIndex = new Map<string, number>();
  graph.personas.forEach((p, i) => personaIndex.set(p.id, i));

  // Group stories by persona
  const storiesByPersona = new Map<string, typeof graph.userStories>();
  for (const story of graph.userStories) {
    if (!storiesByPersona.has(story.persona)) storiesByPersona.set(story.persona, []);
    storiesByPersona.get(story.persona)!.push(story);
  }

  for (const persona of graph.personas) {
    const pPos = collapsedPersonaPositions.get(persona.id);
    if (!pPos) continue;

    const pIdx = personaIndex.get(persona.id) ?? 0;
    const stories = storiesByPersona.get(persona.id) || [];

    // Collect unique capabilities across all this persona's stories
    const uniqueCaps = [...new Set(stories.flatMap((s) => s.capabilities))];

    const groupX = STORY_BOX_X;
    const groupY = pPos.y - COLLAPSED_GROUP_H / 2;

    groups.push({
      personaId: persona.id,
      personaIndex: pIdx,
      personaName: persona.name,
      storyCount: stories.length,
      uniqueCapabilities: uniqueCaps,
      x: groupX,
      y: groupY,
      width: STORY_BOX_W,
      height: COLLAPSED_GROUP_H,
    });

    // Also produce a single UserStoryBox so we can reference collapsed box position
    boxes.push({
      id: `collapsed-${persona.id}`,
      title: `${stories.length} ${stories.length === 1 ? "story" : "stories"}`,
      personaId: persona.id,
      personaIndex: pIdx,
      capabilities: uniqueCaps,
      status: "approved",
      x: groupX,
      y: groupY,
      width: STORY_BOX_W,
      height: COLLAPSED_GROUP_H,
    });

    // One line per unique capability, from group box right-edge center
    const boxCenterY = groupY + COLLAPSED_GROUP_H / 2;
    const boxRightX = STORY_BOX_X + STORY_BOX_W;

    for (let ci = 0; ci < uniqueCaps.length; ci++) {
      const capId = uniqueCaps[ci];
      const cPos = capabilityPositions.get(capId);
      if (!cPos) continue;

      const storyBoxPos = { x: boxRightX, y: boxCenterY };
      const baseAngle = (pIdx * 0.02) + (ci * 0.025);
      const dist = Math.abs(cPos.x - boxRightX);
      const distFactor = Math.min(1, 400 / Math.max(dist, 100));
      const curvature = (0.08 + baseAngle) * distFactor;

      lines.push({
        personaId: persona.id,
        personaIndex: pIdx,
        userStoryId: `collapsed-${persona.id}`,
        userStoryTitle: `${stories.length} stories`,
        userStoryStatus: "approved",
        capabilityId: capId,
        storyBoxPos,
        path: {
          d: curvedPath(boxRightX, boxCenterY, cPos.x, cPos.y, curvature),
          points: [storyBoxPos, cPos],
        },
      });
    }
  }

  return { groups, lines, boxes };
}

/**
 * Compute collapsed persona positions (tighter vertical spacing).
 * Each persona takes COLLAPSED_GROUP_H + COLLAPSED_PERSONA_GAP instead
 * of the full stacked story height.
 */
export function computeCollapsedPersonaPositions(
  graph: LandscapeGraph,
  personaX: number,
): Map<string, Position> {
  const positions = new Map<string, Position>();
  let cursorY = 50;

  for (const persona of graph.personas) {
    const centerY = cursorY + COLLAPSED_GROUP_H / 2;
    positions.set(persona.id, { x: personaX, y: centerY });
    cursorY += COLLAPSED_GROUP_H + COLLAPSED_PERSONA_GAP;
  }

  return positions;
}

/**
 * Given raw context/inferred/capability/persona positions,
 * compute the derived paths (events, workflows, personas)
 * and assemble the complete LandscapePositions.
 */
export function assemblePositions(
  graph: LandscapeGraph,
  contextPositions: Map<string, Position>,
  groupBoxes: GroupBox[],
  inferredPositions: Map<string, Position>,
  capabilityPositions: Map<string, Position>,
  personaPositions: Map<string, Position>,
  canvasWidth: number,
  canvasHeight: number,
  systemBounds?: Map<string, SystemBounds>,
  collapsedPersonaPos?: Map<string, Position>,
): LandscapePositions {
  // Event paths — STRICTLY CAP-TO-CAP
  // Events only render when both source and target capabilities are mapped.
  // No fallback to context centers or inferred systems.
  //
  // To avoid visual overlap when many paths share the same source or target,
  // we first collect all edges, then assign curvature per-edge based on how
  // many edges share the same (source, target) pair or the same endpoint.
  const rawEdges: Array<{
    key: string;
    srcPos: Position;
    tgtPos: Position;
    pairKey: string;
    eventName: string;
  }> = [];

  for (const event of graph.events) {
    if (!event.sourceCapabilityId) continue;
    const srcPos = capabilityPositions.get(event.sourceCapabilityId);
    if (!srcPos) continue;

    const targetCapIds = event.targetCapabilityIds || [];
    targetCapIds.forEach((targetCapId, ti) => {
      const tgtPos = capabilityPositions.get(targetCapId);
      if (!tgtPos) return;

      // Canonical pair key so A→B and B→A get different curvature signs
      const pairKey = `${event.sourceCapabilityId}→${targetCapId}`;
      rawEdges.push({
        key: `${event.id}-r${ti}`,
        srcPos,
        tgtPos,
        pairKey,
        eventName: event.title,
      });
    });
  }

  // Count edges per directional pair to fan them out
  const pairCounts = new Map<string, number>();
  const pairIndex = new Map<string, number>();
  for (const edge of rawEdges) {
    pairCounts.set(edge.pairKey, (pairCounts.get(edge.pairKey) || 0) + 1);
    pairIndex.set(edge.pairKey, 0); // reset
  }

  // Also count inbound/outbound per node to offset port attachment points
  const outboundCount = new Map<string, number>();
  const inboundCount = new Map<string, number>();
  for (const edge of rawEdges) {
    const srcKey = `${edge.srcPos.x},${edge.srcPos.y}`;
    const tgtKey = `${edge.tgtPos.x},${edge.tgtPos.y}`;
    outboundCount.set(srcKey, (outboundCount.get(srcKey) || 0) + 1);
    inboundCount.set(tgtKey, (inboundCount.get(tgtKey) || 0) + 1);
  }

  // Track how many edges we've emitted per source/target to stagger attachment
  const outboundEmitted = new Map<string, number>();
  const inboundEmitted = new Map<string, number>();

  const eventPaths = new Map<string, PathData>();
  const eventLabels = new Map<string, string>(); // key → event display name

  for (const edge of rawEdges) {
    const pairTotal = pairCounts.get(edge.pairKey) || 1;
    const idx = pairIndex.get(edge.pairKey) || 0;
    pairIndex.set(edge.pairKey, idx + 1);

    // Fan curvature: center around 0.12, spread ±0.03 per edge in pair (gentle fan)
    const baseCurvature = 0.12;
    const spread = 0.03;
    const curvature = pairTotal === 1
      ? baseCurvature
      : baseCurvature + (idx - (pairTotal - 1) / 2) * spread;

    // Offset source/target Y slightly when many edges share the same port
    const srcKey = `${edge.srcPos.x},${edge.srcPos.y}`;
    const tgtKey = `${edge.tgtPos.x},${edge.tgtPos.y}`;
    const srcTotal = outboundCount.get(srcKey) || 1;
    const tgtTotal = inboundCount.get(tgtKey) || 1;
    const srcIdx = outboundEmitted.get(srcKey) || 0;
    const tgtIdx = inboundEmitted.get(tgtKey) || 0;
    outboundEmitted.set(srcKey, srcIdx + 1);
    inboundEmitted.set(tgtKey, tgtIdx + 1);

    // Stagger attachment points vertically (±4px range, subtle)
    const srcYOff = srcTotal <= 1 ? 0 : (srcIdx - (srcTotal - 1) / 2) * 2;
    const tgtYOff = tgtTotal <= 1 ? 0 : (tgtIdx - (tgtTotal - 1) / 2) * 2;

    const sx = edge.srcPos.x;
    const sy = edge.srcPos.y + srcYOff;
    const tx = edge.tgtPos.x;
    const ty = edge.tgtPos.y + tgtYOff;

    eventPaths.set(edge.key, {
      d: curvedPath(sx, sy, tx, ty, curvature),
      points: [{ x: sx, y: sy }, { x: tx, y: ty }],
    });

    eventLabels.set(edge.key, edge.eventName);
  }

  // Workflow paths — thread through capability ports when available
  // (kept for backward compat, but no longer rendered visually)
  const workflowPaths = new Map<string, PathData>();
  for (const wf of graph.workflows) {
    const capIds = wf.capabilityIds || [];
    let pts: Position[];

    if (capIds.length >= 2) {
      // Thread through capability port positions
      pts = capIds
        .map((capId) => capabilityPositions.get(capId))
        .filter(Boolean) as Position[];
    } else {
      // Fallback: thread through context positions
      pts = wf.contextIds
        .map((cid) => contextPositions.get(cid))
        .filter(Boolean) as Position[];
    }

    if (pts.length < 2) continue;

    // Build a smooth curved path through points
    if (pts.length === 2) {
      const d = curvedPath(pts[0].x, pts[0].y, pts[1].x, pts[1].y, 0.1);
      workflowPaths.set(wf.id, { d, points: pts });
    } else {
      // Multi-point: build SVG path with slight offsets for visual separation
      const d = pts
        .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
        .join(" ");
      workflowPaths.set(wf.id, { d, points: pts });
    }
  }

  // Event → Workflow membership map
  const eventWorkflowMap = computeEventWorkflowMap(graph);

  // Compute persona → user story → capability lines and story boxes
  // (must be before buildWorkflowEventChains so story lines can be prepended to chains)
  const { lines: personaStoryLines, boxes: userStoryBoxes } = computePersonaStoryData(
    graph, personaPositions, capabilityPositions,
  );

  // Chained event paths per workflow for dot animation
  // (includes story→cap segments so dots start from user stories)
  const workflowEventChains = buildWorkflowEventChains(
    graph, eventPaths, eventWorkflowMap, personaStoryLines,
  );

  // Persona-workflow animated dots
  const personaFlowDots = computePersonaWorkflowDots(graph);

  // Compute context overlays
  const contextOverlays = computeContextOverlays(graph, systemBounds ?? new Map());

  // Compute collapsed persona data
  const resolvedCollapsedPos = collapsedPersonaPos ?? computeCollapsedPersonaPositions(graph, 40);
  const {
    groups: collapsedPersonaGroups,
    lines: collapsedPersonaLines,
    boxes: collapsedUserStoryBoxes,
  } = computeCollapsedPersonaData(graph, resolvedCollapsedPos, capabilityPositions);

  return {
    contextPositions,
    contextOverlays,
    groupBoxes,
    inferredPositions,
    systemBounds: systemBounds ?? new Map(),
    capabilityPositions,
    personaPositions,
    userStoryBoxes,
    eventPaths,
    eventLabels,
    workflowPaths,
    personaStoryLines,
    personaFlowDots,
    eventWorkflowMap,
    workflowEventChains,
    collapsedPersonaGroups,
    collapsedPersonaLines,
    collapsedUserStoryBoxes,
    collapsedPersonaPositions: resolvedCollapsedPos,
    contextRadius: CTX_R,
    canvasWidth: Math.max(canvasWidth, 1000),
    canvasHeight: Math.max(canvasHeight, 700),
  };
}

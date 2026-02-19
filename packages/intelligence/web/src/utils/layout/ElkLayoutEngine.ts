/**
 * ELK.js Layout Engine Adapter — Taxonomy-Aware
 *
 * Uses ELK (Eclipse Layout Kernel) for hierarchical layout.
 * When taxonomy data is available, systems/subsystems/stacks become
 * nested container nodes with contexts placed inside.
 * Falls back to flat subdomain grouping if no taxonomy data exists.
 */

import ELK, { type ElkNode, type ElkExtendedEdge } from "elkjs";
import type {
  LandscapeGraph,
  LandscapeLayoutEngine,
  LandscapePositions,
  GroupBox,
  Position,
  SystemBounds,
  TaxonomySystemNode,
} from "../../types/landscape.js";
import {
  CTX_W,
  CTX_H,
  INFERRED_W,
  INFERRED_H,
  CAP_SIZE,
  PERSONA_SIZE,
  GROUP_META,
  groupContexts,
  collectAllFqtns,
  resolveContextToSystemFqtn,
  buildSystemBoundsTree,
  assemblePositions,
  computeCollapsedPersonaPositions,
} from "./layout-helpers.js";

/* ══════════════════════════════════════════════════════════════════════ */

export class ElkLayoutEngine implements LandscapeLayoutEngine {
  name = "elkjs";
  private elk = new ELK();

  async layout(graph: LandscapeGraph): Promise<LandscapePositions> {
    const hasTaxonomy = graph.systems && graph.systems.length > 0;
    const elkGraph = hasTaxonomy
      ? this.buildTaxonomyElkGraph(graph)
      : this.buildLegacyElkGraph(graph);

    let laid: ElkNode;
    try {
      laid = await this.elk.layout(elkGraph);
    } catch (err) {
      console.warn("[ElkLayoutEngine] ELK layout failed, falling back to grid:", err);
      return this.gridFallback(graph);
    }

    return hasTaxonomy
      ? this.convertTaxonomyPositions(laid, graph)
      : this.convertLegacyPositions(laid, graph);
  }

  /* ══════════════════════════════════════════════════════════════════
   *  TAXONOMY-AWARE LAYOUT (new)
   * ══════════════════════════════════════════════════════════════════ */

  /**
   * Build an ELK graph where taxonomy systems/subsystems/stacks are
   * nested container nodes and capabilities are placed as port-like
   * nodes inside their parent system container.
   * Contexts are NOT ELK nodes — they become transparent overlays
   * computed after layout from the system bounds.
   */
  private buildTaxonomyElkGraph(graph: LandscapeGraph): ElkNode {
    const fqtnSet = collectAllFqtns(graph.systems);
    const children: ElkNode[] = [];
    const edges: ElkExtendedEdge[] = [];

    // Index capabilities by their resolved taxonomy node FQTN
    // Prefer taxonomyNodes[0] (from capability rels) over the legacy taxonomyNode field
    const capsByFqtn = new Map<string, typeof graph.capabilities>();
    for (const cap of graph.capabilities) {
      const taxNode = (cap.taxonomyNodes && cap.taxonomyNodes.length > 0)
        ? cap.taxonomyNodes[0]
        : cap.taxonomyNode;
      if (!taxNode) continue;
      // Find deepest matching FQTN
      let resolved: string | undefined;
      if (fqtnSet.has(taxNode)) {
        resolved = taxNode;
      } else {
        const parts = taxNode.split(".");
        for (let i = parts.length - 1; i >= 1; i--) {
          const candidate = parts.slice(0, i).join(".");
          if (fqtnSet.has(candidate)) { resolved = candidate; break; }
        }
      }
      if (!resolved) continue;
      if (!capsByFqtn.has(resolved)) capsByFqtn.set(resolved, []);
      capsByFqtn.get(resolved)!.push(cap);
    }

    // Track which capabilities were placed inside a system container
    const placedCaps = new Set<string>();

    // Recursively build nested system containers
    const buildSystemNode = (sys: TaxonomySystemNode, depth: number): ElkNode => {
      const sysId = `sys-${sys.fqtn}`;
      const sysChildren: ElkNode[] = [];

      // Add capabilities that belong to this exact node (as port-like nodes)
      const capsHere = capsByFqtn.get(sys.fqtn) || [];
      for (const cap of capsHere) {
        sysChildren.push({
          id: `cap-${cap.id}`,
          width: CAP_SIZE + 10, // slightly wider for port appearance
          height: CAP_SIZE,
          labels: [{ text: cap.name }],
        });
        placedCaps.add(cap.id);
      }

      // Recursively add child system containers
      for (const child of sys.children || []) {
        sysChildren.push(buildSystemNode(child, depth + 1));
      }

      const paddingTop = depth === 0 ? 55 : 45;
      return {
        id: sysId,
        labels: [{ text: sys.name }],
        children: sysChildren.length > 0 ? sysChildren : [
          { id: `${sysId}-spacer`, width: 60, height: 30 },
        ],
        layoutOptions: {
          "elk.padding": `[top=${paddingTop},left=25,bottom=25,right=25]`,
          "elk.algorithm": "layered",
          "elk.direction": "RIGHT",
          "elk.spacing.nodeNode": "25",
          "elk.layered.spacing.nodeNodeBetweenLayers": "35",
        },
      };
    };

    // Top-level system containers
    for (const sys of graph.systems) {
      children.push(buildSystemNode(sys, 0));
    }

    // Inferred unknown systems
    for (const unknown of graph.inferredSystems) {
      children.push({
        id: `inferred-${unknown.slug}`,
        width: INFERRED_W,
        height: INFERRED_H,
        labels: [{ text: `??? ${unknown.slug}` }],
      });
    }

    // Capabilities NOT placed inside any system → float outside
    for (const cap of graph.capabilities) {
      if (!placedCaps.has(cap.id)) {
        children.push({
          id: `cap-${cap.id}`,
          width: CAP_SIZE,
          height: CAP_SIZE,
          labels: [{ text: cap.name }],
        });
      }
    }

    // Edges – domain event flows (strictly cap-to-cap)
    // Only creates ELK edges when both source and target capabilities are placed.
    for (const event of graph.events) {
      if (!event.sourceCapabilityId || !placedCaps.has(event.sourceCapabilityId)) continue;
      const sourceElkId = `cap-${event.sourceCapabilityId}`;

      const targetCapIds = event.targetCapabilityIds || [];
      targetCapIds.forEach((targetCapId, ti) => {
        if (!placedCaps.has(targetCapId)) return;
        const targetElkId = `cap-${targetCapId}`;
        if (sourceElkId === targetElkId) return;

        edges.push({
          id: `evt-${event.id}-cap-${ti}`,
          sources: [sourceElkId],
          targets: [targetElkId],
        });
      });
    }

    // Edges – workflow connections through capabilities
    for (const wf of graph.workflows) {
      const capIds = wf.capabilityIds || [];
      if (capIds.length >= 2) {
        for (let i = 0; i < capIds.length - 1; i++) {
          if (placedCaps.has(capIds[i]) && placedCaps.has(capIds[i + 1])) {
            edges.push({
              id: `wf-${wf.id}-cap-${i}`,
              sources: [`cap-${capIds[i]}`],
              targets: [`cap-${capIds[i + 1]}`],
            });
          }
        }
      }
      // Removed fallback ctx-to-ctx edges (contexts are no longer ELK nodes)
    }

    return {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "RIGHT",
        "elk.spacing.nodeNode": "50",
        "elk.layered.spacing.nodeNodeBetweenLayers": "70",
        "elk.hierarchyHandling": "INCLUDE_CHILDREN",
        "elk.layered.mergeEdges": "true",
      },
      children,
      edges,
    };
  }

  /**
   * Convert ELK output into LandscapePositions with nested SystemBounds.
   */
  private convertTaxonomyPositions(elk: ElkNode, graph: LandscapeGraph): LandscapePositions {
    const nodeMap = new Map<string, { x: number; y: number; w: number; h: number }>();
    this.walkNodes(elk, 0, 0, nodeMap);

    // ── Left column layout constants ──────────────────────────────
    const LEFT_COLUMN_WIDTH = 470; // Total reserved width for persona names + badge + story boxes
    const PERSONA_X = 160;        // Persona circle center X (room for name labels to the left)
    const STORY_BOX_H = 28;       // Story box height
    const STORY_GAP = 6;          // Gap between story boxes
    const PERSONA_GAP = 20;       // Gap between persona groups

    // Shift all ELK output right by LEFT_COLUMN_WIDTH
    const shiftedMap = new Map<string, { x: number; y: number; w: number; h: number }>();
    for (const [key, val] of nodeMap) {
      shiftedMap.set(key, {
        x: val.x + LEFT_COLUMN_WIDTH,
        y: val.y,
        w: val.w,
        h: val.h,
      });
    }

    // Build nested SystemBounds tree (from shifted positions)
    const systemBoundsTree = buildSystemBoundsTree(graph.systems, shiftedMap, 0);

    // Flatten into a Map keyed by FQTN
    const systemBoundsMap = new Map<string, SystemBounds>();
    const flattenBounds = (bounds: SystemBounds[]) => {
      for (const b of bounds) {
        systemBoundsMap.set(b.fqtn, b);
        if (b.children) flattenBounds(b.children);
      }
    };
    flattenBounds(systemBoundsTree);

    const groupBoxes: GroupBox[] = [];

    // Inferred system positions (shifted)
    const inferredPositions = new Map<string, Position>();
    for (const sys of graph.inferredSystems) {
      const n = shiftedMap.get(`inferred-${sys.slug}`);
      if (n) inferredPositions.set(sys.slug, { x: n.x + n.w / 2, y: n.y + n.h / 2 });
    }

    // Capability positions (shifted)
    const capabilityPositions = new Map<string, Position>();
    for (const cap of graph.capabilities) {
      const n = shiftedMap.get(`cap-${cap.id}`);
      if (n) capabilityPositions.set(cap.id, { x: n.x + n.w / 2, y: n.y + n.h / 2 });
    }

    // ── Persona + User Story left-column layout ──────────────────
    // Group stories by persona, then stack them vertically
    const storiesByPersona = new Map<string, typeof graph.userStories>();
    for (const story of graph.userStories) {
      if (!storiesByPersona.has(story.persona)) storiesByPersona.set(story.persona, []);
      storiesByPersona.get(story.persona)!.push(story);
    }

    const personaPositions = new Map<string, Position>();
    let cursorY = 50; // Start Y for first persona group

    for (let pi = 0; pi < graph.personas.length; pi++) {
      const persona = graph.personas[pi];
      const stories = storiesByPersona.get(persona.id) || [];

      // Persona circle is vertically centered on its story group
      const groupHeight = Math.max(1, stories.length) * (STORY_BOX_H + STORY_GAP) - STORY_GAP;
      const personaCenterY = cursorY + groupHeight / 2;

      personaPositions.set(persona.id, {
        x: PERSONA_X,
        y: personaCenterY,
      });

      cursorY += groupHeight + PERSONA_GAP;
    }

    // Context positions - compute from system bounds
    const fqtnSet = collectAllFqtns(graph.systems);
    const contextPositions = new Map<string, Position>();
    for (const ctx of graph.contexts) {
      const fqtn = resolveContextToSystemFqtn(ctx, fqtnSet);
      if (fqtn && systemBoundsMap.has(fqtn)) {
        const bounds = systemBoundsMap.get(fqtn)!;
        contextPositions.set(ctx.id, {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2,
        });
      }
    }

    // Compute collapsed persona positions (tighter vertical spacing)
    const collapsedPersonaPos = computeCollapsedPersonaPositions(graph, PERSONA_X);

    const canvasWidth = (elk.width ?? 0) + LEFT_COLUMN_WIDTH + 100;
    const canvasHeight = Math.max(
      (elk.height ?? 0) + 100,
      cursorY + 100,
    );

    return assemblePositions(
      graph,
      contextPositions,
      groupBoxes,
      inferredPositions,
      capabilityPositions,
      personaPositions,
      canvasWidth,
      canvasHeight,
      systemBoundsMap,
      collapsedPersonaPos,
    );
  }

  /* ══════════════════════════════════════════════════════════════════
   *  LEGACY LAYOUT (flat subdomain groups — no taxonomy)
   * ══════════════════════════════════════════════════════════════════ */

  private buildLegacyElkGraph(graph: LandscapeGraph): ElkNode {
    const children: ElkNode[] = [];
    const edges: ElkExtendedEdge[] = [];

    const groups = groupContexts(graph.contexts);

    for (const [key, ctxs] of groups) {
      const meta = GROUP_META[key] ?? { label: key, order: 99 };
      const groupChildren: ElkNode[] = ctxs.map((ctx) => ({
        id: `ctx-${ctx.id}`,
        width: CTX_W,
        height: CTX_H,
        labels: [{ text: ctx.title }],
      }));

      children.push({
        id: `group-${key}`,
        labels: [{ text: meta.label }],
        children: groupChildren,
        layoutOptions: {
          "elk.padding": "[top=45,left=25,bottom=25,right=25]",
          "elk.algorithm": "layered",
          "elk.direction": "DOWN",
          "elk.spacing.nodeNode": "30",
          "elk.layered.spacing.nodeNodeBetweenLayers": "40",
          "org.eclipse.elk.priority": String(meta.order),
        },
      });
    }

    for (const unknown of graph.inferredSystems) {
      children.push({
        id: `inferred-${unknown.slug}`,
        width: INFERRED_W,
        height: INFERRED_H,
        labels: [{ text: `??? ${unknown.slug}` }],
      });
    }

    for (const cap of graph.capabilities) {
      children.push({
        id: `cap-${cap.id}`,
        width: CAP_SIZE,
        height: CAP_SIZE,
        labels: [{ text: cap.name }],
      });
    }

    for (const persona of graph.personas) {
      children.push({
        id: `persona-${persona.id}`,
        width: PERSONA_SIZE,
        height: PERSONA_SIZE,
        labels: [{ text: persona.name }],
      });
    }

    for (const event of graph.events) {
      const sourceId = `ctx-${event.sourceContextId}`;
      for (const consumer of event.resolvedConsumers) {
        const targetId = consumer.contextId
          ? `ctx-${consumer.contextId}`
          : `inferred-${consumer.slug}`;
        edges.push({
          id: `evt-${event.id}-to-${consumer.slug}`,
          sources: [sourceId],
          targets: [targetId],
        });
      }
      for (const slug of event.unresolvedConsumers) {
        edges.push({
          id: `evt-${event.id}-to-${slug}`,
          sources: [sourceId],
          targets: [`inferred-${slug}`],
        });
      }
    }

    // Workflow edges – influence layout proximity (not rendered as visible lines)
    for (const wf of graph.workflows) {
      for (let i = 0; i < wf.contextIds.length - 1; i++) {
        edges.push({
          id: `wf-${wf.id}-${i}`,
          sources: [`ctx-${wf.contextIds[i]}`],
          targets: [`ctx-${wf.contextIds[i + 1]}`],
        });
      }
    }

    return {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "RIGHT",
        "elk.spacing.nodeNode": "60",
        "elk.layered.spacing.nodeNodeBetweenLayers": "80",
        "elk.hierarchyHandling": "INCLUDE_CHILDREN",
        "elk.layered.mergeEdges": "true",
      },
      children,
      edges,
    };
  }

  private convertLegacyPositions(elk: ElkNode, graph: LandscapeGraph): LandscapePositions {
    const nodeMap = new Map<string, { x: number; y: number; w: number; h: number }>();
    this.walkNodes(elk, 0, 0, nodeMap);

    const contextPositions = new Map<string, Position>();
    for (const ctx of graph.contexts) {
      const n = nodeMap.get(`ctx-${ctx.id}`);
      if (n) contextPositions.set(ctx.id, { x: n.x + n.w / 2, y: n.y + n.h / 2 });
    }

    const groupBoxes: GroupBox[] = [];
    for (const key of Object.keys(GROUP_META)) {
      const n = nodeMap.get(`group-${key}`);
      if (n) {
        groupBoxes.push({
          label: GROUP_META[key].label,
          type: key,
          x: n.x,
          y: n.y,
          width: n.w,
          height: n.h,
        });
      }
    }

    const inferredPositions = new Map<string, Position>();
    for (const sys of graph.inferredSystems) {
      const n = nodeMap.get(`inferred-${sys.slug}`);
      if (n) inferredPositions.set(sys.slug, { x: n.x + n.w / 2, y: n.y + n.h / 2 });
    }

    const capabilityPositions = new Map<string, Position>();
    for (const cap of graph.capabilities) {
      const n = nodeMap.get(`cap-${cap.id}`);
      if (n) capabilityPositions.set(cap.id, { x: n.x + n.w / 2, y: n.y + n.h / 2 });
    }

    const personaPositions = new Map<string, Position>();
    for (const p of graph.personas) {
      const n = nodeMap.get(`persona-${p.id}`);
      if (n) personaPositions.set(p.id, { x: n.x + n.w / 2, y: n.y + n.h / 2 });
    }

    const canvasWidth = (elk.width ?? 0) + 100;
    const canvasHeight = (elk.height ?? 0) + 100;

    return assemblePositions(
      graph,
      contextPositions,
      groupBoxes,
      inferredPositions,
      capabilityPositions,
      personaPositions,
      canvasWidth,
      canvasHeight,
    );
  }

  /* ── walk ELK tree and accumulate absolute positions ────────────── */

  private walkNodes(
    node: ElkNode,
    parentX: number,
    parentY: number,
    out: Map<string, { x: number; y: number; w: number; h: number }>,
  ) {
    const x = parentX + (node.x ?? 0);
    const y = parentY + (node.y ?? 0);
    const w = node.width ?? 0;
    const h = node.height ?? 0;

    if (node.id && node.id !== "root") {
      out.set(node.id, { x, y, w, h });
    }

    for (const child of node.children ?? []) {
      this.walkNodes(child, x, y, out);
    }
  }

  /* ── fallback: simple grid ──────────────────────────────────────── */

  private gridFallback(graph: LandscapeGraph): LandscapePositions {
    const PADDING = 40;
    const CTX_SPACING = 160;
    const COL_WIDTH = CTX_SPACING;

    const groups = groupContexts(graph.contexts);
    const sortedGroups = [...groups.entries()]
      .sort((a, b) => (GROUP_META[a[0]]?.order ?? 99) - (GROUP_META[b[0]]?.order ?? 99));

    const contextPositions = new Map<string, Position>();
    const groupBoxes: GroupBox[] = [];

    let gx = PADDING + 20;
    const gy = PADDING + 60;

    for (const [key, ctxs] of sortedGroups) {
      const meta = GROUP_META[key] ?? { label: key, order: 99 };
      const cols = Math.min(ctxs.length, 3);
      const rows = Math.ceil(ctxs.length / 3);
      const boxW = cols * COL_WIDTH + PADDING * 2;
      const boxH = rows * CTX_SPACING + PADDING * 2 + 30;

      groupBoxes.push({ label: meta.label, type: key, x: gx, y: gy, width: boxW, height: boxH });

      ctxs.forEach((ctx, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        contextPositions.set(ctx.id, {
          x: gx + PADDING + col * COL_WIDTH + COL_WIDTH / 2,
          y: gy + PADDING + 30 + row * CTX_SPACING + CTX_SPACING / 2,
        });
      });

      gx += boxW + 30;
    }

    const inferredX = gx + 40;
    const inferredPositions = new Map<string, Position>();
    graph.inferredSystems.forEach((sys, i) => {
      inferredPositions.set(sys.slug, { x: inferredX + 90, y: gy + 40 + i * 120 });
    });

    const capY = gy + Math.max(...groupBoxes.map((b) => b.height), 300) + 60;
    const capabilityPositions = new Map<string, Position>();
    graph.capabilities.forEach((cap, i) => {
      capabilityPositions.set(cap.id, { x: PADDING + 60 + i * 120, y: capY + 20 });
    });

    const personaY = capY + (graph.capabilities.length > 0 ? 80 : 0);
    const personaPositions = new Map<string, Position>();
    graph.personas.forEach((p, i) => {
      personaPositions.set(p.id, { x: PADDING + 60 + i * 140, y: personaY + 40 });
    });

    const canvasW = Math.max(inferredX + 220, gx + 100);
    const canvasH = Math.max(personaY + 120, capY + 160);

    return assemblePositions(
      graph,
      contextPositions,
      groupBoxes,
      inferredPositions,
      capabilityPositions,
      personaPositions,
      canvasW,
      canvasH,
    );
  }
}

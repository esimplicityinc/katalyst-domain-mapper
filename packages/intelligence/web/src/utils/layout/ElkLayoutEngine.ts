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
    const children: ElkNode[] = [];
    const edges: ElkExtendedEdge[] = [];

    // Identify external system FQTNs so we can exclude them from ELK and
    // manually position them on the right side after ELK runs.
    // A top-level system is "external" if:
    //   (a) any bounded context mapped to it has contextType "external-system", OR
    //   (b) it has NO bounded contexts at all (nc-deq-portal, emergency-notification-platform, etc.)
    //       — these are taxonomy stubs for external/peripheral systems with no internal modelling.
    const allFqtns = collectAllFqtns(graph.systems);

    // Build set of FQTNs that have at least one internal/human-process context mapped to them
    const internallyMappedFqtns = new Set<string>();
    for (const ctx of graph.contexts) {
      if ((ctx.contextType === "internal" || ctx.contextType === "human-process") && ctx.taxonomyNode) {
        const parts = ctx.taxonomyNode.split(".");
        for (let i = 1; i <= parts.length; i++) {
          internallyMappedFqtns.add(parts.slice(0, i).join("."));
        }
      }
    }

    // A top-level taxonomy system is "external" (right-side) if it has NO internal contexts.
    // This naturally catches: explicit external-system contexts AND unmapped taxonomy stubs.
    const externalTopLevelFqtns = new Set<string>(
      graph.systems
        .filter(sys => !internallyMappedFqtns.has(sys.fqtn))
        .map(sys => sys.fqtn)
    );

    // Index capabilities by their resolved taxonomy node FQTN
    // Prefer taxonomyNodes[0] (from capability rels) over the legacy taxonomyNode field
    const capsByFqtn = new Map<string, typeof graph.capabilities>();

    // Build a reverse lookup: short name → FQTN (for caps that use short names)
    const shortNameToFqtn = new Map<string, string>();
    for (const fqtn of allFqtns) {
      const parts = fqtn.split(".");
      // Map the last segment to the full FQTN (deepest match wins)
      const shortName = parts[parts.length - 1];
      // Prefer deeper (more specific) FQTNs
      const existing = shortNameToFqtn.get(shortName);
      if (!existing || fqtn.split(".").length > existing.split(".").length) {
        shortNameToFqtn.set(shortName, fqtn);
      }
      // Also map partial suffixes (e.g. "billing-services" matches "durham-water.billing-services")
      for (let i = 1; i < parts.length; i++) {
        const suffix = parts.slice(i).join(".");
        const existingSuffix = shortNameToFqtn.get(suffix);
        if (!existingSuffix || fqtn.split(".").length > existingSuffix.split(".").length) {
          shortNameToFqtn.set(suffix, fqtn);
        }
      }
    }

    for (const cap of graph.capabilities) {
      const taxNode = (cap.taxonomyNodes && cap.taxonomyNodes.length > 0)
        ? cap.taxonomyNodes[0]
        : cap.taxonomyNode;
      if (!taxNode) continue;
      // Find deepest matching FQTN
      let resolved: string | undefined;
      if (allFqtns.has(taxNode)) {
        // Exact FQTN match
        resolved = taxNode;
      } else {
        // Try trimming from right (for partial FQTNs)
        const parts = taxNode.split(".");
        for (let i = parts.length - 1; i >= 1; i--) {
          const candidate = parts.slice(0, i).join(".");
          if (allFqtns.has(candidate)) { resolved = candidate; break; }
        }
        // Fall back to reverse lookup by short name
        if (!resolved) {
          resolved = shortNameToFqtn.get(taxNode);
        }
      }
      if (!resolved) continue;
      if (!capsByFqtn.has(resolved)) capsByFqtn.set(resolved, []);
      capsByFqtn.get(resolved)!.push(cap);
    }

    // Push capabilities down to the deepest stack when they resolve to a
    // subsystem that has only one child stack. This ensures caps render
    // inside stacks rather than floating in the subsystem padding area.
    const systemChildrenByFqtn = new Map<string, TaxonomySystemNode[]>();
    const indexChildren = (nodes: TaxonomySystemNode[]) => {
      for (const node of nodes) {
        systemChildrenByFqtn.set(node.fqtn, node.children || []);
        if (node.children) indexChildren(node.children);
      }
    };
    indexChildren(graph.systems);

    const refinedCapsByFqtn = new Map<string, typeof graph.capabilities>();
    for (const [fqtn, caps] of capsByFqtn) {
      const children = systemChildrenByFqtn.get(fqtn) || [];
      if (children.length === 1) {
        // Exactly one child stack → push all caps down into it
        const childFqtn = children[0].fqtn;
        if (!refinedCapsByFqtn.has(childFqtn)) refinedCapsByFqtn.set(childFqtn, []);
        refinedCapsByFqtn.get(childFqtn)!.push(...caps);
      } else if (children.length > 1) {
        // Multiple child stacks → push caps into the first child that doesn't
        // already have direct caps. This avoids leaving capabilities floating
        // in the subsystem padding area outside any stack.
        const firstChild = children[0].fqtn;
        if (!refinedCapsByFqtn.has(firstChild)) refinedCapsByFqtn.set(firstChild, []);
        refinedCapsByFqtn.get(firstChild)!.push(...caps);
      } else {
        // No children (leaf stack or system) → keep at current level
        if (!refinedCapsByFqtn.has(fqtn)) refinedCapsByFqtn.set(fqtn, []);
        refinedCapsByFqtn.get(fqtn)!.push(...caps);
      }
    }

    // Replace capsByFqtn with the refined version
    capsByFqtn.clear();
    for (const [fqtn, caps] of refinedCapsByFqtn) {
      capsByFqtn.set(fqtn, caps);
    }

    // Identify abstract/parent capabilities that have no taxonomy mapping.
    // These are organizational groupings (e.g. "water-operations") that are
    // parents of concrete capabilities. They should NOT appear as ELK nodes
    // inside the system hierarchy — they are only shown in capability detail
    // panels. Mark them so they are excluded from ELK and positioned off-canvas.
    const mappedCapIds = new Set<string>();
    for (const caps of capsByFqtn.values()) {
      for (const cap of caps) mappedCapIds.add(cap.id);
    }
    const abstractCapIds = new Set<string>();
    for (const cap of graph.capabilities) {
      if (!mappedCapIds.has(cap.id)) {
        abstractCapIds.add(cap.id);
      }
    }

    // Track which capabilities were placed inside a system container
    const placedCaps = new Set<string>();   // all "accounted for" caps (ELK + manual)
    const elkCaps = new Set<string>();      // caps actually added as ELK nodes (for edge routing)

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
        elkCaps.add(cap.id);
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

    // Only include internal/mixed systems in the ELK graph.
    // External systems and unmapped taxonomy stubs are positioned manually
    // in convertTaxonomyPositions() to guarantee they appear on the right.
    for (const sys of graph.systems) {
      if (!externalTopLevelFqtns.has(sys.fqtn)) {
        children.push(buildSystemNode(sys, 0));
      } else {
        // Mark any capabilities belonging to this external system as "placed"
        // so they don't get added as free-floating ELK nodes. They will be
        // positioned inside the manually-laid-out external system box instead.
        const collectExternalCaps = (node: TaxonomySystemNode) => {
          const capsHere = capsByFqtn.get(node.fqtn) || [];
          for (const cap of capsHere) placedCaps.add(cap.id);
          for (const child of node.children || []) collectExternalCaps(child);
        };
        collectExternalCaps(sys);
      }
    }

    // Inferred unknown systems are also excluded from ELK — they get manually
    // placed to the right in convertTaxonomyPositions().

    // Capabilities with no resolved system at all → float as ELK orphan nodes.
    // Skip abstract/parent capabilities — they are organizational groupings
    // and should not appear as visible nodes in the landscape.
    for (const cap of graph.capabilities) {
      if (!placedCaps.has(cap.id) && !abstractCapIds.has(cap.id)) {
        children.push({
          id: `cap-${cap.id}`,
          width: CAP_SIZE,
          height: CAP_SIZE,
          labels: [{ text: cap.name }],
        });
        elkCaps.add(cap.id);
      }
    }

    // Edges – domain event flows (strictly cap-to-cap)
    // Only emit edges when BOTH caps are actually in the ELK graph.
    for (const event of graph.events) {
      if (!event.sourceCapabilityId || !elkCaps.has(event.sourceCapabilityId)) continue;
      const sourceElkId = `cap-${event.sourceCapabilityId}`;

      const targetCapIds = event.targetCapabilityIds || [];
      targetCapIds.forEach((targetCapId, ti) => {
        if (!elkCaps.has(targetCapId)) return;
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
          if (elkCaps.has(capIds[i]) && elkCaps.has(capIds[i + 1])) {
            edges.push({
              id: `wf-${wf.id}-cap-${i}`,
              sources: [`cap-${capIds[i]}`],
              targets: [`cap-${capIds[i + 1]}`],
            });
          }
        }
      }
    }

    return {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "DOWN",
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
   *
   * Layout: personas on the LEFT in a column, system hierarchy to the RIGHT,
   * external systems and inferred unknowns along the bottom.
   * Story→capability lines route horizontally from the persona column into
   * the system area.
   */
  private convertTaxonomyPositions(elk: ElkNode, graph: LandscapeGraph): LandscapePositions {
    const nodeMap = new Map<string, { x: number; y: number; w: number; h: number }>();
    this.walkNodes(elk, 0, 0, nodeMap);

    // ── Persona column constants (left side) ──────────────────────
    const PERSONA_X = 160;        // Persona circle center X
    const STORY_BOX_X = 200;      // Story box left edge
    const STORY_BOX_W = 220;      // Story box width
    const PERSONA_COL_RIGHT = STORY_BOX_X + STORY_BOX_W + 60; // Right edge of persona column
    const STORY_BOX_H = 28;
    const STORY_GAP = 6;
    const PERSONA_GAP = 20;

    // ── Place the system area to the RIGHT of the persona column ──
    const SYSTEM_AREA_LEFT = PERSONA_COL_RIGHT;
    const SYSTEM_AREA_TOP = 50; // Aligned with top of persona column

    const shiftedMap = new Map<string, { x: number; y: number; w: number; h: number }>();
    for (const [key, val] of nodeMap) {
      shiftedMap.set(key, {
        x: val.x + SYSTEM_AREA_LEFT,
        y: val.y + SYSTEM_AREA_TOP,
        w: val.w,
        h: val.h,
      });
    }

    // ── Determine which top-level systems were excluded from ELK ──
    const internallyMappedFqtns = new Set<string>();
    for (const ctx of graph.contexts) {
      if ((ctx.contextType === "internal" || ctx.contextType === "human-process") && ctx.taxonomyNode) {
        const parts = ctx.taxonomyNode.split(".");
        for (let i = 1; i <= parts.length; i++) {
          internallyMappedFqtns.add(parts.slice(0, i).join("."));
        }
      }
    }
    const externalTopLevelSystems = graph.systems.filter(
      sys => !internallyMappedFqtns.has(sys.fqtn)
    );

    // Build nested SystemBounds tree (internal systems only)
    const internalSystems = graph.systems.filter(
      sys => internallyMappedFqtns.has(sys.fqtn)
    );
    const systemBoundsTree = buildSystemBoundsTree(internalSystems, shiftedMap, 0);

    const systemBoundsMap = new Map<string, SystemBounds>();
    const flattenBounds = (bounds: SystemBounds[]) => {
      for (const b of bounds) {
        systemBoundsMap.set(b.fqtn, b);
        if (b.children) flattenBounds(b.children);
      }
    };
    flattenBounds(systemBoundsTree);

    const groupBoxes: GroupBox[] = [];

    // ── Capability positions from ELK ─────────────────────────────
    const capabilityPositions = new Map<string, Position>();
    for (const cap of graph.capabilities) {
      const n = shiftedMap.get(`cap-${cap.id}`);
      if (n) {
        capabilityPositions.set(cap.id, { x: n.x + n.w / 2, y: n.y + n.h / 2 });
      }
    }

    // ── Compute system area bounds ────────────────────────────────
    let maxELKRight = SYSTEM_AREA_LEFT;
    let maxELKBottom = SYSTEM_AREA_TOP;
    for (const val of shiftedMap.values()) {
      maxELKRight = Math.max(maxELKRight, val.x + val.w);
      maxELKBottom = Math.max(maxELKBottom, val.y + val.h);
    }

    // ── Compute persona positions, vertically centered on system area ──
    const storiesByPersona = new Map<string, typeof graph.userStories>();
    for (const story of graph.userStories) {
      if (!storiesByPersona.has(story.persona)) storiesByPersona.set(story.persona, []);
      storiesByPersona.get(story.persona)!.push(story);
    }

    // First pass: compute total persona column height
    let totalPersonaHeight = 0;
    for (const persona of graph.personas) {
      const stories = storiesByPersona.get(persona.id) || [];
      const groupHeight = Math.max(1, stories.length) * (STORY_BOX_H + STORY_GAP) - STORY_GAP;
      totalPersonaHeight += groupHeight + PERSONA_GAP;
    }
    totalPersonaHeight -= PERSONA_GAP; // Remove trailing gap

    // Vertically center the persona column relative to the system area
    const systemAreaMidY = SYSTEM_AREA_TOP + (maxELKBottom - SYSTEM_AREA_TOP) / 2;
    let personaCursorY = Math.max(SYSTEM_AREA_TOP, systemAreaMidY - totalPersonaHeight / 2);

    const personaPositions = new Map<string, Position>();
    for (let pi = 0; pi < graph.personas.length; pi++) {
      const persona = graph.personas[pi];
      const stories = storiesByPersona.get(persona.id) || [];
      const groupHeight = Math.max(1, stories.length) * (STORY_BOX_H + STORY_GAP) - STORY_GAP;
      const personaCenterY = personaCursorY + groupHeight / 2;
      personaPositions.set(persona.id, { x: PERSONA_X, y: personaCenterY });
      personaCursorY += groupHeight + PERSONA_GAP;
    }

    // ── Bottom area: external systems + inferred unknowns ─────────
    const overallBottom = Math.max(maxELKBottom, personaCursorY);
    const EXTERNAL_AREA_TOP = overallBottom + 50;
    const EXTERNAL_COL_W = 240;
    const EXTERNAL_COL_GAP = 30;
    const CAP_ROW_GAP = 10;
    let extCursorX = SYSTEM_AREA_LEFT; // Align with system area
    const extCursorY = EXTERNAL_AREA_TOP;

    // Index caps by external FQTN
    const externalFqtnSet = new Set(externalTopLevelSystems.map(s => s.fqtn));
    const capsByExternalFqtn = new Map<string, typeof graph.capabilities>();
    for (const cap of graph.capabilities) {
      const taxNode = (cap.taxonomyNodes && cap.taxonomyNodes.length > 0)
        ? cap.taxonomyNodes[0]
        : cap.taxonomyNode;
      if (!taxNode) continue;
      let resolved: string | undefined;
      const parts = taxNode.split(".");
      if (externalFqtnSet.has(parts[0])) resolved = parts[0];
      else if (externalFqtnSet.has(taxNode)) resolved = taxNode;
      if (!resolved) continue;
      if (!capsByExternalFqtn.has(resolved)) capsByExternalFqtn.set(resolved, []);
      capsByExternalFqtn.get(resolved)!.push(cap);
    }

    // Place external systems horizontally along the bottom
    for (const sys of externalTopLevelSystems) {
      const caps = capsByExternalFqtn.get(sys.fqtn) || [];
      const headerH = 55;
      const boxH = caps.length > 0
        ? headerH + caps.length * (CAP_SIZE + CAP_ROW_GAP) + 30
        : 80;
      systemBoundsMap.set(sys.fqtn, {
        x: extCursorX,
        y: extCursorY,
        width: EXTERNAL_COL_W,
        height: boxH,
        name: sys.name,
        fqtn: sys.fqtn,
        nodeType: sys.nodeType,
        depth: 0,
        children: undefined,
      });
      // Place caps inside
      caps.forEach((cap, i) => {
        capabilityPositions.set(cap.id, {
          x: extCursorX + EXTERNAL_COL_W / 2,
          y: extCursorY + headerH + i * (CAP_SIZE + CAP_ROW_GAP) + CAP_SIZE / 2,
        });
      });
      extCursorX += EXTERNAL_COL_W + EXTERNAL_COL_GAP;
    }

    // Place inferred unknown systems after external systems
    const inferredPositions = new Map<string, Position>();
    for (const sys of graph.inferredSystems) {
      inferredPositions.set(sys.slug, {
        x: extCursorX + INFERRED_W / 2,
        y: extCursorY + INFERRED_H / 2,
      });
      extCursorX += INFERRED_W + EXTERNAL_COL_GAP;
    }

    // ── Context positions from system bounds ──────────────────────
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

    // ── Collapsed persona positions ──────────────────────────────
    const collapsedPersonaPos = computeCollapsedPersonaPositions(graph, PERSONA_X);

    // ── Canvas dimensions ─────────────────────────────────────────
    const canvasWidth = Math.max(
      maxELKRight + 100,
      extCursorX + 60,
      1000,
    );
    const canvasHeight = Math.max(
      overallBottom + 100,
      extCursorY + 200,
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

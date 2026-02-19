/**
 * Dagre Layout Engine Adapter
 *
 * Uses @dagrejs/dagre for hierarchical directed-graph layout.
 * Dagre is a layered layout algorithm (Sugiyama-style) that
 * produces clean, compact layouts with compound node support.
 *
 * Differences from ELK:
 * - Synchronous (no WASM / web-worker)
 * - Simpler API, fewer tuning options
 * - Smaller bundle size
 * - Compound nodes (clusters) for subdomain grouping
 */

import dagre from "@dagrejs/dagre";
import type {
  LandscapeGraph,
  LandscapeLayoutEngine,
  LandscapePositions,
  GroupBox,
  Position,
} from "../../types/landscape.js";
import {
  CTX_W,
  CTX_H,
  INFERRED_W,
  INFERRED_H,
  CAP_SIZE,
  PERSONA_SIZE,
  groupKey,
  GROUP_META,
  groupContexts,
  assemblePositions,
} from "./layout-helpers.js";

export class DagreLayoutEngine implements LandscapeLayoutEngine {
  name = "dagre";

  async layout(graph: LandscapeGraph): Promise<LandscapePositions> {
    // Dagre is synchronous — wrap in async for interface compat
    return this.computeLayout(graph);
  }

  private computeLayout(graph: LandscapeGraph): LandscapePositions {
    const g = new dagre.graphlib.Graph({ compound: true })
      .setGraph({
        rankdir: "LR",
        nodesep: 60,
        edgesep: 30,
        ranksep: 100,
        marginx: 40,
        marginy: 40,
      })
      .setDefaultEdgeLabel(() => ({}));

    // 1. Create group (cluster) nodes
    const groups = groupContexts(graph.contexts);
    for (const [key] of groups) {
      const meta = GROUP_META[key] ?? { label: key, order: 99 };
      g.setNode(`group-${key}`, {
        label: meta.label,
        clusterLabelPos: "top",
        style: `fill: transparent`,
      });
    }

    // 2. Add context nodes inside their group
    for (const ctx of graph.contexts) {
      const key = groupKey(ctx);
      g.setNode(`ctx-${ctx.id}`, {
        label: ctx.title,
        width: CTX_W,
        height: CTX_H,
      });
      g.setParent(`ctx-${ctx.id}`, `group-${key}`);
    }

    // 3. Inferred unknown systems
    for (const unknown of graph.inferredSystems) {
      g.setNode(`inferred-${unknown.slug}`, {
        label: `??? ${unknown.slug}`,
        width: INFERRED_W,
        height: INFERRED_H,
      });
    }

    // 4. Capabilities
    for (const cap of graph.capabilities) {
      g.setNode(`cap-${cap.id}`, {
        label: cap.name,
        width: CAP_SIZE,
        height: CAP_SIZE,
      });
    }

    // 5. Personas
    for (const persona of graph.personas) {
      g.setNode(`persona-${persona.id}`, {
        label: persona.name,
        width: PERSONA_SIZE,
        height: PERSONA_SIZE,
      });
    }

    // 6. Edges — event flows
    for (const event of graph.events) {
      const sourceId = `ctx-${event.sourceContextId}`;

      for (const consumer of event.resolvedConsumers) {
        const targetId = consumer.contextId
          ? `ctx-${consumer.contextId}`
          : `inferred-${consumer.slug}`;
        g.setEdge(sourceId, targetId, { label: event.title, weight: 2 });
      }

      for (const slug of event.unresolvedConsumers) {
        g.setEdge(sourceId, `inferred-${slug}`, { label: event.title, weight: 1 });
      }
    }

    // 7. Edges — workflow sequence
    for (const wf of graph.workflows) {
      for (let i = 0; i < wf.contextIds.length - 1; i++) {
        g.setEdge(`ctx-${wf.contextIds[i]}`, `ctx-${wf.contextIds[i + 1]}`, {
          weight: 1,
        });
      }
    }

    // Run layout
    dagre.layout(g);

    // Extract positions — dagre gives center (x,y) for each node
    const contextPositions = new Map<string, Position>();
    for (const ctx of graph.contexts) {
      const n = g.node(`ctx-${ctx.id}`);
      if (n) contextPositions.set(ctx.id, { x: n.x, y: n.y });
    }

    // Group boxes — dagre compound nodes have x,y (center), width, height
    const groupBoxes: GroupBox[] = [];
    for (const [key] of groups) {
      const n = g.node(`group-${key}`);
      if (n && n.width && n.height) {
        const meta = GROUP_META[key] ?? { label: key, order: 99 };
        groupBoxes.push({
          label: meta.label,
          type: key,
          x: n.x - n.width / 2,
          y: n.y - n.height / 2,
          width: n.width,
          height: n.height,
        });
      }
    }

    const inferredPositions = new Map<string, Position>();
    for (const sys of graph.inferredSystems) {
      const n = g.node(`inferred-${sys.slug}`);
      if (n) inferredPositions.set(sys.slug, { x: n.x, y: n.y });
    }

    const capabilityPositions = new Map<string, Position>();
    for (const cap of graph.capabilities) {
      const n = g.node(`cap-${cap.id}`);
      if (n) capabilityPositions.set(cap.id, { x: n.x, y: n.y });
    }

    const personaPositions = new Map<string, Position>();
    for (const p of graph.personas) {
      const n = g.node(`persona-${p.id}`);
      if (n) personaPositions.set(p.id, { x: n.x, y: n.y });
    }

    const graphInfo = g.graph();
    const canvasWidth = (graphInfo.width ?? 0) + 100;
    const canvasHeight = (graphInfo.height ?? 0) + 100;

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
}

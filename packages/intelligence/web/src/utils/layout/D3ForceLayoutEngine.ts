/**
 * D3-Force Layout Engine Adapter
 *
 * Uses d3-force for physics-based simulation layout.
 * Produces an organic, force-directed arrangement where:
 * - Connected nodes attract each other (link force)
 * - All nodes repel each other (many-body / charge force)
 * - Nodes don't overlap (collision force)
 * - Groups are kept together via custom cluster force
 *
 * Differences from ELK/Dagre:
 * - Non-deterministic (slightly different each run)
 * - Organic, radial feel vs. strict layered hierarchy
 * - Good at revealing clusters and communities
 * - No native compound/cluster support — faked via custom forces
 */

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type {
  LandscapeGraph,
  LandscapeLayoutEngine,
  LandscapePositions,
  GroupBox,
  Position,
} from "../../types/landscape.js";
import {
  CTX_R,
  INFERRED_W,
  CAP_SIZE,
  PERSONA_SIZE,
  groupKey,
  GROUP_META,
  groupContexts,
  assemblePositions,
} from "./layout-helpers.js";

/* ── internal types ─────────────────────────────────────────────────── */

interface ForceNode extends SimulationNodeDatum {
  id: string;
  kind: "context" | "inferred" | "capability" | "persona";
  group?: string; // subdomain group key
  radius: number;
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
}

/* ── constants ──────────────────────────────────────────────────────── */

const SIM_ITERATIONS = 300;
const CENTER_X = 500;
const CENTER_Y = 400;

/** Assign each group a target cluster position so groups separate. */
const GROUP_TARGETS: Record<string, { x: number; y: number }> = {
  core: { x: 300, y: 300 },
  supporting: { x: 700, y: 300 },
  generic: { x: 300, y: 600 },
  external: { x: 700, y: 600 },
};

/* ══════════════════════════════════════════════════════════════════════ */

export class D3ForceLayoutEngine implements LandscapeLayoutEngine {
  name = "d3-force";

  async layout(graph: LandscapeGraph): Promise<LandscapePositions> {
    return this.computeLayout(graph);
  }

  private computeLayout(graph: LandscapeGraph): LandscapePositions {
    const nodes: ForceNode[] = [];
    const links: ForceLink[] = [];
    const nodeById = new Map<string, ForceNode>();

    // 1. Context nodes
    for (const ctx of graph.contexts) {
      const key = groupKey(ctx);
      const target = GROUP_TARGETS[key] ?? { x: CENTER_X, y: CENTER_Y };
      const node: ForceNode = {
        id: `ctx-${ctx.id}`,
        kind: "context",
        group: key,
        radius: CTX_R,
        x: target.x + (Math.random() - 0.5) * 150,
        y: target.y + (Math.random() - 0.5) * 150,
      };
      nodes.push(node);
      nodeById.set(node.id, node);
    }

    // 2. Inferred systems
    for (const sys of graph.inferredSystems) {
      const node: ForceNode = {
        id: `inferred-${sys.slug}`,
        kind: "inferred",
        radius: INFERRED_W / 3,
        x: CENTER_X + 300 + (Math.random() - 0.5) * 100,
        y: CENTER_Y + (Math.random() - 0.5) * 200,
      };
      nodes.push(node);
      nodeById.set(node.id, node);
    }

    // 3. Capabilities
    for (const cap of graph.capabilities) {
      const node: ForceNode = {
        id: `cap-${cap.id}`,
        kind: "capability",
        radius: CAP_SIZE / 2,
        x: CENTER_X + (Math.random() - 0.5) * 400,
        y: CENTER_Y + 300 + (Math.random() - 0.5) * 80,
      };
      nodes.push(node);
      nodeById.set(node.id, node);
    }

    // 4. Personas
    for (const p of graph.personas) {
      const node: ForceNode = {
        id: `persona-${p.id}`,
        kind: "persona",
        radius: PERSONA_SIZE / 2,
        x: CENTER_X + (Math.random() - 0.5) * 400,
        y: CENTER_Y + 400 + (Math.random() - 0.5) * 80,
      };
      nodes.push(node);
      nodeById.set(node.id, node);
    }

    // 5. Links — event flows
    for (const event of graph.events) {
      const sourceId = `ctx-${event.sourceContextId}`;
      if (!nodeById.has(sourceId)) continue;

      for (const consumer of event.resolvedConsumers) {
        const targetId = consumer.contextId
          ? `ctx-${consumer.contextId}`
          : `inferred-${consumer.slug}`;
        if (nodeById.has(targetId)) {
          links.push({ source: sourceId, target: targetId });
        }
      }

      for (const slug of event.unresolvedConsumers) {
        const targetId = `inferred-${slug}`;
        if (nodeById.has(targetId)) {
          links.push({ source: sourceId, target: targetId });
        }
      }
    }

    // 6. Links — workflow sequence
    for (const wf of graph.workflows) {
      for (let i = 0; i < wf.contextIds.length - 1; i++) {
        const src = `ctx-${wf.contextIds[i]}`;
        const tgt = `ctx-${wf.contextIds[i + 1]}`;
        if (nodeById.has(src) && nodeById.has(tgt)) {
          links.push({ source: src, target: tgt });
        }
      }
    }

    // 7. Run simulation
    const sim: Simulation<ForceNode, ForceLink> = forceSimulation(nodes)
      .force(
        "link",
        forceLink<ForceNode, ForceLink>(links)
          .id((d) => d.id)
          .distance(120)
          .strength(0.7),
      )
      .force("charge", forceManyBody<ForceNode>().strength(-400))
      .force("center", forceCenter(CENTER_X, CENTER_Y))
      .force(
        "collision",
        forceCollide<ForceNode>().radius((d) => d.radius + 20),
      )
      // Cluster force: pull contexts toward their group center
      .force(
        "groupX",
        forceX<ForceNode>()
          .x((d) => (d.group ? (GROUP_TARGETS[d.group]?.x ?? CENTER_X) : CENTER_X))
          .strength((d) => (d.kind === "context" ? 0.15 : 0.02)),
      )
      .force(
        "groupY",
        forceY<ForceNode>()
          .y((d) => (d.group ? (GROUP_TARGETS[d.group]?.y ?? CENTER_Y) : CENTER_Y))
          .strength((d) => (d.kind === "context" ? 0.15 : 0.02)),
      )
      .stop();

    // Run for a fixed number of iterations
    for (let i = 0; i < SIM_ITERATIONS; i++) sim.tick();

    // 8. Extract positions
    const contextPositions = new Map<string, Position>();
    for (const ctx of graph.contexts) {
      const n = nodeById.get(`ctx-${ctx.id}`);
      if (n && n.x != null && n.y != null) {
        contextPositions.set(ctx.id, { x: n.x, y: n.y });
      }
    }

    const inferredPositions = new Map<string, Position>();
    for (const sys of graph.inferredSystems) {
      const n = nodeById.get(`inferred-${sys.slug}`);
      if (n && n.x != null && n.y != null) {
        inferredPositions.set(sys.slug, { x: n.x, y: n.y });
      }
    }

    const capabilityPositions = new Map<string, Position>();
    for (const cap of graph.capabilities) {
      const n = nodeById.get(`cap-${cap.id}`);
      if (n && n.x != null && n.y != null) {
        capabilityPositions.set(cap.id, { x: n.x, y: n.y });
      }
    }

    const personaPositions = new Map<string, Position>();
    for (const p of graph.personas) {
      const n = nodeById.get(`persona-${p.id}`);
      if (n && n.x != null && n.y != null) {
        personaPositions.set(p.id, { x: n.x, y: n.y });
      }
    }

    // 9. Compute group boxes by finding bounding boxes of contexts in each group
    const groups = groupContexts(graph.contexts);
    const groupBoxes: GroupBox[] = [];
    const PADDING = 60;

    for (const [key, ctxs] of groups) {
      const meta = GROUP_META[key] ?? { label: key, order: 99 };
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      for (const ctx of ctxs) {
        const pos = contextPositions.get(ctx.id);
        if (!pos) continue;
        minX = Math.min(minX, pos.x - CTX_R);
        minY = Math.min(minY, pos.y - CTX_R);
        maxX = Math.max(maxX, pos.x + CTX_R);
        maxY = Math.max(maxY, pos.y + CTX_R);
      }

      if (minX !== Infinity) {
        groupBoxes.push({
          label: meta.label,
          type: key,
          x: minX - PADDING,
          y: minY - PADDING - 20, // extra for label
          width: maxX - minX + PADDING * 2,
          height: maxY - minY + PADDING * 2 + 20,
        });
      }
    }

    // 10. Canvas size from node extents
    let allMinX = Infinity, allMinY = Infinity, allMaxX = -Infinity, allMaxY = -Infinity;
    for (const n of nodes) {
      if (n.x != null && n.y != null) {
        allMinX = Math.min(allMinX, n.x - n.radius);
        allMinY = Math.min(allMinY, n.y - n.radius);
        allMaxX = Math.max(allMaxX, n.x + n.radius);
        allMaxY = Math.max(allMaxY, n.y + n.radius);
      }
    }

    const canvasWidth = allMaxX - allMinX + 200;
    const canvasHeight = allMaxY - allMinY + 200;

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

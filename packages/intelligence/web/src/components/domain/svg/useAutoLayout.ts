import { useMemo } from "react";
import {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
} from "d3-force";
import type { BoundedContext } from "../../../types/domain";

export interface PositionedNode {
  context: BoundedContext;
  x: number;
  y: number;
}

export interface AutoLayoutResult {
  positions: PositionedNode[];
  canvasWidth: number;
  canvasHeight: number;
}

export const NODE_WIDTH = 160;
export const NODE_HEIGHT = 80;

/**
 * The collision radius is computed as the half-diagonal of the node rectangle,
 * plus a padding gap so adjacent nodes never touch.
 */
const COLLISION_RADIUS =
  Math.sqrt((NODE_WIDTH / 2) ** 2 + (NODE_HEIGHT / 2) ** 2) + 18;

const CANVAS_PADDING = 60;
const SIM_ITERATIONS = 250;

interface ForceNode extends SimulationNodeDatum {
  id: string;
  subdomainType: string;
}

/**
 * Compute group target positions relative to the given canvas center so that
 * core lands in the middle, supporting forms a ring around it, and generic /
 * unclassified contexts spread to the outer positions.
 */
function computeGroupTargets(
  centerX: number,
  centerY: number,
): Record<string, { x: number; y: number }> {
  return {
    core: { x: centerX, y: centerY },
    supporting: { x: centerX, y: centerY },
    generic: { x: centerX, y: centerY },
    unclassified: { x: centerX, y: centerY },
  };
}

/**
 * Run a d3-force simulation that positions bounded context nodes without
 * overlap, using:
 *   - forceCollide   — prevents rectangular-node overlap via bounding circle
 *   - forceManyBody  — global repulsion keeps nodes spaced out
 *   - forceCenter    — pulls the whole cluster toward the canvas centre
 *   - forceX / forceY — weak subdomain-type clustering (core near centre,
 *                       supporting in a ring, generic/unclassified further out)
 *
 * The simulation runs synchronously for SIM_ITERATIONS ticks and returns
 * the final node positions.
 *
 * Exported for unit testing.
 */
export function runSimulation(
  contexts: BoundedContext[],
  initialCenterX: number,
  initialCenterY: number,
): Array<{ context: BoundedContext; x: number; y: number }> {
  if (contexts.length === 0) return [];

  const groupTargets = computeGroupTargets(initialCenterX, initialCenterY);

  // Separate contexts by subdomain type
  const byType: Record<string, BoundedContext[]> = {
    core: [],
    supporting: [],
    generic: [],
    unclassified: [],
  };
  for (const ctx of contexts) {
    const key =
      ctx.subdomainType === "core" ||
      ctx.subdomainType === "supporting" ||
      ctx.subdomainType === "generic"
        ? ctx.subdomainType
        : "unclassified";
    byType[key].push(ctx);
  }

  // Radius bands per group (spacing from center)
  const ringRadius: Record<string, number> = {
    core: 0,
    supporting: 180,
    generic: 320,
    unclassified: 320,
  };

  // Build ForceNode list with initial positions spread on their ring
  const nodes: ForceNode[] = contexts.map((ctx) => {
    const key =
      ctx.subdomainType === "core" ||
      ctx.subdomainType === "supporting" ||
      ctx.subdomainType === "generic"
        ? ctx.subdomainType
        : "unclassified";
    const siblings = byType[key];
    const idx = siblings.indexOf(ctx);
    const count = siblings.length;
    const r = ringRadius[key] ?? 250;

    // Spread initial position evenly on the ring to give the simulation a
    // good starting configuration and reduce the number of ticks needed.
    const angle = count > 1 ? (2 * Math.PI * idx) / count - Math.PI / 2 : 0;
    return {
      id: ctx.id,
      subdomainType: key,
      x: initialCenterX + (r > 0 ? r * Math.cos(angle) : 0),
      y: initialCenterY + (r > 0 ? r * Math.sin(angle) : 0),
    };
  });

  // Cluster strength: core nodes are pulled hard to centre, others softer
  const clusterStrength: Record<string, number> = {
    core: 0.25,
    supporting: 0.12,
    generic: 0.08,
    unclassified: 0.08,
  };

  const simulation = forceSimulation<ForceNode>(nodes)
    // Prevent overlap — the main fix
    .force(
      "collision",
      forceCollide<ForceNode>().radius(COLLISION_RADIUS).strength(0.9),
    )
    // Global repulsion keeps nodes from clustering too tightly
    .force("charge", forceManyBody<ForceNode>().strength(-250))
    // Pull towards canvas centre
    .force("center", forceCenter<ForceNode>(initialCenterX, initialCenterY))
    // Weak x/y cluster forces per subdomain type
    .force(
      "clusterX",
      forceX<ForceNode>((d) => {
        const target = groupTargets[d.subdomainType] ?? groupTargets.unclassified;
        // Offset supporting/generic slightly so they don't all collapse to centre
        if (d.subdomainType === "supporting") {
          const siblings = byType.supporting;
          const idx = siblings.findIndex((c) => c.id === d.id);
          const count = siblings.length;
          const angle =
            count > 1
              ? (2 * Math.PI * idx) / count - Math.PI / 2
              : -Math.PI / 2;
          return target.x + 180 * Math.cos(angle);
        }
        if (d.subdomainType === "generic" || d.subdomainType === "unclassified") {
          const siblings = [
            ...byType.generic,
            ...byType.unclassified,
          ];
          const idx = siblings.findIndex((c) => c.id === d.id);
          const count = siblings.length;
          const angle =
            count > 1
              ? (2 * Math.PI * idx) / count - Math.PI / 2
              : Math.PI / 2;
          return target.x + 300 * Math.cos(angle);
        }
        return target.x;
      }).strength((d) => clusterStrength[d.subdomainType] ?? 0.08),
    )
    .force(
      "clusterY",
      forceY<ForceNode>((d) => {
        const target = groupTargets[d.subdomainType] ?? groupTargets.unclassified;
        if (d.subdomainType === "supporting") {
          const siblings = byType.supporting;
          const idx = siblings.findIndex((c) => c.id === d.id);
          const count = siblings.length;
          const angle =
            count > 1
              ? (2 * Math.PI * idx) / count - Math.PI / 2
              : -Math.PI / 2;
          return target.y + 180 * Math.sin(angle);
        }
        if (d.subdomainType === "generic" || d.subdomainType === "unclassified") {
          const siblings = [
            ...byType.generic,
            ...byType.unclassified,
          ];
          const idx = siblings.findIndex((c) => c.id === d.id);
          const count = siblings.length;
          const angle =
            count > 1
              ? (2 * Math.PI * idx) / count - Math.PI / 2
              : Math.PI / 2;
          return target.y + 300 * Math.sin(angle);
        }
        return target.y;
      }).strength((d) => clusterStrength[d.subdomainType] ?? 0.08),
    )
    // Don't auto-start async — we'll tick manually
    .stop();

  // Run synchronously
  for (let i = 0; i < SIM_ITERATIONS; i++) {
    simulation.tick();
  }

  return nodes.map((n) => {
    const ctx = contexts.find((c) => c.id === n.id)!;
    return {
      context: ctx,
      // d3 positions are centre-of-node; convert to top-left corner
      x: (n.x ?? initialCenterX) - NODE_WIDTH / 2,
      y: (n.y ?? initialCenterY) - NODE_HEIGHT / 2,
    };
  });
}

/**
 * Compute the bounding box that contains all positioned nodes (with padding)
 * and return canvas width/height that fit them all comfortably.
 *
 * Exported for unit testing.
 */
export function computeCanvasBounds(
  positions: Array<{ x: number; y: number }>,
): { canvasWidth: number; canvasHeight: number; offsetX: number; offsetY: number } {
  if (positions.length === 0) {
    return { canvasWidth: 800, canvasHeight: 600, offsetX: 0, offsetY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const pos of positions) {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + NODE_WIDTH);
    maxY = Math.max(maxY, pos.y + NODE_HEIGHT);
  }

  // Shift all nodes so the content starts at (CANVAS_PADDING, CANVAS_PADDING)
  const offsetX = CANVAS_PADDING - minX;
  const offsetY = CANVAS_PADDING - minY;

  const canvasWidth = maxX - minX + CANVAS_PADDING * 2;
  const canvasHeight = maxY - minY + CANVAS_PADDING * 2;

  return { canvasWidth, canvasHeight, offsetX, offsetY };
}

// Keep backward-compatible constants for anything that imports them
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

/**
 * Auto-layout hook that uses a d3-force simulation to position bounded
 * contexts without overlap.
 *
 * Positions are computed once per unique `contexts` reference (via useMemo).
 * Returns both the positioned nodes and the dynamically computed canvas
 * dimensions needed to fit all nodes.
 */
export function useAutoLayout(contexts: BoundedContext[]): AutoLayoutResult {
  return useMemo(() => {
    if (contexts.length === 0) {
      return { positions: [], canvasWidth: 800, canvasHeight: 600 };
    }

    // Initial canvas centre — we'll adjust after computing bounds
    const initialCenterX = 400;
    const initialCenterY = 300;

    const rawPositions = runSimulation(contexts, initialCenterX, initialCenterY);

    const { canvasWidth, canvasHeight, offsetX, offsetY } =
      computeCanvasBounds(rawPositions.map((p) => ({ x: p.x, y: p.y })));

    // Apply offset so all nodes are within the padded canvas
    const positions: PositionedNode[] = rawPositions.map((p) => ({
      context: p.context,
      x: p.x + offsetX,
      y: p.y + offsetY,
    }));

    return { positions, canvasWidth, canvasHeight };
  }, [contexts]);
}

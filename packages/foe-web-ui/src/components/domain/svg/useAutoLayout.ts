import { useMemo } from "react";
import type { BoundedContext } from "../../../types/domain";

export interface PositionedNode {
  context: BoundedContext;
  x: number;
  y: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;
const SUPPORTING_RADIUS = 150;
const OUTER_RADIUS = 250;
const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;

/**
 * Distributes contexts evenly around a circle at the given radius.
 * When there's only one context in a ring, it's placed at the top (12 o'clock).
 */
function distributeOnRing(
  contexts: BoundedContext[],
  radius: number,
  startAngle: number = -Math.PI / 2,
): PositionedNode[] {
  if (contexts.length === 0) return [];

  return contexts.map((context, i) => {
    const angle = startAngle + (2 * Math.PI * i) / contexts.length;
    return {
      context,
      x: CENTER_X + radius * Math.cos(angle) - NODE_WIDTH / 2,
      y: CENTER_Y + radius * Math.sin(angle) - NODE_HEIGHT / 2,
    };
  });
}

/**
 * Auto-layout hook that positions bounded contexts in concentric rings
 * based on their subdomain type:
 *   - Core contexts -> center of canvas
 *   - Supporting -> middle ring (~150px from center)
 *   - Generic / unclassified -> outer ring (~250px from center)
 *
 * Multiple core contexts are distributed around a small inner ring.
 */
export function useAutoLayout(contexts: BoundedContext[]): PositionedNode[] {
  return useMemo(() => {
    const core: BoundedContext[] = [];
    const supporting: BoundedContext[] = [];
    const outer: BoundedContext[] = []; // generic + unclassified

    for (const ctx of contexts) {
      switch (ctx.subdomainType) {
        case "core":
          core.push(ctx);
          break;
        case "supporting":
          supporting.push(ctx);
          break;
        default:
          outer.push(ctx);
          break;
      }
    }

    const positions: PositionedNode[] = [];

    // Core contexts: center or small ring
    if (core.length === 1) {
      positions.push({
        context: core[0],
        x: CENTER_X - NODE_WIDTH / 2,
        y: CENTER_Y - NODE_HEIGHT / 2,
      });
    } else if (core.length > 1) {
      // Small ring for multiple cores
      const coreRadius = 60;
      positions.push(...distributeOnRing(core, coreRadius));
    }

    // Supporting: middle ring, offset angle so they don't overlap with core
    const supportingOffset =
      supporting.length > 0 && core.length > 0
        ? -Math.PI / 2 + Math.PI / supporting.length
        : -Math.PI / 2;
    positions.push(
      ...distributeOnRing(supporting, SUPPORTING_RADIUS, supportingOffset),
    );

    // Generic + unclassified: outer ring, offset from supporting
    const outerOffset =
      outer.length > 0 && supporting.length > 0
        ? -Math.PI / 2 + Math.PI / (outer.length * 2)
        : -Math.PI / 2;
    positions.push(...distributeOnRing(outer, OUTER_RADIUS, outerOffset));

    return positions;
  }, [contexts]);
}

export { NODE_WIDTH, NODE_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT };

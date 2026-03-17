/**
 * Unit tests for the d3-force–based auto-layout algorithm.
 *
 * We test the exported pure functions (runSimulation, computeCanvasBounds)
 * directly rather than the React hook wrapper, avoiding the need for a DOM.
 */
import { describe, it, expect } from "bun:test";
import {
  runSimulation,
  computeCanvasBounds,
  NODE_WIDTH,
  NODE_HEIGHT,
} from "./useAutoLayout";
import type { BoundedContext } from "../../../types/domain";

/* ── helpers ─────────────────────────────────────────────────────────── */

function makeContext(
  id: string,
  subdomainType: BoundedContext["subdomainType"] = null,
): BoundedContext {
  return {
    id,
    domainModelId: "model-1",
    slug: id,
    title: id,
    description: null,
    responsibility: "",
    sourceDirectory: null,
    status: "draft",
    subdomainType,
    contextType: null,
    taxonomyNode: null,
    relationships: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };
}

/** Returns true if two nodes' bounding boxes overlap (with 1px tolerance). */
function overlaps(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): boolean {
  const TOLERANCE = 1;
  return (
    ax < bx + NODE_WIDTH - TOLERANCE &&
    ax + NODE_WIDTH - TOLERANCE > bx &&
    ay < by + NODE_HEIGHT - TOLERANCE &&
    ay + NODE_HEIGHT - TOLERANCE > by
  );
}

/* ── computeCanvasBounds ──────────────────────────────────────────────── */

describe("computeCanvasBounds", () => {
  it("returns default 800x600 for empty input", () => {
    const result = computeCanvasBounds([]);
    expect(result.canvasWidth).toBe(800);
    expect(result.canvasHeight).toBe(600);
    expect(result.offsetX).toBe(0);
    expect(result.offsetY).toBe(0);
  });

  it("includes 60px padding on each side", () => {
    // Single node at (0, 0)
    const result = computeCanvasBounds([{ x: 0, y: 0 }]);
    // Width = (NODE_WIDTH - 0) + 2 * 60 = NODE_WIDTH + 120
    expect(result.canvasWidth).toBe(NODE_WIDTH + 120);
    expect(result.canvasHeight).toBe(NODE_HEIGHT + 120);
  });

  it("computes offsetX/Y to shift negative coordinates into the padded area", () => {
    // Node at (-100, -50) — should be shifted right and down
    const result = computeCanvasBounds([{ x: -100, y: -50 }]);
    // offsetX = 60 - (-100) = 160
    expect(result.offsetX).toBe(160);
    // offsetY = 60 - (-50) = 110
    expect(result.offsetY).toBe(110);
  });

  it("spans multiple nodes correctly", () => {
    const positions = [
      { x: 0, y: 0 },
      { x: 400, y: 0 },
      { x: 0, y: 300 },
    ];
    const result = computeCanvasBounds(positions);
    // maxX = 400 + NODE_WIDTH, minX = 0 → width span = 400 + NODE_WIDTH
    // + 2*60 padding
    expect(result.canvasWidth).toBe(400 + NODE_WIDTH + 120);
    expect(result.canvasHeight).toBe(300 + NODE_HEIGHT + 120);
  });
});

/* ── runSimulation — basic sanity ─────────────────────────────────────── */

describe("runSimulation — basic sanity", () => {
  it("returns empty array for zero contexts", () => {
    expect(runSimulation([], 400, 300)).toEqual([]);
  });

  it("returns one positioned node for a single context", () => {
    const ctx = makeContext("ctx-1", "core");
    const result = runSimulation([ctx], 400, 300);
    expect(result).toHaveLength(1);
    expect(result[0].context.id).toBe("ctx-1");
    expect(typeof result[0].x).toBe("number");
    expect(typeof result[0].y).toBe("number");
    expect(isFinite(result[0].x)).toBe(true);
    expect(isFinite(result[0].y)).toBe(true);
  });

  it("preserves context identity in output", () => {
    const contexts = [
      makeContext("a", "core"),
      makeContext("b", "supporting"),
      makeContext("c", "generic"),
    ];
    const result = runSimulation(contexts, 400, 300);
    const ids = result.map((r) => r.context.id).sort();
    expect(ids).toEqual(["a", "b", "c"]);
  });
});

/* ── runSimulation — no overlaps ─────────────────────────────────────── */

describe("runSimulation — overlap prevention", () => {
  function assertNoOverlaps(
    positions: Array<{ x: number; y: number }>,
    label: string,
  ) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i];
        const b = positions[j];
        if (overlaps(a.x, a.y, b.x, b.y)) {
          throw new Error(
            `[${label}] Nodes ${i} and ${j} overlap: ` +
              `A=(${a.x.toFixed(1)},${a.y.toFixed(1)}) ` +
              `B=(${b.x.toFixed(1)},${b.y.toFixed(1)})`,
          );
        }
      }
    }
  }

  it("does not overlap 3 core contexts", () => {
    const contexts = [
      makeContext("c1", "core"),
      makeContext("c2", "core"),
      makeContext("c3", "core"),
    ];
    const result = runSimulation(contexts, 400, 300);
    assertNoOverlaps(result, "3 core contexts");
  });

  it("does not overlap 5 supporting contexts", () => {
    const contexts = Array.from({ length: 5 }, (_, i) =>
      makeContext(`s${i}`, "supporting"),
    );
    const result = runSimulation(contexts, 400, 300);
    assertNoOverlaps(result, "5 supporting contexts");
  });

  it("does not overlap 4 generic contexts", () => {
    const contexts = Array.from({ length: 4 }, (_, i) =>
      makeContext(`g${i}`, "generic"),
    );
    const result = runSimulation(contexts, 400, 300);
    assertNoOverlaps(result, "4 generic contexts");
  });

  it("does not overlap the mixed scenario from the screenshot (3c + 3s + 3g)", () => {
    const contexts = [
      makeContext("core-1", "core"),
      makeContext("core-2", "core"),
      makeContext("core-3", "core"),
      makeContext("sup-1", "supporting"),
      makeContext("sup-2", "supporting"),
      makeContext("sup-3", "supporting"),
      makeContext("gen-1", "generic"),
      makeContext("gen-2", "generic"),
      makeContext("gen-3", "generic"),
    ];
    const result = runSimulation(contexts, 400, 300);
    assertNoOverlaps(result, "3c+3s+3g mixed");
  });

  it("does not overlap 10 contexts of a single type", () => {
    const contexts = Array.from({ length: 10 }, (_, i) =>
      makeContext(`ctx-${i}`, "supporting"),
    );
    const result = runSimulation(contexts, 400, 300);
    assertNoOverlaps(result, "10 supporting contexts");
  });

  it("does not overlap null/unclassified subdomain types", () => {
    const contexts = Array.from({ length: 4 }, (_, i) =>
      makeContext(`u${i}`, null),
    );
    const result = runSimulation(contexts, 400, 300);
    assertNoOverlaps(result, "4 unclassified contexts");
  });
});

/* ── runSimulation — canvas bounds ───────────────────────────────────── */

describe("runSimulation — canvas bounds after offset", () => {
  it("all nodes fit within the reported canvas after applying bounds offset", () => {
    const contexts = [
      makeContext("c1", "core"),
      makeContext("s1", "supporting"),
      makeContext("s2", "supporting"),
      makeContext("g1", "generic"),
    ];

    const raw = runSimulation(contexts, 400, 300);
    const { canvasWidth, canvasHeight, offsetX, offsetY } = computeCanvasBounds(
      raw.map((p) => ({ x: p.x, y: p.y })),
    );

    for (const pos of raw) {
      const x = pos.x + offsetX;
      const y = pos.y + offsetY;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x + NODE_WIDTH).toBeLessThanOrEqual(canvasWidth + 1); // +1 float tolerance
      expect(y + NODE_HEIGHT).toBeLessThanOrEqual(canvasHeight + 1);
    }
  });
});

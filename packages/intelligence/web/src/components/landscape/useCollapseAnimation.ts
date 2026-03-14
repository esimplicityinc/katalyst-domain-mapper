/**
 * useCollapseAnimation – Smooth transition layer for user type story collapse/expand
 *
 * Sits between the `dynamicLayout` useMemo (which computes target positions)
 * and the SVG render tree. Interpolates between the previous layout snapshot
 * and the current one using requestAnimationFrame + cubic easing.
 *
 * Animates:
 *  - User type badge Y positions
 *  - Story box Y positions + fade in/out
 *  - Collapsed group box Y positions + fade in/out
 *  - Connection line SVG path `d` attributes (quadratic or cubic Bezier morph)
 */

import { useRef, useState, useEffect } from "react";
import type {
  Position,
  UserTypeStoryLine,
  UserStoryBox,
  CollapsedUserTypeGroup,
} from "../../types/landscape.js";

/* ── Constants ─────────────────────────────────────────────────────── */

const DURATION_MS = 300;

/* ── Easing ─────────────────────────────────────────────────────────── */

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/* ── Path interpolation ─────────────────────────────────────────────── */

/**
 * Path types for interpolation:
 * - "Q"   — M x,y Q cx,cy ex,ey             (6 nums)
 * - "C"   — M x,y C c1x,c1y c2x,c2y ex,ey  (8 nums)
 * - "CC"  — M x,y C ... tx,ty C ... ex,ey   (14 nums, two cubic segments)
 */
type PathType = "Q" | "C" | "CC";

/**
 * Parse numeric values from an SVG path string.
 * Supports:
 *   - Quadratic Bezier: M x,y Q cx,cy x,y → 6 nums, type "Q"
 *   - Single cubic:     M x,y C c1x,c1y c2x,c2y x,y → 8 nums, type "C"
 *   - Double cubic:     M x,y C ... tx,ty C ... ex,ey → 14 nums, type "CC"
 *
 * Returns { nums, type } or null if parsing fails.
 */
function parsePathNums(d: string): { nums: number[]; type: PathType } | null {
  const nums = d.match(/-?\d+(?:\.\d+)?/g);
  if (!nums) return null;

  // Count how many C commands appear
  const cCount = (d.match(/C/g) || []).length;

  // Double cubic: M...C...C... (14 numbers)
  if (cCount >= 2 && nums.length >= 14) {
    return { nums: nums.slice(0, 14).map(Number), type: "CC" };
  }
  // Single cubic: M...C... (8 numbers)
  if (d.includes("C") && nums.length >= 8) {
    return { nums: nums.slice(0, 8).map(Number), type: "C" };
  }
  // Quadratic: M...Q... (6 numbers)
  if (nums.length >= 6) {
    return { nums: nums.slice(0, 6).map(Number), type: "Q" };
  }
  return null;
}

function buildPath(v: number[], type: PathType): string {
  if (type === "CC" && v.length >= 14) {
    return (
      `M${v[0]},${v[1]} ` +
      `C${v[2]},${v[3]} ${v[4]},${v[5]} ${v[6]},${v[7]} ` +
      `C${v[8]},${v[9]} ${v[10]},${v[11]} ${v[12]},${v[13]}`
    );
  }
  if (type === "C" && v.length >= 8) {
    return `M${v[0]},${v[1]} C${v[2]},${v[3]} ${v[4]},${v[5]} ${v[6]},${v[7]}`;
  }
  return `M${v[0]},${v[1]} Q${v[2]},${v[3]} ${v[4]},${v[5]}`;
}

/**
 * Promote a quadratic Bezier to single cubic by duplicating the control point.
 * Q(c) → C(c, c) — gives an identical curve shape.
 */
function promoteQuadToCubic(nums: number[]): number[] {
  // M x1,y1 Q cx,cy x2,y2 → M x1,y1 C cx,cy cx,cy x2,y2
  return [nums[0], nums[1], nums[2], nums[3], nums[2], nums[3], nums[4], nums[5]];
}

/**
 * Promote a single cubic to double cubic by splitting at the midpoint.
 * C(c1, c2) → CC(c1, mid, mid, c2) using de Casteljau subdivision at t=0.5.
 */
function promoteSingleToDoubleCubic(nums: number[]): number[] {
  // Original: M(p0) C(c1, c2, p3) — split at t=0.5
  const [p0x, p0y, c1x, c1y, c2x, c2y, p3x, p3y] = nums;
  // de Casteljau at t=0.5
  const m01x = (p0x + c1x) / 2, m01y = (p0y + c1y) / 2;
  const m12x = (c1x + c2x) / 2, m12y = (c1y + c2y) / 2;
  const m23x = (c2x + p3x) / 2, m23y = (c2y + p3y) / 2;
  const m012x = (m01x + m12x) / 2, m012y = (m01y + m12y) / 2;
  const m123x = (m12x + m23x) / 2, m123y = (m12y + m23y) / 2;
  const midx = (m012x + m123x) / 2, midy = (m012y + m123y) / 2;
  // First segment:  M(p0) C(m01, m012, mid)
  // Second segment: C(m123, m23, p3)
  return [p0x, p0y, m01x, m01y, m012x, m012y, midx, midy, m123x, m123y, m23x, m23y, p3x, p3y];
}

/**
 * Promote a quadratic to double cubic: quad → single cubic → double cubic.
 */
function promoteQuadToDoubleCubic(nums: number[]): number[] {
  return promoteSingleToDoubleCubic(promoteQuadToCubic(nums));
}

/** Return the "highest" path type that can represent both. */
function higherType(a: PathType, b: PathType): PathType {
  const rank: Record<PathType, number> = { Q: 0, C: 1, CC: 2 };
  return rank[a] >= rank[b] ? a : b;
}

/** Promote nums from `from` type to `target` type. */
function promoteToType(nums: number[], from: PathType, target: PathType): number[] {
  if (from === target) return nums;
  if (from === "Q" && target === "C") return promoteQuadToCubic(nums);
  if (from === "Q" && target === "CC") return promoteQuadToDoubleCubic(nums);
  if (from === "C" && target === "CC") return promoteSingleToDoubleCubic(nums);
  return nums; // shouldn't happen
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpNums(from: number[], to: number[], t: number): number[] {
  return from.map((v, i) => lerp(v, to[i], t));
}

/* ── Snapshot type: everything the render tree needs ─────────────────── */

export interface DynamicLayoutSnapshot {
  userTypePositions: Map<string, Position>;
  storyBoxes: UserStoryBox[];
  storyLines: UserTypeStoryLine[];
  collapsedGroups: CollapsedUserTypeGroup[];
  collapsedLines: UserTypeStoryLine[];
  collapsedGroupsByUserType: Map<string, CollapsedUserTypeGroup>;
}

/* ── Animated output consumed by the render tree ─────────────────────── */

export interface AnimatedLayout {
  /** Animated user type badge positions (Y interpolated) */
  userTypePositions: Map<string, Position>;
  /** Animated story boxes (Y interpolated, with opacity) */
  storyBoxes: UserStoryBox[];
  storyBoxOpacity: Map<string, number>;
  /** Animated connection lines from expanded stories */
  storyLines: UserTypeStoryLine[];
  storyLineOpacity: Map<string, number>;
  /** Animated collapsed group boxes (Y interpolated, with opacity) */
  collapsedGroups: CollapsedUserTypeGroup[];
  collapsedGroupOpacity: Map<string, number>;
  /** Animated collapsed connection lines */
  collapsedLines: UserTypeStoryLine[];
  collapsedLineOpacity: Map<string, number>;
  /** Lookup for collapsed groups */
  collapsedGroupsByUserType: Map<string, CollapsedUserTypeGroup>;
  /** Whether animation is in flight */
  isAnimating: boolean;
}

/* ══════════════════════════════════════════════════════════════════════ */

export function useCollapseAnimation(
  targetLayout: DynamicLayoutSnapshot,
  collapsedUserTypes: Set<string>,
): AnimatedLayout {
  const [, forceRender] = useState(0);
  const isAnimatingRef = useRef(false);
  const animFrameRef = useRef(0);
  const startTimeRef = useRef(0);

  // Previous and current snapshots for interpolation
  const prevSnapshotRef = useRef<DynamicLayoutSnapshot | null>(null);
  const prevCollapsedRef = useRef<Set<string>>(new Set());
  // The "live" interpolated values (mutated during animation frames)
  const currentRef = useRef<AnimatedLayout | null>(null);

  /**
   * Detect when the target layout actually changed (collapsed set changed)
   * and kick off an animation from prev → target.
   */
  useEffect(() => {
    const prev = prevCollapsedRef.current;
    const curr = collapsedUserTypes;

    // Detect which user types changed
    let hasChange = false;
    if (prev.size !== curr.size) {
      hasChange = true;
    } else {
      for (const id of curr) {
        if (!prev.has(id)) { hasChange = true; break; }
      }
    }

    if (!hasChange && prevSnapshotRef.current !== null) {
      // No collapse state change, but layout might have changed (e.g. initial load).
      // Just snap to target.
      prevSnapshotRef.current = targetLayout;
      currentRef.current = buildSnap(targetLayout);
      forceRender((n) => n + 1);
      return;
    }

    const prevSnapshot = prevSnapshotRef.current;
    prevSnapshotRef.current = targetLayout;
    prevCollapsedRef.current = new Set(curr);

    // First render — no previous, just snap
    if (!prevSnapshot) {
      currentRef.current = buildSnap(targetLayout);
      forceRender((n) => n + 1);
      return;
    }

    // Kick off animation from prevSnapshot → targetLayout
    cancelAnimationFrame(animFrameRef.current);
    startTimeRef.current = performance.now();
    isAnimatingRef.current = true;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const rawT = Math.min(1, elapsed / DURATION_MS);
      const t = easeOutCubic(rawT);

      currentRef.current = interpolateLayouts(prevSnapshot, targetLayout, t, prev, curr);

      if (rawT < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        isAnimatingRef.current = false;
        currentRef.current = buildSnap(targetLayout);
      }
      forceRender((n) => n + 1);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [targetLayout, collapsedUserTypes]);

  // Return the current animated state (or a snap of target if nothing yet)
  if (!currentRef.current) {
    return buildSnap(targetLayout);
  }

  return { ...currentRef.current, isAnimating: isAnimatingRef.current };
}

/* ── Build a non-animated snapshot from a layout ────────────────────── */

function buildSnap(layout: DynamicLayoutSnapshot): AnimatedLayout {
  return {
    userTypePositions: new Map(layout.userTypePositions),
    storyBoxes: [...layout.storyBoxes],
    storyBoxOpacity: new Map(layout.storyBoxes.map((b) => [b.id, 1])),
    storyLines: [...layout.storyLines],
    storyLineOpacity: new Map(
      layout.storyLines.map((l) => [`${l.userStoryId}-${l.capabilityId}`, 1]),
    ),
    collapsedGroups: [...layout.collapsedGroups],
    collapsedGroupOpacity: new Map(
      layout.collapsedGroups.map((g) => [g.userTypeId, 1]),
    ),
    collapsedLines: [...layout.collapsedLines],
    collapsedLineOpacity: new Map(
      layout.collapsedLines.map((l) => [`collapsed-${l.userTypeId}-${l.capabilityId}`, 1]),
    ),
    collapsedGroupsByUserType: new Map(layout.collapsedGroupsByUserType),
    isAnimating: false,
  };
}

/* ── Interpolate between two layout snapshots ──────────────────────── */

function interpolateLayouts(
  from: DynamicLayoutSnapshot,
  to: DynamicLayoutSnapshot,
  t: number,
  _prevCollapsed: Set<string>,
  _currCollapsed: Set<string>,
): AnimatedLayout {
  // ── 1. User type badge Y positions ───────────────────────────────
  const userTypePositions = new Map<string, Position>();
  for (const [id, toPos] of to.userTypePositions) {
    const fromPos = from.userTypePositions.get(id);
    if (fromPos) {
      userTypePositions.set(id, { x: toPos.x, y: lerp(fromPos.y, toPos.y, t) });
    } else {
      userTypePositions.set(id, toPos);
    }
  }

  // ── 2. Story boxes (expanded) ──────────────────────────────────
  // Boxes in target that also exist in source: lerp Y
  // Boxes only in target (user type was just expanded): fade in
  // Boxes only in source (user type was just collapsed): fade out + lerp to group position
  const storyBoxes: UserStoryBox[] = [];
  const storyBoxOpacity = new Map<string, number>();

  const fromBoxById = new Map(from.storyBoxes.map((b) => [b.id, b]));
  const toBoxById = new Map(to.storyBoxes.map((b) => [b.id, b]));

  // Target boxes
  for (const toBox of to.storyBoxes) {
    const fromBox = fromBoxById.get(toBox.id);
    if (fromBox) {
      // Exists in both — lerp position
      storyBoxes.push({ ...toBox, y: lerp(fromBox.y, toBox.y, t) });
      storyBoxOpacity.set(toBox.id, 1);
    } else {
      // New (user type expanding) — fade in from collapsed group position
      const fromGroup = from.collapsedGroupsByUserType.get(toBox.userTypeId);
      const fromY = fromGroup ? fromGroup.y : toBox.y;
      storyBoxes.push({ ...toBox, y: lerp(fromY, toBox.y, t) });
      storyBoxOpacity.set(toBox.id, t); // fade in
    }
  }

  // Departing boxes (user type collapsing) — keep rendering with fade out
  for (const fromBox of from.storyBoxes) {
    if (toBoxById.has(fromBox.id)) continue; // already handled
    // Find the target collapsed group position to lerp towards
    const toGroup = to.collapsedGroupsByUserType.get(fromBox.userTypeId);
    const toY = toGroup ? toGroup.y : fromBox.y;
    storyBoxes.push({ ...fromBox, y: lerp(fromBox.y, toY, t) });
    storyBoxOpacity.set(fromBox.id, 1 - t); // fade out
  }

  // ── 3. Story connection lines (expanded) ───────────────────────
  const storyLines: UserTypeStoryLine[] = [];
  const storyLineOpacity = new Map<string, number>();

  const toLineKeys = new Set(to.storyLines.map((l) => `${l.userStoryId}-${l.capabilityId}`));
  const fromLineByKey = new Map(
    from.storyLines.map((l) => [`${l.userStoryId}-${l.capabilityId}`, l]),
  );

  // Target lines
  for (const toLine of to.storyLines) {
    const key = `${toLine.userStoryId}-${toLine.capabilityId}`;
    const fromLine = fromLineByKey.get(key);
    if (fromLine) {
      // Morph path
      storyLines.push({ ...toLine, path: morphPath(fromLine.path, toLine.path, t) });
      storyLineOpacity.set(key, 1);
    } else {
      // New line (expanding) — fade in, morph from collapsed line for same cap
      const fromCollapsedLine = from.collapsedLines.find(
        (l) => l.userTypeId === toLine.userTypeId && l.capabilityId === toLine.capabilityId,
      );
      if (fromCollapsedLine) {
        storyLines.push({ ...toLine, path: morphPath(fromCollapsedLine.path, toLine.path, t) });
      } else {
        storyLines.push(toLine);
      }
      storyLineOpacity.set(key, t);
    }
  }

  // Departing lines (collapsing) — fade out
  for (const fromLine of from.storyLines) {
    const key = `${fromLine.userStoryId}-${fromLine.capabilityId}`;
    if (toLineKeys.has(key)) continue;
    // Morph towards collapsed line
    const toCollapsedLine = to.collapsedLines.find(
      (l) => l.userTypeId === fromLine.userTypeId && l.capabilityId === fromLine.capabilityId,
    );
    if (toCollapsedLine) {
      storyLines.push({ ...fromLine, path: morphPath(fromLine.path, toCollapsedLine.path, t) });
    } else {
      storyLines.push(fromLine);
    }
    storyLineOpacity.set(key, 1 - t);
  }

  // ── 4. Collapsed group boxes ───────────────────────────────────
  const collapsedGroups: CollapsedUserTypeGroup[] = [];
  const collapsedGroupOpacity = new Map<string, number>();

  const fromGroupByUserType = new Map(
    from.collapsedGroups.map((g) => [g.userTypeId, g]),
  );
  const toGroupByUserType = new Map(
    to.collapsedGroups.map((g) => [g.userTypeId, g]),
  );

  // Target groups
  for (const toGroup of to.collapsedGroups) {
    const fromGroup = fromGroupByUserType.get(toGroup.userTypeId);
    if (fromGroup) {
      // Both collapsed — lerp Y (sibling shifts)
      collapsedGroups.push({ ...toGroup, y: lerp(fromGroup.y, toGroup.y, t) });
      collapsedGroupOpacity.set(toGroup.userTypeId, 1);
    } else {
      // Newly collapsed — fade in from expanded story position
      const expandedBoxes = from.storyBoxes.filter((b) => b.userTypeId === toGroup.userTypeId);
      const fromY = expandedBoxes.length > 0
        ? expandedBoxes.reduce((sum, b) => sum + b.y, 0) / expandedBoxes.length
        : toGroup.y;
      collapsedGroups.push({ ...toGroup, y: lerp(fromY, toGroup.y, t) });
      collapsedGroupOpacity.set(toGroup.userTypeId, t); // fade in
    }
  }

  // Departing groups (expanding) — fade out
  for (const fromGroup of from.collapsedGroups) {
    if (toGroupByUserType.has(fromGroup.userTypeId)) continue;
    // Lerp towards expanded user type center
    const toUserTypePos = to.userTypePositions.get(fromGroup.userTypeId);
    const toY = toUserTypePos ? toUserTypePos.y - fromGroup.height / 2 : fromGroup.y;
    collapsedGroups.push({ ...fromGroup, y: lerp(fromGroup.y, toY, t) });
    collapsedGroupOpacity.set(fromGroup.userTypeId, 1 - t); // fade out
  }

  const collapsedGroupsByUserType = new Map<string, CollapsedUserTypeGroup>();
  for (const g of collapsedGroups) {
    collapsedGroupsByUserType.set(g.userTypeId, g);
  }

  // ── 5. Collapsed connection lines ──────────────────────────────
  const collapsedLines: UserTypeStoryLine[] = [];
  const collapsedLineOpacity = new Map<string, number>();

  const toCollapsedLineKeys = new Set(
    to.collapsedLines.map((l) => `collapsed-${l.userTypeId}-${l.capabilityId}`),
  );
  const fromCollapsedLineByKey = new Map(
    from.collapsedLines.map((l) => [`collapsed-${l.userTypeId}-${l.capabilityId}`, l]),
  );

  for (const toLine of to.collapsedLines) {
    const key = `collapsed-${toLine.userTypeId}-${toLine.capabilityId}`;
    const fromLine = fromCollapsedLineByKey.get(key);
    if (fromLine) {
      collapsedLines.push({ ...toLine, path: morphPath(fromLine.path, toLine.path, t) });
      collapsedLineOpacity.set(key, 1);
    } else {
      // Newly collapsed — morph from expanded line for same cap
      const fromExpandedLine = from.storyLines.find(
        (l) => l.userTypeId === toLine.userTypeId && l.capabilityId === toLine.capabilityId,
      );
      if (fromExpandedLine) {
        collapsedLines.push({ ...toLine, path: morphPath(fromExpandedLine.path, toLine.path, t) });
      } else {
        collapsedLines.push(toLine);
      }
      collapsedLineOpacity.set(key, t);
    }
  }

  // Departing collapsed lines (expanding) — fade out
  for (const fromLine of from.collapsedLines) {
    const key = `collapsed-${fromLine.userTypeId}-${fromLine.capabilityId}`;
    if (toCollapsedLineKeys.has(key)) continue;
    collapsedLines.push(fromLine);
    collapsedLineOpacity.set(key, 1 - t);
  }

  return {
    userTypePositions,
    storyBoxes,
    storyBoxOpacity,
    storyLines,
    storyLineOpacity,
    collapsedGroups,
    collapsedGroupOpacity,
    collapsedLines,
    collapsedLineOpacity,
    collapsedGroupsByUserType,
    isAnimating: true,
  };
}

/* ── Morph a single path (quadratic, single cubic, or double cubic) ── */

function morphPath(
  fromPath: { d: string; points?: Position[] },
  toPath: { d: string; points?: Position[] },
  t: number,
): { d: string; points?: Position[] } {
  const fromParsed = parsePathNums(fromPath.d);
  const toParsed = parsePathNums(toPath.d);

  if (fromParsed && toParsed) {
    let fromNums = fromParsed.nums;
    let toNums = toParsed.nums;
    let pathType = toParsed.type;

    // Normalize both to the same type for smooth interpolation.
    // Promotion chain: Q → C → CC
    if (fromParsed.type !== toParsed.type) {
      pathType = higherType(fromParsed.type, toParsed.type);
      fromNums = promoteToType(fromNums, fromParsed.type, pathType);
      toNums = promoteToType(toNums, toParsed.type, pathType);
    }

    const interpolated = lerpNums(fromNums, toNums, t);
    const fp = fromPath.points;
    const tp = toPath.points;
    const points = tp && tp.length >= 2
      ? [
          { x: lerp(fp?.[0]?.x ?? tp[0].x, tp[0].x, t),
            y: lerp(fp?.[0]?.y ?? tp[0].y, tp[0].y, t) },
          { x: lerp(fp?.[1]?.x ?? tp[1].x, tp[1].x, t),
            y: lerp(fp?.[1]?.y ?? tp[1].y, tp[1].y, t) },
        ]
      : toPath.points;
    return { d: buildPath(interpolated, pathType), points };
  }

  // Fallback: can't parse, just use target
  return t < 0.5 ? fromPath : toPath;
}

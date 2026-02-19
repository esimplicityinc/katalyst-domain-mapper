/**
 * useCollapseAnimation – Smooth transition layer for persona story collapse/expand
 *
 * Sits between the `dynamicLayout` useMemo (which computes target positions)
 * and the SVG render tree. Interpolates between the previous layout snapshot
 * and the current one using requestAnimationFrame + cubic easing.
 *
 * Animates:
 *  - Persona badge Y positions
 *  - Story box Y positions + fade in/out
 *  - Collapsed group box Y positions + fade in/out
 *  - Connection line SVG path `d` attributes (quadratic Bezier morph)
 */

import { useRef, useState, useEffect } from "react";
import type {
  Position,
  PersonaStoryLine,
  UserStoryBox,
  CollapsedPersonaGroup,
} from "../../types/landscape.js";

/* ── Constants ─────────────────────────────────────────────────────── */

const DURATION_MS = 300;

/* ── Easing ─────────────────────────────────────────────────────────── */

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/* ── Path interpolation ─────────────────────────────────────────────── */

function parsePathNums(d: string): number[] | null {
  const nums = d.match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length < 6) return null;
  return nums.slice(0, 6).map(Number);
}

function buildPath(v: number[]): string {
  return `M${v[0]},${v[1]} Q${v[2]},${v[3]} ${v[4]},${v[5]}`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpNums(from: number[], to: number[], t: number): number[] {
  return from.map((v, i) => lerp(v, to[i], t));
}

/* ── Snapshot type: everything the render tree needs ─────────────────── */

export interface DynamicLayoutSnapshot {
  personaPositions: Map<string, Position>;
  storyBoxes: UserStoryBox[];
  storyLines: PersonaStoryLine[];
  collapsedGroups: CollapsedPersonaGroup[];
  collapsedLines: PersonaStoryLine[];
  collapsedGroupsByPersona: Map<string, CollapsedPersonaGroup>;
}

/* ── Animated output consumed by the render tree ─────────────────────── */

export interface AnimatedLayout {
  /** Animated persona badge positions (Y interpolated) */
  personaPositions: Map<string, Position>;
  /** Animated story boxes (Y interpolated, with opacity) */
  storyBoxes: UserStoryBox[];
  storyBoxOpacity: Map<string, number>;
  /** Animated connection lines from expanded stories */
  storyLines: PersonaStoryLine[];
  storyLineOpacity: Map<string, number>;
  /** Animated collapsed group boxes (Y interpolated, with opacity) */
  collapsedGroups: CollapsedPersonaGroup[];
  collapsedGroupOpacity: Map<string, number>;
  /** Animated collapsed connection lines */
  collapsedLines: PersonaStoryLine[];
  collapsedLineOpacity: Map<string, number>;
  /** Lookup for collapsed groups */
  collapsedGroupsByPersona: Map<string, CollapsedPersonaGroup>;
  /** Whether animation is in flight */
  isAnimating: boolean;
}

/* ══════════════════════════════════════════════════════════════════════ */

export function useCollapseAnimation(
  targetLayout: DynamicLayoutSnapshot,
  collapsedPersonas: Set<string>,
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
    const curr = collapsedPersonas;

    // Detect which personas changed
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
  }, [targetLayout, collapsedPersonas]);

  // Return the current animated state (or a snap of target if nothing yet)
  if (!currentRef.current) {
    return buildSnap(targetLayout);
  }

  return { ...currentRef.current, isAnimating: isAnimatingRef.current };
}

/* ── Build a non-animated snapshot from a layout ────────────────────── */

function buildSnap(layout: DynamicLayoutSnapshot): AnimatedLayout {
  return {
    personaPositions: new Map(layout.personaPositions),
    storyBoxes: [...layout.storyBoxes],
    storyBoxOpacity: new Map(layout.storyBoxes.map((b) => [b.id, 1])),
    storyLines: [...layout.storyLines],
    storyLineOpacity: new Map(
      layout.storyLines.map((l) => [`${l.userStoryId}-${l.capabilityId}`, 1]),
    ),
    collapsedGroups: [...layout.collapsedGroups],
    collapsedGroupOpacity: new Map(
      layout.collapsedGroups.map((g) => [g.personaId, 1]),
    ),
    collapsedLines: [...layout.collapsedLines],
    collapsedLineOpacity: new Map(
      layout.collapsedLines.map((l) => [`collapsed-${l.personaId}-${l.capabilityId}`, 1]),
    ),
    collapsedGroupsByPersona: new Map(layout.collapsedGroupsByPersona),
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
  // ── 1. Persona badge Y positions ───────────────────────────────
  const personaPositions = new Map<string, Position>();
  for (const [id, toPos] of to.personaPositions) {
    const fromPos = from.personaPositions.get(id);
    if (fromPos) {
      personaPositions.set(id, { x: toPos.x, y: lerp(fromPos.y, toPos.y, t) });
    } else {
      personaPositions.set(id, toPos);
    }
  }

  // ── 2. Story boxes (expanded) ──────────────────────────────────
  // Boxes in target that also exist in source: lerp Y
  // Boxes only in target (persona was just expanded): fade in
  // Boxes only in source (persona was just collapsed): fade out + lerp to group position
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
      // New (persona expanding) — fade in from collapsed group position
      const fromGroup = from.collapsedGroupsByPersona.get(toBox.personaId);
      const fromY = fromGroup ? fromGroup.y : toBox.y;
      storyBoxes.push({ ...toBox, y: lerp(fromY, toBox.y, t) });
      storyBoxOpacity.set(toBox.id, t); // fade in
    }
  }

  // Departing boxes (persona collapsing) — keep rendering with fade out
  for (const fromBox of from.storyBoxes) {
    if (toBoxById.has(fromBox.id)) continue; // already handled
    // Find the target collapsed group position to lerp towards
    const toGroup = to.collapsedGroupsByPersona.get(fromBox.personaId);
    const toY = toGroup ? toGroup.y : fromBox.y;
    storyBoxes.push({ ...fromBox, y: lerp(fromBox.y, toY, t) });
    storyBoxOpacity.set(fromBox.id, 1 - t); // fade out
  }

  // ── 3. Story connection lines (expanded) ───────────────────────
  const storyLines: PersonaStoryLine[] = [];
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
        (l) => l.personaId === toLine.personaId && l.capabilityId === toLine.capabilityId,
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
      (l) => l.personaId === fromLine.personaId && l.capabilityId === fromLine.capabilityId,
    );
    if (toCollapsedLine) {
      storyLines.push({ ...fromLine, path: morphPath(fromLine.path, toCollapsedLine.path, t) });
    } else {
      storyLines.push(fromLine);
    }
    storyLineOpacity.set(key, 1 - t);
  }

  // ── 4. Collapsed group boxes ───────────────────────────────────
  const collapsedGroups: CollapsedPersonaGroup[] = [];
  const collapsedGroupOpacity = new Map<string, number>();

  const fromGroupByPersona = new Map(
    from.collapsedGroups.map((g) => [g.personaId, g]),
  );
  const toGroupByPersona = new Map(
    to.collapsedGroups.map((g) => [g.personaId, g]),
  );

  // Target groups
  for (const toGroup of to.collapsedGroups) {
    const fromGroup = fromGroupByPersona.get(toGroup.personaId);
    if (fromGroup) {
      // Both collapsed — lerp Y (sibling shifts)
      collapsedGroups.push({ ...toGroup, y: lerp(fromGroup.y, toGroup.y, t) });
      collapsedGroupOpacity.set(toGroup.personaId, 1);
    } else {
      // Newly collapsed — fade in from expanded story position
      const expandedBoxes = from.storyBoxes.filter((b) => b.personaId === toGroup.personaId);
      const fromY = expandedBoxes.length > 0
        ? expandedBoxes.reduce((sum, b) => sum + b.y, 0) / expandedBoxes.length
        : toGroup.y;
      collapsedGroups.push({ ...toGroup, y: lerp(fromY, toGroup.y, t) });
      collapsedGroupOpacity.set(toGroup.personaId, t); // fade in
    }
  }

  // Departing groups (expanding) — fade out
  for (const fromGroup of from.collapsedGroups) {
    if (toGroupByPersona.has(fromGroup.personaId)) continue;
    // Lerp towards expanded persona center
    const toPersonaPos = to.personaPositions.get(fromGroup.personaId);
    const toY = toPersonaPos ? toPersonaPos.y - fromGroup.height / 2 : fromGroup.y;
    collapsedGroups.push({ ...fromGroup, y: lerp(fromGroup.y, toY, t) });
    collapsedGroupOpacity.set(fromGroup.personaId, 1 - t); // fade out
  }

  const collapsedGroupsByPersona = new Map<string, CollapsedPersonaGroup>();
  for (const g of collapsedGroups) {
    collapsedGroupsByPersona.set(g.personaId, g);
  }

  // ── 5. Collapsed connection lines ──────────────────────────────
  const collapsedLines: PersonaStoryLine[] = [];
  const collapsedLineOpacity = new Map<string, number>();

  const toCollapsedLineKeys = new Set(
    to.collapsedLines.map((l) => `collapsed-${l.personaId}-${l.capabilityId}`),
  );
  const fromCollapsedLineByKey = new Map(
    from.collapsedLines.map((l) => [`collapsed-${l.personaId}-${l.capabilityId}`, l]),
  );

  for (const toLine of to.collapsedLines) {
    const key = `collapsed-${toLine.personaId}-${toLine.capabilityId}`;
    const fromLine = fromCollapsedLineByKey.get(key);
    if (fromLine) {
      collapsedLines.push({ ...toLine, path: morphPath(fromLine.path, toLine.path, t) });
      collapsedLineOpacity.set(key, 1);
    } else {
      // Newly collapsed — morph from expanded line for same cap
      const fromExpandedLine = from.storyLines.find(
        (l) => l.personaId === toLine.personaId && l.capabilityId === toLine.capabilityId,
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
    const key = `collapsed-${fromLine.personaId}-${fromLine.capabilityId}`;
    if (toCollapsedLineKeys.has(key)) continue;
    collapsedLines.push(fromLine);
    collapsedLineOpacity.set(key, 1 - t);
  }

  return {
    personaPositions,
    storyBoxes,
    storyBoxOpacity,
    storyLines,
    storyLineOpacity,
    collapsedGroups,
    collapsedGroupOpacity,
    collapsedLines,
    collapsedLineOpacity,
    collapsedGroupsByPersona,
    isAnimating: true,
  };
}

/* ── Morph a single path (quadratic Bezier) ────────────────────────── */

function morphPath(
  fromPath: { d: string; points?: Position[] },
  toPath: { d: string; points?: Position[] },
  t: number,
): { d: string; points?: Position[] } {
  const fromNums = parsePathNums(fromPath.d);
  const toNums = parsePathNums(toPath.d);

  if (fromNums && toNums) {
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
    return { d: buildPath(interpolated), points };
  }

  // Fallback: can't parse, just use target
  return t < 0.5 ? fromPath : toPath;
}

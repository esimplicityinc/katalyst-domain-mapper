/**
 * Trunk-routed path generator for the V2 landscape visualization.
 *
 * Produces SVG path strings that route user-story→capability connections
 * through a shared vertical "trunk" line, creating a cleaner routing
 * compared to the direct quadratic Bézier curves in routedPath().
 *
 * The path goes: source → horizontal to trunk → vertical along trunk → horizontal to target.
 */

/**
 * Generate an SVG path from a story-box right edge to a capability node,
 * routed through a shared vertical trunk line.
 *
 * @param x1         Source x (story box right edge)
 * @param y1         Source y (story box center-y)
 * @param trunkX     X-coordinate of the vertical trunk line
 * @param x2         Target x (capability node center-x)
 * @param y2         Target y (capability node top-center)
 * @param bendFactor Per-line offset to fan overlapping routes apart
 * @param trunkY     Optional y-coordinate override for the trunk convergence point
 * @returns          SVG path `d` attribute string
 */
export function trunkRoutedPath(
  x1: number,
  y1: number,
  trunkX: number,
  x2: number,
  y2: number,
  bendFactor = 0.0,
  trunkY?: number,
): string {
  // Offset the trunk x slightly per-line so overlapping routes fan apart
  const tx = trunkX + bendFactor;

  // If trunkY is given, route through that y-level on the trunk;
  // otherwise route at the midpoint between source and target y.
  const ty = trunkY ?? (y1 + y2) / 2;

  // Horizontal from source to trunk, vertical along trunk, horizontal to target
  // Using line segments with rounded corners via a cubic Bézier at the bends
  const r = 8; // corner radius

  // Determine direction
  const goingDown = y2 > y1;
  const signY = goingDown ? 1 : -1;

  // Path: source → trunk → target with smooth corners
  return [
    `M${x1},${y1}`,
    // Horizontal to trunk (with rounded corner into vertical)
    `L${tx - r},${y1}`,
    `Q${tx},${y1} ${tx},${y1 + signY * r}`,
    // Vertical along trunk to target y-level
    `L${tx},${ty}`,
    // Continue to target y (with rounded corner into horizontal)
    `L${tx},${y2 - signY * r}`,
    `Q${tx},${y2} ${tx + (x2 > tx ? r : -r)},${y2}`,
    // Horizontal to target
    `L${x2},${y2}`,
  ].join(" ");
}

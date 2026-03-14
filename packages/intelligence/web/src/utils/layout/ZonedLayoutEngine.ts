/**
 * Zoned Layout Engine – V2 Landscape Layout
 *
 * A purpose-built layout engine for the Business Landscape that organizes
 * nodes into semantic zones (user types on the left, capabilities in the
 * middle, bounded contexts on the right) with taxonomy-aware grouping.
 *
 * Unlike ELK/Dagre/D3-Force which are general-purpose graph layout algorithms,
 * ZonedLayoutEngine understands the domain semantics and produces layouts
 * optimized for the FOE landscape visualization.
 *
 * TODO: Full implementation — currently delegates to ElkLayoutEngine as a
 * placeholder while the zoned layout algorithm is being developed.
 */

import type {
  LandscapeGraph,
  LandscapeLayoutEngine,
  LandscapePositions,
} from "../../types/landscape.js";
import { ElkLayoutEngine } from "./ElkLayoutEngine.js";

const delegate = new ElkLayoutEngine();

export class ZonedLayoutEngine implements LandscapeLayoutEngine {
  name = "zoned";

  async layout(graph: LandscapeGraph): Promise<LandscapePositions> {
    // TODO: Implement zoned layout algorithm.
    // For now, delegate to ELK to keep the app functional.
    return delegate.layout(graph);
  }
}

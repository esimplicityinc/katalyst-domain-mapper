import { relative } from "node:path";
import { GOVERNANCE_ROOT } from "../config.js";

/**
 * Convert absolute path to relative path from governance root.
 *
 * Example:
 *   /Users/.../packages/delivery-framework/capabilities/CAP-001.md
 *   -> capabilities/CAP-001.md
 */
export function makeGovernancePath(absolutePath: string): string {
  return relative(GOVERNANCE_ROOT, absolutePath);
}

/**
 * Map MoSCoW priority values (must/should/could) to PrioritySchema values (high/medium/low).
 * NFR frontmatter uses MoSCoW convention; Zod schemas use high/medium/low.
 */
export function mapMoscowPriority(moscow: string): "high" | "medium" | "low" {
  switch (moscow.toLowerCase()) {
    case "must":
      return "high";
    case "should":
      return "medium";
    case "could":
      return "low";
    default:
      // If already in target format, pass through
      if (["high", "medium", "low"].includes(moscow.toLowerCase())) {
        return moscow.toLowerCase() as "high" | "medium" | "low";
      }
      return "medium";
  }
}

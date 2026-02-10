import type { ContextRelationship } from "../../types/domain";

/** Human-readable labels for context relationship types. */
export const RELATIONSHIP_LABELS: Record<ContextRelationship["type"], string> = {
  upstream: "Upstream",
  downstream: "Downstream",
  conformist: "Conformist",
  "anticorruption-layer": "ACL",
  "shared-kernel": "Shared Kernel",
  "customer-supplier": "Customer-Supplier",
  partnership: "Partnership",
  "published-language": "Published Language",
};

/**
 * Tailwind class sets for bounded-context status badges.
 *
 * Uses the DDD ubiquitous-language terms: draft | stable | deprecated.
 */
export const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  stable:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  deprecated:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

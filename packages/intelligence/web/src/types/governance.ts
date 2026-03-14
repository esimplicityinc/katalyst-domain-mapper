// ── Governance Dashboard types ──────────────────────────────────────────────
// Re-exported from @foe/schemas — the single source of truth.

import { taxonomy } from "@foe/schemas";

export type GovernanceSnapshot = taxonomy.StoredGovernanceSnapshot;
export type RoadItemSummary = taxonomy.RoadItemSummary;
export type CapabilityCoverage = taxonomy.CapabilityCoverage;
export type UserTypeCoverage = taxonomy.UserTypeCoverage;
export type IntegrityReport = taxonomy.IntegrityReport;
export type TrendPoint = taxonomy.TrendPoint;
export type GovernanceState = taxonomy.GovernanceState;

// Re-export runtime constants from @foe/schemas
export const GOVERNANCE_STATES = taxonomy.GOVERNANCE_STATES;
export const STATE_LABELS = taxonomy.STATE_LABELS;

// ── Display Constants (UI-only, not in @foe/schemas) ───────────────────────
// These Tailwind CSS class maps are presentation concerns and stay here.

export const STATE_COLORS: Record<
  GovernanceState,
  { bg: string; text: string; border: string }
> = {
  proposed: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-600",
  },
  adr_validated: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
  },
  bdd_pending: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-300 dark:border-cyan-700",
  },
  bdd_complete: {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-300 dark:border-teal-700",
  },
  implementing: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-700",
  },
  nfr_validating: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-300 dark:border-purple-700",
  },
  nfr_blocked: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-300 dark:border-red-700",
  },
  complete: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-300 dark:border-green-700",
  },
};

// Priority colors
export const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-red-600 dark:text-red-400",
  high: "text-orange-600 dark:text-orange-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-gray-500 dark:text-gray-400",
};

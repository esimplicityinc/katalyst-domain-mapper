// ── Governance Dashboard types ──────────────────────────────────────────────
// These match the API response shapes from packages/foe-api governance routes (ROAD-005).

export interface GovernanceSnapshot {
  id: string;
  project: string;
  version: string;
  generated: string;
  createdAt: string;
  stats: {
    capabilities: number;
    personas: number;
    userStories: number;
    roadItems: number;
    integrityStatus: string; // "pass" | "fail"
    integrityErrors: number;
  };
}

export interface RoadItemSummary {
  id: string;
  title: string;
  status: string; // governance states from RoadStatusSchema: proposed, adr_validated, bdd_pending, etc.
  phase: number;
  priority: string; // critical, high, medium, low
}

export interface CapabilityCoverage {
  id: string;
  title: string;
  status: string;
  roadCount: number;
  storyCount: number;
}

export interface PersonaCoverage {
  id: string;
  name: string;
  type: string;
  storyCount: number;
  capabilityCount: number;
}

export interface IntegrityReport {
  valid: boolean;
  errors: string[];
  totalArtifacts: number;
  checkedAt: string;
}

export interface TrendPoint {
  snapshotId: string;
  generated: string;
  totalCapabilities: number;
  totalRoadItems: number;
  integrityStatus: string;
  completedRoads: number;
}

// State machine states aligned with RoadStatusSchema from @foe/schemas
// 8-state governance workflow pipeline:
//   proposed → adr_validated → bdd_pending → bdd_complete → implementing → nfr_validating → complete
//                                                                              ↓
//                                                                         nfr_blocked (loops back)
export const GOVERNANCE_STATES = [
  "proposed",
  "adr_validated",
  "bdd_pending",
  "bdd_complete",
  "implementing",
  "nfr_validating",
  "nfr_blocked",
  "complete",
] as const;

export type GovernanceState = (typeof GOVERNANCE_STATES)[number];

// Human-readable labels for Kanban column headers
export const STATE_LABELS: Record<GovernanceState, string> = {
  proposed: "Proposed",
  adr_validated: "ADR Validated",
  bdd_pending: "BDD Pending",
  bdd_complete: "BDD Complete",
  implementing: "Implementing",
  nfr_validating: "NFR Validating",
  nfr_blocked: "NFR Blocked",
  complete: "Complete",
};

// Color mapping for governance states
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

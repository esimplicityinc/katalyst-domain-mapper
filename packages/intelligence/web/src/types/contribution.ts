// ── Contribution UI Types ──────────────────────────────────────────────────
// Shared types for the contribution management UI. These are UI-specific
// types that correspond to the API response shapes.

export type ContributionStatus = "draft" | "proposed" | "rejected" | "accepted" | "deprecated" | "superseded";

export type ContributionAction = "submit" | "accept" | "reject" | "withdraw" | "revise" | "deprecate" | "reactivate" | "supersede";

export type ContributableItemType =
  | "capability" | "user-type" | "user-story"
  | "road-item" | "adr" | "nfr" | "change-entry"
  | "bounded-context" | "aggregate" | "value-object"
  | "domain-event" | "glossary-term" | "workflow" | "use-case";

export interface ContributionItem {
  itemType: ContributableItemType;
  itemId: string;
  title: string;
  contribution: ContributionData;
  metadata: Record<string, unknown>;
}

export interface ContributionData {
  status: ContributionStatus;
  version: number;
  supersedes: string | null;
  supersededBy: string | null;
  submittedBy: string | null;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewFeedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionVersion {
  version: number;
  status: ContributionStatus;
  createdAt: string;
  submittedBy: string | null;
  reviewedBy: string | null;
  reviewFeedback: string | null;
}

export interface FieldDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: "added" | "removed" | "modified" | "unchanged";
}

export interface ContributionCounts {
  myDrafts: number;
  pendingReview: number;
  rejected: number;
}

export interface ContributionListResponse {
  items: ContributionItem[];
  total: number;
  counts: Record<ContributionStatus, number>;
}

export interface ContributionListParams {
  status?: ContributionStatus;
  type?: ContributableItemType;
  submittedBy?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TransitionResponse {
  success: boolean;
  item: ContributionItem;
  transition: {
    from: ContributionStatus;
    to: ContributionStatus;
    action: string;
    timestamp: string;
  };
}

export interface ContributionDetail extends ContributionItem {
  versions: ContributionVersion[];
}

// ── Display Constants ──────────────────────────────────────────────────────

export const CONTRIBUTION_STATUS_COLORS: Record<ContributionStatus, string> = {
  draft:      "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  proposed:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  rejected:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  accepted:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  deprecated: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  superseded: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-500",
};

export const CONTRIBUTION_STATUS_LABELS: Record<ContributionStatus, string> = {
  draft:      "Draft",
  proposed:   "Pending Review",
  rejected:   "Rejected",
  accepted:   "Accepted",
  deprecated: "Deprecated",
  superseded: "Superseded",
};

export const ITEM_TYPE_LABELS: Record<ContributableItemType, string> = {
  "capability":      "Capability",
  "user-type":       "User Type",
  "user-story":      "User Story",
  "road-item":       "Road Item",
  "adr":             "ADR",
  "nfr":             "NFR",
  "change-entry":    "Change Entry",
  "bounded-context": "Bounded Context",
  "aggregate":       "Aggregate",
  "value-object":    "Value Object",
  "domain-event":    "Domain Event",
  "glossary-term":   "Glossary Term",
  "workflow":        "Workflow",
  "use-case":        "Use Case",
};

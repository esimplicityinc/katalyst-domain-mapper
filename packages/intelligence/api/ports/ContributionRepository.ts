// ── Contribution Repository Port ────────────────────────────────────────────
// Storage-agnostic interface for the universal contribution lifecycle.
// Tracks any taxonomy item type through a review workflow with full audit trail.

import type { ContributionStatus, ContributionAction } from "@foe/schemas/taxonomy";

// ── Query / Filter Types ───────────────────────────────────────────────────

export interface ContributionListFilters {
  status?: ContributionStatus;
  itemType?: string;
  submittedBy?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ── Stored Row Types ───────────────────────────────────────────────────────

export interface StoredContributionItem {
  id: string;
  itemType: string;
  itemId: string;
  version: number;
  status: ContributionStatus;
  supersedes: string | null;
  supersededBy: string | null;
  submittedBy: string | null;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewFeedback: string | null;
  itemData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredContributionAuditEntry {
  id: string;
  contribId: string;
  action: string;
  fromStatus: string;
  toStatus: string;
  actor: string | null;
  feedback: string | null;
  timestamp: string;
}

export interface StoredContributionVersion {
  id: string;
  contribId: string;
  version: number;
  itemData: Record<string, unknown>;
  createdAt: string;
}

// ── Aggregate Result Types ─────────────────────────────────────────────────

export interface ContributionCounts {
  draft: number;
  proposed: number;
  rejected: number;
  accepted: number;
  deprecated: number;
  superseded: number;
}

// ── Repository Interface ───────────────────────────────────────────────────

export interface ContributionRepository {
  // ── Queries ────────────────────────────────────────────────────────────

  /** List contribution items with optional filters, ordered by updatedAt desc */
  listContributions(filters: ContributionListFilters): Promise<{
    items: StoredContributionItem[];
    total: number;
    counts: ContributionCounts;
  }>;

  /** Get counts by status (for badge display) */
  getCounts(): Promise<ContributionCounts>;

  /** Get a single contribution item by type + itemId (latest version) */
  getContribution(itemType: string, itemId: string): Promise<StoredContributionItem | null>;

  /** Get a contribution item by its internal UUID */
  getContributionById(id: string): Promise<StoredContributionItem | null>;

  /** Get all versions of an item */
  getVersions(itemType: string, itemId: string): Promise<StoredContributionVersion[]>;

  /** Get audit log entries for a contribution item */
  getAuditLog(contribId: string): Promise<StoredContributionAuditEntry[]>;

  // ── Commands ───────────────────────────────────────────────────────────

  /** Create a new contribution item (typically draft, version 1) */
  createContribution(item: Omit<StoredContributionItem, "id">): Promise<StoredContributionItem>;

  /** Update an existing contribution item's status and metadata */
  updateContribution(
    id: string,
    updates: Partial<
      Pick<
        StoredContributionItem,
        | "status"
        | "submittedBy"
        | "submittedAt"
        | "reviewedBy"
        | "reviewedAt"
        | "reviewFeedback"
        | "supersedes"
        | "supersededBy"
        | "updatedAt"
      >
    >,
  ): Promise<StoredContributionItem | null>;

  /** Write an audit log entry */
  addAuditEntry(entry: Omit<StoredContributionAuditEntry, "id">): Promise<StoredContributionAuditEntry>;

  /** Save a version snapshot (item data at a point in time) */
  saveVersion(version: Omit<StoredContributionVersion, "id">): Promise<StoredContributionVersion>;

  /** Create a new version row for an item (clone for new-version workflow) */
  createNewVersion(
    itemType: string,
    itemId: string,
    newVersion: number,
    itemData: Record<string, unknown>,
  ): Promise<StoredContributionItem>;
}

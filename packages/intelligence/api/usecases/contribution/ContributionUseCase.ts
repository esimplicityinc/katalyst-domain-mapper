// ── Contribution Use Case ────────────────────────────────────────────────────
// Business logic for the universal contribution lifecycle.
// Validates transitions against the state machine, manages audit trail,
// version history, and field-level diffs.

import {
  CONTRIBUTION_ACTIONS,
  validateContributionTransition,
  type ContributionStatus,
  type ContributionAction,
} from "@foe/schemas/taxonomy";
import type {
  ContributionRepository,
  ContributionListFilters,
  ContributionCounts,
  StoredContributionItem,
  StoredContributionVersion,
  StoredContributionAuditEntry,
} from "../../ports/ContributionRepository.js";
import type { TypeRouter, CreateContributionInput, CreatedItem } from "./TypeRouter.js";

// ── Error Types ────────────────────────────────────────────────────────────

export class ContributionNotFoundError extends Error {
  constructor(itemType: string, itemId: string) {
    super(`Contribution not found: ${itemType}/${itemId}`);
    this.name = "ContributionNotFoundError";
  }
}

export class InvalidTransitionError extends Error {
  constructor(from: string, action: string) {
    super(`Invalid transition: cannot perform '${action}' from status '${from}'`);
    this.name = "InvalidTransitionError";
  }
}

// ── Result Types ───────────────────────────────────────────────────────────

export interface TransitionResult {
  success: boolean;
  item: StoredContributionItem;
  transition: {
    from: ContributionStatus;
    to: ContributionStatus;
    action: string;
    timestamp: string;
  };
}

export interface ContributionDetail {
  item: StoredContributionItem;
  versions: StoredContributionVersion[];
  auditLog: StoredContributionAuditEntry[];
}

export interface FieldDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: "added" | "removed" | "modified" | "unchanged";
}

// ── Use Case ───────────────────────────────────────────────────────────────

export class ContributionUseCase {
  private typeRouter: TypeRouter | null = null;

  constructor(private repo: ContributionRepository) {}

  /** Inject the type router for contribution-aware creates. */
  setTypeRouter(router: TypeRouter): void {
    this.typeRouter = router;
  }

  // ── Queries ────────────────────────────────────────────────────────────

  async list(filters: ContributionListFilters) {
    return this.repo.listContributions(filters);
  }

  async getCounts(): Promise<ContributionCounts> {
    return this.repo.getCounts();
  }

  async getDetail(itemType: string, itemId: string): Promise<ContributionDetail> {
    const item = await this.repo.getContribution(itemType, itemId);
    if (!item) throw new ContributionNotFoundError(itemType, itemId);

    const [versions, auditLog] = await Promise.all([
      this.repo.getVersions(itemType, itemId),
      this.repo.getAuditLog(item.id),
    ]);

    return { item, versions, auditLog };
  }

  async getVersions(itemType: string, itemId: string): Promise<StoredContributionVersion[]> {
    return this.repo.getVersions(itemType, itemId);
  }

  async getDiff(
    itemType: string,
    itemId: string,
    v1: number,
    v2: number,
  ): Promise<FieldDiff[]> {
    const versions = await this.repo.getVersions(itemType, itemId);

    const version1 = versions.find((v) => v.version === v1);
    const version2 = versions.find((v) => v.version === v2);

    if (!version1 || !version2) {
      throw new ContributionNotFoundError(
        itemType,
        `${itemId} (version ${!version1 ? v1 : v2})`,
      );
    }

    return this.computeFieldDiff(version1.itemData, version2.itemData);
  }

  // ── Contribution-Aware Create ──────────────────────────────────────────

  /**
   * Creates an item through the contribution lifecycle:
   * 1. Creates the item in the type-specific table via TypeRouter
   * 2. Creates a contribution_items record with status: 'proposed'
   * 3. Saves a version snapshot
   * 4. Logs the create → proposed audit trail
   */
  async createContributedItem(input: CreateContributionInput): Promise<{
    item: StoredContributionItem;
    created: CreatedItem;
  }> {
    if (!this.typeRouter) {
      throw new Error("TypeRouter not configured. Call setTypeRouter() first.");
    }

    // 1. Create the actual item via the type router
    const created = await this.typeRouter.create(input);

    const now = new Date().toISOString();

    // 2. Create the contribution tracking record
    const contribution = await this.repo.createContribution({
      itemType: input.itemType,
      itemId: created.id,
      version: 1,
      status: "proposed",
      supersedes: null,
      supersededBy: null,
      submittedBy: input.submittedBy,
      submittedAt: now,
      reviewedBy: null,
      reviewedAt: null,
      reviewFeedback: null,
      itemData: created.itemData,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Save the initial version snapshot
    await this.repo.saveVersion({
      contribId: contribution.id,
      version: 1,
      itemData: created.itemData,
      createdAt: now,
    });

    // 4. Audit: create → proposed
    await this.repo.addAuditEntry({
      contribId: contribution.id,
      action: "create",
      fromStatus: "draft",
      toStatus: "proposed",
      actor: input.submittedBy,
      feedback: input.contributionNote ?? null,
      timestamp: now,
    });

    return { item: contribution, created };
  }

  // ── Transitions ────────────────────────────────────────────────────────

  async performTransition(
    itemType: string,
    itemId: string,
    action: string,
    actor?: string,
    feedback?: string,
  ): Promise<TransitionResult> {
    const actionDef = CONTRIBUTION_ACTIONS[action];
    if (!actionDef) {
      throw new InvalidTransitionError("unknown", action);
    }

    const item = await this.repo.getContribution(itemType, itemId);
    if (!item) throw new ContributionNotFoundError(itemType, itemId);

    // Validate the transition against the state machine
    if (item.status !== actionDef.from) {
      throw new InvalidTransitionError(item.status, action);
    }
    if (!validateContributionTransition(item.status, actionDef.to)) {
      throw new InvalidTransitionError(item.status, action);
    }

    const now = new Date().toISOString();

    // Build the update payload based on the action
    const updates: Parameters<ContributionRepository["updateContribution"]>[1] = {
      status: actionDef.to,
      updatedAt: now,
    };

    if (action === "submit") {
      updates.submittedBy = actor ?? null;
      updates.submittedAt = now;
    }

    if (action === "accept" || action === "reject") {
      updates.reviewedBy = actor ?? null;
      updates.reviewedAt = now;
      if (action === "reject" && feedback) {
        updates.reviewFeedback = feedback;
      }
    }

    if (action === "revise" || action === "withdraw" || action === "reactivate") {
      // Reset review fields when going back to draft
      updates.reviewedBy = null;
      updates.reviewedAt = null;
      updates.reviewFeedback = null;
    }

    const updated = await this.repo.updateContribution(item.id, updates);
    if (!updated) throw new ContributionNotFoundError(itemType, itemId);

    // Write audit log entry
    await this.repo.addAuditEntry({
      contribId: item.id,
      action,
      fromStatus: item.status,
      toStatus: actionDef.to,
      actor: actor ?? null,
      feedback: feedback ?? null,
      timestamp: now,
    });

    return {
      success: true,
      item: updated,
      transition: {
        from: item.status as ContributionStatus,
        to: actionDef.to,
        action,
        timestamp: now,
      },
    };
  }

  // ── New Version ────────────────────────────────────────────────────────

  async createNewVersion(
    itemType: string,
    itemId: string,
    actor?: string,
  ): Promise<TransitionResult> {
    const current = await this.repo.getContribution(itemType, itemId);
    if (!current) throw new ContributionNotFoundError(itemType, itemId);

    if (current.status !== "accepted") {
      throw new InvalidTransitionError(
        current.status,
        "new-version (item must be accepted)",
      );
    }

    const now = new Date().toISOString();
    const newVersion = current.version + 1;

    // Save current data as a version snapshot
    if (current.itemData) {
      await this.repo.saveVersion({
        contribId: current.id,
        version: current.version,
        itemData: current.itemData,
        createdAt: now,
      });
    }

    // Mark current as superseded
    await this.repo.updateContribution(current.id, {
      status: "superseded",
      supersededBy: `${itemId}@v${newVersion}`,
      updatedAt: now,
    });

    // Create the new version row
    const newItem = await this.repo.createNewVersion(
      itemType,
      itemId,
      newVersion,
      current.itemData ?? {},
    );

    // Audit the supersede transition on the old item
    await this.repo.addAuditEntry({
      contribId: current.id,
      action: "supersede",
      fromStatus: "accepted",
      toStatus: "superseded",
      actor: actor ?? null,
      feedback: `Superseded by v${newVersion}`,
      timestamp: now,
    });

    // Audit the creation of the new version
    await this.repo.addAuditEntry({
      contribId: newItem.id,
      action: "new-version",
      fromStatus: "draft",
      toStatus: "draft",
      actor: actor ?? null,
      feedback: `Created from v${current.version}`,
      timestamp: now,
    });

    return {
      success: true,
      item: newItem,
      transition: {
        from: "accepted" as ContributionStatus,
        to: "draft" as ContributionStatus,
        action: "new-version",
        timestamp: now,
      },
    };
  }

  // ── Private Helpers ────────────────────────────────────────────────────

  private computeFieldDiff(
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
  ): FieldDiff[] {
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    const diffs: FieldDiff[] = [];

    for (const key of allKeys) {
      const oldValue = oldData[key];
      const newValue = newData[key];

      if (!(key in oldData)) {
        diffs.push({ field: key, oldValue: undefined, newValue, changeType: "added" });
      } else if (!(key in newData)) {
        diffs.push({ field: key, oldValue, newValue: undefined, changeType: "removed" });
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diffs.push({ field: key, oldValue, newValue, changeType: "modified" });
      } else {
        diffs.push({ field: key, oldValue, newValue, changeType: "unchanged" });
      }
    }

    return diffs;
  }
}

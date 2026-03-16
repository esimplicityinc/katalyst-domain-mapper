// ── Contribution Repository – SQLite / Drizzle Adapter ──────────────────────
import { eq, desc, and, like, count, type SQL } from "drizzle-orm";
import type { DrizzleDB } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import type {
  ContributionRepository,
  ContributionListFilters,
  ContributionCounts,
  StoredContributionItem,
  StoredContributionAuditEntry,
  StoredContributionVersion,
} from "../../ports/ContributionRepository.js";
import type { ContributionStatus } from "@foe/schemas/taxonomy";

export class ContributionRepositorySQLite implements ContributionRepository {
  constructor(private db: DrizzleDB) {}

  // ── Queries ──────────────────────────────────────────────────────────────

  async listContributions(filters: ContributionListFilters): Promise<{
    items: StoredContributionItem[];
    total: number;
    counts: ContributionCounts;
  }> {
    const conditions: SQL<unknown>[] = [];

    if (filters.status) {
      conditions.push(eq(schema.contributionItems.status, filters.status));
    }
    if (filters.itemType) {
      conditions.push(eq(schema.contributionItems.itemType, filters.itemType));
    }
    if (filters.submittedBy) {
      conditions.push(eq(schema.contributionItems.submittedBy, filters.submittedBy));
    }
    if (filters.search) {
      conditions.push(like(schema.contributionItems.itemId, `%${filters.search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const rows = this.db
      .select()
      .from(schema.contributionItems)
      .where(where)
      .orderBy(desc(schema.contributionItems.updatedAt))
      .limit(limit)
      .offset(offset)
      .all();

    const totalResult = this.db
      .select({ value: count() })
      .from(schema.contributionItems)
      .where(where)
      .get();

    const total = totalResult?.value ?? 0;
    const counts = await this.getCounts();

    return {
      items: rows.map((r) => this.toStoredItem(r)),
      total,
      counts,
    };
  }

  async getCounts(): Promise<ContributionCounts> {
    const rows = this.db
      .select({
        status: schema.contributionItems.status,
        cnt: count(),
      })
      .from(schema.contributionItems)
      .groupBy(schema.contributionItems.status)
      .all();

    const result: ContributionCounts = {
      draft: 0,
      proposed: 0,
      rejected: 0,
      accepted: 0,
      deprecated: 0,
      superseded: 0,
    };

    for (const row of rows) {
      if (row.status in result) {
        result[row.status as keyof ContributionCounts] = row.cnt;
      }
    }

    return result;
  }

  async getContribution(
    itemType: string,
    itemId: string,
  ): Promise<StoredContributionItem | null> {
    const row = this.db
      .select()
      .from(schema.contributionItems)
      .where(
        and(
          eq(schema.contributionItems.itemType, itemType),
          eq(schema.contributionItems.itemId, itemId),
        ),
      )
      .orderBy(desc(schema.contributionItems.version))
      .limit(1)
      .get();

    return row ? this.toStoredItem(row) : null;
  }

  async getContributionById(id: string): Promise<StoredContributionItem | null> {
    const row = this.db
      .select()
      .from(schema.contributionItems)
      .where(eq(schema.contributionItems.id, id))
      .get();

    return row ? this.toStoredItem(row) : null;
  }

  async getVersions(
    itemType: string,
    itemId: string,
  ): Promise<StoredContributionVersion[]> {
    // First find all contribution item IDs for this type+id
    const contribs = this.db
      .select({ id: schema.contributionItems.id })
      .from(schema.contributionItems)
      .where(
        and(
          eq(schema.contributionItems.itemType, itemType),
          eq(schema.contributionItems.itemId, itemId),
        ),
      )
      .all();

    if (contribs.length === 0) return [];

    const contribIds = contribs.map((c) => c.id);

    // Get all version snapshots for these contributions
    const versions: StoredContributionVersion[] = [];
    for (const cid of contribIds) {
      const rows = this.db
        .select()
        .from(schema.contributionVersions)
        .where(eq(schema.contributionVersions.contribId, cid))
        .orderBy(desc(schema.contributionVersions.version))
        .all();

      for (const row of rows) {
        versions.push({
          id: row.id,
          contribId: row.contribId,
          version: row.version,
          itemData: (row.itemData ?? {}) as Record<string, unknown>,
          createdAt: row.createdAt,
        });
      }
    }

    return versions.sort((a, b) => b.version - a.version);
  }

  async getAuditLog(contribId: string): Promise<StoredContributionAuditEntry[]> {
    const rows = this.db
      .select()
      .from(schema.contributionAuditLog)
      .where(eq(schema.contributionAuditLog.contribId, contribId))
      .orderBy(desc(schema.contributionAuditLog.timestamp))
      .all();

    return rows.map((r) => ({
      id: r.id,
      contribId: r.contribId,
      action: r.action,
      fromStatus: r.fromStatus,
      toStatus: r.toStatus,
      actor: r.actor,
      feedback: r.feedback,
      timestamp: r.timestamp,
    }));
  }

  // ── Commands ─────────────────────────────────────────────────────────────

  async createContribution(
    item: Omit<StoredContributionItem, "id">,
  ): Promise<StoredContributionItem> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db
      .insert(schema.contributionItems)
      .values({
        id,
        itemType: item.itemType,
        itemId: item.itemId,
        version: item.version,
        status: item.status,
        supersedes: item.supersedes,
        supersededBy: item.supersededBy,
        submittedBy: item.submittedBy,
        submittedAt: item.submittedAt,
        reviewedBy: item.reviewedBy,
        reviewedAt: item.reviewedAt,
        reviewFeedback: item.reviewFeedback,
        itemData: item.itemData,
        createdAt: item.createdAt || now,
        updatedAt: item.updatedAt || now,
      })
      .run();

    return { id, ...item, createdAt: item.createdAt || now, updatedAt: item.updatedAt || now };
  }

  async updateContribution(
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
  ): Promise<StoredContributionItem | null> {
    const now = new Date().toISOString();
    const values: Record<string, unknown> = { updatedAt: updates.updatedAt ?? now };

    if (updates.status !== undefined) values.status = updates.status;
    if (updates.submittedBy !== undefined) values.submittedBy = updates.submittedBy;
    if (updates.submittedAt !== undefined) values.submittedAt = updates.submittedAt;
    if (updates.reviewedBy !== undefined) values.reviewedBy = updates.reviewedBy;
    if (updates.reviewedAt !== undefined) values.reviewedAt = updates.reviewedAt;
    if (updates.reviewFeedback !== undefined) values.reviewFeedback = updates.reviewFeedback;
    if (updates.supersedes !== undefined) values.supersedes = updates.supersedes;
    if (updates.supersededBy !== undefined) values.supersededBy = updates.supersededBy;

    this.db
      .update(schema.contributionItems)
      .set(values)
      .where(eq(schema.contributionItems.id, id))
      .run();

    return this.getContributionById(id);
  }

  async addAuditEntry(
    entry: Omit<StoredContributionAuditEntry, "id">,
  ): Promise<StoredContributionAuditEntry> {
    const id = crypto.randomUUID();

    this.db
      .insert(schema.contributionAuditLog)
      .values({
        id,
        contribId: entry.contribId,
        action: entry.action,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        actor: entry.actor,
        feedback: entry.feedback,
        timestamp: entry.timestamp,
      })
      .run();

    return { id, ...entry };
  }

  async saveVersion(
    version: Omit<StoredContributionVersion, "id">,
  ): Promise<StoredContributionVersion> {
    const id = crypto.randomUUID();

    this.db
      .insert(schema.contributionVersions)
      .values({
        id,
        contribId: version.contribId,
        version: version.version,
        itemData: version.itemData,
        createdAt: version.createdAt,
      })
      .run();

    return { id, ...version };
  }

  async createNewVersion(
    itemType: string,
    itemId: string,
    newVersion: number,
    itemData: Record<string, unknown>,
  ): Promise<StoredContributionItem> {
    const now = new Date().toISOString();

    return this.createContribution({
      itemType,
      itemId,
      version: newVersion,
      status: "draft" as ContributionStatus,
      supersedes: `${itemId}@v${newVersion - 1}`,
      supersededBy: null,
      submittedBy: null,
      submittedAt: null,
      reviewedBy: null,
      reviewedAt: null,
      reviewFeedback: null,
      itemData,
      createdAt: now,
      updatedAt: now,
    });
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private toStoredItem(row: typeof schema.contributionItems.$inferSelect): StoredContributionItem {
    return {
      id: row.id,
      itemType: row.itemType,
      itemId: row.itemId,
      version: row.version,
      status: row.status as ContributionStatus,
      supersedes: row.supersedes,
      supersededBy: row.supersededBy,
      submittedBy: row.submittedBy,
      submittedAt: row.submittedAt,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt,
      reviewFeedback: row.reviewFeedback,
      itemData: (row.itemData ?? null) as Record<string, unknown> | null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

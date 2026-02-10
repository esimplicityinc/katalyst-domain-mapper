import { eq, desc } from "drizzle-orm";
import type {
  GovernanceRepository,
  StoredSnapshot,
  CapabilityCoverage,
  PersonaCoverage,
  RoadItemSummary,
  IntegrityReport,
  TrendPoint,
} from "../../ports/GovernanceRepository.js";
import type { DrizzleDB } from "../../db/client.js";
import type { ValidatedSnapshotData } from "../../domain/governance/validateSnapshotData.js";
import * as schema from "../../db/schema.js";

export class GovernanceRepositorySQLite implements GovernanceRepository {
  constructor(private db: DrizzleDB) {}

  async saveSnapshot(data: ValidatedSnapshotData): Promise<StoredSnapshot> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const generated = data.generated ?? now;

    const stats = {
      capabilities:
        data.stats.capabilities ??
        data.stats.totalCapabilities ??
        Object.keys(data.capabilities).length,
      personas: data.stats.personas ?? data.stats.totalPersonas ?? 0,
      userStories: data.stats.userStories ?? data.stats.totalStories ?? 0,
      roadItems:
        data.stats.roadItems ??
        data.stats.totalRoadItems ??
        Object.keys(data.roadItems).length,
      integrityStatus:
        data.stats.integrityStatus ??
        (data.stats.referentialIntegrity?.valid ? "pass" : "fail"),
      integrityErrors:
        data.stats.integrityErrors ??
        data.stats.referentialIntegrity?.errors?.length ??
        0,
    };

    // Insert snapshot
    this.db
      .insert(schema.governanceSnapshots)
      .values({
        id,
        project: data.project,
        version: data.version,
        generated,
        rawIndex: data as unknown as Record<string, unknown>,
        createdAt: now,
      })
      .run();

    // Denormalize capabilities
    const byCapability = data.byCapability ?? {};
    for (const [capId, cap] of Object.entries(data.capabilities)) {
      const capData = byCapability[capId];
      this.db
        .insert(schema.governanceCapabilities)
        .values({
          id: `${id}:${capId}`,
          snapshotId: id,
          title: cap.title ?? capId,
          status: cap.status ?? "unknown",
          roadCount: capData?.roads?.length ?? 0,
          storyCount: capData?.stories?.length ?? 0,
        })
        .run();
    }

    // Denormalize road items
    for (const [roadId, road] of Object.entries(data.roadItems)) {
      this.db
        .insert(schema.governanceRoadItems)
        .values({
          id: `${id}:${roadId}`,
          snapshotId: id,
          roadId,
          title: road.title ?? roadId,
          status: road.status ?? "proposed",
          phase: road.phase ?? 0,
          priority: road.priority ?? "medium",
        })
        .run();
    }

    // Denormalize bounded contexts if present
    const contexts = data.boundedContexts ?? {};
    const byContext = data.byContext ?? {};
    for (const [slug, ctx] of Object.entries(contexts)) {
      const ctxData = byContext[slug];
      this.db
        .insert(schema.governanceContexts)
        .values({
          id: `${id}:${slug}`,
          snapshotId: id,
          slug,
          title: ctx.title ?? slug,
          aggregateCount: ctxData?.aggregates?.length ?? 0,
          eventCount: ctxData?.events?.length ?? 0,
        })
        .run();
    }

    return {
      id,
      project: data.project,
      version: data.version,
      generated,
      createdAt: now,
      stats,
    };
  }

  async getLatestSnapshot(): Promise<StoredSnapshot | null> {
    const row = this.db
      .select()
      .from(schema.governanceSnapshots)
      .orderBy(desc(schema.governanceSnapshots.createdAt))
      .limit(1)
      .get();

    if (!row) return null;
    return this.toStoredSnapshot(row);
  }

  async getSnapshotById(id: string): Promise<StoredSnapshot | null> {
    const row = this.db
      .select()
      .from(schema.governanceSnapshots)
      .where(eq(schema.governanceSnapshots.id, id))
      .get();

    if (!row) return null;
    return this.toStoredSnapshot(row);
  }

  async listSnapshots(limit?: number): Promise<StoredSnapshot[]> {
    const rows = this.db
      .select()
      .from(schema.governanceSnapshots)
      .orderBy(desc(schema.governanceSnapshots.createdAt))
      .limit(limit ?? 50)
      .all();

    return rows.map((row) => this.toStoredSnapshot(row));
  }

  async deleteSnapshot(id: string): Promise<boolean> {
    const existing = this.db
      .select({ id: schema.governanceSnapshots.id })
      .from(schema.governanceSnapshots)
      .where(eq(schema.governanceSnapshots.id, id))
      .get();

    if (!existing) return false;

    this.db
      .delete(schema.governanceSnapshots)
      .where(eq(schema.governanceSnapshots.id, id))
      .run();
    return true;
  }

  async getCapabilityCoverage(): Promise<CapabilityCoverage[]> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return [];

    const rows = this.db
      .select()
      .from(schema.governanceCapabilities)
      .where(eq(schema.governanceCapabilities.snapshotId, latest.id))
      .all();

    return rows.map((r) => ({
      id: r.id.replace(`${latest.id}:`, ""),
      title: r.title,
      status: r.status,
      roadCount: r.roadCount,
      storyCount: r.storyCount,
    }));
  }

  async getPersonaCoverage(): Promise<PersonaCoverage[]> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return [];

    const raw =
      (latest as unknown as { _rawIndex: ValidatedSnapshotData })._rawIndex ??
      (await this.getRawIndex(latest.id));

    if (!raw) return [];

    const personas = raw.personas ?? {};
    const byPersona = raw.byPersona ?? {};

    return Object.entries(personas).map(([perId, persona]) => {
      const personaData = byPersona[perId];
      return {
        id: perId,
        name: persona.name ?? perId,
        type: persona.type ?? "human",
        storyCount: personaData?.stories?.length ?? 0,
        capabilityCount: personaData?.capabilities?.length ?? 0,
      };
    });
  }

  async getRoadItems(statusFilter?: string): Promise<RoadItemSummary[]> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return [];

    let query = this.db
      .select()
      .from(schema.governanceRoadItems)
      .where(eq(schema.governanceRoadItems.snapshotId, latest.id));

    const rows = query.all();

    const filtered = statusFilter
      ? rows.filter((r) => r.status === statusFilter)
      : rows;

    return filtered.map((r) => ({
      id: r.roadId,
      title: r.title,
      status: r.status,
      phase: r.phase,
      priority: r.priority,
    }));
  }

  async getIntegrity(): Promise<IntegrityReport> {
    const latest = await this.getLatestSnapshot();
    if (!latest) {
      return {
        valid: true,
        errors: [],
        totalArtifacts: 0,
        checkedAt: new Date().toISOString(),
      };
    }

    const raw = await this.getRawIndex(latest.id);
    if (!raw) {
      return {
        valid: true,
        errors: [],
        totalArtifacts: 0,
        checkedAt: latest.generated,
      };
    }

    const statsObj = raw.stats;
    const integrity = statsObj?.referentialIntegrity;

    // Count total artifacts from stats
    const totalArtifacts =
      (statsObj?.totalCapabilities ?? statsObj?.capabilities ?? 0) +
      (statsObj?.totalPersonas ?? statsObj?.personas ?? 0) +
      (statsObj?.totalStories ?? statsObj?.userStories ?? 0) +
      (statsObj?.totalRoadItems ?? statsObj?.roadItems ?? 0);

    return {
      valid: integrity?.valid ?? latest.stats.integrityStatus === "pass",
      errors: integrity?.errors ?? [],
      totalArtifacts,
      checkedAt: latest.generated,
    };
  }

  async getTrends(limit?: number): Promise<TrendPoint[]> {
    const snapshots = this.db
      .select()
      .from(schema.governanceSnapshots)
      .orderBy(desc(schema.governanceSnapshots.createdAt))
      .limit(limit ?? 50)
      .all();

    return snapshots.map((snap) => {
      const raw = snap.rawIndex as unknown as ValidatedSnapshotData;
      const statsObj = raw?.stats;

      // Count completed roads from denormalized table
      const roadRows = this.db
        .select()
        .from(schema.governanceRoadItems)
        .where(eq(schema.governanceRoadItems.snapshotId, snap.id))
        .all();

      const completedRoads = roadRows.filter(
        (r) => r.status === "complete",
      ).length;

      const capCount = this.db
        .select()
        .from(schema.governanceCapabilities)
        .where(eq(schema.governanceCapabilities.snapshotId, snap.id))
        .all().length;

      return {
        snapshotId: snap.id,
        generated: snap.generated,
        totalCapabilities: capCount,
        totalRoadItems: roadRows.length,
        integrityStatus:
          statsObj?.integrityStatus ??
          (statsObj?.referentialIntegrity?.valid ? "pass" : "fail"),
        completedRoads,
      };
    });
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private toStoredSnapshot(row: {
    id: string;
    project: string;
    version: string;
    generated: string;
    rawIndex: Record<string, unknown>;
    createdAt: string;
  }): StoredSnapshot {
    const raw = row.rawIndex as unknown as ValidatedSnapshotData;
    const statsObj = raw?.stats;

    return {
      id: row.id,
      project: row.project,
      version: row.version,
      generated: row.generated,
      createdAt: row.createdAt,
      stats: {
        capabilities:
          statsObj?.capabilities ?? statsObj?.totalCapabilities ?? 0,
        personas: statsObj?.personas ?? statsObj?.totalPersonas ?? 0,
        userStories: statsObj?.userStories ?? statsObj?.totalStories ?? 0,
        roadItems: statsObj?.roadItems ?? statsObj?.totalRoadItems ?? 0,
        integrityStatus:
          statsObj?.integrityStatus ??
          (statsObj?.referentialIntegrity?.valid ? "pass" : "fail"),
        integrityErrors:
          statsObj?.integrityErrors ??
          statsObj?.referentialIntegrity?.errors?.length ??
          0,
      },
    };
  }

  private async getRawIndex(
    snapshotId: string,
  ): Promise<ValidatedSnapshotData | null> {
    const row = this.db
      .select({ rawIndex: schema.governanceSnapshots.rawIndex })
      .from(schema.governanceSnapshots)
      .where(eq(schema.governanceSnapshots.id, snapshotId))
      .get();

    return (row?.rawIndex as unknown as ValidatedSnapshotData) ?? null;
  }
}

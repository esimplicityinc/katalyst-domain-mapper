import { eq, desc } from "drizzle-orm";
import type {
  GovernanceRepository,
  StoredSnapshot,
  CapabilityCoverage,
  PersonaCoverage,
  RoadItemSummary,
  IntegrityReport,
  TrendPoint,
  StoredPersona,
  StoredUserStory,
  StoredCapability,
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

    // Denormalize capabilities (expanded with full fields)
    const byCapability = data.byCapability ?? {};
    for (const [capId, cap] of Object.entries(data.capabilities)) {
      const capData = byCapability[capId];
      const capFull = cap as Record<string, unknown>;
      this.db
        .insert(schema.governanceCapabilities)
        .values({
          id: `${id}:${capId}`,
          snapshotId: id,
          capabilityId: capId,
          title: cap.title ?? capId,
          status: cap.status ?? "unknown",
          description: capFull.description ?? null,
          category: capFull.category ?? null,
          parentCapability: capFull.parent_capability ?? capFull.parentCapability ?? null,
          dependsOn: capFull.depends_on ?? capFull.dependsOn ?? [],
          roadCount: capData?.roads?.length ?? 0,
          storyCount: capData?.stories?.length ?? 0,
          taxonomyNode: capFull.taxonomy_node ?? capFull.taxonomyNode ?? null,
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

    // Denormalize personas if present
    const personas = data.personas ?? {};
    const byPersona = data.byPersona ?? {};
    for (const [perId, persona] of Object.entries(personas as Record<string, Record<string, unknown>>)) {
      const personaData = byPersona[perId];
      this.db
        .insert(schema.governancePersonas)
        .values({
          id: `${id}:${perId}`,
          snapshotId: id,
          personaId: perId,
          name: persona.name ?? perId,
          type: persona.type ?? "human",
          status: persona.status ?? "draft",
          archetype: persona.archetype ?? "consumer",
          description: persona.description ?? null,
          goals: persona.goals ?? [],
          painPoints: persona.pain_points ?? persona.painPoints ?? [],
          behaviors: persona.behaviors ?? [],
          typicalCapabilities: persona.typical_capabilities ?? persona.typicalCapabilities ?? [],
          technicalProfile: persona.technical_profile ?? persona.technicalProfile ?? null,
          relatedStories: persona.related_stories ?? persona.relatedStories ?? [],
          relatedPersonas: persona.related_personas ?? persona.relatedPersonas ?? [],
          storyCount: personaData?.stories?.length ?? 0,
          capabilityCount: personaData?.capabilities?.length ?? 0,
        })
        .run();
    }

    // Denormalize user stories if present
    const userStories = data.userStories ?? {};
    for (const [storyId, story] of Object.entries(userStories as Record<string, Record<string, unknown>>)) {
      if (typeof story !== "object" || !story) continue;
      this.db
        .insert(schema.governanceUserStories)
        .values({
          id: `${id}:${storyId}`,
          snapshotId: id,
          storyId,
          title: story.title ?? storyId,
          persona: story.persona ?? "",
          status: story.status ?? "draft",
          capabilities: story.capabilities ?? [],
          useCases: story.use_cases ?? story.useCases ?? [],
          acceptanceCriteria: story.acceptance_criteria ?? story.acceptanceCriteria ?? [],
          taxonomyNode: story.taxonomy_node ?? story.taxonomyNode ?? null,
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

  async getLatestSnapshotByProject(project: string): Promise<StoredSnapshot | null> {
    const row = this.db
      .select()
      .from(schema.governanceSnapshots)
      .where(eq(schema.governanceSnapshots.project, project))
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

    const rows = this.db
      .select()
      .from(schema.governancePersonas)
      .where(eq(schema.governancePersonas.snapshotId, latest.id))
      .all();

    // Fall back to raw_index if no denormalized personas (older snapshots)
    if (rows.length === 0) {
      const raw = await this.getRawIndex(latest.id);
      if (!raw) return [];
      const rawPersonas = raw.personas ?? {};
      const rawByPersona = raw.byPersona ?? {};
      return Object.entries(rawPersonas as Record<string, Record<string, unknown>>).map(([perId, persona]) => {
        const personaData = rawByPersona[perId];
        return {
          id: perId,
          name: String(persona.name ?? perId),
          type: String(persona.type ?? "human"),
          storyCount: personaData?.stories?.length ?? 0,
          capabilityCount: personaData?.capabilities?.length ?? 0,
        };
      });
    }

    return rows.map((r) => ({
      id: r.personaId,
      name: r.name,
      type: r.type,
      storyCount: r.storyCount,
      capabilityCount: r.capabilityCount,
    }));
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

  // ── Capability CRUD ────────────────────────────────────────────────────────

  async listCapabilities(): Promise<StoredCapability[]> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return [];
    const rows = this.db
      .select()
      .from(schema.governanceCapabilities)
      .where(eq(schema.governanceCapabilities.snapshotId, latest.id))
      .all();
    return rows.map((r) => this.rowToCapability(r, latest.id));
  }

  async getCapabilityById(id: string): Promise<StoredCapability | null> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return null;
    const row = this.db
      .select()
      .from(schema.governanceCapabilities)
      .where(eq(schema.governanceCapabilities.id, `${latest.id}:${id}`))
      .get();
    if (!row) return null;
    return this.rowToCapability(row, latest.id);
  }

  async createCapability(data: Omit<StoredCapability, 'roadCount' | 'storyCount'>): Promise<StoredCapability> {
    const latest = await this.getLatestSnapshot();
    if (!latest) throw new Error("No governance snapshot exists. Ingest a snapshot first.");
    this.db.insert(schema.governanceCapabilities).values({
      id: `${latest.id}:${data.id}`,
      snapshotId: latest.id,
      capabilityId: data.id,
      title: data.title,
      status: data.status,
      description: data.description ?? null,
      category: data.category ?? null,
      parentCapability: data.parentCapability ?? null,
      dependsOn: data.dependsOn ?? [],
      roadCount: 0,
      storyCount: 0,
      taxonomyNode: data.taxonomyNode ?? null,
    }).run();
    return { ...data, roadCount: 0, storyCount: 0 };
  }

  async updateCapability(id: string, data: Partial<Omit<StoredCapability, 'id' | 'roadCount' | 'storyCount'>>): Promise<StoredCapability | null> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return null;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select().from(schema.governanceCapabilities).where(eq(schema.governanceCapabilities.id, compositeId)).get();
    if (!existing) return null;
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.parentCapability !== undefined) updateData.parentCapability = data.parentCapability;
    if (data.dependsOn !== undefined) updateData.dependsOn = data.dependsOn;
    if (data.taxonomyNode !== undefined) updateData.taxonomyNode = data.taxonomyNode;
    this.db.update(schema.governanceCapabilities).set(updateData).where(eq(schema.governanceCapabilities.id, compositeId)).run();
    const updated = this.db.select().from(schema.governanceCapabilities).where(eq(schema.governanceCapabilities.id, compositeId)).get();
    if (!updated) return null;
    return this.rowToCapability(updated, latest.id);
  }

  async deleteCapability(id: string): Promise<boolean> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return false;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select({ id: schema.governanceCapabilities.id }).from(schema.governanceCapabilities).where(eq(schema.governanceCapabilities.id, compositeId)).get();
    if (!existing) return false;
    this.db.delete(schema.governanceCapabilities).where(eq(schema.governanceCapabilities.id, compositeId)).run();
    return true;
  }

  // ── Persona CRUD ──────────────────────────────────────────────────────────

  async listPersonas(): Promise<StoredPersona[]> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return [];
    const rows = this.db.select().from(schema.governancePersonas).where(eq(schema.governancePersonas.snapshotId, latest.id)).all();
    return rows.map((r) => this.rowToPersona(r, latest.id));
  }

  async getPersonaById(id: string): Promise<StoredPersona | null> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return null;
    const row = this.db.select().from(schema.governancePersonas).where(eq(schema.governancePersonas.id, `${latest.id}:${id}`)).get();
    if (!row) return null;
    return this.rowToPersona(row, latest.id);
  }

  async createPersona(data: Omit<StoredPersona, 'storyCount' | 'capabilityCount'>): Promise<StoredPersona> {
    const latest = await this.getLatestSnapshot();
    if (!latest) throw new Error("No governance snapshot exists. Ingest a snapshot first.");
    this.db.insert(schema.governancePersonas).values({
      id: `${latest.id}:${data.id}`,
      snapshotId: latest.id,
      personaId: data.id,
      name: data.name,
      type: data.type,
      status: data.status,
      archetype: data.archetype,
      description: data.description ?? null,
      goals: data.goals ?? [],
      painPoints: data.painPoints ?? [],
      behaviors: data.behaviors ?? [],
      typicalCapabilities: data.typicalCapabilities ?? [],
      technicalProfile: data.technicalProfile ?? null,
      relatedStories: data.relatedStories ?? [],
      relatedPersonas: data.relatedPersonas ?? [],
      storyCount: 0,
      capabilityCount: 0,
    }).run();
    return { ...data, storyCount: 0, capabilityCount: 0 };
  }

  async updatePersona(id: string, data: Partial<Omit<StoredPersona, 'id' | 'storyCount' | 'capabilityCount'>>): Promise<StoredPersona | null> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return null;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select().from(schema.governancePersonas).where(eq(schema.governancePersonas.id, compositeId)).get();
    if (!existing) return null;
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.archetype !== undefined) updateData.archetype = data.archetype;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.goals !== undefined) updateData.goals = data.goals;
    if (data.painPoints !== undefined) updateData.painPoints = data.painPoints;
    if (data.behaviors !== undefined) updateData.behaviors = data.behaviors;
    if (data.typicalCapabilities !== undefined) updateData.typicalCapabilities = data.typicalCapabilities;
    if (data.technicalProfile !== undefined) updateData.technicalProfile = data.technicalProfile;
    if (data.relatedStories !== undefined) updateData.relatedStories = data.relatedStories;
    if (data.relatedPersonas !== undefined) updateData.relatedPersonas = data.relatedPersonas;
    this.db.update(schema.governancePersonas).set(updateData).where(eq(schema.governancePersonas.id, compositeId)).run();
    const updated = this.db.select().from(schema.governancePersonas).where(eq(schema.governancePersonas.id, compositeId)).get();
    if (!updated) return null;
    return this.rowToPersona(updated, latest.id);
  }

  async deletePersona(id: string): Promise<boolean> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return false;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select({ id: schema.governancePersonas.id }).from(schema.governancePersonas).where(eq(schema.governancePersonas.id, compositeId)).get();
    if (!existing) return false;
    this.db.delete(schema.governancePersonas).where(eq(schema.governancePersonas.id, compositeId)).run();
    return true;
  }

  // ── User Story CRUD ───────────────────────────────────────────────────────

  async listUserStories(): Promise<StoredUserStory[]> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return [];
    const rows = this.db.select().from(schema.governanceUserStories).where(eq(schema.governanceUserStories.snapshotId, latest.id)).all();
    return rows.map((r) => this.rowToUserStory(r, latest.id));
  }

  async getUserStoryById(id: string): Promise<StoredUserStory | null> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return null;
    const row = this.db.select().from(schema.governanceUserStories).where(eq(schema.governanceUserStories.id, `${latest.id}:${id}`)).get();
    if (!row) return null;
    return this.rowToUserStory(row, latest.id);
  }

  async createUserStory(data: StoredUserStory): Promise<StoredUserStory> {
    const latest = await this.getLatestSnapshot();
    if (!latest) throw new Error("No governance snapshot exists. Ingest a snapshot first.");
    this.db.insert(schema.governanceUserStories).values({
      id: `${latest.id}:${data.id}`,
      snapshotId: latest.id,
      storyId: data.id,
      title: data.title,
      persona: data.persona,
      status: data.status,
      capabilities: data.capabilities ?? [],
      useCases: data.useCases ?? [],
      acceptanceCriteria: data.acceptanceCriteria ?? [],
      taxonomyNode: data.taxonomyNode ?? null,
    }).run();
    return data;
  }

  async updateUserStory(id: string, data: Partial<Omit<StoredUserStory, 'id'>>): Promise<StoredUserStory | null> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return null;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select().from(schema.governanceUserStories).where(eq(schema.governanceUserStories.id, compositeId)).get();
    if (!existing) return null;
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.persona !== undefined) updateData.persona = data.persona;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.capabilities !== undefined) updateData.capabilities = data.capabilities;
    if (data.useCases !== undefined) updateData.useCases = data.useCases;
    if (data.acceptanceCriteria !== undefined) updateData.acceptanceCriteria = data.acceptanceCriteria;
    if (data.taxonomyNode !== undefined) updateData.taxonomyNode = data.taxonomyNode;
    this.db.update(schema.governanceUserStories).set(updateData).where(eq(schema.governanceUserStories.id, compositeId)).run();
    const updated = this.db.select().from(schema.governanceUserStories).where(eq(schema.governanceUserStories.id, compositeId)).get();
    if (!updated) return null;
    return this.rowToUserStory(updated, latest.id);
  }

  async deleteUserStory(id: string): Promise<boolean> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return false;
    const compositeId = `${latest.id}:${id}`;
    const existing = this.db.select({ id: schema.governanceUserStories.id }).from(schema.governanceUserStories).where(eq(schema.governanceUserStories.id, compositeId)).get();
    if (!existing) return false;
    this.db.delete(schema.governanceUserStories).where(eq(schema.governanceUserStories.id, compositeId)).run();
    return true;
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private rowToCapability(row: typeof schema.governanceCapabilities.$inferSelect, snapshotId: string): StoredCapability {
    return {
      id: row.capabilityId ?? row.id.replace(`${snapshotId}:`, ""),
      title: row.title,
      status: row.status,
      description: row.description ?? null,
      category: row.category ?? null,
      parentCapability: row.parentCapability ?? null,
      dependsOn: (row.dependsOn as string[]) ?? [],
      roadCount: row.roadCount,
      storyCount: row.storyCount,
      taxonomyNode: row.taxonomyNode ?? null,
    };
  }

  private rowToPersona(row: typeof schema.governancePersonas.$inferSelect, _snapshotId: string): StoredPersona {
    return {
      id: row.personaId,
      name: row.name,
      type: row.type,
      status: row.status,
      archetype: row.archetype,
      description: row.description ?? null,
      goals: (row.goals as string[]) ?? [],
      painPoints: (row.painPoints as string[]) ?? [],
      behaviors: (row.behaviors as string[]) ?? [],
      typicalCapabilities: (row.typicalCapabilities as string[]) ?? [],
      technicalProfile: row.technicalProfile as StoredPersona['technicalProfile'] ?? null,
      relatedStories: (row.relatedStories as string[]) ?? [],
      relatedPersonas: (row.relatedPersonas as string[]) ?? [],
      storyCount: row.storyCount,
      capabilityCount: row.capabilityCount,
    };
  }

  private rowToUserStory(row: typeof schema.governanceUserStories.$inferSelect, _snapshotId: string): StoredUserStory {
    return {
      id: row.storyId,
      title: row.title,
      persona: row.persona,
      status: row.status,
      capabilities: (row.capabilities as string[]) ?? [],
      useCases: (row.useCases as string[]) ?? [],
      acceptanceCriteria: (row.acceptanceCriteria as string[]) ?? [],
      taxonomyNode: row.taxonomyNode ?? null,
    };
  }

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

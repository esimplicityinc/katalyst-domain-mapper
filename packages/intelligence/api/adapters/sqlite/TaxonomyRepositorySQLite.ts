import { eq, desc } from "drizzle-orm";
import type {
  TaxonomyRepository,
  StoredTaxonomySnapshot,
  TaxonomyPluginSummary,
  TaxonomyNodeSummary,
  TaxonomyEnvironmentSummary,
  TaxonomyHierarchy,
  TaxonomyHierarchyNode,
} from "../../ports/TaxonomyRepository.js";
import type { DrizzleDB } from "../../db/client.js";
import type { ValidatedTaxonomyData } from "../../domain/taxonomy/validateTaxonomyData.js";
import * as schema from "../../db/schema.js";

export class TaxonomyRepositorySQLite implements TaxonomyRepository {
  constructor(private db: DrizzleDB) {}

  async saveSnapshot(data: ValidatedTaxonomyData): Promise<StoredTaxonomySnapshot> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const generated = data.generated ?? now;

    const pluginSummary: TaxonomyPluginSummary = {
      layerTypes: data.layerTypes.length,
      capabilities: data.capabilities.length,
      capabilityRels: data.capabilityRels.length,
      actions: data.actions.length,
      stages: data.stages.length,
      tools: data.tools.length,
    };

    // Insert snapshot
    this.db
      .insert(schema.taxonomySnapshots)
      .values({
        id,
        project: data.project,
        version: data.version,
        generated,
        rawSnapshot: data.rawPayload,
        nodeCount: data.nodes.length,
        environmentCount: data.environments.length,
        createdAt: now,
      })
      .run();

    // Denormalize nodes
    for (const node of data.nodes) {
      this.db
        .insert(schema.taxonomyNodes)
        .values({
          id: `${id}:${node.name}`,
          snapshotId: id,
          name: node.name,
          nodeType: node.nodeType,
          fqtn: node.fqtn,
          description: node.description,
          parentNode: node.parentNode,
          owners: node.owners,
          environments: node.environments,
          labels: node.labels,
          dependsOn: node.dependsOn,
        })
        .run();
    }

    // Denormalize environments
    for (const env of data.environments) {
      this.db
        .insert(schema.taxonomyEnvironments)
        .values({
          id: `${id}:${env.name}`,
          snapshotId: id,
          name: env.name,
          description: env.description,
          parentEnvironment: env.parentEnvironment,
          promotionTargets: env.promotionTargets,
          templateReplacements: env.templateReplacements,
        })
        .run();
    }

    // Denormalize layer types
    for (const lt of data.layerTypes) {
      this.db
        .insert(schema.taxonomyLayerTypes)
        .values({
          id: `${id}:${lt.name}`,
          snapshotId: id,
          name: lt.name,
          description: lt.description,
          defaultLayerDir: lt.defaultLayerDir,
        })
        .run();
    }

    // Denormalize capabilities
    for (const cap of data.capabilities) {
      this.db
        .insert(schema.taxonomyCapabilities)
        .values({
          id: `${id}:${cap.name}`,
          snapshotId: id,
          name: cap.name,
          description: cap.description,
          categories: cap.categories,
          dependsOn: cap.dependsOn,
        })
        .run();
    }

    // Denormalize capability relationships
    for (const rel of data.capabilityRels) {
      this.db
        .insert(schema.taxonomyCapabilityRels)
        .values({
          id: `${id}:${rel.name}`,
          snapshotId: id,
          name: rel.name,
          node: rel.node,
          relationshipType: rel.relationshipType,
          capabilities: rel.capabilities,
        })
        .run();
    }

    // Denormalize actions
    for (const action of data.actions) {
      this.db
        .insert(schema.taxonomyActions)
        .values({
          id: `${id}:${action.name}`,
          snapshotId: id,
          name: action.name,
          actionType: action.actionType,
          layerType: action.layerType,
          tags: action.tags,
        })
        .run();
    }

    // Denormalize stages
    for (const stage of data.stages) {
      this.db
        .insert(schema.taxonomyStages)
        .values({
          id: `${id}:${stage.name}`,
          snapshotId: id,
          name: stage.name,
          description: stage.description,
          dependsOn: stage.dependsOn,
        })
        .run();
    }

    // Denormalize tools
    for (const tool of data.tools) {
      this.db
        .insert(schema.taxonomyTools)
        .values({
          id: `${id}:${tool.name}`,
          snapshotId: id,
          name: tool.name,
          description: tool.description,
          actions: tool.actions,
        })
        .run();
    }

    return {
      id,
      project: data.project,
      version: data.version,
      generated,
      nodeCount: data.nodes.length,
      environmentCount: data.environments.length,
      pluginSummary,
      createdAt: now,
    };
  }

  async getLatestSnapshot(): Promise<StoredTaxonomySnapshot | null> {
    const row = this.db
      .select()
      .from(schema.taxonomySnapshots)
      .orderBy(desc(schema.taxonomySnapshots.createdAt))
      .limit(1)
      .get();

    if (!row) return null;
    return this.toStoredSnapshot(row);
  }

  async getSnapshotById(id: string): Promise<StoredTaxonomySnapshot | null> {
    const row = this.db
      .select()
      .from(schema.taxonomySnapshots)
      .where(eq(schema.taxonomySnapshots.id, id))
      .get();

    if (!row) return null;
    return this.toStoredSnapshot(row);
  }

  async listSnapshots(limit?: number): Promise<StoredTaxonomySnapshot[]> {
    const rows = this.db
      .select()
      .from(schema.taxonomySnapshots)
      .orderBy(desc(schema.taxonomySnapshots.createdAt))
      .limit(limit ?? 50)
      .all();

    return rows.map((row) => this.toStoredSnapshot(row));
  }

  async deleteSnapshot(id: string): Promise<boolean> {
    const existing = this.db
      .select({ id: schema.taxonomySnapshots.id })
      .from(schema.taxonomySnapshots)
      .where(eq(schema.taxonomySnapshots.id, id))
      .get();

    if (!existing) return false;

    this.db
      .delete(schema.taxonomySnapshots)
      .where(eq(schema.taxonomySnapshots.id, id))
      .run();
    return true;
  }

  async getNodes(nodeType?: string): Promise<TaxonomyNodeSummary[]> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return [];

    const rows = this.db
      .select()
      .from(schema.taxonomyNodes)
      .where(eq(schema.taxonomyNodes.snapshotId, latest.id))
      .all();

    const filtered = nodeType
      ? rows.filter((r) => r.nodeType === nodeType)
      : rows;

    return filtered.map((r) => ({
      name: r.name,
      nodeType: r.nodeType,
      fqtn: r.fqtn,
      description: r.description,
      parentNode: r.parentNode,
    }));
  }

  async getHierarchy(): Promise<TaxonomyHierarchy> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return { systems: [] };

    const rows = this.db
      .select()
      .from(schema.taxonomyNodes)
      .where(eq(schema.taxonomyNodes.snapshotId, latest.id))
      .all();

    // Build parent-to-children map
    const nodeMap = new Map<
      string,
      TaxonomyHierarchyNode & { parentNode: string | null }
    >();
    for (const r of rows) {
      nodeMap.set(r.name, {
        name: r.name,
        nodeType: r.nodeType,
        fqtn: r.fqtn,
        description: r.description,
        children: [],
        parentNode: r.parentNode,
      });
    }

    // Assemble tree
    const systems: TaxonomyHierarchyNode[] = [];
    for (const node of nodeMap.values()) {
      if (node.parentNode && nodeMap.has(node.parentNode)) {
        nodeMap.get(node.parentNode)!.children.push(node);
      } else if (!node.parentNode) {
        systems.push(node);
      }
    }

    return { systems };
  }

  async getEnvironments(): Promise<TaxonomyEnvironmentSummary[]> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return [];

    const rows = this.db
      .select()
      .from(schema.taxonomyEnvironments)
      .where(eq(schema.taxonomyEnvironments.snapshotId, latest.id))
      .all();

    return rows.map((r) => ({
      name: r.name,
      description: r.description,
      parentEnvironment: r.parentEnvironment,
    }));
  }

  async getPluginSummary(): Promise<TaxonomyPluginSummary> {
    const latest = await this.getLatestSnapshot();
    if (!latest) {
      return {
        layerTypes: 0,
        capabilities: 0,
        capabilityRels: 0,
        actions: 0,
        stages: 0,
        tools: 0,
      };
    }

    return {
      layerTypes: this.db.select().from(schema.taxonomyLayerTypes).where(eq(schema.taxonomyLayerTypes.snapshotId, latest.id)).all().length,
      capabilities: this.db.select().from(schema.taxonomyCapabilities).where(eq(schema.taxonomyCapabilities.snapshotId, latest.id)).all().length,
      capabilityRels: this.db.select().from(schema.taxonomyCapabilityRels).where(eq(schema.taxonomyCapabilityRels.snapshotId, latest.id)).all().length,
      actions: this.db.select().from(schema.taxonomyActions).where(eq(schema.taxonomyActions.snapshotId, latest.id)).all().length,
      stages: this.db.select().from(schema.taxonomyStages).where(eq(schema.taxonomyStages.snapshotId, latest.id)).all().length,
      tools: this.db.select().from(schema.taxonomyTools).where(eq(schema.taxonomyTools.snapshotId, latest.id)).all().length,
    };
  }

  async getCapabilitiesByNode(nodeName: string): Promise<string[]> {
    const latest = await this.getLatestSnapshot();
    if (!latest) return [];

    const rels = this.db
      .select()
      .from(schema.taxonomyCapabilityRels)
      .where(eq(schema.taxonomyCapabilityRels.snapshotId, latest.id))
      .all();

    const matchingRels = rels.filter((r) => r.node === nodeName);
    const capNames = new Set<string>();
    for (const rel of matchingRels) {
      const caps = rel.capabilities ?? [];
      for (const cap of caps) {
        capNames.add(cap);
      }
    }

    return Array.from(capNames);
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private toStoredSnapshot(row: {
    id: string;
    project: string;
    version: string;
    generated: string;
    nodeCount: number;
    environmentCount: number;
    createdAt: string;
  }): StoredTaxonomySnapshot {
    return {
      id: row.id,
      project: row.project,
      version: row.version,
      generated: row.generated,
      nodeCount: row.nodeCount,
      environmentCount: row.environmentCount,
      pluginSummary: {
        layerTypes: this.db.select().from(schema.taxonomyLayerTypes).where(eq(schema.taxonomyLayerTypes.snapshotId, row.id)).all().length,
        capabilities: this.db.select().from(schema.taxonomyCapabilities).where(eq(schema.taxonomyCapabilities.snapshotId, row.id)).all().length,
        capabilityRels: this.db.select().from(schema.taxonomyCapabilityRels).where(eq(schema.taxonomyCapabilityRels.snapshotId, row.id)).all().length,
        actions: this.db.select().from(schema.taxonomyActions).where(eq(schema.taxonomyActions.snapshotId, row.id)).all().length,
        stages: this.db.select().from(schema.taxonomyStages).where(eq(schema.taxonomyStages.snapshotId, row.id)).all().length,
        tools: this.db.select().from(schema.taxonomyTools).where(eq(schema.taxonomyTools.snapshotId, row.id)).all().length,
      },
      createdAt: row.createdAt,
    };
  }
}

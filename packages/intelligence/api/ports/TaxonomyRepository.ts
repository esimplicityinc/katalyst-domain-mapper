import type { ValidatedTaxonomyData } from "../domain/taxonomy/validateTaxonomyData.js";

// ── Stored Snapshot (returned from queries) ────────────────────────────────

export interface StoredTaxonomySnapshot {
  id: string;
  project: string;
  version: string;
  generated: string;
  nodeCount: number;
  environmentCount: number;
  pluginSummary: TaxonomyPluginSummary;
  createdAt: string;
}

export interface TaxonomyPluginSummary {
  layerTypes: number;
  capabilities: number;
  capabilityRels: number;
  actions: number;
  stages: number;
  tools: number;
}

// ── Query Result Types ─────────────────────────────────────────────────────

export interface TaxonomyNodeSummary {
  name: string;
  nodeType: string;
  fqtn: string;
  description: string | null;
  parentNode: string | null;
}

export interface TaxonomyEnvironmentSummary {
  name: string;
  description: string | null;
  parentEnvironment: string | null;
}

export interface TaxonomyHierarchyNode {
  name: string;
  nodeType: string;
  fqtn: string;
  description: string | null;
  children: TaxonomyHierarchyNode[];
}

export interface TaxonomyHierarchy {
  systems: TaxonomyHierarchyNode[];
}

// ── Repository Interface ───────────────────────────────────────────────────

export interface TaxonomyRepository {
  /** Store a taxonomy snapshot, denormalizing into tables */
  saveSnapshot(data: ValidatedTaxonomyData): Promise<StoredTaxonomySnapshot>;

  /** Get the most recently ingested snapshot */
  getLatestSnapshot(): Promise<StoredTaxonomySnapshot | null>;

  /** Get a snapshot by its ID */
  getSnapshotById(id: string): Promise<StoredTaxonomySnapshot | null>;

  /** List all snapshots, most recent first */
  listSnapshots(limit?: number): Promise<StoredTaxonomySnapshot[]>;

  /** Delete a snapshot and all denormalized data (FK cascade) */
  deleteSnapshot(id: string): Promise<boolean>;

  /** Get taxonomy nodes from the latest snapshot, with optional type filter */
  getNodes(nodeType?: string): Promise<TaxonomyNodeSummary[]>;

  /** Get the full hierarchy tree from the latest snapshot */
  getHierarchy(): Promise<TaxonomyHierarchy>;

  /** Get environments from the latest snapshot */
  getEnvironments(): Promise<TaxonomyEnvironmentSummary[]>;

  /** Get plugin counts from the latest snapshot */
  getPluginSummary(): Promise<TaxonomyPluginSummary>;

  /** Get capabilities mapped to a specific taxonomy node */
  getCapabilitiesByNode(nodeName: string): Promise<string[]>;
}

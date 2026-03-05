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
  teams: number;
  persons: number;
}

// ── Query Result Types ─────────────────────────────────────────────────────

export interface TaxonomyNodeSummary {
  name: string;
  nodeType: string;
  fqtn: string;
  description: string | null;
  parentNode: string | null;
  owners: string[];
}

export interface TaxonomyEnvironmentSummary {
  name: string;
  description: string | null;
  parentEnvironment: string | null;
}

// ── Team & Person Query Types ──────────────────────────────────────────────

export interface TaxonomyTeamSummary {
  name: string;
  displayName: string;
  teamType: string;
  description: string | null;
  focusArea: string | null;
  communicationChannels: string[];
  ownedNodes: string[];
  memberCount: number;
}

export interface TaxonomyTeamMemberSummary {
  personName: string;
  displayName: string;
  email: string | null;
  role: string; // role within this team
}

export interface TaxonomyTeamDetail extends TaxonomyTeamSummary {
  members: TaxonomyTeamMemberSummary[];
}

export interface TaxonomyPersonSummary {
  name: string;
  displayName: string;
  email: string | null;
  role: string | null;
  avatarUrl: string | null;
  teams: Array<{ team: string; role: string }>;
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

// ── Capability Tree ────────────────────────────────────────────────────────

/**
 * A single node in the capability hierarchy tree.
 *
 * Capabilities are organised in up to 3 levels following the taxonomy node
 * structure:
 *   system capability  (e.g. "regulatory-compliance")
 *     └─ subsystem capability  (e.g. "water-quality-monitoring")
 *          └─ stack capability  (e.g. "lims-sample-analysis")
 *
 * Status is always derived from children using "worst-child-wins":
 *   planned  <  stable  <  deprecated
 * Leaf nodes carry the status declared in the taxonomy snapshot.
 */
export interface CapabilityNode {
  /** Slug — the stable identifier used everywhere (replaces CAP-XXX in references) */
  name: string;
  /** Human-readable title */
  description: string;
  /** Optional display tag, e.g. "CAP-005", retained for traceability */
  tag: string | null;
  /** Explicit declared status on this node (only meaningful on leaf nodes) */
  declaredStatus: "planned" | "stable" | "deprecated";
  /**
   * Derived status — computed bottom-up using worst-child-wins.
   * For leaf nodes this equals declaredStatus.
   * planned < stable < deprecated
   */
  derivedStatus: "planned" | "stable" | "deprecated";
  /** Taxonomy node(s) this capability is implemented/supported by */
  taxonomyNodes: string[];
  /** Capability dependency slugs (peer dependencies, not hierarchy) */
  dependsOn: string[];
  /** Categories for grouping / filtering */
  categories: string[];
  /** Child capabilities (sub-capabilities) — empty for leaves */
  children: CapabilityNode[];
}

export interface CapabilityTree {
  /** Root capabilities (parentCapability = null) */
  roots: CapabilityNode[];
  /** Flat map for O(1) lookup by slug */
  byName: Map<string, CapabilityNode>;
}

// ── Repository Interface ───────────────────────────────────────────────────

export interface TaxonomyRepository {
  /** Store a taxonomy snapshot, denormalizing into tables */
  saveSnapshot(data: ValidatedTaxonomyData): Promise<StoredTaxonomySnapshot>;

  /** Get the most recently ingested snapshot */
  getLatestSnapshot(): Promise<StoredTaxonomySnapshot | null>;

  /** Get the most recently ingested snapshot for a specific project */
  getLatestSnapshotByProject(project: string): Promise<StoredTaxonomySnapshot | null>;

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

  /**
   * Get the full capability hierarchy tree for the latest snapshot.
   * Status is derived bottom-up (worst-child-wins) on every internal node.
   */
  getCapabilityTree(): Promise<CapabilityTree>;

  /**
   * Get the full capability hierarchy tree for a specific snapshot.
   */
  getCapabilityTreeBySnapshotId(snapshotId: string): Promise<CapabilityTree>;

  /** Get all teams from the latest snapshot */
  getTeams(): Promise<TaxonomyTeamSummary[]>;

  /** Get a team by name with full member details from the latest snapshot */
  getTeamByName(name: string): Promise<TaxonomyTeamDetail | null>;

  /** Get all persons from the latest snapshot with their team memberships */
  getPersons(): Promise<TaxonomyPersonSummary[]>;
}

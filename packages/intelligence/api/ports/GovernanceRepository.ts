export interface StoredSnapshot {
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
    integrityStatus: string;
    integrityErrors: number;
  };
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

export interface RoadItemSummary {
  id: string;
  title: string;
  status: string;
  phase: number;
  priority: string;
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

import type { ValidatedSnapshotData } from "../domain/governance/validateSnapshotData.js";

export interface GovernanceRepository {
  /** Store a governance index snapshot, denormalizing into tables */
  saveSnapshot(data: ValidatedSnapshotData): Promise<StoredSnapshot>;

  /** Get the most recently ingested snapshot */
  getLatestSnapshot(): Promise<StoredSnapshot | null>;

  /** Get the most recently ingested snapshot for a specific project */
  getLatestSnapshotByProject(project: string): Promise<StoredSnapshot | null>;

  /** Get a snapshot by its ID */
  getSnapshotById(id: string): Promise<StoredSnapshot | null>;

  /** List all snapshots, most recent first */
  listSnapshots(limit?: number): Promise<StoredSnapshot[]>;

  /** Delete a snapshot and all denormalized data (FK cascade) */
  deleteSnapshot(id: string): Promise<boolean>;

  /** Get capability coverage from the latest snapshot */
  getCapabilityCoverage(): Promise<CapabilityCoverage[]>;

  /** Get persona coverage from the latest snapshot */
  getPersonaCoverage(): Promise<PersonaCoverage[]>;

  /** Get road items from the latest snapshot, with optional status filter */
  getRoadItems(statusFilter?: string): Promise<RoadItemSummary[]>;

  /** Get cross-reference integrity from the latest snapshot */
  getIntegrity(): Promise<IntegrityReport>;

  /** Get health trends across all snapshots */
  getTrends(limit?: number): Promise<TrendPoint[]>;
}

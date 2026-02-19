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

export interface StoredPersona {
  id: string; // PER-XXX
  name: string;
  type: string;
  status: string;
  archetype: string;
  description: string | null;
  goals: string[];
  painPoints: string[];
  behaviors: string[];
  typicalCapabilities: string[];
  technicalProfile: {
    skillLevel?: string;
    integrationType?: string;
    frequency?: string;
  } | null;
  relatedStories: string[];
  relatedPersonas: string[];
  storyCount: number;
  capabilityCount: number;
}

export interface StoredUserStory {
  id: string; // US-XXX
  title: string;
  persona: string; // PER-XXX
  status: string;
  capabilities: string[];
  useCases: string[];
  acceptanceCriteria: string[];
  taxonomyNode: string | null;
}

export interface StoredCapability {
  id: string; // CAP-XXX
  title: string;
  status: string;
  description: string | null;
  category: string | null;
  parentCapability: string | null;
  dependsOn: string[];
  roadCount: number;
  storyCount: number;
  taxonomyNode: string | null;
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

  // ── Capability CRUD ────────────────────────────────────────────────────────

  /** List all capabilities from the latest snapshot */
  listCapabilities(): Promise<StoredCapability[]>;

  /** Get a capability by ID (CAP-XXX) from the latest snapshot */
  getCapabilityById(id: string): Promise<StoredCapability | null>;

  /** Create a new capability (adds to latest snapshot context) */
  createCapability(data: Omit<StoredCapability, 'roadCount' | 'storyCount'>): Promise<StoredCapability>;

  /** Update a capability */
  updateCapability(id: string, data: Partial<Omit<StoredCapability, 'id' | 'roadCount' | 'storyCount'>>): Promise<StoredCapability | null>;

  /** Delete a capability */
  deleteCapability(id: string): Promise<boolean>;

  // ── Persona CRUD ──────────────────────────────────────────────────────────

  /** List all personas from the latest snapshot */
  listPersonas(): Promise<StoredPersona[]>;

  /** Get a persona by ID (PER-XXX) from the latest snapshot */
  getPersonaById(id: string): Promise<StoredPersona | null>;

  /** Create a new persona */
  createPersona(data: Omit<StoredPersona, 'storyCount' | 'capabilityCount'>): Promise<StoredPersona>;

  /** Update a persona */
  updatePersona(id: string, data: Partial<Omit<StoredPersona, 'id' | 'storyCount' | 'capabilityCount'>>): Promise<StoredPersona | null>;

  /** Delete a persona */
  deletePersona(id: string): Promise<boolean>;

  // ── User Story CRUD ───────────────────────────────────────────────────────

  /** List all user stories from the latest snapshot */
  listUserStories(): Promise<StoredUserStory[]>;

  /** Get a user story by ID (US-XXX) from the latest snapshot */
  getUserStoryById(id: string): Promise<StoredUserStory | null>;

  /** Create a new user story */
  createUserStory(data: StoredUserStory): Promise<StoredUserStory>;

  /** Update a user story */
  updateUserStory(id: string, data: Partial<Omit<StoredUserStory, 'id'>>): Promise<StoredUserStory | null>;

  /** Delete a user story */
  deleteUserStory(id: string): Promise<boolean>;
}

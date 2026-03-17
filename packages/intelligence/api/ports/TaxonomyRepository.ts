// ── Unified Taxonomy Repository Port ────────────────────────────────────────
// Merges the former TaxonomyRepository, GovernanceRepository, and
// DomainModelRepository into a single port interface. All types are imported
// from @foe/schemas (single source of truth).

import type { ValidatedTaxonomyData } from "../domain/taxonomy/validateTaxonomyData.js";
import { taxonomy } from "@foe/schemas";

// ── Re-exports from @foe/schemas ───────────────────────────────────────────

export type TaxonomyPluginSummary = taxonomy.TaxonomyPluginSummary;

// Governance types
export type StoredGovernanceSnapshot = taxonomy.StoredGovernanceSnapshot;
export type CapabilityCoverage = taxonomy.CapabilityCoverage;
export type UserTypeCoverage = taxonomy.UserTypeCoverage;
export type RoadItemSummary = taxonomy.RoadItemSummary;
export type IntegrityReport = taxonomy.IntegrityReport;
export type TrendPoint = taxonomy.TrendPoint;
export type StoredUserType = taxonomy.StoredUserType;
export type StoredUserStory = taxonomy.StoredUserStory;
export type StoredCapability = taxonomy.StoredCapability;
export type GovernanceSnapshotInput = taxonomy.GovernanceSnapshotInput;

// Domain model types
export type StoredDomainModel = taxonomy.StoredDomainModel;
export type StoredBoundedContext = taxonomy.StoredBoundedContext;
export type StoredAggregate = taxonomy.StoredAggregate;
export type StoredDomainEvent = taxonomy.StoredDomainEvent;
export type StoredValueObject = taxonomy.StoredValueObject;
export type StoredGlossaryTerm = taxonomy.StoredGlossaryTerm;
export type StoredWorkflow = taxonomy.StoredWorkflow;
export type DomainModelWithArtifacts = taxonomy.DomainModelWithArtifacts;

// Practice area types
export type StoredPracticeArea = taxonomy.StoredPracticeArea;
export type CreatePracticeAreaInput = taxonomy.CreatePracticeAreaInput;
export type UpdatePracticeAreaInput = taxonomy.UpdatePracticeAreaInput;

// Competency types
export type StoredCompetency = taxonomy.StoredCompetency;
export type CreateCompetencyInput = taxonomy.CreateCompetencyInput;
export type UpdateCompetencyInput = taxonomy.UpdateCompetencyInput;

// Adoption types
export type StoredTeamAdoption = taxonomy.StoredTeamAdoption;
export type CreateTeamAdoptionInput = taxonomy.CreateTeamAdoptionInput;
export type UpdateTeamAdoptionInput = taxonomy.UpdateTeamAdoptionInput;
export type StoredIndividualAdoption = taxonomy.StoredIndividualAdoption;
export type CreateIndividualAdoptionInput = taxonomy.CreateIndividualAdoptionInput;
export type UpdateIndividualAdoptionInput = taxonomy.UpdateIndividualAdoptionInput;

export type CreateDomainModelInput = taxonomy.CreateDomainModelInput;
export type UpdateDomainModelInput = taxonomy.UpdateDomainModelInput;
export type CreateBoundedContextInput = taxonomy.CreateBoundedContextInput;
export type UpdateBoundedContextInput = taxonomy.UpdateBoundedContextInput;
export type CreateAggregateInput = taxonomy.CreateAggregateInput;
export type UpdateAggregateInput = taxonomy.UpdateAggregateInput;
export type CreateDomainEventInput = taxonomy.CreateDomainEventInput;
export type UpdateDomainEventInput = taxonomy.UpdateDomainEventInput;
export type CreateValueObjectInput = taxonomy.CreateValueObjectInput;
export type UpdateValueObjectInput = taxonomy.UpdateValueObjectInput;
export type CreateGlossaryTermInput = taxonomy.CreateGlossaryTermInput;
export type UpdateGlossaryTermInput = taxonomy.UpdateGlossaryTermInput;
export type CreateWorkflowInput = taxonomy.CreateWorkflowInput;
export type UpdateWorkflowInput = taxonomy.UpdateWorkflowInput;

// ── Stored Taxonomy Snapshot ───────────────────────────────────────────────

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

// ── Taxonomy Query Result Types ────────────────────────────────────────────

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
  role: string;
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

export interface CapabilityNode {
  name: string;
  description: string;
  tag: string | null;
  declaredStatus: "planned" | "stable" | "deprecated";
  derivedStatus: "planned" | "stable" | "deprecated";
  taxonomyNodes: string[];
  dependsOn: string[];
  categories: string[];
  children: CapabilityNode[];
}

export interface CapabilityTree {
  roots: CapabilityNode[];
  byName: Map<string, CapabilityNode>;
}

// ── Unified Repository Interface ───────────────────────────────────────────

export interface TaxonomyRepository {
  // ══════════════════════════════════════════════════════════════════════════
  // TAXONOMY SNAPSHOTS (was TaxonomyRepository)
  // ══════════════════════════════════════════════════════════════════════════

  /** Store a taxonomy snapshot, denormalizing into tables */
  saveTaxonomySnapshot(data: ValidatedTaxonomyData): Promise<StoredTaxonomySnapshot>;
  /** Get the most recently ingested taxonomy snapshot */
  getLatestTaxonomySnapshot(): Promise<StoredTaxonomySnapshot | null>;
  /** Get the most recently ingested taxonomy snapshot for a specific project */
  getLatestTaxonomySnapshotByProject(project: string): Promise<StoredTaxonomySnapshot | null>;
  /** Get a taxonomy snapshot by its ID */
  getTaxonomySnapshotById(id: string): Promise<StoredTaxonomySnapshot | null>;
  /** List all taxonomy snapshots, most recent first */
  listTaxonomySnapshots(limit?: number): Promise<StoredTaxonomySnapshot[]>;
  /** Delete a taxonomy snapshot and all denormalized data (FK cascade) */
  deleteTaxonomySnapshot(id: string): Promise<boolean>;

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
  /** Get the full capability hierarchy tree for the latest snapshot */
  getCapabilityTree(): Promise<CapabilityTree>;
  /** Get the full capability hierarchy tree for a specific snapshot */
  getCapabilityTreeBySnapshotId(snapshotId: string): Promise<CapabilityTree>;
  /** Get all teams from the latest snapshot */
  getTeams(): Promise<TaxonomyTeamSummary[]>;
  /** Get a team by name with full member details from the latest snapshot */
  getTeamByName(name: string): Promise<TaxonomyTeamDetail | null>;
  /** Get all persons from the latest snapshot with their team memberships */
  getPersons(): Promise<TaxonomyPersonSummary[]>;

  // ══════════════════════════════════════════════════════════════════════════
  // GOVERNANCE (was GovernanceRepository)
  // ══════════════════════════════════════════════════════════════════════════

  /** Store a governance index snapshot, denormalizing into tables */
  saveGovernanceSnapshot(data: GovernanceSnapshotInput): Promise<StoredGovernanceSnapshot>;
  /** Get the most recently ingested governance snapshot */
  getLatestGovernanceSnapshot(): Promise<StoredGovernanceSnapshot | null>;
  /** Get the most recently ingested governance snapshot for a specific project */
  getLatestGovernanceSnapshotByProject(project: string): Promise<StoredGovernanceSnapshot | null>;
  /** Get a governance snapshot by its ID */
  getGovernanceSnapshotById(id: string): Promise<StoredGovernanceSnapshot | null>;
  /** List all governance snapshots, most recent first */
  listGovernanceSnapshots(limit?: number): Promise<StoredGovernanceSnapshot[]>;
  /** Delete a governance snapshot and all denormalized data (FK cascade) */
  deleteGovernanceSnapshot(id: string): Promise<boolean>;

  /** Get capability coverage from the latest governance snapshot */
  getCapabilityCoverage(): Promise<CapabilityCoverage[]>;
  /** Get user type coverage from the latest governance snapshot */
  getUserTypeCoverage(): Promise<UserTypeCoverage[]>;
  /** Get road items from the latest governance snapshot, with optional status filter */
  getRoadItems(statusFilter?: string): Promise<RoadItemSummary[]>;
  /** Get cross-reference integrity from the latest governance snapshot */
  getIntegrity(): Promise<IntegrityReport>;
  /** Get health trends across all governance snapshots */
  getTrends(limit?: number): Promise<TrendPoint[]>;

  // Governance Capability CRUD
  listGovernanceCapabilities(): Promise<StoredCapability[]>;
  getGovernanceCapabilityById(id: string): Promise<StoredCapability | null>;
  createGovernanceCapability(
    data: Omit<StoredCapability, "roadCount" | "storyCount">,
  ): Promise<StoredCapability>;
  updateGovernanceCapability(
    id: string,
    data: Partial<Omit<StoredCapability, "id" | "roadCount" | "storyCount">>,
  ): Promise<StoredCapability | null>;
  deleteGovernanceCapability(id: string): Promise<boolean>;

  // Governance User Type CRUD
  listUserTypes(): Promise<StoredUserType[]>;
  getUserTypeById(id: string): Promise<StoredUserType | null>;
  createUserType(
    data: Omit<StoredUserType, "storyCount" | "capabilityCount">,
  ): Promise<StoredUserType>;
  updateUserType(
    id: string,
    data: Partial<Omit<StoredUserType, "id" | "storyCount" | "capabilityCount">>,
  ): Promise<StoredUserType | null>;
  deleteUserType(id: string): Promise<boolean>;

  // Governance User Story CRUD
  listUserStories(): Promise<StoredUserStory[]>;
  getUserStoryById(id: string): Promise<StoredUserStory | null>;
  createUserStory(data: StoredUserStory): Promise<StoredUserStory>;
  updateUserStory(
    id: string,
    data: Partial<Omit<StoredUserStory, "id">>,
  ): Promise<StoredUserStory | null>;
  deleteUserStory(id: string): Promise<boolean>;

  // ══════════════════════════════════════════════════════════════════════════
  // DOMAIN MODELS (was DomainModelRepository)
  // ══════════════════════════════════════════════════════════════════════════

  // Domain Model CRUD
  createDomainModel(input: CreateDomainModelInput): Promise<StoredDomainModel>;
  updateDomainModel(id: string, input: UpdateDomainModelInput): Promise<void>;
  listDomainModels(): Promise<StoredDomainModel[]>;
  getDomainModelById(id: string): Promise<DomainModelWithArtifacts | null>;
  deleteDomainModel(id: string): Promise<boolean>;
  domainModelExists(id: string): Promise<boolean>;

  // Bounded Contexts
  addBoundedContext(
    modelId: string,
    input: CreateBoundedContextInput,
  ): Promise<StoredBoundedContext>;
  updateBoundedContext(
    ctxId: string,
    input: UpdateBoundedContextInput,
  ): Promise<void>;
  deleteBoundedContext(ctxId: string): Promise<void>;

  // Aggregates
  addAggregate(
    modelId: string,
    input: CreateAggregateInput,
  ): Promise<StoredAggregate>;
  updateAggregate(aggId: string, input: UpdateAggregateInput): Promise<void>;
  deleteAggregate(aggId: string): Promise<void>;

  // Domain Events
  addDomainEvent(
    modelId: string,
    input: CreateDomainEventInput,
  ): Promise<StoredDomainEvent>;
  updateDomainEvent(
    eventId: string,
    input: UpdateDomainEventInput,
  ): Promise<void>;
  deleteDomainEvent(eventId: string): Promise<void>;

  // Value Objects
  addValueObject(
    modelId: string,
    input: CreateValueObjectInput,
  ): Promise<StoredValueObject>;
  updateValueObject(
    voId: string,
    input: UpdateValueObjectInput,
  ): Promise<void>;
  deleteValueObject(voId: string): Promise<void>;

  // Glossary
  addGlossaryTerm(
    modelId: string,
    input: CreateGlossaryTermInput,
  ): Promise<StoredGlossaryTerm>;
  updateGlossaryTerm(
    termId: string,
    input: UpdateGlossaryTermInput,
  ): Promise<void>;
  listGlossaryTerms(modelId: string): Promise<StoredGlossaryTerm[]>;
  deleteGlossaryTerm(termId: string): Promise<void>;

  // Workflows
  addWorkflow(
    modelId: string,
    input: CreateWorkflowInput,
  ): Promise<StoredWorkflow>;
  updateWorkflow(wfId: string, input: UpdateWorkflowInput): Promise<void>;
  listWorkflows(modelId: string): Promise<StoredWorkflow[]>;
  deleteWorkflow(wfId: string): Promise<void>;

  // ══════════════════════════════════════════════════════════════════════════
  // PRACTICE AREAS & COMPETENCIES
  // ══════════════════════════════════════════════════════════════════════════

  // ── Practice Areas ──
  listPracticeAreas(snapshotId: string): Promise<StoredPracticeArea[]>;
  getPracticeAreaById(snapshotId: string, id: string): Promise<StoredPracticeArea | null>;
  createPracticeArea(snapshotId: string, input: CreatePracticeAreaInput): Promise<StoredPracticeArea>;
  updatePracticeArea(snapshotId: string, id: string, input: UpdatePracticeAreaInput): Promise<StoredPracticeArea>;
  deletePracticeArea(snapshotId: string, id: string): Promise<void>;

  // ── Competencies ──
  listCompetencies(snapshotId: string, practiceAreaId?: string): Promise<StoredCompetency[]>;
  getCompetencyById(snapshotId: string, id: string): Promise<StoredCompetency | null>;
  createCompetency(snapshotId: string, input: CreateCompetencyInput): Promise<StoredCompetency>;
  updateCompetency(snapshotId: string, id: string, input: UpdateCompetencyInput): Promise<StoredCompetency>;
  deleteCompetency(snapshotId: string, id: string): Promise<void>;

  // ── Team Adoptions ──
  listTeamAdoptions(snapshotId: string, teamName?: string): Promise<StoredTeamAdoption[]>;
  getTeamAdoption(snapshotId: string, teamName: string, practiceAreaId: string): Promise<StoredTeamAdoption | null>;
  createTeamAdoption(snapshotId: string, input: CreateTeamAdoptionInput): Promise<StoredTeamAdoption>;
  updateTeamAdoption(snapshotId: string, id: string, input: UpdateTeamAdoptionInput): Promise<StoredTeamAdoption>;
  deleteTeamAdoption(snapshotId: string, id: string): Promise<void>;

  // ── Individual Adoptions ──
  listIndividualAdoptions(snapshotId: string, personName?: string): Promise<StoredIndividualAdoption[]>;
  getIndividualAdoption(snapshotId: string, personName: string, practiceAreaId: string): Promise<StoredIndividualAdoption | null>;
  createIndividualAdoption(snapshotId: string, input: CreateIndividualAdoptionInput): Promise<StoredIndividualAdoption>;
  updateIndividualAdoption(snapshotId: string, id: string, input: UpdateIndividualAdoptionInput): Promise<StoredIndividualAdoption>;
  deleteIndividualAdoption(snapshotId: string, id: string): Promise<void>;
}

// ── Backward-compatible aliases ────────────────────────────────────────────
// These allow a gradual migration of consumers that still import the old
// interface names. They can be removed once all consumers are updated.

/** @deprecated Use TaxonomyRepository instead */
export type GovernanceRepository = Pick<
  TaxonomyRepository,
  | "saveGovernanceSnapshot"
  | "getLatestGovernanceSnapshot"
  | "getLatestGovernanceSnapshotByProject"
  | "getGovernanceSnapshotById"
  | "listGovernanceSnapshots"
  | "deleteGovernanceSnapshot"
  | "getCapabilityCoverage"
  | "getUserTypeCoverage"
  | "getRoadItems"
  | "getIntegrity"
  | "getTrends"
  | "listGovernanceCapabilities"
  | "getGovernanceCapabilityById"
  | "createGovernanceCapability"
  | "updateGovernanceCapability"
  | "deleteGovernanceCapability"
  | "listUserTypes"
  | "getUserTypeById"
  | "createUserType"
  | "updateUserType"
  | "deleteUserType"
  | "listUserStories"
  | "getUserStoryById"
  | "createUserStory"
  | "updateUserStory"
  | "deleteUserStory"
>;

/** @deprecated Use TaxonomyRepository instead */
export type DomainModelRepository = Pick<
  TaxonomyRepository,
  | "createDomainModel"
  | "updateDomainModel"
  | "listDomainModels"
  | "getDomainModelById"
  | "deleteDomainModel"
  | "domainModelExists"
  | "addBoundedContext"
  | "updateBoundedContext"
  | "deleteBoundedContext"
  | "addAggregate"
  | "updateAggregate"
  | "deleteAggregate"
  | "addDomainEvent"
  | "updateDomainEvent"
  | "deleteDomainEvent"
  | "addValueObject"
  | "updateValueObject"
  | "deleteValueObject"
  | "addGlossaryTerm"
  | "updateGlossaryTerm"
  | "listGlossaryTerms"
  | "deleteGlossaryTerm"
  | "addWorkflow"
  | "updateWorkflow"
  | "listWorkflows"
  | "deleteWorkflow"
>;

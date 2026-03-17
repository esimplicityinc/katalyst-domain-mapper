import { z } from "zod";
import {
  TaxonomyNodeSchema,
  TaxonomyEnvironmentSchema,
  TaxonomyLayerTypeSchema,
  TaxonomyCapabilitySchema,
  TaxonomyCapabilityRelSchema,
  TaxonomyActionSchema,
  TaxonomyStageSchema,
  TaxonomyToolSchema,
  TaxonomyPersonSchema,
  TaxonomyTeamSchema,
} from "./taxonomy-node.js";
import { LayerHealthSchema } from "./layer-health.js";
import {
  CapabilityIdPattern,
  CompetencyIdPattern,
  PracticeAreaIdPattern,
  UserTypeIdPattern,
  UserStoryIdPattern,
  UseCaseIdPattern,
  RoadItemIdPattern,
  AdrIdPattern,
  NfrIdPattern,
  ChangeIdPattern,
} from "./common.js";

// Extension schemas for typed node data
import { BoundedContextExtSchema } from "./extensions/bounded-context.js";
import { AggregateExtSchema } from "./extensions/aggregate.js";
import { ValueObjectExtSchema } from "./extensions/value-object.js";
import { DomainEventExtSchema } from "./extensions/domain-event.js";
import { GlossaryTermExtSchema } from "./extensions/glossary-term.js";
import { CapabilityExtSchema } from "./extensions/capability.js";
import { UserTypeExtSchema } from "./extensions/user-type.js";
import { UserStoryExtSchema } from "./extensions/user-story.js";
import { UseCaseExtSchema } from "./extensions/use-case.js";
import { RoadItemExtSchema } from "./extensions/road-item.js";
import { AdrExtSchema } from "./extensions/adr.js";
import { NfrExtSchema } from "./extensions/nfr.js";
import { ChangeEntryExtSchema } from "./extensions/change-entry.js";
import { PracticeAreaExtSchema } from "./extensions/practice-area.js";
import { CompetencyExtSchema } from "./extensions/competency.js";

// Adoption bridge schemas
import {
  AdoptionLevelSchema,
  TeamAdoptionSchema,
  IndividualAdoptionSchema,
} from "./adoption.js";

// ── Node Extension Map Schema ──────────────────────────────────────────────
// Maps node UUIDs to their typed extension data. Each extension is optional;
// only nodes with domain/governance-specific data have entries here.
export const NodeExtensionsSchema = z.object({
  // ── Existing ──
  boundedContexts: z.record(BoundedContextExtSchema).default({}),
  aggregates: z.record(AggregateExtSchema).default({}),
  valueObjects: z.record(ValueObjectExtSchema).default({}),
  domainEvents: z.record(DomainEventExtSchema).default({}),
  glossaryTerms: z.record(GlossaryTermExtSchema).default({}),
  capabilities: z.record(CapabilityExtSchema).default({}),
  userTypes: z.record(UserTypeExtSchema).default({}),
  userStories: z.record(UserStoryExtSchema).default({}),
  useCases: z.record(UseCaseExtSchema).default({}),
  roadItems: z.record(RoadItemExtSchema).default({}),
  adrs: z.record(AdrExtSchema).default({}),
  nfrs: z.record(NfrExtSchema).default({}),
  changeEntries: z.record(ChangeEntryExtSchema).default({}),

  // ── NEW: Practice Areas ──
  practiceAreas: z.record(PracticeAreaExtSchema).default({}),
  competencies: z.record(CompetencyExtSchema).default({}),
});

export type NodeExtensions = z.infer<typeof NodeExtensionsSchema>;

// ── Plugin Summary Schema ──────────────────────────────────────────────────
export const TaxonomyPluginSummarySchema = z.object({
  layerTypes: z.number().int().nonnegative().default(0),
  capabilities: z.number().int().nonnegative().default(0),
  capabilityRels: z.number().int().nonnegative().default(0),
  actions: z.number().int().nonnegative().default(0),
  stages: z.number().int().nonnegative().default(0),
  tools: z.number().int().nonnegative().default(0),
  layerHealths: z.number().int().nonnegative().default(0),
  teams: z.number().int().nonnegative().default(0),
  persons: z.number().int().nonnegative().default(0),
  // ── NEW ──
  practiceAreas: z.number().int().nonnegative().default(0),
  competencies: z.number().int().nonnegative().default(0),
  teamAdoptions: z.number().int().nonnegative().default(0),
  individualAdoptions: z.number().int().nonnegative().default(0),
});

export type TaxonomyPluginSummary = z.infer<typeof TaxonomyPluginSummarySchema>;

// ── Reverse Indices ────────────────────────────────────────────────────────
// Fast lookup structures migrated from the former GovernanceIndexSchema.
export const ReverseIndicesSchema = z.object({
  byCapability: z
    .record(
      z.object({
        userTypes: z.array(UserTypeIdPattern),
        stories: z.array(UserStoryIdPattern),
        roads: z.array(RoadItemIdPattern),
      }),
    )
    .default({}),
  byUserType: z
    .record(
      z.object({
        stories: z.array(UserStoryIdPattern),
        capabilities: z.array(CapabilityIdPattern),
      }),
    )
    .default({}),
  byRoad: z
    .record(
      z.object({
        adrs: z.array(AdrIdPattern),
        changes: z.array(ChangeIdPattern),
        capabilities: z.array(CapabilityIdPattern),
        nfrs: z.array(NfrIdPattern),
      }),
    )
    .default({}),
  byContext: z
    .record(
      z.object({
        aggregates: z.array(z.string()),
        events: z.array(z.string()),
        valueObjects: z.array(z.string()),
        roads: z.array(RoadItemIdPattern),
      }),
    )
    .default({}),
  byAggregate: z
    .record(
      z.object({
        context: z.string(),
        valueObjects: z.array(z.string()),
        events: z.array(z.string()),
      }),
    )
    .default({}),
  // ── NEW: Practice Area reverse indices ──
  byPracticeArea: z
    .record(
      z.object({
        competencies: z.array(CompetencyIdPattern),
        teams: z.array(z.string()), // team names with adoptions
        methods: z.array(z.string()), // M-xxx refs
      }),
    )
    .default({}),
  byTeam: z
    .record(
      z.object({
        practiceAreas: z.array(PracticeAreaIdPattern),
        adoptionLevels: z.record(PracticeAreaIdPattern, AdoptionLevelSchema),
      }),
    )
    .default({}),
});

export type ReverseIndices = z.infer<typeof ReverseIndicesSchema>;

// ── Taxonomy Statistics ────────────────────────────────────────────────────
export const TaxonomyStatsSchema = z.object({
  totalNodes: z.number().int().nonnegative().default(0),
  totalEnvironments: z.number().int().nonnegative().default(0),
  totalCapabilities: z.number().int().default(0),
  totalUserTypes: z.number().int().default(0),
  totalStories: z.number().int().default(0),
  totalUseCases: z.number().int().default(0),
  totalRoadItems: z.number().int().default(0),
  totalAdrs: z.number().int().default(0),
  totalNfrs: z.number().int().default(0),
  totalChanges: z.number().int().default(0),
  totalContexts: z.number().int().default(0),
  totalAggregates: z.number().int().default(0),
  totalValueObjects: z.number().int().default(0),
  totalDomainEvents: z.number().int().default(0),
  totalGlossaryTerms: z.number().int().default(0),
  // ── NEW ──
  totalPracticeAreas: z.number().int().default(0),
  totalCompetencies: z.number().int().default(0),
  totalTeamAdoptions: z.number().int().default(0),
  totalIndividualAdoptions: z.number().int().default(0),
  roadsByStatus: z.record(z.number().int()).default({}),
  roadsByPhase: z.record(z.number().int()).default({}),
  referentialIntegrity: z
    .object({
      valid: z.boolean(),
      errors: z.array(z.string()),
    })
    .default({ valid: true, errors: [] }),
});

export type TaxonomyStats = z.infer<typeof TaxonomyStatsSchema>;

// ── Taxonomy Snapshot Schema ───────────────────────────────────────────────
// The single source of truth for the entire project taxonomy. Replaces the
// former GovernanceIndexSchema and DomainModelSchema with a unified structure
// where every entity is a TaxonomyNode with a typed extension.
export const TaxonomySnapshotSchema = z.object({
  id: z.string().uuid(),
  project: z.string(),
  version: z.string(),
  generated: z.string(),
  createdAt: z.string(),

  // ── Core collections ──
  nodes: z.record(TaxonomyNodeSchema).default({}),
  environments: z.record(TaxonomyEnvironmentSchema).default({}),

  // ── Plugin / infrastructure collections ──
  layerTypes: z.record(TaxonomyLayerTypeSchema).default({}),
  infraCapabilities: z.record(TaxonomyCapabilitySchema).default({}),
  capabilityRels: z.record(TaxonomyCapabilityRelSchema).default({}),
  actions: z.record(TaxonomyActionSchema).default({}),
  stages: z.record(TaxonomyStageSchema).default({}),
  tools: z.record(TaxonomyToolSchema).default({}),
  persons: z.record(TaxonomyPersonSchema).default({}),
  teams: z.record(TaxonomyTeamSchema).default({}),
  layerHealths: z.record(LayerHealthSchema).default({}),

  // ── Node type extensions ──
  // Keyed by node UUID, carries domain/governance-specific data.
  extensions: NodeExtensionsSchema.default({}),

  // ── NEW: Adoption records ──
  teamAdoptions: z.record(TeamAdoptionSchema).default({}),
  individualAdoptions: z.record(IndividualAdoptionSchema).default({}),

  // ── Derived data ──
  pluginSummary: TaxonomyPluginSummarySchema.default({}),
  reverseIndices: ReverseIndicesSchema.default({}),
  stats: TaxonomyStatsSchema.default({}),
});

export type TaxonomySnapshot = z.infer<typeof TaxonomySnapshotSchema>;

// ── Helper Functions ───────────────────────────────────────────────────────

/** Get road item node names by capability ID via reverse indices. */
export function getRoadsByCapability(
  snapshot: TaxonomySnapshot,
  capId: string,
): string[] {
  return snapshot.reverseIndices.byCapability[capId]?.roads ?? [];
}

/** Get user type node names by capability ID via reverse indices. */
export function getUserTypesByCapability(
  snapshot: TaxonomySnapshot,
  capId: string,
): string[] {
  return snapshot.reverseIndices.byCapability[capId]?.userTypes ?? [];
}

/** Get capability coverage (number of roads per capability). */
export function getCapabilityCoverage(
  snapshot: TaxonomySnapshot,
): Record<string, number> {
  const coverage: Record<string, number> = {};
  for (const [capId, data] of Object.entries(
    snapshot.reverseIndices.byCapability,
  )) {
    coverage[capId] = data.roads.length;
  }
  return coverage;
}

/** Get aggregate slugs by bounded context slug via reverse indices. */
export function getAggregatesByContext(
  snapshot: TaxonomySnapshot,
  contextSlug: string,
): string[] {
  return snapshot.reverseIndices.byContext[contextSlug]?.aggregates ?? [];
}

/** Get domain event slugs by bounded context slug via reverse indices. */
export function getEventsByContext(
  snapshot: TaxonomySnapshot,
  contextSlug: string,
): string[] {
  return snapshot.reverseIndices.byContext[contextSlug]?.events ?? [];
}

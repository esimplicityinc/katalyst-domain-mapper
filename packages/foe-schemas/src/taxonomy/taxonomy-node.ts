import { z } from "zod";
import { TaxonomyNodeNamePattern } from "./common.js";
import { EntityBaseSchema } from "./entity-base.js";

// ── Taxonomy Node Type ─────────────────────────────────────────────────────
// Expanded to include all entity kinds from the former ddd/ and governance/
// modules. Infrastructure types (system, subsystem, stack, layer, user,
// org_unit) use the base node schema only. Domain/governance types carry
// typed extensions alongside the base node.
export const TaxonomyNodeTypeSchema = z.enum([
  // ── Infrastructure (base node only) ──
  "system",
  "subsystem",
  "stack",
  "library",
  "layer",
  "user",
  "org_unit",
  // ── DDD domain modeling ──
  "bounded_context",
  "aggregate",
  "value_object",
  "domain_event",
  "glossary_term",
  // ── Governance lifecycle ──
  "capability",
  "user_type",
  "user_story",
  "use_case",
  "road_item",
  "adr",
  "nfr",
  "change_entry",
  // ── Practice Areas (NEW) ──
  "practice_area",
  "competency",
]);

export type TaxonomyNodeType = z.infer<typeof TaxonomyNodeTypeSchema>;

// ── Capability Relationship Type ───────────────────────────────────────────
export const CapabilityRelationshipTypeSchema = z.enum([
  "supports",
  "depends-on",
  "implements",
  "enables",
]);

export type CapabilityRelationshipType = z.infer<
  typeof CapabilityRelationshipTypeSchema
>;

// ── Team Topology Type ─────────────────────────────────────────────────────
export const TeamTopologyTypeSchema = z.enum([
  "stream-aligned",
  "platform",
  "enabling",
  "complicated-subsystem",
]);

export type TeamTopologyType = z.infer<typeof TeamTopologyTypeSchema>;

// ── Action Type ────────────────────────────────────────────────────────────
export const ActionTypeSchema = z.enum(["shell", "http", "workflow"]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

// ── Taxonomy Node Schema ───────────────────────────────────────────────────
// Pattern A: Tree nodes. Extends EntityBase with hierarchy-specific fields.
// The universal base for every entity in the taxonomy tree.
// UUID is the primary identity; name is the human-readable slug.
// The `contribution` block (from EntityBase) gates the universal contribution
// lifecycle (draft → proposed → accepted, etc.). Type-specific statuses only
// activate after contribution.status === "accepted".
export const TaxonomyNodeSchema = EntityBaseSchema.extend({
  nodeType: TaxonomyNodeTypeSchema,
  fqtn: z.string(), // fully-qualified taxonomy name
  parentNode: z.string().nullable().default(null), // parent node ref
  environments: z.array(z.string()).default([]),
  path: z.string().default(""),
});

export type TaxonomyNode = z.infer<typeof TaxonomyNodeSchema>;

// ── Infrastructure Schemas ─────────────────────────────────────────────────
// Pattern B: Infrastructure items. Extend EntityBase with type-specific fields.
// These entities aren't tree nodes but need full lifecycle.
//
// NOTE: TaxonomyTeamMembershipSchema is NOT refactored -- it's a pure value
// object (no identity) embedded in TaxonomyTeamSchema.

// ── Taxonomy Environment Schema ────────────────────────────────────────────
export const TaxonomyEnvironmentSchema = EntityBaseSchema.extend({
  parentEnvironment: z.string().nullable().default(null),
  promotionTargets: z.array(z.string()).default([]),
  templateReplacements: z.record(z.string()).default({}),
});

export type TaxonomyEnvironment = z.infer<typeof TaxonomyEnvironmentSchema>;

// ── Taxonomy Layer Type Schema ─────────────────────────────────────────────
export const TaxonomyLayerTypeSchema = EntityBaseSchema.extend({
  defaultLayerDir: z.string().nullable().default(null),
});

export type TaxonomyLayerType = z.infer<typeof TaxonomyLayerTypeSchema>;

// ── Taxonomy Capability Schema ─────────────────────────────────────────────
// Infrastructure-level capability (not to be confused with CapabilityExtSchema
// which is the governance lifecycle extension for capability nodes).
// NOTE: `tag` removed -- governance IDs go in `labels` on EntityBase.
export const TaxonomyCapabilitySchema = EntityBaseSchema.extend({
  categories: z.array(z.string()).default([]),
  dependsOnCapabilities: z.array(z.string()).default([]),
  /** Slug of the parent capability (null = root / system-level capability) */
  parentCapability: z.string().nullable().default(null),
});

export type TaxonomyCapability = z.infer<typeof TaxonomyCapabilitySchema>;

// ── Taxonomy Capability Relationship Schema ────────────────────────────────
export const TaxonomyCapabilityRelSchema = EntityBaseSchema.extend({
  node: z.string(),
  relationshipType: CapabilityRelationshipTypeSchema,
  capabilities: z.array(z.string()).min(1),
});

export type TaxonomyCapabilityRel = z.infer<typeof TaxonomyCapabilityRelSchema>;

// ── Taxonomy Action Schema ─────────────────────────────────────────────────
export const TaxonomyActionSchema = EntityBaseSchema.extend({
  actionType: ActionTypeSchema,
  layerType: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
});

export type TaxonomyAction = z.infer<typeof TaxonomyActionSchema>;

// ── Taxonomy Stage Schema ──────────────────────────────────────────────────
// NOTE: description and dependsOn already exist on EntityBase, no extra fields needed.
export const TaxonomyStageSchema = EntityBaseSchema;

export type TaxonomyStage = z.infer<typeof TaxonomyStageSchema>;

// ── Taxonomy Tool Schema ───────────────────────────────────────────────────
export const TaxonomyToolSchema = EntityBaseSchema.extend({
  actions: z.array(z.string()).default([]),
});

export type TaxonomyTool = z.infer<typeof TaxonomyToolSchema>;

// ── Taxonomy Person Schema ─────────────────────────────────────────────────
export const TaxonomyPersonSchema = EntityBaseSchema.extend({
  displayName: z.string(),
  email: z.string().nullable().default(null),
  role: z.string().nullable().default(null),
  avatarUrl: z.string().nullable().default(null),
});

export type TaxonomyPerson = z.infer<typeof TaxonomyPersonSchema>;

// ── Taxonomy Team Membership Schema ────────────────────────────────────────
// Pure value object -- NOT refactored to EntityBase (no identity/lifecycle).
export const TaxonomyTeamMembershipSchema = z.object({
  personName: TaxonomyNodeNamePattern,
  role: z.string(),
});

export type TaxonomyTeamMembership = z.infer<
  typeof TaxonomyTeamMembershipSchema
>;

// ── Taxonomy Team Schema ───────────────────────────────────────────────────
export const TaxonomyTeamSchema = EntityBaseSchema.extend({
  displayName: z.string(),
  teamType: TeamTopologyTypeSchema,
  focusArea: z.string().nullable().default(null),
  communicationChannels: z.array(z.string()).default([]),
  ownedNodes: z.array(z.string()).default([]),
  members: z.array(TaxonomyTeamMembershipSchema).default([]),
});

export type TaxonomyTeam = z.infer<typeof TaxonomyTeamSchema>;

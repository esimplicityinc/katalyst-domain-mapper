import { z } from "zod";
import { TaxonomyNodeNamePattern } from "./common.js";

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
// The universal base for every entity in the taxonomy tree.
// UUID is the primary identity; name is the human-readable slug.
export const TaxonomyNodeSchema = z.object({
  id: z.string().uuid(),
  name: TaxonomyNodeNamePattern,
  nodeType: TaxonomyNodeTypeSchema,
  fqtn: z.string(),
  description: z.string().nullable().default(null),
  parentNode: z.string().nullable().default(null),
  owners: z.array(z.string()).default([]),
  environments: z.array(z.string()).default([]),
  labels: z.record(z.string()).default({}),
  dependsOn: z.array(z.string()).default([]),
  path: z.string().default(""),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
});

export type TaxonomyNode = z.infer<typeof TaxonomyNodeSchema>;

// ── Taxonomy Environment Schema ────────────────────────────────────────────
export const TaxonomyEnvironmentSchema = z.object({
  name: TaxonomyNodeNamePattern,
  description: z.string().nullable().default(null),
  parentEnvironment: z.string().nullable().default(null),
  promotionTargets: z.array(z.string()).default([]),
  templateReplacements: z.record(z.string()).default({}),
});

export type TaxonomyEnvironment = z.infer<typeof TaxonomyEnvironmentSchema>;

// ── Taxonomy Layer Type Schema ─────────────────────────────────────────────
export const TaxonomyLayerTypeSchema = z.object({
  name: TaxonomyNodeNamePattern,
  description: z.string().nullable().default(null),
  defaultLayerDir: z.string().nullable().default(null),
});

export type TaxonomyLayerType = z.infer<typeof TaxonomyLayerTypeSchema>;

// ── Taxonomy Capability Schema ─────────────────────────────────────────────
// Infrastructure-level capability (not to be confused with CapabilityExtSchema
// which is the governance lifecycle extension for capability nodes).
export const TaxonomyCapabilitySchema = z.object({
  name: TaxonomyNodeNamePattern,
  description: z.string(),
  categories: z.array(z.string()).default([]),
  dependsOnCapabilities: z.array(z.string()).default([]),
  /** Slug of the parent capability (null = root / system-level capability) */
  parentCapability: z.string().nullable().default(null),
  /** Optional display tag for traceability, e.g. "CAP-005" */
  tag: z.string().nullable().default(null),
});

export type TaxonomyCapability = z.infer<typeof TaxonomyCapabilitySchema>;

// ── Taxonomy Capability Relationship Schema ────────────────────────────────
export const TaxonomyCapabilityRelSchema = z.object({
  name: TaxonomyNodeNamePattern,
  node: z.string(),
  relationshipType: CapabilityRelationshipTypeSchema,
  capabilities: z.array(z.string()).min(1),
});

export type TaxonomyCapabilityRel = z.infer<typeof TaxonomyCapabilityRelSchema>;

// ── Taxonomy Action Schema ─────────────────────────────────────────────────
export const TaxonomyActionSchema = z.object({
  name: TaxonomyNodeNamePattern,
  actionType: ActionTypeSchema,
  layerType: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
});

export type TaxonomyAction = z.infer<typeof TaxonomyActionSchema>;

// ── Taxonomy Stage Schema ──────────────────────────────────────────────────
export const TaxonomyStageSchema = z.object({
  name: TaxonomyNodeNamePattern,
  description: z.string().nullable().default(null),
  dependsOn: z.array(z.string()).default([]),
});

export type TaxonomyStage = z.infer<typeof TaxonomyStageSchema>;

// ── Taxonomy Tool Schema ───────────────────────────────────────────────────
export const TaxonomyToolSchema = z.object({
  name: TaxonomyNodeNamePattern,
  description: z.string(),
  actions: z.array(z.string()).default([]),
});

export type TaxonomyTool = z.infer<typeof TaxonomyToolSchema>;

// ── Taxonomy Person Schema ─────────────────────────────────────────────────
export const TaxonomyPersonSchema = z.object({
  name: TaxonomyNodeNamePattern,
  displayName: z.string(),
  email: z.string().nullable().default(null),
  role: z.string().nullable().default(null),
  avatarUrl: z.string().nullable().default(null),
});

export type TaxonomyPerson = z.infer<typeof TaxonomyPersonSchema>;

// ── Taxonomy Team Membership Schema ────────────────────────────────────────
export const TaxonomyTeamMembershipSchema = z.object({
  personName: TaxonomyNodeNamePattern,
  role: z.string(),
});

export type TaxonomyTeamMembership = z.infer<
  typeof TaxonomyTeamMembershipSchema
>;

// ── Taxonomy Team Schema ───────────────────────────────────────────────────
export const TaxonomyTeamSchema = z.object({
  name: TaxonomyNodeNamePattern,
  displayName: z.string(),
  teamType: TeamTopologyTypeSchema,
  description: z.string().nullable().default(null),
  focusArea: z.string().nullable().default(null),
  communicationChannels: z.array(z.string()).default([]),
  ownedNodes: z.array(z.string()).default([]),
  members: z.array(TaxonomyTeamMembershipSchema).default([]),
});

export type TaxonomyTeam = z.infer<typeof TaxonomyTeamSchema>;

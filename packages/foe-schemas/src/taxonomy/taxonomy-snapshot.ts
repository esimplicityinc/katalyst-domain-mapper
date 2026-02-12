import { z } from "zod";

// ── Taxonomy Node Name Pattern ─────────────────────────────────────────────
// Kubernetes-style kebab-case names (max 63 chars)
export const TaxonomyNodeNamePattern = z
  .string()
  .regex(/^[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$/);

// ── Taxonomy Node Type ─────────────────────────────────────────────────────
export const TaxonomyNodeTypeSchema = z.enum([
  "system",
  "subsystem",
  "stack",
  "layer",
  "user",
  "org_unit",
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

// ── Action Type ────────────────────────────────────────────────────────────
export const ActionTypeSchema = z.enum(["shell", "http", "workflow"]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

// ── Taxonomy Node Schema ───────────────────────────────────────────────────
export const TaxonomyNodeSchema = z.object({
  name: TaxonomyNodeNamePattern,
  nodeType: TaxonomyNodeTypeSchema,
  fqtn: z.string(),
  description: z.string().nullable().default(null),
  parentNode: z.string().nullable().default(null),
  owners: z.array(z.string()).default([]),
  environments: z.array(z.string()).default([]),
  labels: z.record(z.string()).default({}),
  dependsOn: z.array(z.string()).default([]),
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
export const TaxonomyCapabilitySchema = z.object({
  name: TaxonomyNodeNamePattern,
  description: z.string(),
  categories: z.array(z.string()).default([]),
  dependsOnCapabilities: z.array(z.string()).default([]),
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

// ── Plugin Summary Schema ──────────────────────────────────────────────────
export const TaxonomyPluginSummarySchema = z.object({
  layerTypes: z.number().int().nonnegative().default(0),
  capabilities: z.number().int().nonnegative().default(0),
  capabilityRels: z.number().int().nonnegative().default(0),
  actions: z.number().int().nonnegative().default(0),
  stages: z.number().int().nonnegative().default(0),
  tools: z.number().int().nonnegative().default(0),
});

export type TaxonomyPluginSummary = z.infer<typeof TaxonomyPluginSummarySchema>;

// ── Taxonomy Snapshot Schema ───────────────────────────────────────────────
export const TaxonomySnapshotSchema = z.object({
  id: z.string().uuid(),
  project: z.string(),
  version: z.string(),
  generated: z.string(),
  nodeCount: z.number().int().nonnegative(),
  environmentCount: z.number().int().nonnegative(),
  pluginSummary: TaxonomyPluginSummarySchema,
  createdAt: z.string(),
});

export type TaxonomySnapshot = z.infer<typeof TaxonomySnapshotSchema>;

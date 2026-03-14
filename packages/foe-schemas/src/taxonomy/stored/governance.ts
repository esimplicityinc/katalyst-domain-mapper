import { z } from "zod";
import { ContributionSchema } from "../contribution.js";

// ── Governance Snapshot Stats ──────────────────────────────────────────────

export const GovernanceSnapshotStatsSchema = z.object({
  capabilities: z.number().default(0),
  userTypes: z.number().default(0),
  userStories: z.number().default(0),
  roadItems: z.number().default(0),
  integrityStatus: z.string().default("unknown"),
  integrityErrors: z.number().default(0),
});
export type GovernanceSnapshotStats = z.infer<
  typeof GovernanceSnapshotStatsSchema
>;

// ── Stored Governance Snapshot ─────────────────────────────────────────────

export const StoredGovernanceSnapshotSchema = z.object({
  id: z.string(),
  project: z.string(),
  version: z.string(),
  generated: z.string(),
  createdAt: z.string(),
  stats: GovernanceSnapshotStatsSchema,
});
export type StoredGovernanceSnapshot = z.infer<
  typeof StoredGovernanceSnapshotSchema
>;

// ── Stored Capability ──────────────────────────────────────────────────────

export const StoredCapabilitySchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["planned", "stable", "deprecated"]),
  description: z.string().nullable().default(null),
  category: z
    .enum([
      "Security",
      "Observability",
      "Communication",
      "Business",
      "Technical",
    ])
    .nullable()
    .default(null),
  parentCapability: z.string().nullable().default(null),
  dependsOn: z.array(z.string()).default([]),
  roadCount: z.number().default(0),
  storyCount: z.number().default(0),
  taxonomyNode: z.string().nullable().default(null),
  contribution: ContributionSchema,
});
export type StoredCapability = z.infer<typeof StoredCapabilitySchema>;

export const CreateCapabilityInputSchema = StoredCapabilitySchema.omit({
  roadCount: true,
  storyCount: true,
});
export type CreateCapabilityInput = z.infer<typeof CreateCapabilityInputSchema>;

export const UpdateCapabilityInputSchema = z.object({
  status: z.enum(["planned", "stable", "deprecated"]).optional(),
  title: z.string().optional(),
  description: z.string().nullable().default(null).optional(),
  dependsOn: z.array(z.string()).default([]).optional(),
  parentCapability: z.string().nullable().default(null).optional(),
  category: z
    .enum([
      "Security",
      "Observability",
      "Communication",
      "Business",
      "Technical",
    ])
    .nullable()
    .default(null)
    .optional(),
  taxonomyNode: z.string().nullable().default(null).optional(),
});
export type UpdateCapabilityInput = z.infer<typeof UpdateCapabilityInputSchema>;

// ── Stored User Type ───────────────────────────────────────────────────────

export const StoredUserTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["human", "bot", "system", "external_api"]),
  status: z.enum(["draft", "approved", "deprecated"]),
  archetype: z.enum([
    "creator",
    "operator",
    "administrator",
    "consumer",
    "integrator",
  ]),
  description: z.string().nullable().default(null),
  goals: z.array(z.string()).default([]),
  painPoints: z.array(z.string()).default([]),
  behaviors: z.array(z.string()).default([]),
  typicalCapabilities: z.array(z.string()).default([]),
  technicalProfile: z
    .object({
      skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      integrationType: z
        .enum(["web_ui", "api", "sdk", "webhook", "cli"])
        .optional(),
      frequency: z.enum(["daily", "weekly", "occasional"]).optional(),
    })
    .nullable()
    .default(null),
  relatedStories: z.array(z.string()).default([]),
  relatedUserTypes: z.array(z.string()).default([]),
  storyCount: z.number().default(0),
  capabilityCount: z.number().default(0),
  contribution: ContributionSchema,
});
export type StoredUserType = z.infer<typeof StoredUserTypeSchema>;

export const CreateUserTypeInputSchema = StoredUserTypeSchema.omit({
  storyCount: true,
  capabilityCount: true,
});
export type CreateUserTypeInput = z.infer<typeof CreateUserTypeInputSchema>;

export const UpdateUserTypeInputSchema = z.object({
  type: z.enum(["human", "bot", "system", "external_api"]).optional(),
  status: z.enum(["draft", "approved", "deprecated"]).optional(),
  description: z.string().nullable().default(null).optional(),
  name: z.string().optional(),
  archetype: z
    .enum(["creator", "operator", "administrator", "consumer", "integrator"])
    .optional(),
  goals: z.array(z.string()).default([]).optional(),
  painPoints: z.array(z.string()).default([]).optional(),
  behaviors: z.array(z.string()).default([]).optional(),
  typicalCapabilities: z.array(z.string()).default([]).optional(),
  technicalProfile: z
    .object({
      skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      integrationType: z
        .enum(["web_ui", "api", "sdk", "webhook", "cli"])
        .optional(),
      frequency: z.enum(["daily", "weekly", "occasional"]).optional(),
    })
    .nullable()
    .default(null)
    .optional(),
  relatedStories: z.array(z.string()).default([]).optional(),
  relatedUserTypes: z.array(z.string()).default([]).optional(),
});
export type UpdateUserTypeInput = z.infer<typeof UpdateUserTypeInputSchema>;

// ── Stored User Story ──────────────────────────────────────────────────────

export const StoredUserStorySchema = z.object({
  id: z.string(),
  title: z.string(),
  userType: z.string(),
  status: z.enum([
    "draft",
    "approved",
    "implementing",
    "complete",
    "deprecated",
  ]),
  capabilities: z.array(z.string()).default([]),
  useCases: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string()).default([]),
  taxonomyNode: z.string().nullable().default(null),
  contribution: ContributionSchema,
});
export type StoredUserStory = z.infer<typeof StoredUserStorySchema>;

export const UpdateUserStoryInputSchema = z.object({
  status: z
    .enum(["draft", "approved", "implementing", "complete", "deprecated"])
    .optional(),
  title: z.string().optional(),
  userType: z.string().optional(),
  capabilities: z.array(z.string()).default([]).optional(),
  useCases: z.array(z.string()).default([]).optional(),
  acceptanceCriteria: z.array(z.string()).default([]).optional(),
  taxonomyNode: z.string().nullable().default(null).optional(),
});
export type UpdateUserStoryInput = z.infer<typeof UpdateUserStoryInputSchema>;

// ── Capability Coverage ────────────────────────────────────────────────────

export const CapabilityCoverageSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  roadCount: z.number(),
  storyCount: z.number(),
});
export type CapabilityCoverage = z.infer<typeof CapabilityCoverageSchema>;

// ── User Type Coverage ─────────────────────────────────────────────────────

export const UserTypeCoverageSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  storyCount: z.number(),
  capabilityCount: z.number(),
});
export type UserTypeCoverage = z.infer<typeof UserTypeCoverageSchema>;

// ── Road Item Summary ──────────────────────────────────────────────────────

export const RoadItemSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  phase: z.number(),
  priority: z.enum(["critical", "high", "medium", "low"]),
});
export type RoadItemSummary = z.infer<typeof RoadItemSummarySchema>;

// ── Integrity Report ───────────────────────────────────────────────────────

export const IntegrityReportSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  totalArtifacts: z.number(),
  checkedAt: z.string(),
});
export type IntegrityReport = z.infer<typeof IntegrityReportSchema>;

// ── Trend Point ────────────────────────────────────────────────────────────

export const TrendPointSchema = z.object({
  snapshotId: z.string(),
  generated: z.string(),
  totalCapabilities: z.number(),
  totalRoadItems: z.number(),
  integrityStatus: z.string(),
  completedRoads: z.number(),
});
export type TrendPoint = z.infer<typeof TrendPointSchema>;

// ── Governance States ──────────────────────────────────────────────────────

export const GOVERNANCE_STATES = [
  "proposed",
  "adr_validated",
  "bdd_pending",
  "bdd_complete",
  "implementing",
  "nfr_validating",
  "nfr_blocked",
  "complete",
] as const;
export type GovernanceState = (typeof GOVERNANCE_STATES)[number];

export const STATE_LABELS: Record<GovernanceState, string> = {
  proposed: "Proposed",
  adr_validated: "ADR Validated",
  bdd_pending: "BDD Pending",
  bdd_complete: "BDD Complete",
  implementing: "Implementing",
  nfr_validating: "NFR Validating",
  nfr_blocked: "NFR Blocked",
  complete: "Complete",
};

// ── Governance Snapshot Input ──────────────────────────────────────────────

export const GovernanceSnapshotInputSchema = z.object({
  version: z.string(),
  project: z.string(),
  generated: z.string().optional(),
  capabilities: z.record(
    z.string(),
    z.object({
      id: z.string().optional(),
      title: z.string(),
      status: z.string(),
    }),
  ),
  userTypes: z
    .record(
      z.string(),
      z.object({
        id: z.string().optional(),
        name: z.string(),
        type: z.string(),
      }),
    )
    .default({}),
  userStories: z.record(z.string(), z.unknown()).default({}),
  roadItems: z
    .record(
      z.string(),
      z.object({
        id: z.string().optional(),
        title: z.string(),
        status: z.string(),
        phase: z.number().optional(),
        priority: z.string().optional(),
      }),
    )
    .default({}),
  stats: z.object({
    capabilities: z.number().optional(),
    totalCapabilities: z.number().optional(),
    userTypes: z.number().optional(),
    totalUserTypes: z.number().optional(),
    userStories: z.number().optional(),
    totalStories: z.number().optional(),
    roadItems: z.number().optional(),
    totalRoadItems: z.number().optional(),
    integrityStatus: z.string().optional(),
    integrityErrors: z.number().optional(),
    roadsByStatus: z.record(z.string(), z.number()).optional(),
    referentialIntegrity: z
      .object({
        valid: z.boolean(),
        errors: z.array(z.string()),
      })
      .optional(),
  }),
  byCapability: z
    .record(
      z.string(),
      z.object({
        stories: z.array(z.string()).optional(),
        roads: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  byUserType: z
    .record(
      z.string(),
      z.object({
        stories: z.array(z.string()).optional(),
        capabilities: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  boundedContexts: z
    .record(
      z.string(),
      z.object({
        title: z.string().optional(),
      }),
    )
    .optional(),
  byContext: z
    .record(
      z.string(),
      z.object({
        aggregates: z.array(z.string()).optional(),
        events: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});
export type GovernanceSnapshotInput = z.infer<
  typeof GovernanceSnapshotInputSchema
>;

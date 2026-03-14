import { z } from "zod";
import {
  CapabilityIdPattern,
  UserStoryIdPattern,
  UserTypeIdPattern,
} from "../common.js";
import { ContributionSchema } from "../contribution.js";

// ── User Type Extension ────────────────────────────────────────────────────
// Carries governance lifecycle fields for taxonomy nodes with nodeType:
// "user_type". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels (including governance-id e.g. "UT-001"), dependsOn, etc.
export const UserTypeExtSchema = z.object({
  title: z.string(),
  tag: z.string().regex(/^@UT-\d+$/),
  type: z.enum(["human", "bot", "system", "external_api"]),
  status: z.enum(["draft", "approved", "deprecated"]),
  archetype: z.enum([
    "creator",
    "operator",
    "administrator",
    "consumer",
    "integrator",
  ]),
  goals: z.array(z.string()).default([]),
  painPoints: z.array(z.string()).default([]),
  behaviors: z.array(z.string()).default([]),
  typicalCapabilities: z.array(CapabilityIdPattern).default([]),
  technicalProfile: z
    .object({
      skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
      integrationType: z.enum(["web_ui", "api", "sdk", "webhook", "cli"]),
      frequency: z.enum(["daily", "weekly", "occasional"]),
    })
    .optional(),
  relatedStories: z.array(UserStoryIdPattern).default([]),
  relatedUserTypes: z.array(UserTypeIdPattern).default([]),
  created: z.string().optional(),
  updated: z.string().optional(),
  validatedBy: z.string().optional(),
  contribution: ContributionSchema,
});

export type UserTypeExt = z.infer<typeof UserTypeExtSchema>;

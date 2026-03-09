import { z } from "zod";
import {
  CapabilityIdPattern,
  UserStoryIdPattern,
  PersonaIdPattern,
} from "../common.js";

// ── Persona Extension ──────────────────────────────────────────────────────
// Carries governance lifecycle fields for taxonomy nodes with nodeType:
// "persona". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels (including governance-id e.g. "PER-001"), dependsOn, etc.
export const PersonaExtSchema = z.object({
  title: z.string(),
  tag: z.string().regex(/^@PER-\d+$/),
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
  relatedPersonas: z.array(PersonaIdPattern).default([]),
  created: z.string().optional(),
  updated: z.string().optional(),
  validatedBy: z.string().optional(),
});

export type PersonaExt = z.infer<typeof PersonaExtSchema>;

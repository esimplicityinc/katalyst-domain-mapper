import { z } from "zod";
import {
  PersonaIdPattern,
  CapabilityIdPattern,
  UseCaseIdPattern,
} from "../common.js";

// ── User Story Extension ───────────────────────────────────────────────────
// Carries governance lifecycle fields for taxonomy nodes with nodeType:
// "user_story". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels (including governance-id e.g. "US-001"), dependsOn, etc.
export const UserStoryExtSchema = z.object({
  title: z.string(),
  persona: PersonaIdPattern,
  status: z.enum([
    "draft",
    "approved",
    "implementing",
    "complete",
    "deprecated",
  ]),
  capabilities: z.array(CapabilityIdPattern).min(1),
  useCases: z.array(UseCaseIdPattern).default([]),
  acceptanceCriteria: z.array(z.string()).default([]),
});

export type UserStoryExt = z.infer<typeof UserStoryExtSchema>;

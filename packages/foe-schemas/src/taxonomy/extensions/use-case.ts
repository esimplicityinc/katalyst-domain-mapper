import { z } from "zod";
import { UserTypeIdPattern } from "../common.js";

// ── Use Case Extension ─────────────────────────────────────────────────────
// Carries governance lifecycle fields for taxonomy nodes with nodeType:
// "use_case". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels (including governance-id e.g. "UC-001"), dependsOn, etc.
export const UseCaseExtSchema = z.object({
  title: z.string(),
  actors: z.array(UserTypeIdPattern).default([]),
  preconditions: z.array(z.string()).default([]),
  postconditions: z.array(z.string()).default([]),
  mainFlow: z.array(z.string()).default([]),
  alternativeFlows: z.array(z.string()).default([]),
});

export type UseCaseExt = z.infer<typeof UseCaseExtSchema>;

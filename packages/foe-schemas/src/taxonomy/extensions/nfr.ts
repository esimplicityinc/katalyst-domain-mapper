import { z } from "zod";
import { PrioritySchema } from "../common.js";
import { ContributionSchema } from "../contribution.js";

// ── NFR Category ───────────────────────────────────────────────────────────
export const NfrCategorySchema = z.enum([
  "performance",
  "security",
  "accessibility",
  "reliability",
  "scalability",
  "maintainability",
]);
export type NfrCategory = z.infer<typeof NfrCategorySchema>;

// ── NFR Extension ──────────────────────────────────────────────────────────
// Carries governance lifecycle fields for taxonomy nodes with nodeType:
// "nfr". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels (including governance-id e.g. "NFR-SEC-001"), dependsOn, etc.
export const NfrExtSchema = z.object({
  title: z.string(),
  category: NfrCategorySchema,
  priority: PrioritySchema,
  status: z.enum(["active", "deprecated"]),
  created: z.string(),
  threshold: z.string().optional(),
  measurement: z.string().optional(),
  contribution: ContributionSchema,
});

export type NfrExt = z.infer<typeof NfrExtSchema>;

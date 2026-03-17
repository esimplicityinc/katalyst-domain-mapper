import { z } from "zod";
import { AdrIdPattern } from "../common.js";

// ── ADR Status ─────────────────────────────────────────────────────────────
export const AdrStatusSchema = z.enum([
  "proposed",
  "accepted",
  "deprecated",
  "superseded",
]);
export type AdrStatus = z.infer<typeof AdrStatusSchema>;

// ── ADR Category ───────────────────────────────────────────────────────────
export const AdrCategorySchema = z.enum([
  "architecture",
  "infrastructure",
  "security",
  "performance",
  "maintainability",
  "testing",
]);
export type AdrCategory = z.infer<typeof AdrCategorySchema>;

// ── ADR Extension ──────────────────────────────────────────────────────────
// Carries governance lifecycle fields for taxonomy nodes with nodeType:
// "adr". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels (including governance-id e.g. "ADR-001"), dependsOn, etc.
export const AdrExtSchema = z.object({
  title: z.string(),
  status: AdrStatusSchema,
  category: AdrCategorySchema,
  scope: z.string().default("project-wide"),
  supersededBy: AdrIdPattern.optional(),
});

export type AdrExt = z.infer<typeof AdrExtSchema>;

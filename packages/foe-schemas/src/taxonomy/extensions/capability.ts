import { z } from "zod";
import { ContributionSchema } from "../contribution.js";

// ── Capability Extension ───────────────────────────────────────────────────
// Carries governance lifecycle fields for taxonomy nodes with nodeType:
// "capability". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels (including governance-id e.g. "CAP-001"), dependsOn, etc.
export const CapabilityExtSchema = z.object({
  title: z.string(),
  tag: z.string().regex(/^@CAP-\d+$/),
  category: z.enum([
    "Security",
    "Observability",
    "Communication",
    "Business",
    "Technical",
  ]),
  status: z.enum(["planned", "stable", "deprecated"]),
  contribution: ContributionSchema,
});

export type CapabilityExt = z.infer<typeof CapabilityExtSchema>;

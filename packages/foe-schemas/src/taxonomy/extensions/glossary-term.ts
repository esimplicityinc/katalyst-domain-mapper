import { z } from "zod";

// ── Glossary Term Extension ────────────────────────────────────────────────
// Carries domain-specific fields for taxonomy nodes with nodeType:
// "glossary_term". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels, dependsOn, etc.
export const GlossaryTermExtSchema = z.object({
  term: z.string(),
  definition: z.string(),
  contextId: z.string().uuid().optional(),
  aliases: z.array(z.string()).default([]),
  examples: z.array(z.string()).default([]),
  relatedTerms: z.array(z.string()).default([]),
  source: z.string().optional(),
});

export type GlossaryTermExt = z.infer<typeof GlossaryTermExtSchema>;

import { z } from "zod";
import { SlugPattern } from "../common.js";

// ── Invariant ──────────────────────────────────────────────────────────────
export const InvariantSchema = z.object({
  description: z.string(),
  enforced: z.boolean().default(false),
  enforcementLocation: z.string().optional(),
});

export type Invariant = z.infer<typeof InvariantSchema>;

// ── Aggregate Extension ────────────────────────────────────────────────────
// Carries domain-specific fields for taxonomy nodes with nodeType:
// "aggregate". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels, dependsOn, etc.
export const AggregateExtSchema = z.object({
  context: SlugPattern,
  rootEntity: z.string(),
  entities: z.array(z.string()).default([]),
  valueObjects: z.array(SlugPattern).default([]),
  events: z.array(SlugPattern).default([]),
  commands: z.array(z.string()).default([]),
  invariants: z.array(InvariantSchema).default([]),
  sourceFile: z.string().optional(),
  status: z.enum(["draft", "implemented", "deprecated"]).default("draft"),
});

export type AggregateExt = z.infer<typeof AggregateExtSchema>;

import { z } from "zod";
import { SlugPattern } from "../common.js";

// ── Invariant ──────────────────────────────────────────────────────────────
// Accepts both `rule` (web UI convention) and `description` (original schema).
// After parsing, both fields are present and normalized.
export const InvariantSchema = z
  .object({
    rule: z.string().optional(),
    description: z.string().optional(),
    enforced: z.boolean().default(false),
    enforcementLocation: z.string().optional(),
  })
  .transform((val) => ({
    rule: val.rule ?? val.description ?? "",
    description: val.description ?? val.rule ?? "",
    enforced: val.enforced,
    enforcementLocation: val.enforcementLocation,
  }));

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

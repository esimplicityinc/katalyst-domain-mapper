import { z } from "zod";
import { SlugPattern } from "../common.js";

// ── Value Object Property ──────────────────────────────────────────────────
// Accepts both `constraints` (original schema) and `description` (web UI).
// After parsing, both fields are present.
export const ValueObjectPropertySchema = z
  .object({
    name: z.string(),
    type: z.string(),
    constraints: z.string().optional(),
    description: z.string().optional(),
  })
  .transform((val) => ({
    name: val.name,
    type: val.type,
    constraints: val.constraints ?? val.description,
    description: val.description ?? val.constraints,
  }));

export type ValueObjectProperty = z.infer<typeof ValueObjectPropertySchema>;

// ── Value Object Extension ─────────────────────────────────────────────────
// Carries domain-specific fields for taxonomy nodes with nodeType:
// "value_object". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels, dependsOn, etc.
export const ValueObjectExtSchema = z.object({
  context: SlugPattern,
  properties: z.array(ValueObjectPropertySchema).default([]),
  validationRules: z.array(z.string()).default([]),
  immutable: z.boolean().default(true),
  sourceFile: z.string().optional(),
});

export type ValueObjectExt = z.infer<typeof ValueObjectExtSchema>;

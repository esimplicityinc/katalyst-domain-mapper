import { z } from "zod";
import { TaxonomyNodeNamePattern } from "./common.js";
import { ContributionSchema } from "./contribution.js";

// ── Entity Base Schema ─────────────────────────────────────────────────────
// The universal foundation for all entities in the system. Every tree node,
// infrastructure item, and bridge record composes from this shared core.
//
// 10 fields total:
//   Identity:     id, name
//   Metadata:     description, labels
//   Ownership:    owners, dependsOn
//   Timestamps:   createdAt, updatedAt (single source of truth, ISO 8601)
//   Lifecycle:    contribution (never duplicated in extensions)
export const EntityBaseSchema = z.object({
  // ── Identity ──
  id: z.string().uuid(),
  name: TaxonomyNodeNamePattern, // kebab-case slug, max 63 chars

  // ── Metadata ──
  description: z.string().nullable().default(null),
  labels: z.record(z.string()).default({}), // governance IDs, tags, key-value pairs

  // ── Ownership & Dependencies ──
  owners: z.array(z.string()).default([]), // person/team name refs
  dependsOn: z.array(z.string()).default([]), // cross-entity dependency refs

  // ── Timestamps (single source of truth, ISO 8601 validated) ──
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // ── Lifecycle (single instance -- never duplicated in extensions) ──
  contribution: ContributionSchema,
});

export type EntityBase = z.infer<typeof EntityBaseSchema>;

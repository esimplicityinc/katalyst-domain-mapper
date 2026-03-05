import { z } from "zod";
import { SlugPattern } from "../common.js";

// ── Communication Pattern ──────────────────────────────────────────────────
export const CommunicationPatternSchema = z.enum([
  "domain-events",
  "shared-kernel",
  "anti-corruption-layer",
  "open-host-service",
  "conformist",
  "partnership",
  "customer-supplier",
  "separate-ways",
]);

export type CommunicationPattern = z.infer<typeof CommunicationPatternSchema>;

// ── Subdomain Type ─────────────────────────────────────────────────────────
export const SubdomainTypeSchema = z.enum(["core", "supporting", "generic"]);
export type SubdomainType = z.infer<typeof SubdomainTypeSchema>;

// ── Context Type ───────────────────────────────────────────────────────────
export const ContextTypeSchema = z.enum([
  "internal",
  "external-system",
  "human-process",
  "unknown",
]);
export type ContextType = z.infer<typeof ContextTypeSchema>;

// ── Context Relationship ───────────────────────────────────────────────────
// Describes a relationship between two bounded contexts (from the UUID-based
// DDD model). In the taxonomy each context is a node; relationships are
// expressed via this embedded object OR via dependsOn on the base node.
export const ContextRelationshipSchema = z.object({
  targetContext: z.string(),
  type: z.enum([
    "upstream",
    "downstream",
    "partnership",
    "shared-kernel",
    "separate-ways",
  ]),
  communicationPattern: CommunicationPatternSchema.optional(),
  description: z.string().optional(),
});

export type ContextRelationship = z.infer<typeof ContextRelationshipSchema>;

// ── Bounded Context Extension ──────────────────────────────────────────────
// Carries domain-specific fields for taxonomy nodes with nodeType:
// "bounded_context". The base TaxonomyNode provides id, name, fqtn,
// parentNode, labels, dependsOn, etc.
export const BoundedContextExtSchema = z.object({
  responsibility: z.string(),
  sourceDirectory: z.string().optional(),
  aggregates: z.array(SlugPattern).default([]),
  relationships: z.array(ContextRelationshipSchema).default([]),
  communicationPattern: CommunicationPatternSchema.default("domain-events"),
  upstreamContexts: z.array(SlugPattern).default([]),
  downstreamContexts: z.array(SlugPattern).default([]),
  teamOwnership: z.string().optional(),
  ownerTeam: z.string().optional(),
  status: z.enum(["draft", "stable", "deprecated"]).default("draft"),
  subdomainType: SubdomainTypeSchema.nullable().default(null),
  contextType: ContextTypeSchema.default("internal"),
});

export type BoundedContextExt = z.infer<typeof BoundedContextExtSchema>;

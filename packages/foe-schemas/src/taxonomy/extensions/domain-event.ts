import { z } from "zod";
import { SlugPattern } from "../common.js";

// ── Event Payload Field ────────────────────────────────────────────────────
export const EventPayloadFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
});

export type EventPayloadField = z.infer<typeof EventPayloadFieldSchema>;

// ── Domain Event Extension ─────────────────────────────────────────────────
// Carries domain-specific fields for taxonomy nodes with nodeType:
// "domain_event". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels, dependsOn, etc.
export const DomainEventExtSchema = z.object({
  context: SlugPattern,
  aggregate: SlugPattern.optional(),
  payload: z.array(EventPayloadFieldSchema).default([]),
  consumedBy: z.array(SlugPattern).default([]),
  triggers: z.array(z.string()).default([]),
  sideEffects: z.array(z.string()).default([]),
  sourceFile: z.string().optional(),
  sourceCapabilityId: z.string().optional(),
  targetCapabilityIds: z.array(z.string()).default([]),
});

export type DomainEventExt = z.infer<typeof DomainEventExtSchema>;

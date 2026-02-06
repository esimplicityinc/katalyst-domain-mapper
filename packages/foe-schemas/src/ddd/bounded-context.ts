import { z } from "zod";

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

export const ContextRelationshipSchema = z.object({
  targetContext: z.string(),
  type: z.enum(["upstream", "downstream", "partnership", "shared-kernel", "separate-ways"]),
  communicationPattern: CommunicationPatternSchema.optional(),
  description: z.string().optional(),
});
export type ContextRelationship = z.infer<typeof ContextRelationshipSchema>;

export const BoundedContextSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  description: z.string().optional(),
  responsibility: z.string(),
  sourceDirectory: z.string().optional(),
  aggregates: z.array(z.string()).default([]),
  relationships: z.array(ContextRelationshipSchema).default([]),
  teamOwnership: z.string().optional(),
  status: z.enum(["draft", "stable", "deprecated"]).default("draft"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type BoundedContext = z.infer<typeof BoundedContextSchema>;

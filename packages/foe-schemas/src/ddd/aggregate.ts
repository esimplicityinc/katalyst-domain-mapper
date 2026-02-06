import { z } from "zod";

export const InvariantSchema = z.object({
  description: z.string(),
  enforced: z.boolean().default(false),
  enforcementLocation: z.string().optional(),
});
export type Invariant = z.infer<typeof InvariantSchema>;

export const AggregateSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  contextId: z.string().uuid(),
  rootEntity: z.string(),
  entities: z.array(z.string()).default([]),
  valueObjects: z.array(z.string()).default([]),
  events: z.array(z.string()).default([]),
  commands: z.array(z.string()).default([]),
  invariants: z.array(InvariantSchema).default([]),
  sourceFile: z.string().optional(),
  status: z.enum(["draft", "implemented", "deprecated"]).default("draft"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Aggregate = z.infer<typeof AggregateSchema>;

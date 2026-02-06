import { z } from "zod";
import { BoundedContextSchema } from "./bounded-context.js";
import { AggregateSchema } from "./aggregate.js";
import { ValueObjectSchema } from "./value-object.js";
import { DomainEventSchema } from "./domain-event.js";
import { GlossaryTermSchema } from "./glossary.js";

/**
 * A complete domain model — the top-level container for all DDD artifacts
 * belonging to a single project.
 */
export const DomainModelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  boundedContexts: z.array(BoundedContextSchema).default([]),
  aggregates: z.array(AggregateSchema).default([]),
  valueObjects: z.array(ValueObjectSchema).default([]),
  domainEvents: z.array(DomainEventSchema).default([]),
  glossary: z.array(GlossaryTermSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type DomainModel = z.infer<typeof DomainModelSchema>;

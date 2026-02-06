import { z } from "zod";

export const EventPayloadFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
});
export type EventPayloadField = z.infer<typeof EventPayloadFieldSchema>;

export const DomainEventSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  contextId: z.string().uuid(),
  aggregateId: z.string().uuid().optional(),
  description: z.string().optional(),
  payload: z.array(EventPayloadFieldSchema).default([]),
  consumedBy: z.array(z.string()).default([]),
  triggers: z.array(z.string()).default([]),
  sideEffects: z.array(z.string()).default([]),
  sourceFile: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type DomainEvent = z.infer<typeof DomainEventSchema>;

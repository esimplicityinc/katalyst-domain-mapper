import { z } from 'zod';
import { SlugPattern } from '../common.js';

export const EventPayloadFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
});

export const DomainEventSchema = z.object({
  slug: SlugPattern,
  title: z.string(),
  context: SlugPattern,
  aggregate: SlugPattern.optional(),
  description: z.string().optional(),
  payload: z.array(EventPayloadFieldSchema).default([]),
  consumedBy: z.array(SlugPattern).default([]),
  triggers: z.array(z.string()).default([]),
  sideEffects: z.array(z.string()).default([]),
  sourceFile: z.string().optional(),
  path: z.string(),
});

export type DomainEvent = z.infer<typeof DomainEventSchema>;
export type EventPayloadField = z.infer<typeof EventPayloadFieldSchema>;

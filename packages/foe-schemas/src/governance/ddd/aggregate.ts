import { z } from 'zod';
import { SlugPattern } from '../common.js';

export const InvariantSchema = z.object({
  description: z.string(),
  enforced: z.boolean().default(false),
  enforcementLocation: z.string().optional(),
});

export const AggregateSchema = z.object({
  slug: SlugPattern,
  title: z.string(),
  context: SlugPattern,
  rootEntity: z.string(),
  entities: z.array(z.string()).default([]),
  valueObjects: z.array(SlugPattern).default([]),
  events: z.array(SlugPattern).default([]),
  invariants: z.array(InvariantSchema).default([]),
  commands: z.array(z.string()).default([]),
  sourceFile: z.string().optional(),
  status: z.enum(['draft', 'implemented', 'deprecated']).default('draft'),
  path: z.string(),
});

export type Aggregate = z.infer<typeof AggregateSchema>;
export type Invariant = z.infer<typeof InvariantSchema>;

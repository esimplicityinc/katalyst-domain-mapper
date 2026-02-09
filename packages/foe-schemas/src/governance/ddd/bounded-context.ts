import { z } from 'zod';
import { SlugPattern } from '../common.js';

export const CommunicationPatternSchema = z.enum([
  'domain-events', 'shared-kernel', 'anti-corruption-layer',
  'open-host-service', 'conformist',
  'partnership', 'customer-supplier', 'separate-ways',
]);

export const BoundedContextSchema = z.object({
  slug: SlugPattern,
  title: z.string(),
  description: z.string().optional(),
  responsibility: z.string(),
  sourceDirectory: z.string().optional(),
  aggregates: z.array(SlugPattern).default([]),
  communicationPattern: CommunicationPatternSchema.default('domain-events'),
  upstreamContexts: z.array(SlugPattern).default([]),
  downstreamContexts: z.array(SlugPattern).default([]),
  teamOwnership: z.string().optional(),
  status: z.enum(['draft', 'stable', 'deprecated']).default('draft'),
  path: z.string(),
});

export type BoundedContext = z.infer<typeof BoundedContextSchema>;
export type CommunicationPattern = z.infer<typeof CommunicationPatternSchema>;

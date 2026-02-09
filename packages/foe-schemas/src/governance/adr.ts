import { z } from 'zod';
import { AdrIdPattern } from './common.js';

export const AdrStatusSchema = z.enum(['proposed', 'accepted', 'deprecated', 'superseded']);
export const AdrCategorySchema = z.enum(['architecture', 'infrastructure', 'security', 'performance']);

export const AdrSchema = z.object({
  id: AdrIdPattern,
  title: z.string(),
  status: AdrStatusSchema,
  category: AdrCategorySchema,
  scope: z.string().default('project-wide'),
  created: z.string(),
  updated: z.string(),
  supersededBy: AdrIdPattern.optional(),
  path: z.string(),
});

export type Adr = z.infer<typeof AdrSchema>;
export type AdrStatus = z.infer<typeof AdrStatusSchema>;
export type AdrCategory = z.infer<typeof AdrCategorySchema>;

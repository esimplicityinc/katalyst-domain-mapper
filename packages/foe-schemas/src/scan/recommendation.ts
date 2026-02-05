import { z } from 'zod';
import { PrioritySchema, ImpactSchema } from './common.js';
import { MethodReferenceSchema } from './method-reference.js';

/**
 * Recommendation represents an actionable improvement
 */
export const RecommendationSchema = z.object({
  /** Unique recommendation identifier */
  id: z.string(),
  
  /** Priority level */
  priority: PrioritySchema,
  
  /** Short title */
  title: z.string(),
  
  /** Detailed description */
  description: z.string(),
  
  /** Expected impact */
  impact: ImpactSchema,
  
  /** Methods implementing this recommendation would address */
  methods: z.array(MethodReferenceSchema).default([]),
  
  /** Learning path URL (link to Field Guide) */
  learningPath: z.string().url().optional(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

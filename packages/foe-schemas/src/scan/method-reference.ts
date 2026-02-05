import { z } from 'zod';
import { MethodMaturitySchema } from '../field-guide/method.js';

// Re-export MethodMaturity types from field-guide module to avoid duplication
export { MethodMaturitySchema, type MethodMaturity } from '../field-guide/method.js';

/**
 * How closely a method relates to a finding/recommendation
 */
export const RelevanceSchema = z.enum(['primary', 'secondary']);
export type Relevance = z.infer<typeof RelevanceSchema>;

/**
 * Reference to a Field Guide method
 * This is embedded in scan results to link findings/recommendations to methods
 */
export const MethodReferenceSchema = z.object({
  /** Method ID (e.g., "M111") */
  methodId: z.string().regex(/^M\d{3,}$/),
  
  /** Human-readable method title */
  title: z.string(),
  
  /** Method maturity level */
  maturity: MethodMaturitySchema,
  
  /** Field guide this method belongs to (optional for external methods) */
  fieldGuide: z.string().optional(),
  
  /** External framework information */
  external: z.object({
    framework: z.string(),  // "dora", "ddd", "bdd"
    method: z.string(),     // slug within framework
  }).optional(),
  
  /** How closely this method relates to the finding/recommendation */
  relevance: RelevanceSchema,
  
  /** URL path to the method documentation */
  linkUrl: z.string().optional(),
});

export type MethodReference = z.infer<typeof MethodReferenceSchema>;

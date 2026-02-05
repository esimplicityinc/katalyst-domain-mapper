import { z } from 'zod';

/**
 * Context where a method was referenced
 */
export const ReferenceContextSchema = z.enum(['subscore', 'finding', 'recommendation']);
export type ReferenceContext = z.infer<typeof ReferenceContextSchema>;

/**
 * Summary of a method referenced in the report
 */
export const ReferencedMethodSummarySchema = z.object({
  /** Method ID */
  methodId: z.string().regex(/^M\d{3,}$/),
  
  /** Method title */
  title: z.string(),
  
  /** Field guide (optional for external methods) */
  fieldGuide: z.string().optional(),
  
  /** Total number of times this method was referenced */
  referenceCount: z.number().int().positive(),
  
  /** Contexts where this method appeared */
  contexts: z.array(ReferenceContextSchema),
});

export type ReferencedMethodSummary = z.infer<typeof ReferencedMethodSummarySchema>;

import { z } from 'zod';

/**
 * Adopted method from external framework
 */
export const AdoptedMethodSchema = z.object({
  /** Framework name */
  framework: z.string(),
  
  /** Method slug within framework */
  method: z.string(),
  
  /** FOE-specific maturity assessment */
  foeMaturity: z.enum(['hypothesized', 'observing', 'validated', 'proven']),
});
export type AdoptedMethod = z.infer<typeof AdoptedMethodSchema>;

/**
 * Field Guide metadata schema
 */
export const FieldGuideSchema = z.object({
  /** Field Guide ID (slug) */
  id: z.string(),
  
  /** Display name */
  title: z.string(),
  
  /** Short description */
  description: z.string().optional(),
  
  /** Methods adopted from external frameworks */
  adoptedMethods: z.array(AdoptedMethodSchema).optional(),
  
  /** Path to overview file */
  overviewPath: z.string(),
  
  /** Sidebar ID for Docusaurus */
  sidebarId: z.string().default('fieldGuideSidebar'),
});

export type FieldGuide = z.infer<typeof FieldGuideSchema>;

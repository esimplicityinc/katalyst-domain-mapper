import { z } from "zod";

/**
 * Method maturity levels from FOE Field Guides
 */
export const MethodMaturitySchema = z.enum([
  "hypothesized",
  "observing",
  "validated",
  "proven",
]);
export type MethodMaturity = z.infer<typeof MethodMaturitySchema>;

/**
 * External method information (for methods from DORA, DDD, BDD, etc.)
 */
export const ExternalMethodInfoSchema = z.object({
  /** Framework name (e.g., "dora", "ddd", "bdd", "team-topologies") */
  framework: z.string(),

  /** Method slug within the framework */
  method: z.string(),
});
export type ExternalMethodInfo = z.infer<typeof ExternalMethodInfoSchema>;

/**
 * Method schema matching Field Guide frontmatter
 */
export const MethodSchema = z.object({
  /** Method ID (e.g., "M111", "M164") */
  methodId: z.string().regex(/^M\d{3,}$/),

  /** Human-readable title */
  title: z.string(),

  /** Short description (optional) */
  description: z.string().optional(),

  /** Method maturity level (required for FOE methods, optional for external framework methods) */
  maturity: MethodMaturitySchema.optional(),

  /** Field guide this method belongs to (optional for external methods) */
  fieldGuide: z.string().optional(), // "testing", "agentic-coding", etc.

  /** External method information (if this is from an external framework) */
  external: ExternalMethodInfoSchema.optional(),

  /** FOE-specific maturity (can differ from external framework's view) */
  foeMaturity: MethodMaturitySchema.optional(),

  /** Linked observation IDs */
  observations: z.array(z.string().regex(/^O\d{3,}$/)).default([]),

  /** Keywords for auto-linking (extracted from title + content) */
  keywords: z.array(z.string()).default([]),

  /** Path to markdown file (relative to field guides root) */
  path: z.string(),

  /** Sidebar position for navigation (optional) */
  sidebarPosition: z.number().int().optional(),

  /** Additional frontmatter fields */
  pillar: z.string().optional(), // For DDD methods (tactical-design, strategic-design)
});

export type Method = z.infer<typeof MethodSchema>;

/**
 * Maturity level folder mapping
 */
export const MATURITY_FOLDER_MAP: Record<MethodMaturity, string> = {
  hypothesized: "emerging",
  observing: "emerging",
  validated: "established",
  proven: "established",
};

/**
 * Helper to determine folder from maturity
 */
export function getMaturityFolder(maturity: MethodMaturity): string {
  return MATURITY_FOLDER_MAP[maturity];
}

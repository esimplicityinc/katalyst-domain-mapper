import { z } from "zod";

/**
 * Observation status
 */
export const ObservationStatusSchema = z.enum(["in-progress", "completed"]);
export type ObservationStatus = z.infer<typeof ObservationStatusSchema>;

/**
 * Observation source type
 */
export const ObservationSourceTypeSchema = z.enum(["internal", "external"]);
export type ObservationSourceType = z.infer<typeof ObservationSourceTypeSchema>;

/**
 * External observation source metadata
 */
export const ExternalSourceSchema = z.object({
  /** Authors of the study/research */
  authors: z.array(z.string()).optional(),

  /** Organization or institution */
  organization: z.string().optional(),

  /** Publication year */
  year: z.number().int().optional(),

  /** URL to the source */
  url: z.string().url(),

  /** Publication title or study name */
  publicationTitle: z.string().optional(),
});
export type ExternalSource = z.infer<typeof ExternalSourceSchema>;

/**
 * Observation schema matching Field Guide frontmatter
 */
export const ObservationSchema = z.object({
  /** Observation ID (e.g., "O157", "O100") */
  observationId: z.string().regex(/^O\d{3,}$/),

  /** Human-readable title */
  title: z.string(),

  /** Observation status */
  status: ObservationStatusSchema,

  /** Source type (internal vs external) */
  sourceType: ObservationSourceTypeSchema,

  /** External source metadata (for external observations) */
  source: ExternalSourceSchema.optional(),

  /** Method IDs this observation supports */
  methods: z.array(z.string().regex(/^M\d{3,}$/)).default([]),

  /** Path to markdown file (relative to field guides root) */
  path: z.string(),

  /** Sidebar position for navigation (optional) */
  sidebarPosition: z.number().int().optional(),

  /** Date the observation was documented (ISO 8601) */
  dateDocumented: z.string().datetime().optional(),

  /** Team or individuals who conducted the observation (for internal) */
  observers: z.array(z.string()).optional(),
});

export type Observation = z.infer<typeof ObservationSchema>;

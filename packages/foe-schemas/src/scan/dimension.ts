import { z } from "zod";
import { ConfidenceSchema } from "./common.js";
import { SubScoreSchema } from "./subscore.js";

/**
 * DimensionScore represents one of the three FOE principles
 * - Feedback (35% weight)
 * - Understanding (35% weight)
 * - Confidence (30% weight)
 */
export const DimensionScoreSchema = z.object({
  /** Dimension name */
  name: z.enum(["Feedback", "Understanding", "Confidence"]),

  /** Total score for this dimension (0-100) */
  score: z.number().min(0).max(100),

  /** Maximum possible score (always 100) */
  max: z.literal(100),

  /** Confidence in this dimension's assessment */
  confidence: ConfidenceSchema,

  /** UI color for visualization */
  color: z.string(),

  /** Four subscores that make up this dimension (each max 25) */
  subscores: z.array(SubScoreSchema).length(4),
});

export type DimensionScore = z.infer<typeof DimensionScoreSchema>;

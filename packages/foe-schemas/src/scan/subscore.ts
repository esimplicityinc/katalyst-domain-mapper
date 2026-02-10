import { z } from "zod";
import { ConfidenceSchema } from "./common.js";
import { MethodReferenceSchema } from "./method-reference.js";

/**
 * Scoring deduction with reason
 */
export const DeductionSchema = z.object({
  /** Points deducted */
  points: z.number().min(0),

  /** Reason for deduction */
  reason: z.string(),
});
export type Deduction = z.infer<typeof DeductionSchema>;

/**
 * SubScore represents a scored sub-area within a dimension
 * Each dimension has 4 subscores, each with max 25 points
 */
export const SubScoreSchema = z.object({
  /** Name of the sub-area (e.g., "CI Pipeline Speed") */
  name: z.string(),

  /** Score achieved (0-25) */
  score: z.number().min(0).max(25),

  /** Maximum possible score (always 25) */
  max: z.literal(25),

  /** Confidence in this assessment */
  confidence: ConfidenceSchema,

  /** Evidence supporting the score */
  evidence: z.array(z.string()),

  /** Gaps identified (what's missing or problematic) */
  gaps: z.array(z.string()),

  /** Detailed scoring deductions (optional) */
  deductions: z.array(DeductionSchema).optional(),

  /** Methods that this subscore measures/relates to */
  methods: z.array(MethodReferenceSchema).optional(),
});

export type SubScore = z.infer<typeof SubScoreSchema>;

import { z } from "zod";
import { MaturityLevelSchema, AssessmentModeSchema } from "./common.js";
import { DimensionScoreSchema } from "./dimension.js";
import { FindingSchema } from "./finding.js";
import { StrengthSchema } from "./strength.js";
import { RecommendationSchema } from "./recommendation.js";
import { TriangleDiagnosisSchema } from "./triangle-diagnosis.js";
import { MethodologySchema } from "./methodology.js";
import { ReferencedMethodSummarySchema } from "./method-summary.js";

/**
 * FOEReport is the complete scan result for a repository
 * This is the source of truth schema for all FOE scan outputs
 */
export const FOEReportSchema = z.object({
  // Metadata
  /** Unique report identifier */
  id: z.string().uuid(),

  /** Repository name */
  repository: z.string(),

  /** Repository URL (optional) */
  repositoryUrl: z.string().url().optional(),

  /** Scan timestamp (ISO 8601) */
  scanDate: z.string().datetime(),

  /** How long the scan took (milliseconds) */
  scanDuration: z.number().int().nonnegative(),

  /** Scanner version that produced this report */
  scannerVersion: z.string(),

  // Scores
  /** Overall FOE score (0-100) */
  overallScore: z.number().min(0).max(100),

  /** Maturity level based on overall score */
  maturityLevel: MaturityLevelSchema,

  /** Assessment mode (standard vs critical) */
  assessmentMode: AssessmentModeSchema,

  // Summary
  /** Executive summary (2-3 sentences) */
  executiveSummary: z.string(),

  // Dimensions (The three FOE principles)
  dimensions: z.object({
    feedback: DimensionScoreSchema,
    understanding: DimensionScoreSchema,
    confidence: DimensionScoreSchema,
  }),

  // Findings
  /** Critical failures (severity: critical) */
  criticalFailures: z.array(FindingSchema),

  /** Strengths found */
  strengths: z.array(StrengthSchema),

  /** All gaps (severity: high/medium/low) */
  gaps: z.array(FindingSchema),

  /** Prioritized recommendations */
  recommendations: z.array(RecommendationSchema),

  // Triangle Diagnosis
  /** Cognitive triangle health assessment */
  triangleDiagnosis: TriangleDiagnosisSchema,

  // Methodology
  /** How the scan was conducted */
  methodology: MethodologySchema,

  // Method Summary
  /** All methods referenced in this report */
  referencedMethods: z.array(ReferencedMethodSummarySchema).default([]),
});

export type FOEReport = z.infer<typeof FOEReportSchema>;

import type { MaturityLevel } from "./common.js";

/**
 * Helper to calculate maturity level from overall score
 */
export function calculateMaturityLevel(score: number): MaturityLevel {
  if (score >= 76) return "Optimized";
  if (score >= 51) return "Practicing";
  if (score >= 26) return "Emerging";
  return "Hypothesized";
}

/**
 * Helper to validate and parse a report
 */
export function validateReport(data: unknown): FOEReport {
  return FOEReportSchema.parse(data);
}

/**
 * Helper to safely parse a report (returns null on error)
 */
export function safeParseReport(data: unknown): FOEReport | null {
  const result = FOEReportSchema.safeParse(data);
  return result.success ? result.data : null;
}

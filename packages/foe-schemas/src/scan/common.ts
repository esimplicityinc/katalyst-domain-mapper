import { z } from "zod";

/**
 * Confidence level in the assessment
 */
export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

/**
 * Severity levels for findings and gaps
 */
export const SeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export type Severity = z.infer<typeof SeveritySchema>;

/**
 * Overall maturity level determined by score
 */
export const MaturityLevelSchema = z.enum([
  "Hypothesized", // 0-25
  "Emerging", // 26-50
  "Practicing", // 51-75
  "Optimized", // 76-100
]);
export type MaturityLevel = z.infer<typeof MaturityLevelSchema>;

/**
 * Assessment mode affects scoring strictness
 */
export const AssessmentModeSchema = z.enum(["standard", "critical"]);
export type AssessmentMode = z.infer<typeof AssessmentModeSchema>;

/**
 * Priority levels for recommendations
 */
export const PrioritySchema = z.enum([
  "immediate",
  "short-term",
  "medium-term",
]);
export type Priority = z.infer<typeof PrioritySchema>;

/**
 * Impact level for findings and recommendations
 */
export const ImpactSchema = z.enum(["high", "medium", "low"]);
export type Impact = z.infer<typeof ImpactSchema>;

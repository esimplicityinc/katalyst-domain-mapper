import { z } from "zod";

/**
 * Cognitive Triangle health state
 */
export const CycleHealthSchema = z.enum(["virtuous", "at-risk", "vicious"]);
export type CycleHealth = z.infer<typeof CycleHealthSchema>;

/**
 * FOE principle name
 */
export const FOEPrincipleSchema = z.enum([
  "feedback",
  "understanding",
  "confidence",
]);
export type FOEPrinciple = z.infer<typeof FOEPrincipleSchema>;

/**
 * Triangle Diagnosis identifies the state of the cognitive triangle
 * and provides FOE-specific intervention guidance
 */
export const TriangleDiagnosisSchema = z.object({
  /** Overall cycle health based on minimum thresholds */
  cycleHealth: CycleHealthSchema,

  /** Diagnosed pattern (e.g., "Feedback without Understanding") */
  pattern: z.string(),

  /** Which principle is weakest and needs attention */
  weakestPrinciple: FOEPrincipleSchema,

  /** Specific FOE intervention recommendation */
  intervention: z.string(),

  /** Score thresholds used for diagnosis */
  thresholds: z
    .object({
      understanding: z.number().default(35),
      feedback: z.number().default(40),
      confidence: z.number().default(30),
    })
    .optional(),
});

export type TriangleDiagnosis = z.infer<typeof TriangleDiagnosisSchema>;

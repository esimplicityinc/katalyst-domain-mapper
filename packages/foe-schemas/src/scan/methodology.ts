import { z } from "zod";

/**
 * Methodology captures how the scan was conducted
 */
export const MethodologySchema = z.object({
  /** Total number of files analyzed */
  filesAnalyzed: z.number().int().nonnegative(),

  /** Number of test files found and analyzed */
  testFilesAnalyzed: z.number().int().nonnegative(),

  /** Number of ADRs (Architecture Decision Records) analyzed */
  adrsAnalyzed: z.number().int().nonnegative(),

  /** Whether coverage reports were found */
  coverageReportFound: z.boolean().optional(),

  /** Notes about confidence levels and caveats */
  confidenceNotes: z.array(z.string()),
});

export type Methodology = z.infer<typeof MethodologySchema>;

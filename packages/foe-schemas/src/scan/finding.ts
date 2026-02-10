import { z } from "zod";
import { SeveritySchema } from "./common.js";
import { MethodReferenceSchema } from "./method-reference.js";

/**
 * Finding represents a gap, issue, or critical failure
 */
export const FindingSchema = z.object({
  /** Unique finding identifier */
  id: z.string(),

  /** Area/category this finding belongs to */
  area: z.string(),

  /** Severity level */
  severity: SeveritySchema,

  /** Short title summarizing the finding */
  title: z.string(),

  /** Evidence supporting this finding */
  evidence: z.string(),

  /** Impact description */
  impact: z.string(),

  /** Recommended action */
  recommendation: z.string(),

  /** File/location reference (optional) */
  location: z.string().optional(),

  /** Methods that address this finding */
  methods: z.array(MethodReferenceSchema).default([]),
});

export type Finding = z.infer<typeof FindingSchema>;

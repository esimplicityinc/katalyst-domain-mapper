import { z } from "zod";

/**
 * Strength represents a positive aspect of the repository
 */
export const StrengthSchema = z.object({
  /** Unique strength identifier */
  id: z.string(),

  /** Area/category this strength belongs to */
  area: z.string(),

  /** Evidence supporting this strength */
  evidence: z.string(),

  /** Caveat or limitation (optional) */
  caveat: z.string().optional(),
});

export type Strength = z.infer<typeof StrengthSchema>;

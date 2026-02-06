import { z } from "zod";

export const GlossaryTermSchema = z.object({
  id: z.string().uuid(),
  term: z.string(),
  definition: z.string(),
  contextId: z.string().uuid().optional(),
  aliases: z.array(z.string()).default([]),
  examples: z.array(z.string()).default([]),
  relatedTerms: z.array(z.string()).default([]),
  source: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;

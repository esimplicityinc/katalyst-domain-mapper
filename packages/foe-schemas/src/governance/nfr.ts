import { z } from "zod";
import { NfrIdPattern, PrioritySchema } from "./common.js";

export const NfrCategorySchema = z.enum([
  "performance",
  "security",
  "accessibility",
  "reliability",
  "scalability",
  "maintainability",
]);

export const NfrSchema = z.object({
  id: NfrIdPattern,
  title: z.string(),
  category: NfrCategorySchema,
  priority: PrioritySchema,
  status: z.enum(["active", "deprecated"]),
  created: z.string(),
  threshold: z.string().optional(),
  measurement: z.string().optional(),
  path: z.string(),
});

export type Nfr = z.infer<typeof NfrSchema>;
export type NfrCategory = z.infer<typeof NfrCategorySchema>;

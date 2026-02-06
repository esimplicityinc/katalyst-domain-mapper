import { z } from "zod";

export const PropertySchema = z.object({
  name: z.string(),
  type: z.string(),
  constraints: z.string().optional(),
});
export type Property = z.infer<typeof PropertySchema>;

export const ValueObjectSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  contextId: z.string().uuid(),
  description: z.string().optional(),
  properties: z.array(PropertySchema).default([]),
  validationRules: z.array(z.string()).default([]),
  immutable: z.boolean().default(true),
  sourceFile: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ValueObject = z.infer<typeof ValueObjectSchema>;

import { z } from 'zod';
import { SlugPattern } from '../common.js';

export const ValueObjectPropertySchema = z.object({
  name: z.string(),
  type: z.string(),
  constraints: z.string().optional(),
});

export const ValueObjectSchema = z.object({
  slug: SlugPattern,
  title: z.string(),
  context: SlugPattern,
  description: z.string().optional(),
  properties: z.array(ValueObjectPropertySchema).default([]),
  validationRules: z.array(z.string()).default([]),
  immutable: z.boolean().default(true),
  sourceFile: z.string().optional(),
  path: z.string(),
});

export type ValueObject = z.infer<typeof ValueObjectSchema>;
export type ValueObjectProperty = z.infer<typeof ValueObjectPropertySchema>;

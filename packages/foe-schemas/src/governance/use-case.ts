import { z } from 'zod';
import { UseCaseIdPattern, PersonaIdPattern } from './common.js';

export const UseCaseSchema = z.object({
  id: UseCaseIdPattern,
  title: z.string(),
  description: z.string().optional(),
  actors: z.array(PersonaIdPattern).default([]),
  preconditions: z.array(z.string()).default([]),
  postconditions: z.array(z.string()).default([]),
  mainFlow: z.array(z.string()).default([]),
  alternativeFlows: z.array(z.string()).default([]),
  path: z.string(),
});

export type UseCase = z.infer<typeof UseCaseSchema>;

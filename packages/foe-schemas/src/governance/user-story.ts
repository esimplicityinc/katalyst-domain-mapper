import { z } from 'zod';
import { UserStoryIdPattern, PersonaIdPattern, CapabilityIdPattern, UseCaseIdPattern } from './common.js';

export const UserStorySchema = z.object({
  id: UserStoryIdPattern,
  title: z.string(),
  persona: PersonaIdPattern,
  status: z.enum(['draft', 'approved', 'implementing', 'complete', 'deprecated']),
  capabilities: z.array(CapabilityIdPattern).min(1),
  useCases: z.array(UseCaseIdPattern).default([]),
  acceptanceCriteria: z.array(z.string()).default([]),
  path: z.string(),
});

export type UserStory = z.infer<typeof UserStorySchema>;

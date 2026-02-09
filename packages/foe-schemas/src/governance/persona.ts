import { z } from 'zod';
import { PersonaIdPattern, CapabilityIdPattern, UserStoryIdPattern } from './common.js';

export const PersonaSchema = z.object({
  id: PersonaIdPattern,
  name: z.string(),
  tag: z.string().regex(/^@PER-\d+$/),
  type: z.enum(['human', 'bot', 'system', 'external_api']),
  status: z.enum(['draft', 'approved', 'deprecated']),
  archetype: z.enum(['creator', 'operator', 'administrator', 'consumer', 'integrator']),
  description: z.string().optional(),
  goals: z.array(z.string()).default([]),
  painPoints: z.array(z.string()).default([]),
  behaviors: z.array(z.string()).default([]),
  typicalCapabilities: z.array(CapabilityIdPattern).default([]),
  technicalProfile: z.object({
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    integrationType: z.enum(['web_ui', 'api', 'sdk', 'webhook', 'cli']),
    frequency: z.enum(['daily', 'weekly', 'occasional']),
  }).optional(),
  relatedStories: z.array(UserStoryIdPattern).default([]),
  relatedPersonas: z.array(PersonaIdPattern).default([]),
  created: z.string().optional(),
  updated: z.string().optional(),
  validatedBy: z.string().optional(),
  path: z.string(),
});

export type Persona = z.infer<typeof PersonaSchema>;

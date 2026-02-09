import { z } from 'zod';
import { ChangeIdPattern, RoadItemIdPattern } from './common.js';

export const ChangeStatusSchema = z.enum(['draft', 'published', 'archived']);
export const ChangeCategorySchema = z.enum([
  'Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'
]);

export const ComplianceCheckSchema = z.object({
  status: z.enum(['pending', 'pass', 'fail']),
  validatedBy: z.string().default(''),
  validatedAt: z.string().default(''),
  notes: z.string().default(''),
});

export const NfrCheckSchema = z.object({
  status: z.enum(['pending', 'pass', 'fail', 'na']),
  evidence: z.string().default(''),
  validatedBy: z.string().default(''),
});

export const AgentSignatureSchema = z.object({
  agent: z.string(),
  role: z.string(),
  status: z.enum(['approved', 'rejected', 'pending']),
  timestamp: z.string(),
});

export const ChangeEntrySchema = z.object({
  id: ChangeIdPattern,
  roadId: RoadItemIdPattern,
  title: z.string(),
  date: z.string(),
  version: z.string(),
  status: ChangeStatusSchema,
  categories: z.array(ChangeCategorySchema).min(1),
  compliance: z.object({
    adrCheck: ComplianceCheckSchema,
    bddCheck: z.object({
      status: z.enum(['pending', 'pass', 'fail']),
      scenarios: z.number().int().default(0),
      passed: z.number().int().default(0),
      coverage: z.string().default('0%'),
    }),
    nfrChecks: z.object({
      performance: NfrCheckSchema,
      security: NfrCheckSchema,
      accessibility: NfrCheckSchema,
    }),
  }),
  signatures: z.array(AgentSignatureSchema).default([]),
  path: z.string(),
});

export type ChangeEntry = z.infer<typeof ChangeEntrySchema>;
export type ChangeStatus = z.infer<typeof ChangeStatusSchema>;
export type ChangeCategory = z.infer<typeof ChangeCategorySchema>;
export type ComplianceCheck = z.infer<typeof ComplianceCheckSchema>;
export type NfrCheck = z.infer<typeof NfrCheckSchema>;
export type AgentSignature = z.infer<typeof AgentSignatureSchema>;

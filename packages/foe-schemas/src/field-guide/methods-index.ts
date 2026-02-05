import { z } from 'zod';
import { MethodSchema } from './method.js';

/**
 * Methods Index - complete registry of all methods
 * This is generated at build time from Field Guide markdown files
 */
export const MethodsIndexSchema = z.object({
  /** Index version */
  version: z.string(),
  
  /** Generation timestamp (ISO 8601) */
  generated: z.string().datetime(),
  
  /** All methods indexed by methodId */
  methods: z.record(z.string(), MethodSchema),
  
  /** Keyword index for auto-linking */
  keywordIndex: z.record(z.string(), z.array(z.string())),
  
  /** Field guide index (guide ID → method IDs) */
  fieldGuideIndex: z.record(z.string(), z.array(z.string())).optional(),
  
  /** External framework index (framework → method IDs) */
  frameworkIndex: z.record(z.string(), z.array(z.string())).optional(),
});

export type MethodsIndex = z.infer<typeof MethodsIndexSchema>;

import type { Method } from './method.js';

/**
 * Helper to get methods by field guide
 */
export function getMethodsByFieldGuide(
  index: MethodsIndex,
  fieldGuideId: string
): Method[] {
  if (!index.fieldGuideIndex) return [];
  const methodIds = index.fieldGuideIndex[fieldGuideId] || [];
  return methodIds
    .map(id => index.methods[id])
    .filter((m): m is Method => m !== undefined);
}

/**
 * Helper to get methods by framework
 */
export function getMethodsByFramework(
  index: MethodsIndex,
  framework: string
): Method[] {
  if (!index.frameworkIndex) return [];
  const methodIds = index.frameworkIndex[framework] || [];
  return methodIds
    .map(id => index.methods[id])
    .filter((m): m is Method => m !== undefined);
}

/**
 * Helper to search methods by keyword
 */
export function searchMethodsByKeyword(
  index: MethodsIndex,
  keyword: string
): Method[] {
  const normalizedKeyword = keyword.toLowerCase();
  const methodIds = index.keywordIndex[normalizedKeyword] || [];
  return methodIds
    .map(id => index.methods[id])
    .filter((m): m is Method => m !== undefined);
}



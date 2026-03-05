import { z } from "zod";
import { MethodSchema } from "./method.js";

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

  /** Keyword → method IDs reverse index */
  byKeyword: z.record(z.string(), z.array(z.string())),

  /** Field guide ID → method IDs reverse index */
  byFieldGuide: z.record(z.string(), z.array(z.string())).default({}),

  /** External framework → method IDs reverse index */
  byFramework: z.record(z.string(), z.array(z.string())).default({}),

  /** Observation ID → method IDs reverse index */
  byObservation: z.record(z.string(), z.array(z.string())).default({}),

  /** Aggregate statistics */
  stats: z.object({
    totalMethods: z.number().int().nonnegative(),
    byMaturity: z.record(z.string(), z.number().int().nonnegative()),
    byFieldGuide: z.record(z.string(), z.number().int().nonnegative()),
    byFramework: z.record(z.string(), z.number().int().nonnegative()),
  }),
});

export type MethodsIndex = z.infer<typeof MethodsIndexSchema>;

import type { Method } from "./method.js";

/**
 * Helper to get methods by field guide
 */
export function getMethodsByFieldGuide(
  index: MethodsIndex,
  fieldGuideId: string,
): Method[] {
  const methodIds = index.byFieldGuide[fieldGuideId] || [];
  return methodIds
    .map((id: string) => index.methods[id])
    .filter((m): m is Method => m !== undefined);
}

/**
 * Helper to get methods by framework
 */
export function getMethodsByFramework(
  index: MethodsIndex,
  framework: string,
): Method[] {
  const methodIds = index.byFramework[framework] || [];
  return methodIds
    .map((id: string) => index.methods[id])
    .filter((m): m is Method => m !== undefined);
}

/**
 * Helper to search methods by keyword
 */
export function searchMethodsByKeyword(
  index: MethodsIndex,
  keyword: string,
): Method[] {
  const normalizedKeyword = keyword.toLowerCase();
  const methodIds = index.byKeyword[normalizedKeyword] || [];
  return methodIds
    .map((id: string) => index.methods[id])
    .filter((m): m is Method => m !== undefined);
}

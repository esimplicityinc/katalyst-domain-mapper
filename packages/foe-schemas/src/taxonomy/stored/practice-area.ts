import { z } from "zod";
import {
  PracticeAreaExtSchema,
  PillarTypeSchema,
} from "../extensions/practice-area.js";

// ── Stored Practice Area ──────────────────────────────────────────────────

export const StoredPracticeAreaSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string().nullable().default(null),
  canonical: z.boolean().default(false),
  pillars: z.string().default("[]"), // JSON-serialized PracticeAreaPillar[]
  competencies: z.string().default("[]"), // JSON-serialized CompetencyId[]
  methods: z.string().default("[]"), // JSON-serialized MethodRef[]
  tools: z.string().default("[]"), // JSON-serialized ToolRef[]
  labels: z.string().default("{}"), // JSON-serialized Record<string, string>
  owners: z.string().default("[]"), // JSON-serialized string[]
  createdAt: z.string(),
  updatedAt: z.string(),
  taxonomyNode: z.string().nullable().default(null),
});
export type StoredPracticeArea = z.infer<typeof StoredPracticeAreaSchema>;

export const CreatePracticeAreaInputSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  canonical: z.boolean().optional(),
  pillars: PracticeAreaExtSchema.shape.pillars.optional(),
  competencies: PracticeAreaExtSchema.shape.competencies.optional(),
  methods: PracticeAreaExtSchema.shape.methods.optional(),
  tools: PracticeAreaExtSchema.shape.tools.optional(),
});
export type CreatePracticeAreaInput = z.infer<
  typeof CreatePracticeAreaInputSchema
>;

export const UpdatePracticeAreaInputSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  pillars: PracticeAreaExtSchema.shape.pillars.optional(),
  competencies: PracticeAreaExtSchema.shape.competencies.optional(),
  methods: PracticeAreaExtSchema.shape.methods.optional(),
  tools: PracticeAreaExtSchema.shape.tools.optional(),
});
export type UpdatePracticeAreaInput = z.infer<
  typeof UpdatePracticeAreaInputSchema
>;

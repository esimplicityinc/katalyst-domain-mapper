import { z } from "zod";
import {
  CompetencyTypeSchema,
  CompetencyLevelSchema,
} from "../extensions/competency.js";

// ── Stored Competency ─────────────────────────────────────────────────────

export const StoredCompetencySchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string().nullable().default(null),
  practiceAreaId: z.string(), // UUID from practice_areas table
  competencyType: CompetencyTypeSchema,
  skills: z.string().default("[]"), // JSON-serialized Skill[]
  levelDefinitions: z.string().default("[]"), // JSON-serialized CompetencyLevelDef[3]
  dependencies: z.string().default("[]"), // JSON-serialized CompetencyDependency[]
  labels: z.string().default("{}"),
  owners: z.string().default("[]"),
  createdAt: z.string(),
  updatedAt: z.string(),
  taxonomyNode: z.string().nullable().default(null),
});
export type StoredCompetency = z.infer<typeof StoredCompetencySchema>;

export const CreateCompetencyInputSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  practiceAreaId: z.string(), // UUID from practice_areas table
  competencyType: CompetencyTypeSchema,
  skills: z.array(z.unknown()).optional(),
  levelDefinitions: z.tuple([z.unknown(), z.unknown(), z.unknown()]),
  dependencies: z.array(z.unknown()).optional(),
});
export type CreateCompetencyInput = z.infer<typeof CreateCompetencyInputSchema>;

export const UpdateCompetencyInputSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  competencyType: CompetencyTypeSchema.optional(),
  skills: z.array(z.unknown()).optional(),
  levelDefinitions: z.tuple([z.unknown(), z.unknown(), z.unknown()]).optional(),
  dependencies: z.array(z.unknown()).optional(),
});
export type UpdateCompetencyInput = z.infer<typeof UpdateCompetencyInputSchema>;

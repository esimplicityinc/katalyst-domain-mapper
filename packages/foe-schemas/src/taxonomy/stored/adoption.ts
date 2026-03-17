import { z } from "zod";
import { AdoptionLevelSchema, AdoptionRoleSchema } from "../adoption.js";

// ── Stored Team Adoption ──────────────────────────────────────────────────

export const StoredTeamAdoptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  teamName: z.string(),
  practiceAreaId: z.string(), // UUID from practice_areas table
  adoptionLevel: AdoptionLevelSchema,
  adoptedAt: z.string(),
  lastAssessedAt: z.string().nullable().default(null),
  assessedBy: z.string().nullable().default(null),
  competencyProgress: z.string().default("[]"), // JSON-serialized CompetencyProgress[]
  scanEvidence: z.string().default("[]"), // JSON-serialized ScanEvidence[]
  notes: z.string().nullable().default(null),
  labels: z.string().default("{}"),
  owners: z.string().default("[]"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StoredTeamAdoption = z.infer<typeof StoredTeamAdoptionSchema>;

export const CreateTeamAdoptionInputSchema = z.object({
  teamName: z.string(),
  practiceAreaId: z.string(),
  adoptionLevel: AdoptionLevelSchema,
  notes: z.string().nullable().optional(),
});
export type CreateTeamAdoptionInput = z.infer<
  typeof CreateTeamAdoptionInputSchema
>;

export const UpdateTeamAdoptionInputSchema = z.object({
  adoptionLevel: AdoptionLevelSchema.optional(),
  notes: z.string().nullable().optional(),
  competencyProgress: z.array(z.unknown()).optional(),
});
export type UpdateTeamAdoptionInput = z.infer<
  typeof UpdateTeamAdoptionInputSchema
>;

// ── Stored Individual Adoption ────────────────────────────────────────────

export const StoredIndividualAdoptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  personName: z.string(),
  practiceAreaId: z.string(),
  role: AdoptionRoleSchema,
  competencyProgress: z.string().default("[]"), // JSON-serialized CompetencyProgress[]
  skillAssessments: z.string().default("[]"), // JSON-serialized SkillAssessment[]
  notes: z.string().nullable().default(null),
  labels: z.string().default("{}"),
  owners: z.string().default("[]"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StoredIndividualAdoption = z.infer<
  typeof StoredIndividualAdoptionSchema
>;

export const CreateIndividualAdoptionInputSchema = z.object({
  personName: z.string(),
  practiceAreaId: z.string(),
  role: AdoptionRoleSchema,
  notes: z.string().nullable().optional(),
});
export type CreateIndividualAdoptionInput = z.infer<
  typeof CreateIndividualAdoptionInputSchema
>;

export const UpdateIndividualAdoptionInputSchema = z.object({
  role: AdoptionRoleSchema.optional(),
  notes: z.string().nullable().optional(),
  competencyProgress: z.array(z.unknown()).optional(),
  skillAssessments: z.array(z.unknown()).optional(),
});
export type UpdateIndividualAdoptionInput = z.infer<
  typeof UpdateIndividualAdoptionInputSchema
>;

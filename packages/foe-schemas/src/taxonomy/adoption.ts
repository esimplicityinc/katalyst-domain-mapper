import { z } from "zod";
import { CompetencyIdPattern, PracticeAreaIdPattern } from "./common.js";
import { EntityBaseSchema } from "./entity-base.js";
import { CompetencyLevelSchema } from "./extensions/competency.js";

// ── Adoption Enums ─────────────────────────────────────────────────────────

// Team-level maturity in a practice area.
export const AdoptionLevelSchema = z.enum([
  "aware", // knows it exists, exploring
  "learning", // actively building skills
  "practicing", // applying consistently
  "mastered", // embedded in culture, teaching others
]);
export type AdoptionLevel = z.infer<typeof AdoptionLevelSchema>;

// Assessment completion status (shared by team and individual).
export const AssessmentStatusSchema = z.enum([
  "not_started", // no assessment begun
  "in_progress", // partially assessed
  "self_assessed", // self-declared, awaiting verification
  "verified", // formally verified by assessor
]);
export type AssessmentStatus = z.infer<typeof AssessmentStatusSchema>;

// How scanner evidence relates to declared adoption.
export const EvidenceTypeSchema = z.enum([
  "confirms", // scanner supports the declared level
  "challenges", // scanner contradicts the declared level
  "neutral", // scanner found relevant data, inconclusive
]);
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

// Individual skill proficiency gauge.
export const SkillGaugeSchema = z.enum([
  "strong", // fully proficient
  "improving", // growing capability
  "weak", // minimal capability
  "none", // no capability
]);
export type SkillGauge = z.infer<typeof SkillGaugeSchema>;

// Governance role within a practice area.
export const AdoptionRoleSchema = z.enum([
  "lead", // implements practice across all teams, defines artifacts
  "advocate", // champions the practice on a specific team
  "sme", // subject matter expert, can certify system competencies
  "member", // participating, building skills
]);
export type AdoptionRole = z.infer<typeof AdoptionRoleSchema>;

// ── Shared Value Objects ───────────────────────────────────────────────────

// Per-competency progress tracking (used by both team and individual).
export const CompetencyProgressSchema = z.object({
  competencyId: CompetencyIdPattern,
  level: CompetencyLevelSchema,
  status: AssessmentStatusSchema,
  assessedAt: z.string().datetime().nullable().default(null),
  assessedBy: z.string().nullable().default(null), // person name
});
export type CompetencyProgress = z.infer<typeof CompetencyProgressSchema>;

// A scanner finding linked to an adoption record.
export const ScanEvidenceSchema = z.object({
  reportId: z.string().uuid(), // ref to FOE Report
  scanDate: z.string().datetime(),
  methodId: z.string().regex(/^M\d{3,}$/), // which method was evidenced
  evidenceType: EvidenceTypeSchema,
  detail: z.string(), // finding text
  dimensionScore: z.number().min(0).max(100).nullable().default(null),
});
export type ScanEvidence = z.infer<typeof ScanEvidenceSchema>;

// Per-skill assessment for an individual (gauge + assessor + date).
export const SkillAssessmentSchema = z.object({
  competencyId: CompetencyIdPattern,
  skillName: z.string(), // matches Skill.name
  gauge: SkillGaugeSchema,
  status: AssessmentStatusSchema,
  assessor: z.string().nullable().default(null), // person name (null = self)
  assessedAt: z.string().datetime().nullable().default(null),
});
export type SkillAssessment = z.infer<typeof SkillAssessmentSchema>;

// ── Bridge Entities ────────────────────────────────────────────────────────

// Team Adoption: bridges Team <-> Practice Area.
export const TeamAdoptionSchema = EntityBaseSchema.extend({
  teamName: z.string(), // ref to TaxonomyTeam.name
  practiceAreaId: PracticeAreaIdPattern,
  adoptionLevel: AdoptionLevelSchema,
  adoptedAt: z.string().datetime(),
  lastAssessedAt: z.string().datetime().nullable().default(null),
  assessedBy: z.string().nullable().default(null),
  competencyProgress: z.array(CompetencyProgressSchema).default([]),
  scanEvidence: z.array(ScanEvidenceSchema).default([]),
  notes: z.string().nullable().default(null),
});
export type TeamAdoption = z.infer<typeof TeamAdoptionSchema>;

// Individual Adoption: bridges Person <-> Practice Area.
export const IndividualAdoptionSchema = EntityBaseSchema.extend({
  personName: z.string(), // ref to TaxonomyPerson.name
  practiceAreaId: PracticeAreaIdPattern,
  role: AdoptionRoleSchema,
  competencyProgress: z.array(CompetencyProgressSchema).default([]),
  skillAssessments: z.array(SkillAssessmentSchema).default([]),
  notes: z.string().nullable().default(null),
});
export type IndividualAdoption = z.infer<typeof IndividualAdoptionSchema>;

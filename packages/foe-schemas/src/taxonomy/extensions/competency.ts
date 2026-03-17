import { z } from "zod";
import { CompetencyIdPattern, PracticeAreaIdPattern } from "../common.js";

// ── Competency Level ───────────────────────────────────────────────────────
export const CompetencyLevelSchema = z.enum([
  "basic",
  "intermediate",
  "advanced",
]);
export type CompetencyLevel = z.infer<typeof CompetencyLevelSchema>;

// ── Competency Type ────────────────────────────────────────────────────────
// "practice" = methodology knowledge (how you do things)
// "system"   = platform/technology knowledge (specific tools/infrastructure)
export const CompetencyTypeSchema = z.enum(["practice", "system"]);
export type CompetencyType = z.infer<typeof CompetencyTypeSchema>;

// ── Skill (value object) ──────────────────────────────────────────────────
// A specific, assessable ability within a competency at a particular level.
export const SkillSchema = z.object({
  name: z.string(), // e.g., "Can write Gherkin scenarios"
  description: z.string(), // detailed explanation
  level: CompetencyLevelSchema, // which tier this skill belongs to
  methodRef: z
    .string()
    .regex(/^M\d{3,}$/)
    .nullable()
    .default(null), // optional FOE Method link
  toolRef: z.string().nullable().default(null), // optional TaxonomyTool name
  resourceUrl: z.string().url().nullable().default(null), // optional learning resource
});

export type Skill = z.infer<typeof SkillSchema>;

// ── Competency Level Definition (value object) ────────────────────────────
// Describes what achieving a particular level means for this competency.
export const CompetencyLevelDefSchema = z.object({
  level: CompetencyLevelSchema,
  description: z.string(), // what achieving this level means
  skillCount: z.number().int().nonnegative(), // number of skills at this level
});

export type CompetencyLevelDef = z.infer<typeof CompetencyLevelDefSchema>;

// ── Competency Dependency (value object) ──────────────────────────────────
// A prerequisite relationship between competency levels. Can cross practice
// area boundaries (e.g., "DevOps IaC Basic requires AWS General Intermediate").
// All dependencies form a DAG -- cycles are rejected at validation time.
export const CompetencyDependencySchema = z.object({
  competencyId: CompetencyIdPattern, // the prerequisite competency
  requiredLevel: CompetencyLevelSchema, // minimum level required
  dependencyType: CompetencyTypeSchema, // practice or system
  notes: z.string().nullable().default(null), // optional context
});

export type CompetencyDependency = z.infer<typeof CompetencyDependencySchema>;

// ── Competency Extension ──────────────────────────────────────────────────
// Carries competency-specific fields for taxonomy nodes with
// nodeType: "competency". The base TaxonomyNode provides id, name,
// description, owners, labels (including governance-id COMP-xxx), etc.
export const CompetencyExtSchema = z.object({
  title: z.string(),
  practiceAreaId: PracticeAreaIdPattern, // parent practice area
  competencyType: CompetencyTypeSchema,
  skills: z.array(SkillSchema).default([]),
  levelDefinitions: z.tuple([
    CompetencyLevelDefSchema, // basic
    CompetencyLevelDefSchema, // intermediate
    CompetencyLevelDefSchema, // advanced
  ]),
  dependencies: z.array(CompetencyDependencySchema).default([]),
});

export type CompetencyExt = z.infer<typeof CompetencyExtSchema>;

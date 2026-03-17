import { z } from "zod";
import { CompetencyIdPattern } from "../common.js";

// ── Pillar Type ────────────────────────────────────────────────────────────
// The 6 structural facets of every practice area.
export const PillarTypeSchema = z.enum([
  "strategy", // Why this practice area matters
  "standards", // Quality requirements teams must follow
  "frameworks", // Organizational principles for implementation
  "libraries", // Reusable artifacts (code, templates, modules)
  "processes", // Standard workflows for doing this work
  "measures", // How teams are assessed for maturity
]);

export type PillarType = z.infer<typeof PillarTypeSchema>;

// ── Practice Area Pillar (value object) ────────────────────────────────────
export const PracticeAreaPillarSchema = z.object({
  type: PillarTypeSchema,
  title: z.string(),
  description: z.string(),
  content: z.string().nullable().default(null), // optional markdown body
  artifactRefs: z.array(z.string()).default([]), // refs to ADRs, NFRs, ROAD items
});

export type PracticeAreaPillar = z.infer<typeof PracticeAreaPillarSchema>;

// ── Practice Area Extension ────────────────────────────────────────────────
// Carries practice-area-specific fields for taxonomy nodes with
// nodeType: "practice_area". The base TaxonomyNode provides id, name,
// description, owners, labels (including governance-id PA-xxx), etc.
export const PracticeAreaExtSchema = z.object({
  title: z.string(),
  canonical: z.boolean().default(false), // true = pre-seeded, false = user-defined
  pillars: z.array(PracticeAreaPillarSchema).default([]),
  competencies: z.array(CompetencyIdPattern).default([]), // child competency refs
  methods: z.array(z.string().regex(/^M\d{3,}$/)).default([]), // FOE Method refs
  tools: z.array(z.string()).default([]), // TaxonomyTool name refs
});

export type PracticeAreaExt = z.infer<typeof PracticeAreaExtSchema>;

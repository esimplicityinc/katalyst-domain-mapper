import { z } from "zod";

/**
 * Relationship type constants
 */
export const RelationshipTypes = {
  // Repository relationships
  HAS_SCAN: "HAS_SCAN",

  // Scan relationships
  HAS_DIMENSION: "HAS_DIMENSION",
  HAS_FINDING: "HAS_FINDING",
  HAS_RECOMMENDATION: "HAS_RECOMMENDATION",

  // Dimension relationships
  HAS_SUBSCORE: "HAS_SUBSCORE",

  // Finding relationships
  RELATES_TO_METHOD: "RELATES_TO_METHOD",

  // Recommendation relationships
  IMPLEMENTS_METHOD: "IMPLEMENTS_METHOD",

  // SubScore relationships
  MEASURES_METHOD: "MEASURES_METHOD",

  // Method relationships
  SUPPORTED_BY: "SUPPORTED_BY",
  BELONGS_TO: "BELONGS_TO",
  EXTERNAL_FROM: "EXTERNAL_FROM",
  HAS_KEYWORD: "HAS_KEYWORD",

  // Observation relationships
  SUPPORTS: "SUPPORTS",

  // FieldGuide relationships
  CONTAINS: "CONTAINS",
  ADOPTED_BY: "ADOPTED_BY",

  // Practice Area relationships
  HAS_COMPETENCY: "HAS_COMPETENCY",
  DEPENDS_ON_COMPETENCY: "DEPENDS_ON_COMPETENCY",
  ADOPTED_BY_TEAM: "ADOPTED_BY_TEAM",
  ADOPTED_BY_PERSON: "ADOPTED_BY_PERSON",
  ASSESSED_IN: "ASSESSED_IN",
  EVIDENCED_BY: "EVIDENCED_BY",
} as const;

export type RelationshipType =
  (typeof RelationshipTypes)[keyof typeof RelationshipTypes];

/**
 * Properties for RELATES_TO_METHOD relationship
 */
export const RelatesToMethodPropsSchema = z.object({
  relevance: z.enum(["primary", "secondary"]),
  context: z.enum(["subscore", "finding", "recommendation"]),
});
export type RelatesToMethodProps = z.infer<typeof RelatesToMethodPropsSchema>;

/**
 * Properties for MEASURES_METHOD relationship
 */
export const MeasuresMethodPropsSchema = z.object({
  relevance: z.enum(["primary", "secondary"]),
});
export type MeasuresMethodProps = z.infer<typeof MeasuresMethodPropsSchema>;

/**
 * Properties for EXTERNAL_FROM relationship
 */
export const ExternalFromPropsSchema = z.object({
  method: z.string(), // Method slug within framework
});
export type ExternalFromProps = z.infer<typeof ExternalFromPropsSchema>;

/**
 * Properties for ADOPTED_BY relationship
 */
export const AdoptedByPropsSchema = z.object({
  foeMaturity: z.enum(["hypothesized", "observing", "validated", "proven"]),
});
export type AdoptedByProps = z.infer<typeof AdoptedByPropsSchema>;

/**
 * Properties for HAS_COMPETENCY relationship (PracticeArea -> Competency)
 */
export const HasCompetencyPropsSchema = z.object({
  required: z.boolean().optional(),
  order: z.number().int().optional(),
});
export type HasCompetencyProps = z.infer<typeof HasCompetencyPropsSchema>;

/**
 * Properties for DEPENDS_ON_COMPETENCY relationship (Competency -> Competency)
 */
export const DependsOnCompetencyPropsSchema = z.object({
  dependencyType: z.enum(["prerequisite", "corequisite", "recommended"]),
});
export type DependsOnCompetencyProps = z.infer<
  typeof DependsOnCompetencyPropsSchema
>;

/**
 * Properties for ADOPTED_BY_TEAM relationship (PracticeArea -> Team)
 */
export const AdoptedByTeamPropsSchema = z.object({
  adoptionDate: z.string().datetime(),
  adoptionLevel: z.enum(["exploring", "adopting", "proficient", "leading"]),
  score: z.number().min(0).max(100).optional(),
});
export type AdoptedByTeamProps = z.infer<typeof AdoptedByTeamPropsSchema>;

/**
 * Properties for ADOPTED_BY_PERSON relationship (PracticeArea -> Person)
 */
export const AdoptedByPersonPropsSchema = z.object({
  assessmentDate: z.string().datetime(),
  proficiencyLevel: z.enum(["awareness", "working", "practitioner", "expert"]),
  selfAssessed: z.boolean(),
});
export type AdoptedByPersonProps = z.infer<typeof AdoptedByPersonPropsSchema>;

/**
 * Properties for ASSESSED_IN relationship (Person -> Competency)
 */
export const AssessedInPropsSchema = z.object({
  assessmentDate: z.string().datetime(),
  score: z.number().min(0).max(100).optional(),
  assessor: z.string().optional(),
  notes: z.string().optional(),
});
export type AssessedInProps = z.infer<typeof AssessedInPropsSchema>;

/**
 * Properties for EVIDENCED_BY relationship (TeamAdoption -> Scan)
 */
export const EvidencedByPropsSchema = z.object({
  scanDate: z.string().datetime(),
  relevantDimension: z
    .enum(["Feedback", "Understanding", "Confidence"])
    .optional(),
  evidenceStrength: z.enum(["strong", "moderate", "weak"]).optional(),
});
export type EvidencedByProps = z.infer<typeof EvidencedByPropsSchema>;

/**
 * Properties for HAS_SCAN relationship
 */
export const HasScanPropsSchema = z.object({
  scannedAt: z.string().datetime().optional(),
});
export type HasScanProps = z.infer<typeof HasScanPropsSchema>;

/**
 * Generic relationship schema
 */
export const RelationshipSchema = z.object({
  type: z.string(),
  properties: z.record(z.unknown()).optional(),
});
export type Relationship = z.infer<typeof RelationshipSchema>;

/**
 * Relationship definitions with source and target node labels
 */
export const RELATIONSHIP_DEFINITIONS = {
  [RelationshipTypes.HAS_SCAN]: {
    from: "Repository",
    to: "Scan",
    properties: HasScanPropsSchema.optional(),
  },
  [RelationshipTypes.HAS_DIMENSION]: {
    from: "Scan",
    to: "Dimension",
    properties: z.object({}).optional(),
  },
  [RelationshipTypes.HAS_SUBSCORE]: {
    from: "Dimension",
    to: "SubScore",
    properties: z.object({}).optional(),
  },
  [RelationshipTypes.HAS_FINDING]: {
    from: "Scan",
    to: "Finding",
    properties: z.object({}).optional(),
  },
  [RelationshipTypes.HAS_RECOMMENDATION]: {
    from: "Scan",
    to: "Recommendation",
    properties: z.object({}).optional(),
  },
  [RelationshipTypes.RELATES_TO_METHOD]: {
    from: "Finding",
    to: "Method",
    properties: RelatesToMethodPropsSchema,
  },
  [RelationshipTypes.IMPLEMENTS_METHOD]: {
    from: "Recommendation",
    to: "Method",
    properties: z.object({}).optional(),
  },
  [RelationshipTypes.MEASURES_METHOD]: {
    from: "SubScore",
    to: "Method",
    properties: MeasuresMethodPropsSchema.optional(),
  },
  [RelationshipTypes.SUPPORTED_BY]: {
    from: "Method",
    to: "Observation",
    properties: z.object({}).optional(),
  },
  [RelationshipTypes.SUPPORTS]: {
    from: "Observation",
    to: "Method",
    properties: z.object({}).optional(),
  },
  [RelationshipTypes.BELONGS_TO]: {
    from: "Method",
    to: "FieldGuide",
    properties: z.object({}).optional(),
  },
  [RelationshipTypes.EXTERNAL_FROM]: {
    from: "Method",
    to: "Framework",
    properties: ExternalFromPropsSchema,
  },
  [RelationshipTypes.HAS_KEYWORD]: {
    from: "Method",
    to: "Keyword",
    properties: z.object({}).optional(),
  },
  [RelationshipTypes.CONTAINS]: {
    from: "FieldGuide",
    to: "Method",
    properties: z.object({}).optional(),
  },
  [RelationshipTypes.ADOPTED_BY]: {
    from: "FieldGuide",
    to: "Method",
    properties: AdoptedByPropsSchema.optional(),
  },
  [RelationshipTypes.HAS_COMPETENCY]: {
    from: "PracticeArea",
    to: "Competency",
    properties: HasCompetencyPropsSchema.optional(),
  },
  [RelationshipTypes.DEPENDS_ON_COMPETENCY]: {
    from: "Competency",
    to: "Competency",
    properties: DependsOnCompetencyPropsSchema,
  },
  [RelationshipTypes.ADOPTED_BY_TEAM]: {
    from: "PracticeArea",
    to: "TeamAdoption",
    properties: AdoptedByTeamPropsSchema,
  },
  [RelationshipTypes.ADOPTED_BY_PERSON]: {
    from: "PracticeArea",
    to: "IndividualAdoption",
    properties: AdoptedByPersonPropsSchema,
  },
  [RelationshipTypes.ASSESSED_IN]: {
    from: "IndividualAdoption",
    to: "Competency",
    properties: AssessedInPropsSchema,
  },
  [RelationshipTypes.EVIDENCED_BY]: {
    from: "TeamAdoption",
    to: "Scan",
    properties: EvidencedByPropsSchema,
  },
} as const;

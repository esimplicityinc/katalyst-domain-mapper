import { z } from "zod";

/**
 * Repository Node
 * Represents a code repository that has been scanned
 */
export const RepositoryNodeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string().url().optional(),
  techStack: z.array(z.string()),
  isMonorepo: z.boolean(),
  createdAt: z.string().datetime(),
  lastScannedAt: z.string().datetime().optional(),
});
export type RepositoryNode = z.infer<typeof RepositoryNodeSchema>;

/**
 * Scan Node
 * Represents a single FOE scan of a repository
 */
export const ScanNodeSchema = z.object({
  id: z.string().uuid(),
  overallScore: z.number().min(0).max(100),
  maturityLevel: z.string(),
  scanDate: z.string().datetime(),
  scannerVersion: z.string(),
  assessmentMode: z.enum(["standard", "critical"]),
  executiveSummary: z.string().optional(),
});
export type ScanNode = z.infer<typeof ScanNodeSchema>;

/**
 * Dimension Node
 * Represents one of the three FOE principles (Feedback, Understanding, Confidence)
 */
export const DimensionNodeSchema = z.object({
  name: z.enum(["Feedback", "Understanding", "Confidence"]),
  score: z.number().min(0).max(100),
  max: z.literal(100),
  confidence: z.enum(["high", "medium", "low"]),
});
export type DimensionNode = z.infer<typeof DimensionNodeSchema>;

/**
 * SubScore Node
 * Represents a scored sub-area within a dimension
 */
export const SubScoreNodeSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(25),
  max: z.literal(25),
  confidence: z.enum(["high", "medium", "low"]),
});
export type SubScoreNode = z.infer<typeof SubScoreNodeSchema>;

/**
 * Finding Node
 * Represents a gap or critical failure found during scanning
 */
export const FindingNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  area: z.string(),
  evidence: z.string(),
  impact: z.string(),
  recommendation: z.string(),
  location: z.string().optional(),
});
export type FindingNode = z.infer<typeof FindingNodeSchema>;

/**
 * Recommendation Node
 * Represents a prioritized action item from a scan
 */
export const RecommendationNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.enum(["immediate", "short-term", "medium-term"]),
  description: z.string(),
  impact: z.enum(["high", "medium", "low"]),
});
export type RecommendationNode = z.infer<typeof RecommendationNodeSchema>;

/**
 * Method Node
 * Represents a Field Guide method
 */
export const MethodNodeSchema = z.object({
  methodId: z.string().regex(/^M\d{3,}$/),
  title: z.string(),
  maturity: z.enum(["hypothesized", "observing", "validated", "proven"]),
  foeMaturity: z
    .enum(["hypothesized", "observing", "validated", "proven"])
    .optional(),
  isExternal: z.boolean(),
  fieldGuide: z.string().optional(),
  keywords: z.array(z.string()),
  description: z.string().optional(),
});
export type MethodNode = z.infer<typeof MethodNodeSchema>;

/**
 * Observation Node
 * Represents evidence supporting a method
 */
export const ObservationNodeSchema = z.object({
  observationId: z.string().regex(/^O\d{3,}$/),
  title: z.string(),
  status: z.enum(["in-progress", "completed"]),
  sourceType: z.enum(["internal", "external"]),
  dateDocumented: z.string().datetime().optional(),
});
export type ObservationNode = z.infer<typeof ObservationNodeSchema>;

/**
 * FieldGuide Node
 * Represents a collection of related methods
 */
export const FieldGuideNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
});
export type FieldGuideNode = z.infer<typeof FieldGuideNodeSchema>;

/**
 * Framework Node
 * Represents an external framework (DORA, DDD, BDD, etc.)
 */
export const FrameworkNodeSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string().optional(),
});
export type FrameworkNode = z.infer<typeof FrameworkNodeSchema>;

/**
 * PracticeArea Node
 * Represents a high-level FOE practice area (e.g., "Test Automation", "CI/CD Pipeline")
 * that teams and individuals can adopt
 */
export const PracticeAreaNodeSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  dimension: z.enum(["Feedback", "Understanding", "Confidence"]),
  description: z.string().optional(),
  maturityLevel: z.enum([
    "hypothesized",
    "emerging",
    "practicing",
    "optimized",
  ]),
});
export type PracticeAreaNode = z.infer<typeof PracticeAreaNodeSchema>;

/**
 * Competency Node
 * Represents a specific skill or capability within a practice area
 * that can be assessed and tracked
 */
export const CompetencyNodeSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  level: z.enum(["foundational", "intermediate", "advanced"]),
  assessmentCriteria: z.array(z.string()).optional(),
});
export type CompetencyNode = z.infer<typeof CompetencyNodeSchema>;

/**
 * TeamAdoption Node
 * Represents a team's adoption of a practice area, with evidence and scoring
 */
export const TeamAdoptionNodeSchema = z.object({
  id: z.string().uuid(),
  teamName: z.string(),
  adoptionDate: z.string().datetime(),
  adoptionLevel: z.enum(["exploring", "adopting", "proficient", "leading"]),
  score: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});
export type TeamAdoptionNode = z.infer<typeof TeamAdoptionNodeSchema>;

/**
 * IndividualAdoption Node
 * Represents an individual's adoption/assessment of a practice area competency
 */
export const IndividualAdoptionNodeSchema = z.object({
  id: z.string().uuid(),
  personName: z.string(),
  assessmentDate: z.string().datetime(),
  proficiencyLevel: z.enum(["awareness", "working", "practitioner", "expert"]),
  selfAssessed: z.boolean(),
  notes: z.string().optional(),
});
export type IndividualAdoptionNode = z.infer<
  typeof IndividualAdoptionNodeSchema
>;

/**
 * Keyword Node
 * Used for method auto-linking
 */
export const KeywordNodeSchema = z.object({
  value: z.string(),
});
export type KeywordNode = z.infer<typeof KeywordNodeSchema>;

/**
 * Union of all node types for type safety
 */
export const GraphNodeSchema = z.discriminatedUnion("_label", [
  RepositoryNodeSchema.extend({ _label: z.literal("Repository") }),
  ScanNodeSchema.extend({ _label: z.literal("Scan") }),
  DimensionNodeSchema.extend({ _label: z.literal("Dimension") }),
  SubScoreNodeSchema.extend({ _label: z.literal("SubScore") }),
  FindingNodeSchema.extend({ _label: z.literal("Finding") }),
  RecommendationNodeSchema.extend({ _label: z.literal("Recommendation") }),
  MethodNodeSchema.extend({ _label: z.literal("Method") }),
  ObservationNodeSchema.extend({ _label: z.literal("Observation") }),
  FieldGuideNodeSchema.extend({ _label: z.literal("FieldGuide") }),
  FrameworkNodeSchema.extend({ _label: z.literal("Framework") }),
  KeywordNodeSchema.extend({ _label: z.literal("Keyword") }),
  PracticeAreaNodeSchema.extend({ _label: z.literal("PracticeArea") }),
  CompetencyNodeSchema.extend({ _label: z.literal("Competency") }),
  TeamAdoptionNodeSchema.extend({ _label: z.literal("TeamAdoption") }),
  IndividualAdoptionNodeSchema.extend({
    _label: z.literal("IndividualAdoption"),
  }),
]);
export type GraphNode = z.infer<typeof GraphNodeSchema>;

/**
 * Node label constants
 */
export const NodeLabels = {
  REPOSITORY: "Repository",
  SCAN: "Scan",
  DIMENSION: "Dimension",
  SUBSCORE: "SubScore",
  FINDING: "Finding",
  RECOMMENDATION: "Recommendation",
  METHOD: "Method",
  OBSERVATION: "Observation",
  FIELD_GUIDE: "FieldGuide",
  FRAMEWORK: "Framework",
  KEYWORD: "Keyword",
  PRACTICE_AREA: "PracticeArea",
  COMPETENCY: "Competency",
  TEAM_ADOPTION: "TeamAdoption",
  INDIVIDUAL_ADOPTION: "IndividualAdoption",
} as const;

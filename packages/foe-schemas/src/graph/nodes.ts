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
} as const;

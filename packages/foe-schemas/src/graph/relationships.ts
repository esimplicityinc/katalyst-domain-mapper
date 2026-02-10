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
} as const;

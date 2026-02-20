import { z } from "zod";

// ── Health Status ──────────────────────────────────────────────────────────────
export const HealthStatusSchema = z.enum(["pass", "warn", "fail"]);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

// ── Health Category ────────────────────────────────────────────────────────────
export const HealthCategorySchema = z.enum([
  "understandability",
  "functionality",
  "compliance",
]);
export type HealthCategory = z.infer<typeof HealthCategorySchema>;

// ── Understandability Metrics ──────────────────────────────────────────────────
// Tracks code formatting, linting, and documentation quality.
// Maps to ADR categories: "maintainability"
// Maps to NFR categories: "maintainability"
export const UnderstandabilityMetricsSchema = z.object({
  lintErrorCount: z.number().int().nonnegative(),
  lintWarningCount: z.number().int().nonnegative(),
  formattingViolationCount: z.number().int().nonnegative(),
  documentationCoveragePercent: z
    .number()
    .min(0)
    .max(100)
    .nullable()
    .default(null),
});

export type UnderstandabilityMetrics = z.infer<
  typeof UnderstandabilityMetricsSchema
>;

// ── Functionality Metrics ──────────────────────────────────────────────────────
// Tracks passing unit and integration tests, and code coverage.
// Maps to ADR categories: "testing"
// Maps to NFR categories: "reliability", "performance"
export const FunctionalityMetricsSchema = z.object({
  unitTestsPassed: z.number().int().nonnegative(),
  unitTestsFailed: z.number().int().nonnegative(),
  unitTestsSkipped: z.number().int().nonnegative(),
  integrationTestsPassed: z.number().int().nonnegative(),
  integrationTestsFailed: z.number().int().nonnegative(),
  integrationTestsSkipped: z.number().int().nonnegative(),
  codeCoveragePercent: z.number().min(0).max(100).nullable().default(null),
});

export type FunctionalityMetrics = z.infer<typeof FunctionalityMetricsSchema>;

// ── Compliance Metrics ─────────────────────────────────────────────────────────
// Tracks security scanning, license auditing, and dependency health.
// Maps to ADR categories: "security", "infrastructure"
// Maps to NFR categories: "security", "accessibility"
export const ComplianceMetricsSchema = z.object({
  vulnerabilityCritical: z.number().int().nonnegative(),
  vulnerabilityHigh: z.number().int().nonnegative(),
  vulnerabilityMedium: z.number().int().nonnegative(),
  vulnerabilityLow: z.number().int().nonnegative(),
  licenseIssueCount: z.number().int().nonnegative(),
  dependencyAuditIssueCount: z.number().int().nonnegative(),
});

export type ComplianceMetrics = z.infer<typeof ComplianceMetricsSchema>;

// ── Category Schemas ───────────────────────────────────────────────────────────
// Each category carries: score (0-100), status, typed metrics, and governance
// references (nfrIds, adrIds) linking to the standards being measured against.

export const UnderstandabilityCategorySchema = z.object({
  score: z.number().min(0).max(100),
  status: HealthStatusSchema,
  metrics: UnderstandabilityMetricsSchema,
  /** NFR IDs (e.g. "NFR-MNT-001") whose thresholds this category is measured against */
  nfrIds: z.array(z.string()).default([]),
  /** ADR IDs (e.g. "ADR-005") whose decisions this category enforces */
  adrIds: z.array(z.string()).default([]),
});

export type UnderstandabilityCategory = z.infer<
  typeof UnderstandabilityCategorySchema
>;

export const FunctionalityCategorySchema = z.object({
  score: z.number().min(0).max(100),
  status: HealthStatusSchema,
  metrics: FunctionalityMetricsSchema,
  /** NFR IDs (e.g. "NFR-REL-001") whose thresholds this category is measured against */
  nfrIds: z.array(z.string()).default([]),
  /** ADR IDs (e.g. "ADR-008") whose decisions this category enforces */
  adrIds: z.array(z.string()).default([]),
});

export type FunctionalityCategory = z.infer<typeof FunctionalityCategorySchema>;

export const ComplianceCategorySchema = z.object({
  score: z.number().min(0).max(100),
  status: HealthStatusSchema,
  metrics: ComplianceMetricsSchema,
  /** NFR IDs (e.g. "NFR-SEC-001") whose thresholds this category is measured against */
  nfrIds: z.array(z.string()).default([]),
  /** ADR IDs (e.g. "ADR-003") whose decisions this category enforces */
  adrIds: z.array(z.string()).default([]),
});

export type ComplianceCategory = z.infer<typeof ComplianceCategorySchema>;

// ── Layer Health ───────────────────────────────────────────────────────────────
// Top-level entity capturing the health of a single taxonomy layer node at a
// point in time (tied to a taxonomy snapshot). The layerNode field is a FK to
// a TaxonomyNode with nodeType: "layer".
//
// Traceability:
//   ADR  = the decision ("we chose this standard")
//   NFR  = the threshold ("it must meet this bar")
//   LayerHealth = the measurement ("here's where we actually are")
export const LayerHealthSchema = z.object({
  /** Taxonomy node name — must reference a node with nodeType: "layer" */
  layerNode: z.string(),
  understandability: UnderstandabilityCategorySchema,
  functionality: FunctionalityCategorySchema,
  compliance: ComplianceCategorySchema,
  /** Weighted composite of all three category scores */
  overallScore: z.number().min(0).max(100),
  /** Determined by the worst-performing category status */
  overallStatus: HealthStatusSchema,
});

export type LayerHealth = z.infer<typeof LayerHealthSchema>;

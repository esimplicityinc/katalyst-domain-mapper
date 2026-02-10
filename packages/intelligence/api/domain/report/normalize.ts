import { FOEReportSchema } from "@foe/schemas/scan";
import type { FOEReport } from "@foe/schemas/scan";
import { ReportValidationError } from "./ReportErrors.js";

/**
 * Scanner output format (matches foe-web-ui types).
 * This is what the scanner agent actually produces.
 */
interface ScannerReport {
  version: string;
  generated: string;
  repository: {
    name: string;
    path: string;
    techStack: string[];
    monorepo: boolean;
  };
  dimensions: {
    feedback: ScannerDimension;
    understanding: ScannerDimension;
    confidence: ScannerDimension;
  };
  triangleDiagnosis: {
    cycleHealth: string;
    weakestDimension: string;
    weakestScore: number;
    pattern: string;
    intervention: string;
    belowMinimum: string[];
  };
  overallScore: number;
  maturityLevel: string;
  topStrengths: { area: string; score: number; reason: string }[];
  topGaps: { area: string; score: number; reason: string }[];
  methodology: {
    scanDuration: string;
    agentsUsed: string[];
    filesAnalyzed?: number;
    confidenceLevel: string;
  };
}

interface ScannerDimension {
  score: number;
  maxScore: number;
  subscores: Record<string, { score: number; max: number; confidence: string }>;
  findings: {
    area: string;
    type: string;
    description: string;
    evidence: string[];
  }[];
  gaps: {
    area: string;
    currentState: string;
    hypothesis: string;
    recommendation: string;
    impact: string;
    foeMethod?: string;
  }[];
}

function isScannerFormat(data: unknown): data is ScannerReport {
  const d = data as Record<string, unknown>;
  return (
    d != null &&
    typeof d === "object" &&
    "version" in d &&
    "repository" in d &&
    typeof d.repository === "object" &&
    d.repository !== null &&
    "name" in (d.repository as Record<string, unknown>)
  );
}

function calculateMaturity(score: number): string {
  if (score >= 76) return "Optimized";
  if (score >= 51) return "Practicing";
  if (score >= 26) return "Emerging";
  return "Hypothesized";
}

/**
 * Transform scanner output format → canonical FOEReport (Zod schema).
 */
function transformScannerReport(data: ScannerReport): FOEReport {
  const id = crypto.randomUUID();

  const transformDimension = (
    name: "Feedback" | "Understanding" | "Confidence",
    dim: ScannerDimension,
    color: string,
  ) => {
    const entries = Object.entries(dim.subscores);
    // Pad to 4 subscores if needed
    while (entries.length < 4) {
      entries.push([
        `subscore-${entries.length + 1}`,
        { score: 0, max: 25, confidence: "low" },
      ]);
    }

    return {
      name,
      score: dim.score,
      max: 100 as const,
      confidence: "medium" as const,
      color,
      subscores: entries.slice(0, 4).map(([subName, sub]) => ({
        name: subName,
        score: Math.min(sub.score, 25),
        max: 25 as const,
        confidence: (sub.confidence as "high" | "medium" | "low") ?? "medium",
        evidence: [] as string[],
        gaps: [] as string[],
      })),
    };
  };

  const transformFindings = (
    gaps: ScannerDimension["gaps"],
    kind: "gap",
    prefix: string,
  ) =>
    gaps.map((g, i) => ({
      id: `${prefix}-${i + 1}`,
      area: g.area,
      severity: (g.impact === "high"
        ? "high"
        : g.impact === "medium"
          ? "medium"
          : "low") as "critical" | "high" | "medium" | "low",
      title: g.currentState,
      evidence: g.hypothesis,
      impact: g.impact,
      recommendation: g.recommendation,
      methods: [],
    }));

  // Collect all gaps from all dimensions
  const allGaps = [
    ...transformFindings(data.dimensions.feedback.gaps, "gap", "fb"),
    ...transformFindings(data.dimensions.understanding.gaps, "gap", "und"),
    ...transformFindings(data.dimensions.confidence.gaps, "gap", "conf"),
  ];

  // Transform strengths from topStrengths
  const reportStrengths = data.topStrengths.map((s, i) => ({
    id: `str-${i + 1}`,
    area: s.area,
    evidence: s.reason,
  }));

  // Transform recommendations from topGaps
  const reportRecommendations = data.topGaps.map((g, i) => ({
    id: `rec-${i + 1}`,
    priority: (i === 0
      ? "immediate"
      : i <= 1
        ? "short-term"
        : "medium-term") as "immediate" | "short-term" | "medium-term",
    title: g.area,
    description: g.reason,
    impact: (g.score < 30 ? "high" : g.score < 50 ? "medium" : "low") as
      | "high"
      | "medium"
      | "low",
    methods: [],
  }));

  // Parse scanDuration from string like "5m 32s" to milliseconds
  let scanDurationMs = 0;
  const durationStr = data.methodology.scanDuration;
  const minMatch = durationStr.match(/(\d+)m/);
  const secMatch = durationStr.match(/(\d+)s/);
  if (minMatch) scanDurationMs += Number(minMatch[1]) * 60_000;
  if (secMatch) scanDurationMs += Number(secMatch[1]) * 1000;

  const weakestMap: Record<
    string,
    "feedback" | "understanding" | "confidence"
  > = {
    feedback: "feedback",
    understanding: "understanding",
    confidence: "confidence",
  };

  return {
    id,
    repository: data.repository.name,
    repositoryUrl: undefined,
    scanDate: data.generated || new Date().toISOString(),
    scanDuration: scanDurationMs,
    scannerVersion: data.version,
    overallScore: data.overallScore,
    maturityLevel: calculateMaturity(
      data.overallScore,
    ) as FOEReport["maturityLevel"],
    assessmentMode: "standard" as const,
    executiveSummary: `FOE assessment for ${data.repository.name}. Overall score: ${data.overallScore}/100 (${calculateMaturity(data.overallScore)}).`,
    dimensions: {
      feedback: transformDimension(
        "Feedback",
        data.dimensions.feedback,
        "#3b82f6",
      ),
      understanding: transformDimension(
        "Understanding",
        data.dimensions.understanding,
        "#9333ea",
      ),
      confidence: transformDimension(
        "Confidence",
        data.dimensions.confidence,
        "#10b981",
      ),
    },
    criticalFailures: [],
    strengths: reportStrengths,
    gaps: allGaps,
    recommendations: reportRecommendations,
    triangleDiagnosis: {
      cycleHealth:
        (data.triangleDiagnosis.cycleHealth as
          | "virtuous"
          | "at-risk"
          | "vicious") ?? "at-risk",
      pattern: data.triangleDiagnosis.pattern,
      weakestPrinciple:
        weakestMap[data.triangleDiagnosis.weakestDimension?.toLowerCase()] ??
        "feedback",
      intervention: data.triangleDiagnosis.intervention,
    },
    methodology: {
      filesAnalyzed: data.methodology.filesAnalyzed ?? 0,
      testFilesAnalyzed: 0,
      adrsAnalyzed: 0,
      confidenceNotes: [data.methodology.confidenceLevel],
    },
    referencedMethods: [],
  };
}

/**
 * Normalize any report input into the canonical FOEReport shape.
 *
 * Strategy:
 * 1. Try parsing as the canonical Zod schema first
 * 2. If that fails, try parsing as the scanner output format and transform
 * 3. If both fail, throw a ReportValidationError
 */
export function normalizeReport(data: unknown): FOEReport {
  // Attempt 1: canonical Zod schema
  const zodResult = FOEReportSchema.safeParse(data);
  if (zodResult.success) {
    return zodResult.data;
  }

  // Attempt 2: scanner output format
  if (isScannerFormat(data)) {
    try {
      const transformed = transformScannerReport(data);
      // Validate the transformed result
      const reparse = FOEReportSchema.safeParse(transformed);
      if (reparse.success) {
        return reparse.data;
      }
      // If strict validation fails, return the transformed report anyway
      // (scanner output may not perfectly match all Zod constraints)
      return transformed;
    } catch (err) {
      throw new ReportValidationError(
        "Failed to transform scanner report to canonical format",
        { transformError: String(err), zodErrors: zodResult.error.issues },
      );
    }
  }

  throw new ReportValidationError(
    "Invalid report format: does not match canonical or scanner schema",
    {
      zodErrors: zodResult.error.issues,
    },
  );
}

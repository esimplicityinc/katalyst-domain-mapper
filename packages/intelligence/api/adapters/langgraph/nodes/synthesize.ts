/**
 * synthesize node — merges specialist assessments into a unified FOE report.
 *
 * This is the final node in the scan graph. It takes the aggregated
 * DimensionAssessments and produces the canonical report format that
 * matches what the OpenCode scanner container outputs.
 */
import type { ScanState } from "../graphs/scanState.js";
import type { DimensionAssessment } from "../../../ports/ScanOrchestrator.js";
import { extractRepoName } from "./detectContext.js";

interface SpecialistResult {
  scores?: Record<
    string,
    { score: number; max: number; confidence: string; evidence?: string[] }
  >;
  dimension_score?: number;
  dimension_max?: number;
  gaps?: Array<{ area: string; recommendation?: string; impact?: string; [key: string]: unknown }>;
  strengths?: Array<{ area: string; evidence?: string; [key: string]: unknown }>;
  findings?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function synthesize(
  state: ScanState,
): Promise<Partial<ScanState>> {
  try {
    const assessmentMap = new Map<string, DimensionAssessment>();
    for (const a of state.assessments) {
      assessmentMap.set(a.dimension, a);
    }

    // Extract specialist results
    const ciResult = parseSpecialistResult(assessmentMap.get("ci"));
    const testsResult = parseSpecialistResult(assessmentMap.get("tests"));
    const archResult = parseSpecialistResult(assessmentMap.get("arch"));
    const domainResult = parseSpecialistResult(assessmentMap.get("domain"));
    const docsResult = parseSpecialistResult(assessmentMap.get("docs"));

    // Calculate dimension scores
    const feedbackScore = ciResult.dimension_score ?? 0;
    const understandingScore = Math.round(
      ((archResult.dimension_score ?? 0) +
        (domainResult.dimension_score ?? 0) +
        (docsResult.dimension_score ?? 0)) /
        3,
    );
    const confidenceScore = testsResult.dimension_score ?? 0;

    // Overall score: feedback 35%, understanding 35%, confidence 30%
    const overallScore = Math.round(
      feedbackScore * 0.35 +
        understandingScore * 0.35 +
        confidenceScore * 0.3,
    );

    // Maturity level
    const maturityLevel = getMaturityLevel(overallScore);

    // Triangle diagnosis
    const triangleDiagnosis = diagnoseTriangle(
      understandingScore,
      feedbackScore,
      confidenceScore,
    );

    // Collect all gaps and strengths, pick top 3
    const allGaps = [
      ...(ciResult.gaps ?? []),
      ...(testsResult.gaps ?? []),
      ...(archResult.gaps ?? []),
      ...(domainResult.gaps ?? []),
      ...(docsResult.gaps ?? []),
    ];
    const allStrengths = [
      ...(ciResult.strengths ?? []),
      ...(testsResult.strengths ?? []),
      ...(archResult.strengths ?? []),
      ...(domainResult.strengths ?? []),
      ...(docsResult.strengths ?? []),
    ];

    const topGaps = allGaps
      .sort((a, b) => impactOrder(a.impact) - impactOrder(b.impact))
      .slice(0, 3)
      .map((g) => ({
        area: g.area,
        score: 0,
        reason: g.recommendation ?? "Improvement needed",
      }));

    const topStrengths = allStrengths.slice(0, 3).map((s) => ({
      area: s.area,
      score: 100,
      reason: s.evidence ?? "Strong practice detected",
    }));

    const report = {
      version: "1.0",
      generated: new Date().toISOString(),
      repository: {
        path: state.repositoryPath,
        name: extractRepoName(state.repositoryPath),
        techStack: state.techStack,
        monorepo: state.monorepo,
      },
      dimensions: {
        feedback: buildDimension(feedbackScore, ciResult),
        understanding: buildDimensionFromMultiple(
          understandingScore,
          archResult,
          domainResult,
          docsResult,
        ),
        confidence: buildDimension(confidenceScore, testsResult),
      },
      triangleDiagnosis,
      overallScore,
      maturityLevel,
      topStrengths,
      topGaps,
      methodology: {
        scanDuration: "unknown",
        agentsUsed: ["ci", "tests", "arch", "domain", "docs"],
        confidenceLevel: "medium",
      },
    };

    return { report };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      error: `Synthesis failed: ${message}`,
      report: null,
    };
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseSpecialistResult(
  assessment: DimensionAssessment | undefined,
): SpecialistResult {
  if (!assessment) return {};
  const raw = assessment.raw as Record<string, unknown>;
  if (raw?.error) return {};
  return raw as SpecialistResult;
}

function getMaturityLevel(score: number): string {
  if (score <= 25) return "hypothesized";
  if (score <= 50) return "emerging";
  if (score <= 75) return "practicing";
  return "optimized";
}

function diagnoseTriangle(
  understanding: number,
  feedback: number,
  confidence: number,
) {
  const belowMinimum: string[] = [];
  if (understanding < 35) belowMinimum.push("understanding");
  if (feedback < 40) belowMinimum.push("feedback");
  if (confidence < 30) belowMinimum.push("confidence");

  const scores = { understanding, feedback, confidence };
  const weakest = Object.entries(scores).sort(
    ([, a], [, b]) => a - b,
  )[0];

  let pattern: string;
  let intervention: string;
  let cycleHealth: string;

  if (belowMinimum.length >= 3) {
    pattern = "Vicious Cycle Risk";
    intervention = "Start with weakest dimension urgently";
    cycleHealth = "critical";
  } else if (belowMinimum.length === 0 && Math.min(understanding, feedback, confidence) >= 50) {
    pattern = "Virtuous Cycle Potential";
    intervention = "Strengthen weakest to accelerate";
    cycleHealth = "healthy";
  } else if (belowMinimum.includes("understanding")) {
    pattern = "Confident Ignorance";
    intervention = "Add architecture docs, simplify systems";
    cycleHealth = "at-risk";
  } else if (belowMinimum.includes("feedback")) {
    pattern = "Analysis Paralysis";
    intervention = "Add CI, monitoring, faster test loops";
    cycleHealth = "at-risk";
  } else if (belowMinimum.includes("confidence")) {
    pattern = "Knowledge without Action";
    intervention = "Add feature flags, canary deploys, rollback";
    cycleHealth = "at-risk";
  } else {
    pattern = `${weakest[0]} is weakest dimension`;
    intervention = `Focus improvement on ${weakest[0]}`;
    cycleHealth = "practicing";
  }

  return {
    cycleHealth,
    weakestDimension: weakest[0],
    weakestScore: weakest[1],
    pattern,
    intervention,
    belowMinimum,
  };
}

function impactOrder(impact?: string): number {
  switch (impact) {
    case "critical":
      return 0;
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
    default:
      return 4;
  }
}

function buildDimension(score: number, result: SpecialistResult) {
  return {
    score,
    maxScore: 100,
    subscores: result.scores ?? {},
    findings: result.findings
      ? Object.entries(result.findings).map(([area, detail]) => ({
          area,
          type: "finding",
          description: String(detail),
          evidence: [],
        }))
      : [],
    gaps: result.gaps ?? [],
  };
}

function buildDimensionFromMultiple(
  score: number,
  ...results: SpecialistResult[]
) {
  const mergedSubscores: Record<string, unknown> = {};
  const mergedFindings: Array<Record<string, unknown>> = [];
  const mergedGaps: Array<Record<string, unknown>> = [];

  for (const result of results) {
    if (result.scores) {
      Object.assign(mergedSubscores, result.scores);
    }
    if (result.gaps) {
      mergedGaps.push(...result.gaps);
    }
    if (result.findings) {
      for (const [area, detail] of Object.entries(result.findings)) {
        mergedFindings.push({
          area,
          type: "finding",
          description: String(detail),
          evidence: [],
        });
      }
    }
  }

  return {
    score,
    maxScore: 100,
    subscores: mergedSubscores,
    findings: mergedFindings,
    gaps: mergedGaps,
  };
}

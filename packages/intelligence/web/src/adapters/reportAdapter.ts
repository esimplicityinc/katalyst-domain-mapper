/**
 * Adapts a raw/canonical report from the API into the FOEReport shape
 * expected by the UI visualization components.
 *
 * The API stores reports in a "canonical" schema (flat subscores arrays,
 * repository as a string, etc.) while the UI's FOEReport type uses
 * the scanner's output schema (nested subscores records, repository object, etc.).
 *
 * This adapter bridges the two, handling both formats gracefully.
 */
import type { FOEReport, DimensionReport, TopItem } from "../types/report";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawReport = Record<string, any>;

/**
 * Returns true if the report already conforms to the FOEReport scanner format.
 */
function isScannerFormat(raw: RawReport): boolean {
  return (
    typeof raw.repository === "object" &&
    raw.repository !== null &&
    "path" in raw.repository &&
    "version" in raw &&
    "generated" in raw
  );
}

/**
 * Transform a canonical (DB) dimension into the UI DimensionReport shape.
 */
function adaptDimension(dim: RawReport | undefined): DimensionReport {
  if (!dim) {
    return { score: 0, maxScore: 100, subscores: {}, findings: [], gaps: [] };
  }

  // Convert subscores from array to record if needed
  let subscores: DimensionReport["subscores"] = {};
  if (Array.isArray(dim.subscores)) {
    for (const s of dim.subscores) {
      const key = slugify(s.name ?? s.id ?? `subscore-${Object.keys(subscores).length}`);
      subscores[key] = {
        score: s.score ?? 0,
        max: s.max ?? 25,
        confidence: s.confidence ?? "medium",
      };
    }
  } else if (dim.subscores && typeof dim.subscores === "object") {
    // Already a record — pass through
    subscores = dim.subscores;
  }

  // Adapt findings — canonical has separate strengths, gaps arrays at root level
  const findings = Array.isArray(dim.findings)
    ? dim.findings
    : [];

  const gaps = Array.isArray(dim.gaps)
    ? dim.gaps
    : [];

  return {
    score: dim.score ?? 0,
    maxScore: dim.maxScore ?? dim.max ?? 100,
    subscores,
    findings,
    gaps,
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Adapt a raw API report (canonical or scanner format) into FOEReport.
 */
export function adaptReport(raw: RawReport): FOEReport {
  // If it's already in scanner format, return as-is
  if (isScannerFormat(raw)) {
    return raw as FOEReport;
  }

  // Build repository object from canonical flat fields
  const repository =
    typeof raw.repository === "string"
      ? {
          name: raw.repository,
          path: raw.repositoryUrl ?? "",
          techStack: Array.isArray(raw.techStack) ? raw.techStack : [],
          monorepo: raw.monorepo ?? false,
        }
      : raw.repository ?? { name: "Unknown", path: "", techStack: [], monorepo: false };

  // Build triangle diagnosis
  const tri = raw.triangleDiagnosis ?? {};
  const weakestDimension = tri.weakestDimension ?? tri.weakestPrinciple ?? "unknown";
  
  // Calculate weakestScore from dimension scores if not provided
  let weakestScore = tri.weakestScore ?? 0;
  if (!tri.weakestScore && raw.dimensions) {
    const dimScores = {
      feedback: raw.dimensions.feedback?.score ?? 0,
      understanding: raw.dimensions.understanding?.score ?? 0,
      confidence: raw.dimensions.confidence?.score ?? 0,
    };
    weakestScore = Math.min(dimScores.feedback, dimScores.understanding, dimScores.confidence);
  }
  
  const triangleDiagnosis = {
    cycleHealth: tri.cycleHealth ?? "unknown",
    weakestDimension,
    weakestScore,
    pattern: tri.pattern ?? "",
    intervention: tri.intervention ?? "",
    belowMinimum: Array.isArray(tri.belowMinimum) ? tri.belowMinimum : [],
  };

  // Build topStrengths from canonical strengths array
  const topStrengths: TopItem[] = Array.isArray(raw.topStrengths)
    ? raw.topStrengths
    : Array.isArray(raw.strengths)
      ? raw.strengths.map((s: RawReport) => ({
          area: s.area ?? s.id ?? "Unknown",
          score: s.score ?? 0,
          reason: s.evidence ?? s.description ?? "",
        }))
      : [];

  // Build topGaps
  const topGaps: TopItem[] = Array.isArray(raw.topGaps)
    ? raw.topGaps
    : Array.isArray(raw.gaps)
      ? raw.gaps.map((g: RawReport) => ({
          area: g.area ?? g.id ?? "Unknown",
          score: g.score ?? 0,
          reason: g.description ?? g.hypothesis ?? "",
        }))
      : [];

  // Build methodology
  const meth = raw.methodology ?? {};
  const methodology = {
    scanDuration: meth.scanDuration ?? (raw.scanDuration ? `${Math.round(raw.scanDuration / 1000)}s` : "unknown"),
    agentsUsed: Array.isArray(meth.agentsUsed) ? meth.agentsUsed : ["ci", "tests", "arch", "domain", "docs"],
    filesAnalyzed: meth.filesAnalyzed ?? 0,
    confidenceLevel: meth.confidenceLevel ?? "medium",
  };

  return {
    version: raw.version ?? raw.scannerVersion ?? "1.0",
    generated: raw.generated ?? raw.scanDate ?? new Date().toISOString(),
    repository,
    dimensions: {
      feedback: adaptDimension(raw.dimensions?.feedback),
      understanding: adaptDimension(raw.dimensions?.understanding),
      confidence: adaptDimension(raw.dimensions?.confidence),
    },
    triangleDiagnosis,
    overallScore: raw.overallScore ?? 0,
    maturityLevel: raw.maturityLevel ?? "Unknown",
    topStrengths,
    topGaps,
    methodology,
  };
}

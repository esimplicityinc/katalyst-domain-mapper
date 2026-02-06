import type { FOEReport } from "@foe/schemas/scan";
import type { ReportRepository } from "../../ports/ReportRepository.js";
import { ReportNotFoundError } from "../../domain/report/ReportErrors.js";

export interface ReportComparison {
  baseReport: { id: string; repository: string; scanDate: string; overallScore: number };
  compareReport: { id: string; repository: string; scanDate: string; overallScore: number };
  scoreDelta: number;
  dimensionDeltas: {
    feedback: number;
    understanding: number;
    confidence: number;
  };
  maturityChange: { from: string; to: string } | null;
  newGaps: string[];
  resolvedGaps: string[];
  newStrengths: string[];
}

export class CompareReports {
  constructor(private reportRepo: ReportRepository) {}

  async execute(baseId: string, compareId: string): Promise<ReportComparison> {
    const base = await this.reportRepo.getById(baseId);
    if (!base) throw new ReportNotFoundError(baseId);

    const compare = await this.reportRepo.getById(compareId);
    if (!compare) throw new ReportNotFoundError(compareId);

    const baseGapAreas = new Set(base.gaps.map((g) => g.area));
    const compareGapAreas = new Set(compare.gaps.map((g) => g.area));

    const baseStrengthAreas = new Set(base.strengths.map((s) => s.area));
    const compareStrengthAreas = new Set(compare.strengths.map((s) => s.area));

    return {
      baseReport: {
        id: base.id,
        repository: base.repository,
        scanDate: base.scanDate,
        overallScore: base.overallScore,
      },
      compareReport: {
        id: compare.id,
        repository: compare.repository,
        scanDate: compare.scanDate,
        overallScore: compare.overallScore,
      },
      scoreDelta: compare.overallScore - base.overallScore,
      dimensionDeltas: {
        feedback: compare.dimensions.feedback.score - base.dimensions.feedback.score,
        understanding: compare.dimensions.understanding.score - base.dimensions.understanding.score,
        confidence: compare.dimensions.confidence.score - base.dimensions.confidence.score,
      },
      maturityChange:
        base.maturityLevel !== compare.maturityLevel
          ? { from: base.maturityLevel, to: compare.maturityLevel }
          : null,
      newGaps: compare.gaps
        .filter((g) => !baseGapAreas.has(g.area))
        .map((g) => g.area),
      resolvedGaps: base.gaps
        .filter((g) => !compareGapAreas.has(g.area))
        .map((g) => g.area),
      newStrengths: compare.strengths
        .filter((s) => !baseStrengthAreas.has(s.area))
        .map((s) => s.area),
    };
  }
}

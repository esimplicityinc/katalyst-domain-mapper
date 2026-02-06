import type { ReportRepository } from "../../ports/ReportRepository.js";
import type { Logger } from "../../ports/Logger.js";
import { normalizeReport } from "../../domain/report/normalize.js";
import { ReportValidationError } from "../../domain/report/ReportErrors.js";

export class IngestReport {
  constructor(
    private reportRepo: ReportRepository,
    private logger: Logger
  ) {}

  /**
   * Accept raw JSON (either scanner or canonical format), normalize it,
   * decompose into tables, and return the report ID.
   */
  async execute(rawData: unknown): Promise<{ id: string; overallScore: number; maturityLevel: string }> {
    this.logger.info("Ingesting report");

    let report;
    try {
      report = normalizeReport(rawData);
    } catch (err) {
      if (err instanceof ReportValidationError) {
        throw err;
      }
      throw new ReportValidationError("Failed to normalize report", { cause: String(err) });
    }

    this.logger.info("Report normalized", {
      id: report.id,
      repository: report.repository,
      overallScore: report.overallScore,
      maturityLevel: report.maturityLevel,
    });

    const id = await this.reportRepo.save(report, rawData);

    this.logger.info("Report saved", { id });

    return {
      id,
      overallScore: report.overallScore,
      maturityLevel: report.maturityLevel,
    };
  }
}

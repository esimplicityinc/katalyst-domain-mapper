import type { FOEReport } from "@foe/schemas/scan";
import type { ReportRepository } from "../../ports/ReportRepository.js";
import { ReportNotFoundError } from "../../domain/report/ReportErrors.js";

export class GetReport {
  constructor(private reportRepo: ReportRepository) {}

  async execute(id: string): Promise<FOEReport> {
    const report = await this.reportRepo.getById(id);
    if (!report) {
      throw new ReportNotFoundError(id);
    }
    return report;
  }

  async getRaw(id: string): Promise<unknown> {
    const raw = await this.reportRepo.getRawById(id);
    if (!raw) {
      throw new ReportNotFoundError(id);
    }
    return raw;
  }
}

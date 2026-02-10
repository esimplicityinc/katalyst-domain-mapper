import type {
  ReportRepository,
  StoredReport,
  ReportListFilter,
} from "../../ports/ReportRepository.js";

export class ListReports {
  constructor(private reportRepo: ReportRepository) {}

  async execute(filter?: ReportListFilter): Promise<StoredReport[]> {
    return this.reportRepo.list(filter);
  }
}

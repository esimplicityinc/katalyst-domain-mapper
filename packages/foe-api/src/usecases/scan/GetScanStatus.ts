import type { ScanJobRepository } from "../../ports/ScanJobRepository.js";
import type { ScanJob, ScanJobStatus } from "../../domain/scan/Scan.js";
import { ScanJobNotFoundError } from "../../domain/scan/ScanErrors.js";

export class GetScanStatus {
  constructor(private scanJobRepo: ScanJobRepository) {}

  async execute(id: string): Promise<ScanJob> {
    const job = await this.scanJobRepo.getById(id);
    if (!job) {
      throw new ScanJobNotFoundError(id);
    }
    return job;
  }

  async list(status?: ScanJobStatus): Promise<ScanJob[]> {
    return this.scanJobRepo.list(status);
  }
}

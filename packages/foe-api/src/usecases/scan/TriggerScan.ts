import type { ScanJobRepository } from "../../ports/ScanJobRepository.js";
import type { Logger } from "../../ports/Logger.js";
import { ScanAlreadyRunningError } from "../../domain/scan/ScanErrors.js";
import type { ScanJob } from "../../domain/scan/Scan.js";
import * as path from "node:path";

export class TriggerScan {
  constructor(
    private scanJobRepo: ScanJobRepository,
    private logger: Logger
  ) {}

  async execute(repositoryPath: string): Promise<ScanJob> {
    const resolvedPath = path.resolve(repositoryPath);

    // Check for existing active scan
    const active = await this.scanJobRepo.findActiveByPath(resolvedPath);
    if (active) {
      throw new ScanAlreadyRunningError(resolvedPath);
    }

    const job: ScanJob = {
      id: crypto.randomUUID(),
      repositoryPath: resolvedPath,
      repositoryName: path.basename(resolvedPath),
      status: "queued",
      errorMessage: null,
      scanId: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
    };

    await this.scanJobRepo.create(job);

    this.logger.info("Scan job queued", {
      jobId: job.id,
      repositoryPath: resolvedPath,
    });

    return job;
  }
}

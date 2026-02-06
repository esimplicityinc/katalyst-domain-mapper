import type { ScanJob, ScanJobStatus } from "../../domain/scan/Scan.js";
import type { ScanJobRepository } from "../../ports/ScanJobRepository.js";

export class ScanJobRepositoryInMemory implements ScanJobRepository {
  private jobs = new Map<string, ScanJob>();

  async create(job: ScanJob): Promise<void> {
    this.jobs.set(job.id, { ...job });
  }

  async getById(id: string): Promise<ScanJob | null> {
    return this.jobs.get(id) ?? null;
  }

  async list(status?: ScanJobStatus): Promise<ScanJob[]> {
    const all = Array.from(this.jobs.values());
    if (status) return all.filter((j) => j.status === status);
    return all;
  }

  async update(id: string, updates: Partial<ScanJob>): Promise<void> {
    const existing = this.jobs.get(id);
    if (!existing) return;
    this.jobs.set(id, { ...existing, ...updates });
  }

  async findActiveByPath(repositoryPath: string): Promise<ScanJob | null> {
    for (const job of this.jobs.values()) {
      if (
        job.repositoryPath === repositoryPath &&
        (job.status === "queued" || job.status === "running")
      ) {
        return job;
      }
    }
    return null;
  }
}

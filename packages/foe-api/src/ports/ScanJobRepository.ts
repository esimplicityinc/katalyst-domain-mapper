import type { ScanJob, ScanJobStatus } from "../domain/scan/Scan.js";

export interface ScanJobRepository {
  /** Create a new scan job */
  create(job: ScanJob): Promise<void>;

  /** Get a scan job by ID */
  getById(id: string): Promise<ScanJob | null>;

  /** List scan jobs, optionally filtered by status */
  list(status?: ScanJobStatus): Promise<ScanJob[]>;

  /** Update scan job status and metadata */
  update(id: string, updates: Partial<ScanJob>): Promise<void>;

  /** Find any running or queued job for a given repo path */
  findActiveByPath(repositoryPath: string): Promise<ScanJob | null>;
}

import { eq, or, and } from "drizzle-orm";
import type { ScanJob, ScanJobStatus } from "../../domain/scan/Scan.js";
import type { ScanJobRepository } from "../../ports/ScanJobRepository.js";
import type { DrizzleDB } from "../../db/client.js";
import * as schema from "../../db/schema.js";

export class ScanJobRepositorySQLite implements ScanJobRepository {
  constructor(private db: DrizzleDB) {}

  async create(job: ScanJob): Promise<void> {
    this.db
      .insert(schema.scanJobs)
      .values({
        id: job.id,
        repositoryPath: job.repositoryPath,
        repositoryName: job.repositoryName,
        status: job.status,
        errorMessage: job.errorMessage,
        scanId: job.scanId,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
      })
      .run();
  }

  async getById(id: string): Promise<ScanJob | null> {
    const row = this.db
      .select()
      .from(schema.scanJobs)
      .where(eq(schema.scanJobs.id, id))
      .get();

    return row ? this.toScanJob(row) : null;
  }

  async list(status?: ScanJobStatus): Promise<ScanJob[]> {
    const query = status
      ? this.db
          .select()
          .from(schema.scanJobs)
          .where(eq(schema.scanJobs.status, status))
      : this.db.select().from(schema.scanJobs);

    return query.all().map(this.toScanJob);
  }

  async update(id: string, updates: Partial<ScanJob>): Promise<void> {
    const setValues: Record<string, unknown> = {};
    if (updates.status !== undefined) setValues.status = updates.status;
    if (updates.errorMessage !== undefined)
      setValues.errorMessage = updates.errorMessage;
    if (updates.scanId !== undefined) setValues.scanId = updates.scanId;
    if (updates.startedAt !== undefined)
      setValues.startedAt = updates.startedAt;
    if (updates.completedAt !== undefined)
      setValues.completedAt = updates.completedAt;
    if (updates.repositoryName !== undefined)
      setValues.repositoryName = updates.repositoryName;

    this.db
      .update(schema.scanJobs)
      .set(setValues)
      .where(eq(schema.scanJobs.id, id))
      .run();
  }

  async findActiveByPath(repositoryPath: string): Promise<ScanJob | null> {
    const row = this.db
      .select()
      .from(schema.scanJobs)
      .where(
        and(
          eq(schema.scanJobs.repositoryPath, repositoryPath),
          or(
            eq(schema.scanJobs.status, "queued"),
            eq(schema.scanJobs.status, "running"),
          ),
        ),
      )
      .get();

    return row ? this.toScanJob(row) : null;
  }

  private toScanJob(row: typeof schema.scanJobs.$inferSelect): ScanJob {
    return {
      id: row.id,
      repositoryPath: row.repositoryPath,
      repositoryName: row.repositoryName ?? null,
      status: row.status as ScanJobStatus,
      errorMessage: row.errorMessage ?? null,
      scanId: row.scanId ?? null,
      createdAt: row.createdAt,
      startedAt: row.startedAt ?? null,
      completedAt: row.completedAt ?? null,
    };
  }
}

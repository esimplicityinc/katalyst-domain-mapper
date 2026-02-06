export type ScanJobStatus = "queued" | "running" | "completed" | "failed";

export interface ScanJob {
  id: string;
  repositoryPath: string;
  repositoryName: string | null;
  status: ScanJobStatus;
  errorMessage: string | null;
  scanId: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

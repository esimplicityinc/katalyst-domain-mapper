import type { FOEReport } from "@foe/schemas/scan";

export interface StoredReport {
  id: string;
  repositoryId: string;
  repositoryName: string;
  overallScore: number;
  maturityLevel: string;
  scanDate: string;
  createdAt: string;
}

export interface ReportListFilter {
  repositoryId?: string;
  maturityLevel?: string;
  minScore?: number;
  maxScore?: number;
  limit?: number;
  offset?: number;
}

export interface RepositorySummary {
  id: string;
  name: string;
  url: string | null;
  techStack: string[];
  isMonorepo: boolean;
  lastScannedAt: string | null;
  scanCount: number;
  latestScore: number | null;
}

export interface ScoreTrendPoint {
  scanId: string;
  scanDate: string;
  overallScore: number;
  feedback: number;
  understanding: number;
  confidence: number;
}

export interface ReportRepository {
  /** Store a full report, decomposing into normalized tables */
  save(report: FOEReport, rawReport: unknown): Promise<string>;

  /** Get the full canonical report by ID */
  getById(id: string): Promise<FOEReport | null>;

  /** Get the raw (original) report JSON */
  getRawById(id: string): Promise<unknown | null>;

  /** List reports with optional filters */
  list(filter?: ReportListFilter): Promise<StoredReport[]>;

  /** Delete a report and all related data */
  delete(id: string): Promise<boolean>;

  /** Get or create a repository record, returning its ID */
  ensureRepository(name: string, url?: string, techStack?: string[], isMonorepo?: boolean): Promise<string>;

  /** List all repositories with summary info */
  listRepositories(): Promise<RepositorySummary[]>;

  /** Get a single repository by ID */
  getRepository(id: string): Promise<RepositorySummary | null>;

  /** Get score trend for a repository over time */
  getScoreTrend(repositoryId: string): Promise<ScoreTrendPoint[]>;
}

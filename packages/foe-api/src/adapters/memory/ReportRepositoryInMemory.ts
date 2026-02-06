import type { FOEReport } from "@foe/schemas/scan";
import type {
  ReportRepository,
  StoredReport,
  ReportListFilter,
  RepositorySummary,
  ScoreTrendPoint,
} from "../../ports/ReportRepository.js";

interface StoredReportData {
  report: FOEReport;
  rawReport: unknown;
  repositoryId: string;
  createdAt: string;
}

interface Repository {
  id: string;
  name: string;
  url: string | null;
  techStack: string[];
  isMonorepo: boolean;
  createdAt: string;
  lastScannedAt: string | null;
}

export class ReportRepositoryInMemory implements ReportRepository {
  private reports = new Map<string, StoredReportData>();
  private repositories = new Map<string, Repository>();

  async save(report: FOEReport, rawReport: unknown): Promise<string> {
    const repoId = await this.ensureRepository(report.repository);
    const now = new Date().toISOString();

    // Update repo lastScannedAt
    const repo = this.repositories.get(repoId)!;
    repo.lastScannedAt = report.scanDate;

    this.reports.set(report.id, {
      report,
      rawReport,
      repositoryId: repoId,
      createdAt: now,
    });

    return report.id;
  }

  async getById(id: string): Promise<FOEReport | null> {
    return this.reports.get(id)?.report ?? null;
  }

  async getRawById(id: string): Promise<unknown | null> {
    return this.reports.get(id)?.rawReport ?? null;
  }

  async list(filter?: ReportListFilter): Promise<StoredReport[]> {
    let results = Array.from(this.reports.values()).map((r) => {
      const repo = this.findRepoById(r.repositoryId);
      return {
        id: r.report.id,
        repositoryId: r.repositoryId,
        repositoryName: repo?.name ?? "unknown",
        overallScore: r.report.overallScore,
        maturityLevel: r.report.maturityLevel,
        scanDate: r.report.scanDate,
        createdAt: r.createdAt,
      };
    });

    if (filter?.repositoryId) {
      results = results.filter((r) => r.repositoryId === filter.repositoryId);
    }
    if (filter?.maturityLevel) {
      results = results.filter((r) => r.maturityLevel === filter.maturityLevel);
    }
    if (filter?.minScore !== undefined) {
      results = results.filter((r) => r.overallScore >= filter.minScore!);
    }
    if (filter?.maxScore !== undefined) {
      results = results.filter((r) => r.overallScore <= filter.maxScore!);
    }

    results.sort((a, b) => b.scanDate.localeCompare(a.scanDate));

    const offset = filter?.offset ?? 0;
    const limit = filter?.limit ?? 50;
    return results.slice(offset, offset + limit);
  }

  async delete(id: string): Promise<boolean> {
    return this.reports.delete(id);
  }

  async ensureRepository(
    name: string,
    url?: string,
    techStack?: string[],
    isMonorepo?: boolean
  ): Promise<string> {
    for (const [id, repo] of this.repositories) {
      if (repo.name === name) return id;
    }

    const id = crypto.randomUUID();
    this.repositories.set(id, {
      id,
      name,
      url: url ?? null,
      techStack: techStack ?? [],
      isMonorepo: isMonorepo ?? false,
      createdAt: new Date().toISOString(),
      lastScannedAt: null,
    });
    return id;
  }

  async listRepositories(): Promise<RepositorySummary[]> {
    return Array.from(this.repositories.values()).map((repo) => {
      const scans = Array.from(this.reports.values()).filter(
        (r) => r.repositoryId === repo.id
      );
      const latest = scans.sort((a, b) =>
        b.report.scanDate.localeCompare(a.report.scanDate)
      )[0];

      return {
        id: repo.id,
        name: repo.name,
        url: repo.url,
        techStack: repo.techStack,
        isMonorepo: repo.isMonorepo,
        lastScannedAt: repo.lastScannedAt,
        scanCount: scans.length,
        latestScore: latest?.report.overallScore ?? null,
      };
    });
  }

  async getRepository(id: string): Promise<RepositorySummary | null> {
    const repo = this.repositories.get(id);
    if (!repo) return null;

    const scans = Array.from(this.reports.values()).filter(
      (r) => r.repositoryId === id
    );
    const latest = scans.sort((a, b) =>
      b.report.scanDate.localeCompare(a.report.scanDate)
    )[0];

    return {
      id: repo.id,
      name: repo.name,
      url: repo.url,
      techStack: repo.techStack,
      isMonorepo: repo.isMonorepo,
      lastScannedAt: repo.lastScannedAt,
      scanCount: scans.length,
      latestScore: latest?.report.overallScore ?? null,
    };
  }

  async getScoreTrend(repositoryId: string): Promise<ScoreTrendPoint[]> {
    const scans = Array.from(this.reports.values())
      .filter((r) => r.repositoryId === repositoryId)
      .sort((a, b) => a.report.scanDate.localeCompare(b.report.scanDate));

    return scans.map((s) => ({
      scanId: s.report.id,
      scanDate: s.report.scanDate,
      overallScore: s.report.overallScore,
      feedback: s.report.dimensions.feedback.score,
      understanding: s.report.dimensions.understanding.score,
      confidence: s.report.dimensions.confidence.score,
    }));
  }

  private findRepoById(id: string): Repository | undefined {
    return this.repositories.get(id);
  }
}

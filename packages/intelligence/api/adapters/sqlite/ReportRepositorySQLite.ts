import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import type { FOEReport } from "@foe/schemas/scan";
import type {
  ReportRepository,
  StoredReport,
  ReportListFilter,
  RepositorySummary,
  ScoreTrendPoint,
} from "../../ports/ReportRepository.js";
import type { DrizzleDB } from "../../db/client.js";
import * as schema from "../../db/schema.js";

export class ReportRepositorySQLite implements ReportRepository {
  constructor(private db: DrizzleDB) {}

  async save(report: FOEReport, rawReport: unknown): Promise<string> {
    const repoId = await this.ensureRepository(report.repository);
    const now = new Date().toISOString();

    // Update repository lastScannedAt
    this.db
      .update(schema.repositories)
      .set({ lastScannedAt: report.scanDate })
      .where(eq(schema.repositories.id, repoId))
      .run();

    // Insert scan
    this.db
      .insert(schema.scans)
      .values({
        id: report.id,
        repositoryId: repoId,
        overallScore: report.overallScore,
        maturityLevel: report.maturityLevel,
        assessmentMode: report.assessmentMode,
        executiveSummary: report.executiveSummary,
        scanDate: report.scanDate,
        scanDuration: report.scanDuration,
        scannerVersion: report.scannerVersion,
        rawReport: rawReport as Record<string, unknown>,
        createdAt: now,
      })
      .run();

    // Insert dimensions + subscores
    for (const [_key, dim] of Object.entries(report.dimensions)) {
      const dimId = crypto.randomUUID();
      this.db
        .insert(schema.dimensions)
        .values({
          id: dimId,
          scanId: report.id,
          name: dim.name,
          score: dim.score,
          max: dim.max,
          confidence: dim.confidence,
          color: dim.color,
        })
        .run();

      for (const sub of dim.subscores) {
        this.db
          .insert(schema.subscores)
          .values({
            id: crypto.randomUUID(),
            dimensionId: dimId,
            name: sub.name,
            score: sub.score,
            max: sub.max,
            confidence: sub.confidence,
            evidence: sub.evidence,
            gaps: sub.gaps,
          })
          .run();
      }
    }

    // Insert findings (gaps + critical failures)
    for (const finding of report.gaps) {
      this.db
        .insert(schema.findings)
        .values({
          id: `${report.id}-${finding.id}`,
          scanId: report.id,
          kind: "gap",
          area: finding.area,
          severity: finding.severity,
          title: finding.title,
          evidence: finding.evidence,
          impact: finding.impact,
          recommendation: finding.recommendation,
          location: finding.location,
          methods: finding.methods,
        })
        .run();
    }

    for (const finding of report.criticalFailures) {
      this.db
        .insert(schema.findings)
        .values({
          id: `${report.id}-${finding.id}`,
          scanId: report.id,
          kind: "critical_failure",
          area: finding.area,
          severity: finding.severity,
          title: finding.title,
          evidence: finding.evidence,
          impact: finding.impact,
          recommendation: finding.recommendation,
          location: finding.location,
          methods: finding.methods,
        })
        .run();
    }

    // Insert strengths
    for (const strength of report.strengths) {
      this.db
        .insert(schema.strengths)
        .values({
          id: `${report.id}-${strength.id}`,
          scanId: report.id,
          area: strength.area,
          evidence: strength.evidence,
          caveat: strength.caveat,
        })
        .run();
    }

    // Insert recommendations
    for (const rec of report.recommendations) {
      this.db
        .insert(schema.recommendations)
        .values({
          id: `${report.id}-${rec.id}`,
          scanId: report.id,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          impact: rec.impact,
          methods: rec.methods,
          learningPath: rec.learningPath,
        })
        .run();
    }

    // Insert triangle diagnosis
    this.db
      .insert(schema.triangleDiagnoses)
      .values({
        id: crypto.randomUUID(),
        scanId: report.id,
        cycleHealth: report.triangleDiagnosis.cycleHealth,
        pattern: report.triangleDiagnosis.pattern,
        weakestPrinciple: report.triangleDiagnosis.weakestPrinciple,
        intervention: report.triangleDiagnosis.intervention,
        thresholds: report.triangleDiagnosis.thresholds,
      })
      .run();

    // Insert methodology
    this.db
      .insert(schema.methodologies)
      .values({
        id: crypto.randomUUID(),
        scanId: report.id,
        filesAnalyzed: report.methodology.filesAnalyzed,
        testFilesAnalyzed: report.methodology.testFilesAnalyzed,
        adrsAnalyzed: report.methodology.adrsAnalyzed,
        coverageReportFound: report.methodology.coverageReportFound,
        confidenceNotes: report.methodology.confidenceNotes,
      })
      .run();

    return report.id;
  }

  async getById(id: string): Promise<FOEReport | null> {
    const scan = this.db
      .select()
      .from(schema.scans)
      .where(eq(schema.scans.id, id))
      .get();

    if (!scan) return null;

    // Reconstruct full report from normalized tables
    const dims = this.db
      .select()
      .from(schema.dimensions)
      .where(eq(schema.dimensions.scanId, id))
      .all();

    const dimensionsMap: Record<string, FOEReport["dimensions"]["feedback"]> =
      {};

    for (const dim of dims) {
      const subs = this.db
        .select()
        .from(schema.subscores)
        .where(eq(schema.subscores.dimensionId, dim.id))
        .all();

      const dimKey = dim.name.toLowerCase() as
        | "feedback"
        | "understanding"
        | "confidence";
      dimensionsMap[dimKey] = {
        name: dim.name as "Feedback" | "Understanding" | "Confidence",
        score: dim.score,
        max: 100 as const,
        confidence: dim.confidence as "high" | "medium" | "low",
        color: dim.color,
        subscores: subs.map((s) => ({
          name: s.name,
          score: s.score,
          max: 25 as const,
          confidence: s.confidence as "high" | "medium" | "low",
          evidence: (s.evidence as string[]) ?? [],
          gaps: (s.gaps as string[]) ?? [],
        })),
      };
    }

    const findingsRows = this.db
      .select()
      .from(schema.findings)
      .where(eq(schema.findings.scanId, id))
      .all();

    const strengthRows = this.db
      .select()
      .from(schema.strengths)
      .where(eq(schema.strengths.scanId, id))
      .all();

    const recRows = this.db
      .select()
      .from(schema.recommendations)
      .where(eq(schema.recommendations.scanId, id))
      .all();

    const triangle = this.db
      .select()
      .from(schema.triangleDiagnoses)
      .where(eq(schema.triangleDiagnoses.scanId, id))
      .get();

    const methodology = this.db
      .select()
      .from(schema.methodologies)
      .where(eq(schema.methodologies.scanId, id))
      .get();

    const repo = this.db
      .select()
      .from(schema.repositories)
      .where(eq(schema.repositories.id, scan.repositoryId))
      .get();

    return {
      id: scan.id,
      repository: repo?.name ?? "unknown",
      repositoryUrl: repo?.url ?? undefined,
      scanDate: scan.scanDate,
      scanDuration: scan.scanDuration,
      scannerVersion: scan.scannerVersion,
      overallScore: scan.overallScore,
      maturityLevel: scan.maturityLevel as FOEReport["maturityLevel"],
      assessmentMode: scan.assessmentMode as FOEReport["assessmentMode"],
      executiveSummary: scan.executiveSummary,
      dimensions: {
        feedback: dimensionsMap["feedback"]!,
        understanding: dimensionsMap["understanding"]!,
        confidence: dimensionsMap["confidence"]!,
      },
      criticalFailures: findingsRows
        .filter((f) => f.kind === "critical_failure")
        .map((f) => ({
          id: f.id.replace(`${id}-`, ""),
          area: f.area,
          severity: f.severity as "critical" | "high" | "medium" | "low",
          title: f.title,
          evidence: f.evidence,
          impact: f.impact,
          recommendation: f.recommendation,
          location: f.location ?? undefined,
          methods: (f.methods as unknown[]) ?? [],
        })) as FOEReport["criticalFailures"],
      strengths: strengthRows.map((s) => ({
        id: s.id.replace(`${id}-`, ""),
        area: s.area,
        evidence: s.evidence,
        caveat: s.caveat ?? undefined,
      })),
      gaps: findingsRows
        .filter((f) => f.kind === "gap")
        .map((f) => ({
          id: f.id.replace(`${id}-`, ""),
          area: f.area,
          severity: f.severity as "critical" | "high" | "medium" | "low",
          title: f.title,
          evidence: f.evidence,
          impact: f.impact,
          recommendation: f.recommendation,
          location: f.location ?? undefined,
          methods: (f.methods as unknown[]) ?? [],
        })) as FOEReport["gaps"],
      recommendations: recRows.map((r) => ({
        id: r.id.replace(`${id}-`, ""),
        priority: r.priority as "immediate" | "short-term" | "medium-term",
        title: r.title,
        description: r.description,
        impact: r.impact as "high" | "medium" | "low",
        methods: (r.methods as unknown[]) ?? [],
        learningPath: r.learningPath ?? undefined,
      })) as FOEReport["recommendations"],
      triangleDiagnosis: triangle
        ? {
            cycleHealth: triangle.cycleHealth as
              | "virtuous"
              | "at-risk"
              | "vicious",
            pattern: triangle.pattern,
            weakestPrinciple: triangle.weakestPrinciple as
              | "feedback"
              | "understanding"
              | "confidence",
            intervention: triangle.intervention,
            thresholds: triangle.thresholds ?? undefined,
          }
        : {
            cycleHealth: "at-risk" as const,
            pattern: "Unknown",
            weakestPrinciple: "feedback" as const,
            intervention: "Unknown",
          },
      methodology: methodology
        ? {
            filesAnalyzed: methodology.filesAnalyzed,
            testFilesAnalyzed: methodology.testFilesAnalyzed,
            adrsAnalyzed: methodology.adrsAnalyzed,
            coverageReportFound: methodology.coverageReportFound ?? undefined,
            confidenceNotes: (methodology.confidenceNotes as string[]) ?? [],
          }
        : {
            filesAnalyzed: 0,
            testFilesAnalyzed: 0,
            adrsAnalyzed: 0,
            confidenceNotes: [],
          },
      referencedMethods: [],
    };
  }

  async getRawById(id: string): Promise<unknown | null> {
    const scan = this.db
      .select({ rawReport: schema.scans.rawReport })
      .from(schema.scans)
      .where(eq(schema.scans.id, id))
      .get();
    return scan?.rawReport ?? null;
  }

  async list(filter?: ReportListFilter): Promise<StoredReport[]> {
    const conditions = [];

    if (filter?.repositoryId) {
      conditions.push(eq(schema.scans.repositoryId, filter.repositoryId));
    }
    if (filter?.maturityLevel) {
      conditions.push(eq(schema.scans.maturityLevel, filter.maturityLevel));
    }
    if (filter?.minScore !== undefined) {
      conditions.push(gte(schema.scans.overallScore, filter.minScore));
    }
    if (filter?.maxScore !== undefined) {
      conditions.push(lte(schema.scans.overallScore, filter.maxScore));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = this.db
      .select({
        id: schema.scans.id,
        repositoryId: schema.scans.repositoryId,
        repositoryName: schema.repositories.name,
        overallScore: schema.scans.overallScore,
        maturityLevel: schema.scans.maturityLevel,
        scanDate: schema.scans.scanDate,
        createdAt: schema.scans.createdAt,
      })
      .from(schema.scans)
      .innerJoin(
        schema.repositories,
        eq(schema.scans.repositoryId, schema.repositories.id),
      )
      .where(where)
      .orderBy(desc(schema.scans.scanDate))
      .limit(filter?.limit ?? 50)
      .offset(filter?.offset ?? 0)
      .all();

    return rows;
  }

  async delete(id: string): Promise<boolean> {
    // Check existence first, then delete
    const existing = this.db
      .select({ id: schema.scans.id })
      .from(schema.scans)
      .where(eq(schema.scans.id, id))
      .get();

    if (!existing) return false;

    this.db.delete(schema.scans).where(eq(schema.scans.id, id)).run();
    return true;
  }

  async ensureRepository(
    name: string,
    url?: string,
    techStack?: string[],
    isMonorepo?: boolean,
  ): Promise<string> {
    // Check if repo exists by name
    const existing = this.db
      .select()
      .from(schema.repositories)
      .where(eq(schema.repositories.name, name))
      .get();

    if (existing) {
      return existing.id;
    }

    const id = crypto.randomUUID();
    this.db
      .insert(schema.repositories)
      .values({
        id,
        name,
        url: url ?? null,
        techStack: techStack ?? [],
        isMonorepo: isMonorepo ?? false,
        createdAt: new Date().toISOString(),
      })
      .run();

    return id;
  }

  async listRepositories(): Promise<RepositorySummary[]> {
    const repos = this.db
      .select({
        id: schema.repositories.id,
        name: schema.repositories.name,
        url: schema.repositories.url,
        techStack: schema.repositories.techStack,
        isMonorepo: schema.repositories.isMonorepo,
        lastScannedAt: schema.repositories.lastScannedAt,
        scanCount: sql<number>`(SELECT COUNT(*) FROM scans WHERE scans.repository_id = repositories.id)`,
        latestScore: sql<
          number | null
        >`(SELECT overall_score FROM scans WHERE scans.repository_id = repositories.id ORDER BY scan_date DESC LIMIT 1)`,
      })
      .from(schema.repositories)
      .all();

    return repos.map((r) => ({
      ...r,
      techStack: (r.techStack as string[]) ?? [],
      isMonorepo: r.isMonorepo ?? false,
    }));
  }

  async getRepository(id: string): Promise<RepositorySummary | null> {
    const repo = this.db
      .select({
        id: schema.repositories.id,
        name: schema.repositories.name,
        url: schema.repositories.url,
        techStack: schema.repositories.techStack,
        isMonorepo: schema.repositories.isMonorepo,
        lastScannedAt: schema.repositories.lastScannedAt,
        scanCount: sql<number>`(SELECT COUNT(*) FROM scans WHERE scans.repository_id = repositories.id)`,
        latestScore: sql<
          number | null
        >`(SELECT overall_score FROM scans WHERE scans.repository_id = repositories.id ORDER BY scan_date DESC LIMIT 1)`,
      })
      .from(schema.repositories)
      .where(eq(schema.repositories.id, id))
      .get();

    if (!repo) return null;

    return {
      ...repo,
      techStack: (repo.techStack as string[]) ?? [],
      isMonorepo: repo.isMonorepo ?? false,
    };
  }

  async getScoreTrend(repositoryId: string): Promise<ScoreTrendPoint[]> {
    const scanRows = this.db
      .select({
        scanId: schema.scans.id,
        scanDate: schema.scans.scanDate,
        overallScore: schema.scans.overallScore,
      })
      .from(schema.scans)
      .where(eq(schema.scans.repositoryId, repositoryId))
      .orderBy(schema.scans.scanDate)
      .all();

    const trend: ScoreTrendPoint[] = [];

    for (const scan of scanRows) {
      const dims = this.db
        .select({
          name: schema.dimensions.name,
          score: schema.dimensions.score,
        })
        .from(schema.dimensions)
        .where(eq(schema.dimensions.scanId, scan.scanId))
        .all();

      const dimScores: Record<string, number> = {};
      for (const d of dims) {
        dimScores[d.name.toLowerCase()] = d.score;
      }

      trend.push({
        scanId: scan.scanId,
        scanDate: scan.scanDate,
        overallScore: scan.overallScore,
        feedback: dimScores["feedback"] ?? 0,
        understanding: dimScores["understanding"] ?? 0,
        confidence: dimScores["confidence"] ?? 0,
      });
    }

    return trend;
  }
}

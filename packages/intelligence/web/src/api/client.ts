import type {
  DomainModel,
  DomainModelFull,
  BoundedContext,
  Aggregate,
  DomainEvent,
  ValueObject,
  GlossaryTerm,
  WorkflowState,
  WorkflowTransition,
  DomainWorkflow,
} from "../types/domain";
import type {
  GovernanceSnapshot,
  RoadItemSummary,
  CapabilityCoverage,
  PersonaCoverage,
  IntegrityReport,
  TrendPoint,
} from "../types/governance";
import type { Project, ProjectDetail } from "../types/project";
import { normalizeRepoUrl } from "../utils/url";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.error ?? `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(`${res.status}: ${msg}`);
  }

  return res.json();
}

// ── Report types ──────────────────────────────────────────────────────────────

export interface ReportSummary {
  id: string;
  repositoryId: string;
  repositoryName: string;
  overallScore: number;
  maturityLevel: string;
  scanDate: string;
  createdAt: string;
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

// ── API methods ───────────────────────────────────────────────────────────────

export const api = {
  // ── Reports ────────────────────────────────────────────────────────────────

  /** List all reports */
  listReports(params?: {
    repositoryId?: string;
    maturityLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<ReportSummary[]> {
    const query = new URLSearchParams();
    if (params?.repositoryId) query.set("repositoryId", params.repositoryId);
    if (params?.maturityLevel) query.set("maturityLevel", params.maturityLevel);
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.offset) query.set("offset", String(params.offset));
    const qs = query.toString();
    return request(`/api/v1/reports${qs ? `?${qs}` : ""}`);
  },

  /** Get the raw report JSON by ID (scanner format, compatible with web-ui types) */
  getReportRaw(id: string): Promise<unknown> {
    return request(`/api/v1/reports/${id}/raw`);
  },

  /** Get the canonical report by ID */
  getReport(id: string): Promise<unknown> {
    return request(`/api/v1/reports/${id}`);
  },

  /** List repositories */
  listRepositories(): Promise<RepositorySummary[]> {
    return request("/api/v1/repositories");
  },

  // ── Config ─────────────────────────────────────────────────────────────────

  /** Health check */
  async isHealthy(): Promise<boolean> {
    try {
      await request("/api/v1/health");
      return true;
    } catch {
      return false;
    }
  },

  /** Get config status (is API key set, etc.) */
  getConfigStatus(): Promise<{
    anthropicApiKey: boolean;
    openrouterApiKey: boolean;
    activeProvider: "anthropic" | "openrouter" | null;
    scannerEnabled: boolean;
  }> {
    return request("/api/v1/config/status");
  },

  /** Set an LLM API key at runtime (auto-detects Anthropic vs OpenRouter) */
  setApiKey(
    apiKey: string,
  ): Promise<{
    message: string;
    provider: "anthropic" | "openrouter" | null;
    scannerEnabled: boolean;
  }> {
    return request("/api/v1/config/api-key", {
      method: "PUT",
      body: JSON.stringify({ apiKey }),
    });
  },

  // ── Scans ────────────────────────────────────────────────────────────────────

  /** Trigger a new FOE scan */
  triggerScan(repositoryPath: string): Promise<{
    jobId: string;
    status: string;
    repositoryPath: string;
    message: string;
  }> {
    return request("/api/v1/scans", {
      method: "POST",
      body: JSON.stringify({ repositoryPath }),
    });
  },

  /** Get scan job status */
  getScanStatus(jobId: string): Promise<{
    id: string;
    repositoryPath: string;
    repositoryName: string | null;
    status: "queued" | "running" | "completed" | "failed";
    errorMessage: string | null;
    scanId: string | null;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
  }> {
    return request(`/api/v1/scans/${jobId}`);
  },

  /** List scan jobs */
  listScans(status?: string): Promise<
    Array<{
      id: string;
      repositoryPath: string;
      repositoryName: string | null;
      status: string;
      scanId: string | null;
      createdAt: string;
    }>
  > {
    const qs = status ? `?status=${status}` : "";
    return request(`/api/v1/scans${qs}`);
  },

  // ── Domain Models ──────────────────────────────────────────────────────────

  /** Create a domain model */
  createDomainModel(data: {
    name: string;
    description?: string;
  }): Promise<DomainModel> {
    return request("/api/v1/domain-models", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** List all domain models */
  listDomainModels(): Promise<DomainModel[]> {
    return request("/api/v1/domain-models");
  },

  /** Get a domain model with all artifacts */
  getDomainModel(id: string): Promise<DomainModelFull> {
    return request(`/api/v1/domain-models/${id}`);
  },

  /** Delete a domain model */
  deleteDomainModel(id: string): Promise<{ deleted: boolean }> {
    return request(`/api/v1/domain-models/${id}`, { method: "DELETE" });
  },

  // ── Bounded Contexts ───────────────────────────────────────────────────────

  /** Add a bounded context */
  createBoundedContext(
    modelId: string,
    data: {
      slug: string;
      title: string;
      responsibility: string;
      description?: string;
      sourceDirectory?: string;
      teamOwnership?: string;
      status?: string;
      subdomainType?: "core" | "supporting" | "generic";
      relationships?: BoundedContext["relationships"];
    },
  ): Promise<BoundedContext> {
    return request(`/api/v1/domain-models/${modelId}/contexts`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Update a bounded context */
  updateBoundedContext(
    modelId: string,
    contextId: string,
    data: Partial<{
      title: string;
      responsibility: string;
      description: string;
      sourceDirectory: string;
      teamOwnership: string;
      status: string;
      subdomainType: "core" | "supporting" | "generic" | null;
      relationships: BoundedContext["relationships"];
    }>,
  ): Promise<BoundedContext> {
    return request(`/api/v1/domain-models/${modelId}/contexts/${contextId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Delete a bounded context */
  deleteBoundedContext(
    modelId: string,
    contextId: string,
  ): Promise<{ deleted: boolean }> {
    return request(`/api/v1/domain-models/${modelId}/contexts/${contextId}`, {
      method: "DELETE",
    });
  },

  // ── Aggregates ─────────────────────────────────────────────────────────────

  /** Add an aggregate */
  createAggregate(
    modelId: string,
    data: {
      contextId: string;
      slug: string;
      title: string;
      rootEntity: string;
      entities?: string[];
      valueObjects?: string[];
      events?: string[];
      commands?: string[];
      invariants?: Aggregate["invariants"];
      sourceFile?: string;
      status?: string;
    },
  ): Promise<Aggregate> {
    return request(`/api/v1/domain-models/${modelId}/aggregates`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ── Domain Events ──────────────────────────────────────────────────────────

  /** Add a domain event */
  createDomainEvent(
    modelId: string,
    data: {
      contextId: string;
      aggregateId?: string;
      slug: string;
      title: string;
      description?: string;
      payload?: DomainEvent["payload"];
      consumedBy?: string[];
      triggers?: string[];
      sideEffects?: string[];
      sourceFile?: string;
    },
  ): Promise<DomainEvent> {
    return request(`/api/v1/domain-models/${modelId}/events`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ── Value Objects ──────────────────────────────────────────────────────────

  /** Add a value object */
  createValueObject(
    modelId: string,
    data: {
      contextId: string;
      slug: string;
      title: string;
      description?: string;
      properties?: ValueObject["properties"];
      validationRules?: string[];
      immutable?: boolean;
      sourceFile?: string;
    },
  ): Promise<ValueObject> {
    return request(`/api/v1/domain-models/${modelId}/value-objects`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ── Glossary ───────────────────────────────────────────────────────────────

  /** Add a glossary term */
  createGlossaryTerm(
    modelId: string,
    data: {
      contextId?: string;
      term: string;
      definition: string;
      aliases?: string[];
      examples?: string[];
      relatedTerms?: string[];
      source?: string;
    },
  ): Promise<GlossaryTerm> {
    return request(`/api/v1/domain-models/${modelId}/glossary`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** List glossary terms */
  listGlossaryTerms(modelId: string): Promise<GlossaryTerm[]> {
    return request(`/api/v1/domain-models/${modelId}/glossary`);
  },

  // ── Workflows ───────────────────────────────────────────────────────────────

  /** Add a workflow */
  createWorkflow(
    modelId: string,
    data: {
      slug: string;
      title: string;
      description?: string;
      states?: WorkflowState[];
      transitions?: WorkflowTransition[];
    },
  ): Promise<{ id: string; slug: string; title: string }> {
    return request(`/api/v1/domain-models/${modelId}/workflows`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** List workflows */
  listWorkflows(modelId: string): Promise<DomainWorkflow[]> {
    return request(`/api/v1/domain-models/${modelId}/workflows`);
  },

  /** Delete a workflow */
  deleteWorkflow(
    modelId: string,
    workflowId: string,
  ): Promise<{ message: string }> {
    return request(
      `/api/v1/domain-models/${modelId}/workflows/${workflowId}`,
      { method: "DELETE" },
    );
  },

  // ── Governance ────────────────────────────────────────────────────────────

  /** Get the latest governance snapshot */
  getGovernanceLatest(): Promise<GovernanceSnapshot> {
    return request("/api/v1/governance/latest");
  },

  /** List all governance snapshots */
  listGovernanceSnapshots(): Promise<GovernanceSnapshot[]> {
    return request("/api/v1/governance/snapshots");
  },

  /** Get road items with optional status filter */
  getGovernanceRoads(status?: string): Promise<RoadItemSummary[]> {
    const qs = status ? `?status=${status}` : "";
    return request(`/api/v1/governance/roads${qs}`);
  },

  /** Get capability coverage */
  getCapabilityCoverage(): Promise<CapabilityCoverage[]> {
    return request("/api/v1/governance/coverage/capabilities");
  },

  /** Get persona coverage */
  getPersonaCoverage(): Promise<PersonaCoverage[]> {
    return request("/api/v1/governance/coverage/personas");
  },

  /** Get governance health trends */
  getGovernanceTrends(limit?: number): Promise<TrendPoint[]> {
    const qs = limit ? `?limit=${limit}` : "";
    return request(`/api/v1/governance/trends${qs}`);
  },

  /** Get cross-reference integrity report */
  getGovernanceIntegrity(): Promise<IntegrityReport> {
    return request("/api/v1/governance/integrity");
  },

  // ── Projects ───────────────────────────────────────────────────────────────

  /**
   * List all projects (repositories with scans)
   *
   * Performs client-side grouping of reports by repository.
   * Each project aggregates metadata from the latest scan.
   *
   * @returns Array of projects sorted by last scan date (newest first)
   *
   * @example
   * ```typescript
   * const projects = await api.listProjects();
   * projects.forEach(project => {
   *   console.log(`${project.name}: ${project.latestScore}`);
   * });
   * ```
   */
  async listProjects(): Promise<Project[]> {
    try {
      // Get all repositories with aggregated scan data
      const repositories = await this.listRepositories();

      // Transform repository summaries into project format
      const projects: Project[] = repositories.map((repo) => ({
        id: repo.id,
        name: repo.name,
        url: repo.url,
        techStack: repo.techStack || [],
        isMonorepo: repo.isMonorepo,
        lastScanDate: repo.lastScannedAt,
        latestScore: repo.latestScore,
        maturityLevel:
          repo.latestScore !== null
            ? calculateMaturityLevel(repo.latestScore)
            : null,
        scanCount: repo.scanCount,
      }));

      // Sort by last scan date (newest first), nulls last
      projects.sort((a, b) => {
        if (!a.lastScanDate && !b.lastScanDate) return 0;
        if (!a.lastScanDate) return 1;
        if (!b.lastScanDate) return -1;
        return (
          new Date(b.lastScanDate).getTime() -
          new Date(a.lastScanDate).getTime()
        );
      });

      return projects;
    } catch (error) {
      console.error("Failed to list projects:", error);
      throw error;
    }
  },

  /**
   * Get detailed information for a specific project
   *
   * Retrieves the latest scan and scan history for a repository.
   *
   * @param repositoryId - The repository ID (normalized URL or database ID)
   * @returns Project details with scan history
   * @throws {Error} If the repository is not found or has no scans
   *
   * @example
   * ```typescript
   * const project = await api.getProjectDetail("repo-123");
   * console.log(`Latest score: ${project.latestScore}`);
   * console.log(`Scan history: ${project.scanIds.length} scans`);
   * ```
   */
  async getProjectDetail(repositoryId: string): Promise<ProjectDetail> {
    if (!repositoryId) {
      throw new Error("Repository ID is required");
    }

    try {
      // Get all reports for this repository
      const reports = await this.listReports({ repositoryId });

      if (!reports || reports.length === 0) {
        throw new Error(
          `No scans found for repository: ${repositoryId}`,
        );
      }

      // Sort reports by scan date (newest first)
      const sortedReports = [...reports].sort(
        (a, b) =>
          new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime(),
      );

      // Get the latest report for project metadata
      const latestReport = sortedReports[0];
      const firstReport = sortedReports[sortedReports.length - 1];

      // Calculate average score
      const scores = sortedReports
        .map((r) => r.overallScore)
        .filter((s): s is number => s !== null && s !== undefined);
      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : null;

      // Calculate score trend (latest - previous)
      const scoreTrend =
        sortedReports.length >= 2
          ? sortedReports[0].overallScore - sortedReports[1].overallScore
          : null;

      // Build project detail
      const projectDetail: ProjectDetail = {
        id: latestReport.repositoryId,
        name: latestReport.repositoryName,
        url: normalizeRepoUrl(latestReport.repositoryName) || null,
        techStack: [], // Will be populated from repository data if available
        isMonorepo: false, // Will be populated from repository data if available
        lastScanDate: latestReport.scanDate,
        latestScore: latestReport.overallScore,
        maturityLevel: latestReport.maturityLevel as Project["maturityLevel"],
        scanCount: sortedReports.length,
        firstScanDate: firstReport.scanDate,
        averageScore,
        scoreTrend,
        scanIds: sortedReports.map((r) => r.id),
      };

      // Enrich with repository metadata if available
      try {
        const repositories = await this.listRepositories();
        const repoData = repositories.find((r) => r.id === repositoryId);
        if (repoData) {
          projectDetail.techStack = repoData.techStack || [];
          projectDetail.isMonorepo = repoData.isMonorepo;
          projectDetail.url = repoData.url;
        }
      } catch (error) {
        // Non-critical - continue without repository metadata
        console.warn("Could not fetch repository metadata:", error);
      }

      return projectDetail;
    } catch (error) {
      console.error(`Failed to get project detail for ${repositoryId}:`, error);
      throw error;
    }
  },
};

/**
 * Helper to calculate maturity level from overall score
 *
 * Matches the thresholds defined in FOE schemas.
 *
 * @param score - Overall FOE score (0-100)
 * @returns Maturity level
 */
function calculateMaturityLevel(score: number): Project["maturityLevel"] {
  if (score >= 76) return "Optimized";
  if (score >= 51) return "Practicing";
  if (score >= 26) return "Emerging";
  return "Hypothesized";
}

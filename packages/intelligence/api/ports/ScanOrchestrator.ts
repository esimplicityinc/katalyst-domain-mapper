/**
 * ScanOrchestrator port — abstracts agent orchestration for FOE scanning.
 *
 * This port enables swapping between different agent runtimes (OpenCode, LangGraph, etc.)
 * while keeping the domain and application layers runtime-agnostic.
 *
 * The existing ScanRunner port remains for backward compatibility; ScanOrchestrator
 * is the richer replacement with explicit context and metadata.
 */

/** Which agent runtime produced the result */
export type AgentRuntime = "opencode" | "langgraph";

/** Result from a single specialist dimension agent */
export interface DimensionAssessment {
  dimension: "ci" | "tests" | "arch" | "domain" | "docs";
  raw: unknown; // raw output from the specialist agent
}

/** Context passed to the orchestrator when starting a scan */
export interface ScanContext {
  repositoryPath: string;
  techStack?: string[];
  monorepo?: boolean;
  /** Optional packages list for monorepo scanning */
  packages?: string[];
}

/** Result of a full orchestrated scan */
export interface ScanOrchestrationResult {
  success: boolean;
  /** Full synthesized FOE report (raw JSON) */
  report: unknown;
  /** Individual specialist agent results, if available */
  assessments?: DimensionAssessment[];
  error?: string;
  metadata?: {
    runtime: AgentRuntime;
    durationMs: number;
    agentsUsed: string[];
  };
}

export interface ScanOrchestrator {
  /** Identifies which runtime this orchestrator uses */
  readonly runtime: AgentRuntime;

  /**
   * Run a full FOE scan against a repository.
   * Coordinates specialist agents (CI, tests, arch, domain, docs) and
   * synthesizes their results into a unified report.
   */
  run(context: ScanContext): Promise<ScanOrchestrationResult>;
}

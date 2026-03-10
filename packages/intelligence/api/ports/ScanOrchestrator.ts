/**
 * ScanOrchestrator port — abstracts agent orchestration for FOE scanning.
 *
 * This port enables swapping between different agent runtimes (OpenCode, LangGraph, etc.)
 * while keeping the domain and application layers runtime-agnostic.
 *
 * The existing ScanRunner port remains for backward compatibility; ScanOrchestrator
 * is the richer replacement with explicit context and metadata.
 *
 * Streaming: Callers can optionally provide an `onProgress` callback to receive
 * real-time events as each graph node completes. Without the callback, `run()`
 * still works as before (returns final result only).
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

/** Progress event emitted during scan execution */
export interface ScanProgressEvent {
  /** Which graph node produced this event */
  node: string;
  /** Event type */
  type: "node_started" | "node_completed" | "node_error";
  /** Timestamp when this event occurred */
  timestamp: string;
  /** Duration in ms (only for node_completed) */
  durationMs?: number;
  /** Error message (only for node_error) */
  error?: string;
  /** Partial data from the node (dimension assessment, etc.) */
  data?: unknown;
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

/** Optional scan configuration */
export interface ScanOptions {
  /**
   * Callback for real-time progress events.
   * Called as each graph node starts, completes, or errors.
   */
  onProgress?: (event: ScanProgressEvent) => void;
}

export interface ScanOrchestrator {
  /** Identifies which runtime this orchestrator uses */
  readonly runtime: AgentRuntime;

  /**
   * Run a full FOE scan against a repository.
   * Coordinates specialist agents (CI, tests, arch, domain, docs) and
   * synthesizes their results into a unified report.
   *
   * @param context - Repository context for the scan
   * @param options - Optional configuration (progress callback, etc.)
   */
  run(context: ScanContext, options?: ScanOptions): Promise<ScanOrchestrationResult>;
}

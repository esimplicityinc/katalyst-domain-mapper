/**
 * LangGraph scan orchestrator — runs the FOE scanner as a LangGraph StateGraph.
 *
 * Instead of spawning a Docker container with OpenCode CLI, this adapter
 * builds a StateGraph that coordinates 5 specialist LLM nodes in parallel
 * (fan-out/fan-in), then synthesizes the results into a unified report.
 *
 * Each specialist is a ReAct agent with tool access (read_file, list_directory,
 * glob_files, grep_content, shell) that can actually inspect the repository
 * being scanned — matching the capabilities of the OpenCode agents.
 *
 * Prompts are loaded from the .md agent files in packages/assessment/.opencode/
 * agents/ (single source of truth), with fallback to hardcoded prompts if the
 * .md files aren't available.
 *
 * Streaming: When `onProgress` is provided in options, uses LangGraph's
 * `stream("updates")` to emit real-time events as each node completes.
 * Without the callback, falls back to `invoke()` for simple usage.
 *
 * Advantages over the Docker/OpenCode approach:
 * - No Docker dependency for scanning
 * - Programmatic control over parallelism, retries, checkpointing
 * - Direct LLM API calls (faster cold start)
 * - Full observability into individual node execution
 * - Real-time progress events via streaming
 */
import type {
  ScanOrchestrator,
  ScanContext,
  ScanOrchestrationResult,
  ScanOptions,
  ScanProgressEvent,
} from "../../ports/ScanOrchestrator.js";
import type { Logger } from "../../ports/Logger.js";
import type { LlmProvider } from "../../config/env.js";
import { buildScanGraph } from "./graphs/scanGraph.js";
import { createRepoTools } from "./tools/repoTools.js";
import { resolvePrompts } from "./nodes/prompts.js";

/**
 * Configuration for the LangGraph scan orchestrator.
 */
export interface LangGraphScanConfig {
  /** LLM provider to use */
  provider: LlmProvider;
  /** API key for the LLM provider */
  apiKey: string;
  /** Model ID override (defaults to provider-appropriate model) */
  modelId?: string;
  /** Directory containing scanner agent .md files (optional) */
  agentsDir?: string;
}

export class LangGraphScanOrchestrator implements ScanOrchestrator {
  readonly runtime = "langgraph" as const;

  /** Resolved prompts (loaded once, reused for all scans) */
  private prompts: Map<string, string>;

  constructor(
    private config: LangGraphScanConfig,
    private logger: Logger,
  ) {
    // Load prompts at construction time — tries .md files first, falls back
    this.prompts = resolvePrompts(config.agentsDir);
    const fromMd = this.prompts.size > 0;
    this.logger.info("Specialist prompts resolved", {
      source: fromMd ? ".md agent files" : "hardcoded fallbacks",
      dimensions: [...this.prompts.keys()],
    });
  }

  async run(
    context: ScanContext,
    options?: ScanOptions,
  ): Promise<ScanOrchestrationResult> {
    const startTime = Date.now();
    const onProgress = options?.onProgress;

    this.logger.info("Starting scan (LangGraph runtime)", {
      repositoryPath: context.repositoryPath,
      provider: this.config.provider,
      streaming: !!onProgress,
    });

    try {
      // Dynamically import the LLM provider to avoid loading LangChain
      // when the OpenCode runtime is selected
      const model = await this.createModel();

      // Create sandboxed tools for this specific repository
      const tools = createRepoTools(context.repositoryPath);

      this.logger.info("Repository tools created", {
        repositoryPath: context.repositoryPath,
        toolCount: tools.length,
        toolNames: tools.map((t) => t.name),
      });

      // Build the scan graph with tools and prompts
      const graph = buildScanGraph(model, tools, this.prompts);

      const initialState = {
        repositoryPath: context.repositoryPath,
        techStack: context.techStack ?? [],
        monorepo: context.monorepo ?? false,
        packages: context.packages ?? [],
      };

      // If onProgress callback is provided, use streaming mode
      // Otherwise, use simple invoke for backward compatibility
      let result;
      if (onProgress) {
        result = await this.runWithStreaming(graph, initialState, onProgress);
      } else {
        result = await graph.invoke(initialState);
      }

      const durationMs = Date.now() - startTime;

      if (result.error) {
        this.logger.error("LangGraph scan failed", {
          error: result.error,
          durationMs,
        });
        return {
          success: false,
          report: null,
          assessments: result.assessments,
          error: result.error,
          metadata: {
            runtime: "langgraph",
            durationMs,
            agentsUsed: result.assessments.map(
              (a: { dimension: string }) => `foe-scanner-${a.dimension}`,
            ),
          },
        };
      }

      this.logger.info("LangGraph scan completed", {
        durationMs,
        assessmentCount: result.assessments.length,
      });

      return {
        success: true,
        report: result.report,
        assessments: result.assessments,
        metadata: {
          runtime: "langgraph",
          durationMs,
          agentsUsed: result.assessments.map(
            (a: { dimension: string }) => `foe-scanner-${a.dimension}`,
          ),
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error("LangGraph scan error", { error: message });
      return {
        success: false,
        report: null,
        error: `LangGraph scan failed: ${message}`,
        metadata: {
          runtime: "langgraph",
          durationMs: Date.now() - startTime,
          agentsUsed: [],
        },
      };
    }
  }

  /**
   * Run the scan graph in streaming mode, emitting progress events
   * as each node completes.
   *
   * Uses LangGraph's `stream("updates")` mode which yields one chunk
   * per completed node with the node's output.
   */
  private async runWithStreaming(
    graph: ReturnType<typeof buildScanGraph>,
    initialState: Record<string, unknown>,
    onProgress: (event: ScanProgressEvent) => void,
  ) {
    const nodeStartTimes = new Map<string, number>();
    let finalState: Record<string, unknown> = { ...initialState, assessments: [], report: null, error: null };

    // Stream updates — each chunk is { [nodeName]: nodeOutput }
    const stream = await graph.stream(initialState, {
      streamMode: "updates",
    });

    for await (const chunk of stream) {
      // Each chunk is an object: { nodeName: nodeOutput }
      for (const [nodeName, nodeOutput] of Object.entries(chunk)) {
        const now = Date.now();
        const startTime = nodeStartTimes.get(nodeName);
        const durationMs = startTime ? now - startTime : undefined;

        // Emit node_completed event
        onProgress({
          node: nodeName,
          type: "node_completed",
          timestamp: new Date().toISOString(),
          durationMs,
          data: summarizeNodeOutput(nodeName, nodeOutput),
        });

        // Merge node output into our running state
        if (nodeOutput && typeof nodeOutput === "object") {
          const output = nodeOutput as Record<string, unknown>;
          for (const [key, value] of Object.entries(output)) {
            if (key === "assessments" && Array.isArray(value)) {
              // Assessments use a concat reducer
              const existing = (finalState.assessments as unknown[]) ?? [];
              finalState.assessments = [...existing, ...value];
            } else {
              finalState[key] = value;
            }
          }
        }
      }
    }

    return finalState;
  }

  /**
   * Create the appropriate LLM model based on provider config.
   * Uses dynamic imports to avoid loading all providers upfront.
   */
  private async createModel() {
    const modelId = this.config.modelId;

    switch (this.config.provider) {
      case "anthropic": {
        const { ChatAnthropic } = await import("@langchain/anthropic");
        return new ChatAnthropic({
          model: modelId ?? "claude-sonnet-4-20250514",
          anthropicApiKey: this.config.apiKey,
          temperature: 0.2,
          maxTokens: 4096,
        });
      }

      case "bedrock": {
        // Use Anthropic on Bedrock via the ChatAnthropic wrapper with
        // AWS credentials. This is a simplified approach; for production
        // you might use @langchain/aws directly.
        const { ChatAnthropic } = await import("@langchain/anthropic");
        return new ChatAnthropic({
          model: modelId ?? "claude-sonnet-4-20250514",
          anthropicApiKey: this.config.apiKey,
          temperature: 0.2,
          maxTokens: 4096,
        });
      }

      case "openrouter": {
        // OpenRouter uses OpenAI-compatible API
        const { ChatOpenAI } = await import("@langchain/openai");
        return new ChatOpenAI({
          model: modelId ?? "anthropic/claude-sonnet-4-20250514",
          openAIApiKey: this.config.apiKey,
          temperature: 0.2,
          maxTokens: 4096,
          configuration: {
            baseURL: "https://openrouter.ai/api/v1",
          },
        });
      }

      default: {
        const _exhaustive: never = this.config.provider;
        throw new Error(`Unsupported LLM provider: ${_exhaustive}`);
      }
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Create a concise summary of node output for progress events.
 * Avoids sending the full raw LLM output in progress events.
 */
function summarizeNodeOutput(
  nodeName: string,
  output: unknown,
): Record<string, unknown> {
  if (!output || typeof output !== "object") return {};

  const obj = output as Record<string, unknown>;

  switch (nodeName) {
    case "detectContext":
      return {
        techStack: obj.techStack,
        monorepo: obj.monorepo,
        packages: obj.packages,
      };
    case "synthesize":
      return {
        hasReport: !!obj.report,
        error: obj.error ?? null,
      };
    default:
      // Specialist nodes return { assessments: [...] }
      if (Array.isArray(obj.assessments) && obj.assessments.length > 0) {
        const assessment = obj.assessments[0] as {
          dimension?: string;
          raw?: unknown;
        };
        const raw = assessment.raw as Record<string, unknown> | undefined;
        return {
          dimension: assessment.dimension,
          hasResult: !!raw && !raw.error,
          error: raw?.error ?? null,
        };
      }
      return {};
  }
}

/**
 * LangGraph scan orchestrator — runs the FOE scanner as a LangGraph StateGraph.
 *
 * Instead of spawning a Docker container with OpenCode CLI, this adapter
 * builds a StateGraph that coordinates 5 specialist LLM nodes in parallel
 * (fan-out/fan-in), then synthesizes the results into a unified report.
 *
 * Advantages over the Docker/OpenCode approach:
 * - No Docker dependency for scanning
 * - Programmatic control over parallelism, retries, checkpointing
 * - Direct LLM API calls (faster cold start)
 * - Full observability into individual node execution
 */
import type {
  ScanOrchestrator,
  ScanContext,
  ScanOrchestrationResult,
} from "../../ports/ScanOrchestrator.js";
import type { Logger } from "../../ports/Logger.js";
import type { LlmProvider } from "../../config/env.js";
import { buildScanGraph } from "./graphs/scanGraph.js";

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
}

export class LangGraphScanOrchestrator implements ScanOrchestrator {
  readonly runtime = "langgraph" as const;

  constructor(
    private config: LangGraphScanConfig,
    private logger: Logger,
  ) {}

  async run(context: ScanContext): Promise<ScanOrchestrationResult> {
    const startTime = Date.now();

    this.logger.info("Starting scan (LangGraph runtime)", {
      repositoryPath: context.repositoryPath,
      provider: this.config.provider,
    });

    try {
      // Dynamically import the LLM provider to avoid loading LangChain
      // when the OpenCode runtime is selected
      const model = await this.createModel();

      // Build and execute the scan graph
      const graph = buildScanGraph(model);

      const result = await graph.invoke({
        repositoryPath: context.repositoryPath,
        techStack: context.techStack ?? [],
        monorepo: context.monorepo ?? false,
        packages: context.packages ?? [],
      });

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

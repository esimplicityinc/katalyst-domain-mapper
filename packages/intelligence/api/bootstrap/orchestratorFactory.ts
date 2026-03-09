/**
 * Orchestrator factories — create the appropriate scan/chat orchestrator
 * based on feature flag values.
 *
 * These factories are called during DI container initialization. The
 * feature flag `scan.runtime` / `chat.runtime` determines which adapter
 * is instantiated. Defaults to "opencode" for backward compatibility.
 */
import type { FeatureFlags } from "../ports/FeatureFlags.js";
import type { Logger } from "../ports/Logger.js";
import type { ScanOrchestrator } from "../ports/ScanOrchestrator.js";
import type { ChatOrchestrator } from "../ports/ChatOrchestrator.js";
import type { AppConfig, LlmProvider } from "../config/env.js";
import { OpenCodeScanOrchestrator } from "../adapters/opencode/OpenCodeScanOrchestrator.js";
import { OpenCodeChatOrchestrator } from "../adapters/opencode/OpenCodeChatOrchestrator.js";

/**
 * Create the scan orchestrator based on the `scan.runtime` feature flag.
 *
 * @returns ScanOrchestrator — either OpenCode (Docker-based) or LangGraph
 */
export async function createScanOrchestrator(deps: {
  featureFlags: FeatureFlags;
  config: AppConfig;
  logger: Logger;
  getLlmApiKey: () => { key: string; provider: LlmProvider } | undefined;
}): Promise<ScanOrchestrator> {
  const { featureFlags, config, logger, getLlmApiKey } = deps;

  const runtime = await featureFlags.getStringValue(
    "scan.runtime",
    "opencode",
  );

  if (runtime === "langgraph") {
    logger.info("Using LangGraph scan orchestrator");

    // Dynamic import to avoid loading LangGraph when not needed
    const { LangGraphScanOrchestrator } = await import(
      "../adapters/langgraph/LangGraphScanOrchestrator.js"
    );

    const llm = getLlmApiKey();
    if (!llm) {
      logger.warn(
        "LangGraph scan runtime selected but no LLM key available, falling back to OpenCode",
      );
      return new OpenCodeScanOrchestrator(
        config.scannerImage,
        getLlmApiKey,
        logger.child({ component: "scan-orchestrator", runtime: "opencode" }),
      );
    }

    return new LangGraphScanOrchestrator(
      {
        provider: llm.provider,
        apiKey: llm.key,
      },
      logger.child({ component: "scan-orchestrator", runtime: "langgraph" }),
    );
  }

  // Default: OpenCode (Docker container)
  logger.info("Using OpenCode scan orchestrator");
  return new OpenCodeScanOrchestrator(
    config.scannerImage,
    getLlmApiKey,
    logger.child({ component: "scan-orchestrator", runtime: "opencode" }),
  );
}

/**
 * Create the chat orchestrator based on the `chat.runtime` feature flag.
 *
 * @returns ChatOrchestrator — either OpenCode (HTTP API) or LangGraph
 */
export async function createChatOrchestrator(deps: {
  featureFlags: FeatureFlags;
  config: AppConfig;
  logger: Logger;
  getLlmApiKey: () => { key: string; provider: LlmProvider } | undefined;
  opencodeUrl: string;
}): Promise<ChatOrchestrator> {
  const { featureFlags, config, logger, getLlmApiKey, opencodeUrl } = deps;

  const runtime = await featureFlags.getStringValue(
    "chat.runtime",
    "opencode",
  );

  if (runtime === "langgraph") {
    logger.info("Using LangGraph chat orchestrator");

    const { LangGraphChatOrchestrator } = await import(
      "../adapters/langgraph/LangGraphChatOrchestrator.js"
    );

    const llm = getLlmApiKey();
    if (!llm) {
      logger.warn(
        "LangGraph chat runtime selected but no LLM key available, falling back to OpenCode",
      );
      return new OpenCodeChatOrchestrator(
        opencodeUrl,
        logger.child({ component: "chat-orchestrator", runtime: "opencode" }),
      );
    }

    return new LangGraphChatOrchestrator(
      {
        provider: llm.provider,
        apiKey: llm.key,
      },
      logger.child({ component: "chat-orchestrator", runtime: "langgraph" }),
    );
  }

  // Default: OpenCode (HTTP API)
  logger.info("Using OpenCode chat orchestrator");
  return new OpenCodeChatOrchestrator(
    opencodeUrl,
    logger.child({ component: "chat-orchestrator", runtime: "opencode" }),
  );
}

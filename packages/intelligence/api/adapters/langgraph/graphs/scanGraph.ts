/**
 * FOE Scanner StateGraph definition.
 *
 * Wires together the detectContext, 5 specialist, and synthesize nodes
 * into a LangGraph StateGraph with parallel fan-out/fan-in execution.
 *
 * Each specialist is a mini ReAct agent with tool access (read_file,
 * list_directory, glob_files, grep_content, shell) that can actually
 * inspect the repository being scanned.
 *
 * RetryPolicy: Specialist and synthesize nodes are configured with
 * exponential backoff (3 retries) to handle transient LLM API errors
 * (rate limits, network timeouts, 5xx responses).
 *
 * Graph topology:
 *
 *   START → detectContext → [ci, tests, arch, domain, docs] (parallel) → synthesize → END
 */
import { StateGraph, START, END } from "@langchain/langgraph";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ScanStateAnnotation } from "./scanState.js";
import { detectContext } from "../nodes/detectContext.js";
import {
  createCiNode,
  createTestsNode,
  createArchNode,
  createDomainNode,
  createDocsNode,
} from "../nodes/specialists.js";
import { synthesize } from "../nodes/synthesize.js";
import type { RepoTools } from "../tools/repoTools.js";

// ── Retry Configuration ──────────────────────────────────────────────────────

/**
 * RetryPolicy for specialist LLM nodes.
 *
 * Handles transient failures (rate limits, network errors, 5xx responses)
 * with exponential backoff. Each specialist gets up to 3 retries with:
 * - Initial delay: 1 second
 * - Backoff factor: 2x (1s → 2s → 4s)
 * - Max delay: 10 seconds
 *
 * Only retries on errors that are likely transient. Permanent errors
 * (invalid API key, malformed request) fail immediately.
 */
const SPECIALIST_RETRY_POLICY = {
  maxAttempts: 3,
  initialInterval: 1000,
  backoffFactor: 2,
  maxInterval: 10_000,
  retryOn: (error: Error): boolean => {
    const msg = error.message.toLowerCase();
    // Retry on rate limits, timeouts, and server errors
    return (
      msg.includes("rate limit") ||
      msg.includes("429") ||
      msg.includes("timeout") ||
      msg.includes("econnreset") ||
      msg.includes("econnrefused") ||
      msg.includes("socket hang up") ||
      msg.includes("500") ||
      msg.includes("502") ||
      msg.includes("503") ||
      msg.includes("529") ||
      msg.includes("overloaded")
    );
  },
};

/**
 * RetryPolicy for the synthesize node (lighter — this is deterministic
 * and rarely fails, but we still guard against transient issues).
 */
const SYNTHESIZE_RETRY_POLICY = {
  maxAttempts: 2,
  initialInterval: 500,
  backoffFactor: 2,
  maxInterval: 5_000,
};

// ── Graph Builder ────────────────────────────────────────────────────────────

/**
 * Build the compiled FOE scanner graph.
 *
 * @param model - The LLM to use for specialist analysis nodes.
 *                Typically ChatAnthropic or ChatOpenAI.
 * @param tools - Repository inspection tools (sandboxed to the repo path).
 * @param prompts - Optional map of dimension → system prompt string.
 *                  If not provided, specialists use fallback prompts.
 */
export function buildScanGraph(
  model: BaseChatModel,
  tools: RepoTools,
  prompts?: Map<string, string>,
) {
  const graph = new StateGraph(ScanStateAnnotation)
    // Phase 1: Auto-detect repo characteristics (deterministic, no retry needed)
    .addNode("detectContext", detectContext)

    // Phase 2: Specialist analysis nodes (will run in parallel)
    // Each specialist is a ReAct agent with tool access + RetryPolicy
    .addNode("ci", createCiNode(model, tools, prompts?.get("ci")), {
      retryPolicy: SPECIALIST_RETRY_POLICY,
    })
    .addNode("tests", createTestsNode(model, tools, prompts?.get("tests")), {
      retryPolicy: SPECIALIST_RETRY_POLICY,
    })
    .addNode("arch", createArchNode(model, tools, prompts?.get("arch")), {
      retryPolicy: SPECIALIST_RETRY_POLICY,
    })
    .addNode("domain", createDomainNode(model, tools, prompts?.get("domain")), {
      retryPolicy: SPECIALIST_RETRY_POLICY,
    })
    .addNode("docs", createDocsNode(model, tools, prompts?.get("docs")), {
      retryPolicy: SPECIALIST_RETRY_POLICY,
    })

    // Phase 3: Synthesize results (with lighter retry policy)
    .addNode("synthesize", synthesize, {
      retryPolicy: SYNTHESIZE_RETRY_POLICY,
    })

    // Edges: START → detectContext
    .addEdge(START, "detectContext")

    // Fan-out: detectContext → all 5 specialists in parallel
    .addEdge("detectContext", "ci")
    .addEdge("detectContext", "tests")
    .addEdge("detectContext", "arch")
    .addEdge("detectContext", "domain")
    .addEdge("detectContext", "docs")

    // Fan-in: all specialists → synthesize
    .addEdge("ci", "synthesize")
    .addEdge("tests", "synthesize")
    .addEdge("arch", "synthesize")
    .addEdge("domain", "synthesize")
    .addEdge("docs", "synthesize")

    // synthesize → END
    .addEdge("synthesize", END);

  return graph.compile();
}

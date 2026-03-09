/**
 * FOE Scanner StateGraph definition.
 *
 * Wires together the detectContext, 5 specialist, and synthesize nodes
 * into a LangGraph StateGraph with parallel fan-out/fan-in execution.
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

/**
 * Build the compiled FOE scanner graph.
 *
 * @param model - The LLM to use for specialist analysis nodes.
 *                Typically ChatAnthropic or ChatOpenAI.
 */
export function buildScanGraph(model: BaseChatModel) {
  const graph = new StateGraph(ScanStateAnnotation)
    // Phase 1: Auto-detect repo characteristics
    .addNode("detectContext", detectContext)

    // Phase 2: Specialist analysis nodes (will run in parallel)
    .addNode("ci", createCiNode(model))
    .addNode("tests", createTestsNode(model))
    .addNode("arch", createArchNode(model))
    .addNode("domain", createDomainNode(model))
    .addNode("docs", createDocsNode(model))

    // Phase 3: Synthesize results
    .addNode("synthesize", synthesize)

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

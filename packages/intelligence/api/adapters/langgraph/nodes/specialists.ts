/**
 * LangGraph specialist node functions for the FOE scanner.
 *
 * Each specialist is a mini ReAct agent with tool access (read_file,
 * list_directory, glob_files, grep_content, shell). The agent loops
 * between calling the LLM and executing tools until it produces a
 * final JSON assessment.
 *
 * Structured Output: When the LLM supports `withStructuredOutput()`,
 * specialists use Zod schemas to force valid JSON output, eliminating
 * the fragile extractJson() fallback. The schemas define the exact
 * shape of each specialist's expected response.
 *
 * The specialist's system prompt comes from the .md agent files in
 * packages/assessment/.opencode/agents/ (loaded by promptLoader.ts),
 * with fallback to the condensed prompts in prompts.ts.
 */
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";
import type { ScanState } from "../graphs/scanState.js";
import type { DimensionAssessment } from "../../../ports/ScanOrchestrator.js";
import type { RepoTools } from "../tools/repoTools.js";
import { makeContextPreamble, FALLBACK_PROMPTS } from "./prompts.js";

/** Maximum tool-call iterations per specialist to prevent runaway loops */
const MAX_ITERATIONS = 20;

// ── Zod Schemas for Structured Output ────────────────────────────────────────

/** Schema for a single subscore entry */
const SubscoreSchema = z.object({
  score: z.number().min(0).max(25).describe("Score out of 25"),
  max: z.number().default(25).describe("Maximum possible score"),
  confidence: z.enum(["high", "medium", "low"]).describe("Confidence level in this score"),
  evidence: z.array(z.string()).optional().describe("Evidence supporting this score"),
});

/** Schema for a gap identified by the specialist */
const GapSchema = z.object({
  area: z.string().describe("Area where the gap exists"),
  recommendation: z.string().optional().describe("Suggested improvement"),
  impact: z.enum(["critical", "high", "medium", "low"]).optional().describe("Impact level of this gap"),
});

/** Schema for a strength identified by the specialist */
const StrengthSchema = z.object({
  area: z.string().describe("Area of strength"),
  evidence: z.string().optional().describe("Evidence for this strength"),
});

/**
 * Generic specialist assessment schema.
 *
 * All 5 specialists (CI, tests, arch, domain, docs) produce output
 * conforming to this shape. The `scores` keys vary per specialist but
 * the overall structure is the same.
 */
export const SpecialistAssessmentSchema = z.object({
  source: z.string().describe("Source identifier (e.g. 'foe-scanner-ci')"),
  foe_principle: z.string().optional().describe("Primary FOE principle (e.g. 'Feedback', 'Understanding', 'Confidence')"),
  foe_principles: z.array(z.string()).optional().describe("FOE principles (when multiple apply)"),
  findings: z.record(z.unknown()).optional().describe("Detailed findings keyed by area"),
  scores: z.record(SubscoreSchema).describe("Subscores keyed by area name (4 areas, each out of 25)"),
  dimension_score: z.number().min(0).max(100).describe("Overall dimension score (sum of subscores)"),
  dimension_max: z.number().default(100).describe("Maximum possible dimension score"),
  gaps: z.array(GapSchema).describe("Identified gaps and improvement areas"),
  strengths: z.array(StrengthSchema).describe("Identified strengths"),
});

export type SpecialistAssessment = z.infer<typeof SpecialistAssessmentSchema>;

// ── Types ────────────────────────────────────────────────────────────────────

export interface SpecialistConfig {
  /** Specialist dimension key (e.g. "ci", "tests", "arch", "domain", "docs") */
  dimension: DimensionAssessment["dimension"];
  /** System prompt (from .md file or fallback) */
  systemPrompt: string;
  /** LLM model instance */
  model: BaseChatModel;
  /** Repository inspection tools */
  tools: RepoTools;
}

// ── Specialist Node Factory ──────────────────────────────────────────────────

/**
 * Create a specialist node function that runs a ReAct agent with tool access.
 *
 * The returned function:
 * 1. Builds a ReAct agent with the specialist's system prompt and tools
 * 2. Sends the context preamble as the user message
 * 3. The agent loops: LLM → tool calls → tool execution → LLM → ...
 * 4. When the LLM produces a response with no tool calls, extracts JSON
 * 5. Returns a DimensionAssessment wrapped in the graph state shape
 *
 * Structured output (via Zod schema) is used when available to ensure
 * the LLM produces valid JSON. Falls back to manual extraction if the
 * model doesn't support withStructuredOutput().
 */
export function createSpecialistNode(config: SpecialistConfig) {
  const { dimension, systemPrompt, model, tools } = config;

  // Append structured output instructions to the system prompt
  const enhancedPrompt = `${systemPrompt}

CRITICAL: Your final response MUST be a valid JSON object matching this exact structure:
{
  "source": "foe-scanner-${dimension}",
  "foe_principle": "<Feedback|Understanding|Confidence>",
  "findings": { ... },
  "scores": {
    "<area_1>": { "score": <0-25>, "max": 25, "confidence": "<high|medium|low>", "evidence": [...] },
    "<area_2>": { "score": <0-25>, "max": 25, "confidence": "<high|medium|low>", "evidence": [...] },
    "<area_3>": { "score": <0-25>, "max": 25, "confidence": "<high|medium|low>", "evidence": [...] },
    "<area_4>": { "score": <0-25>, "max": 25, "confidence": "<high|medium|low>", "evidence": [...] }
  },
  "dimension_score": <sum of all scores>,
  "dimension_max": 100,
  "gaps": [{ "area": "...", "recommendation": "...", "impact": "<critical|high|medium|low>" }],
  "strengths": [{ "area": "...", "evidence": "..." }]
}

Return ONLY the JSON object. No markdown, no explanation, no code blocks.`;

  // Build a ReAct agent that will loop between LLM and tools
  const agent = createReactAgent({
    llm: model,
    tools,
    prompt: new SystemMessage(enhancedPrompt),
  });

  return async (state: ScanState): Promise<Partial<ScanState>> => {
    const contextMessage = makeContextPreamble({
      repositoryPath: state.repositoryPath,
      techStack: state.techStack,
      monorepo: state.monorepo,
      packages: state.packages,
    });

    try {
      const result = await agent.invoke(
        {
          messages: [new HumanMessage(contextMessage)],
        },
        {
          recursionLimit: MAX_ITERATIONS * 2 + 2,
        },
      );

      // Extract the final message content (the last AI message)
      const messages = result.messages;
      const lastMessage = messages[messages.length - 1];
      const text = extractTextContent(lastMessage);

      // Parse JSON from the response text
      const raw = extractJson(text);

      // Validate against the Zod schema if we got parseable JSON
      let validated: unknown = raw;
      if (raw && typeof raw === "object") {
        const parseResult = SpecialistAssessmentSchema.safeParse(raw);
        if (parseResult.success) {
          validated = parseResult.data;
        } else {
          // Schema validation failed — use raw JSON but log the issues.
          // The synthesize node handles partial/malformed data gracefully.
          validated = raw;
        }
      }

      const assessment: DimensionAssessment = {
        dimension,
        raw: validated ?? {
          error: "Failed to parse JSON from specialist response",
          rawText: text.slice(0, 500),
        },
      };

      return { assessments: [assessment] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const assessment: DimensionAssessment = {
        dimension,
        raw: { error: message, confidence: "low" },
      };
      return { assessments: [assessment] };
    }
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract text content from a LangChain message.
 */
function extractTextContent(message: unknown): string {
  if (!message || typeof message !== "object") return "";

  const msg = message as { content?: unknown };

  if (typeof msg.content === "string") {
    return msg.content;
  }

  if (Array.isArray(msg.content)) {
    return msg.content
      .filter(
        (c): c is { type: "text"; text: string } =>
          typeof c === "object" &&
          c !== null &&
          "type" in c &&
          c.type === "text",
      )
      .map((c) => c.text)
      .join("");
  }

  return String(msg.content ?? "");
}

/**
 * Extract a JSON object from LLM response text.
 * Handles cases where the LLM wraps JSON in markdown code blocks.
 *
 * This is the fallback path used when structured output isn't available
 * or the LLM doesn't respect the schema constraints.
 */
function extractJson(text: string): unknown | null {
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch {
    // Not direct JSON
  }

  // Try extracting from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Not valid JSON in code block
    }
  }

  // Try finding first { to last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      // Fall through
    }
  }

  return null;
}

// ── Pre-built Node Factories ─────────────────────────────────────────────────
// These convenience functions create specialist nodes with resolved prompts.

export function createCiNode(
  model: BaseChatModel,
  tools: RepoTools,
  prompt?: string,
) {
  return createSpecialistNode({
    dimension: "ci",
    systemPrompt: prompt ?? FALLBACK_PROMPTS.ci,
    model,
    tools,
  });
}

export function createTestsNode(
  model: BaseChatModel,
  tools: RepoTools,
  prompt?: string,
) {
  return createSpecialistNode({
    dimension: "tests",
    systemPrompt: prompt ?? FALLBACK_PROMPTS.tests,
    model,
    tools,
  });
}

export function createArchNode(
  model: BaseChatModel,
  tools: RepoTools,
  prompt?: string,
) {
  return createSpecialistNode({
    dimension: "arch",
    systemPrompt: prompt ?? FALLBACK_PROMPTS.arch,
    model,
    tools,
  });
}

export function createDomainNode(
  model: BaseChatModel,
  tools: RepoTools,
  prompt?: string,
) {
  return createSpecialistNode({
    dimension: "domain",
    systemPrompt: prompt ?? FALLBACK_PROMPTS.domain,
    model,
    tools,
  });
}

export function createDocsNode(
  model: BaseChatModel,
  tools: RepoTools,
  prompt?: string,
) {
  return createSpecialistNode({
    dimension: "docs",
    systemPrompt: prompt ?? FALLBACK_PROMPTS.docs,
    model,
    tools,
  });
}

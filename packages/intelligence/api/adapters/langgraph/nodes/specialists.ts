/**
 * LangGraph specialist node functions for the FOE scanner.
 *
 * Each function is a LangGraph node that calls an LLM with a specialist
 * system prompt and repository context, then parses the response into
 * a DimensionAssessment.
 */
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ScanState } from "../graphs/scanState.js";
import type { DimensionAssessment } from "../../../ports/ScanOrchestrator.js";
import {
  makeContextPreamble,
  CI_SYSTEM_PROMPT,
  TESTS_SYSTEM_PROMPT,
  ARCH_SYSTEM_PROMPT,
  DOMAIN_SYSTEM_PROMPT,
  DOCS_SYSTEM_PROMPT,
} from "./prompts.js";

/**
 * Create a specialist node function for a given dimension.
 *
 * The returned function:
 * 1. Builds a prompt from the specialist's system message + repo context
 * 2. Invokes the LLM
 * 3. Parses JSON from the response
 * 4. Returns a DimensionAssessment wrapped in the graph state shape
 */
export function createSpecialistNode(
  dimension: DimensionAssessment["dimension"],
  systemPrompt: string,
  model: BaseChatModel,
) {
  return async (
    state: ScanState,
  ): Promise<Partial<ScanState>> => {
    const contextMessage = makeContextPreamble({
      repositoryPath: state.repositoryPath,
      techStack: state.techStack,
      monorepo: state.monorepo,
      packages: state.packages,
    });

    try {
      const response = await model.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: contextMessage },
      ]);

      // Extract text content from the response
      const text =
        typeof response.content === "string"
          ? response.content
          : Array.isArray(response.content)
            ? response.content
                .filter((c): c is { type: "text"; text: string } => typeof c === "object" && c !== null && "type" in c && c.type === "text")
                .map((c) => c.text)
                .join("")
            : String(response.content);

      // Parse JSON from the response text
      const raw = extractJson(text);

      const assessment: DimensionAssessment = {
        dimension,
        raw: raw ?? { error: "Failed to parse JSON from LLM response", rawText: text.slice(0, 500) },
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

/**
 * Extract a JSON object from LLM response text.
 * Handles cases where the LLM wraps JSON in markdown code blocks.
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

/** Pre-built node factories for each specialist */
export function createCiNode(model: BaseChatModel) {
  return createSpecialistNode("ci", CI_SYSTEM_PROMPT, model);
}

export function createTestsNode(model: BaseChatModel) {
  return createSpecialistNode("tests", TESTS_SYSTEM_PROMPT, model);
}

export function createArchNode(model: BaseChatModel) {
  return createSpecialistNode("arch", ARCH_SYSTEM_PROMPT, model);
}

export function createDomainNode(model: BaseChatModel) {
  return createSpecialistNode("domain", DOMAIN_SYSTEM_PROMPT, model);
}

export function createDocsNode(model: BaseChatModel) {
  return createSpecialistNode("docs", DOCS_SYSTEM_PROMPT, model);
}

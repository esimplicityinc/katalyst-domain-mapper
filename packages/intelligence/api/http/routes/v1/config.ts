import Elysia, { t } from "elysia";
import type { LlmProvider } from "../../../config/env.js";

export function createConfigRoutes(deps: {
  getAnthropicApiKey: () => string | undefined;
  setAnthropicApiKey: (key: string) => void;
  getOpenrouterApiKey: () => string | undefined;
  setOpenrouterApiKey: (key: string) => void;
  getLlmApiKey: () => { key: string; provider: LlmProvider } | undefined;
  setLlmApiKey: (key: string) => void;
}) {
  return (
    new Elysia({ prefix: "/config" })

      // GET /config/status — check what's configured
      .get(
        "/status",
        () => {
          const llm = deps.getLlmApiKey();
          return {
            // Backward compat: true if any LLM key is set
            anthropicApiKey: !!deps.getAnthropicApiKey(),
            openrouterApiKey: !!deps.getOpenrouterApiKey(),
            // Which provider is currently active
            activeProvider: llm?.provider ?? null,
            scannerEnabled: !!llm,
          };
        },
        {
          detail: {
            summary: "Check API configuration status",
            tags: ["Config"],
          },
        },
      )

      // DELETE /config/api-key — clear all API keys
      .delete(
        "/api-key",
        () => {
          deps.setAnthropicApiKey("");
          deps.setOpenrouterApiKey("");
          return { message: "API key cleared" };
        },
        {
          detail: { summary: "Clear all LLM API keys", tags: ["Config"] },
        },
      )

      // PUT /config/api-key — set an LLM API key (auto-detects provider from prefix)
      .put(
        "/api-key",
        ({ body, set }) => {
          if (!body.apiKey || body.apiKey.trim().length === 0) {
            set.status = 400;
            return { error: "apiKey is required" };
          }

          const trimmed = body.apiKey.trim();
          deps.setLlmApiKey(trimmed);

          const llm = deps.getLlmApiKey();

          return {
            message: `API key configured (${llm?.provider ?? "unknown"} provider)`,
            provider: llm?.provider ?? null,
            scannerEnabled: true,
          };
        },
        {
          body: t.Object({
            apiKey: t.String({
              description:
                "LLM API key — Anthropic (sk-ant-...) or OpenRouter (sk-or-...)",
            }),
          }),
          detail: {
            summary: "Set LLM API key (auto-detects provider)",
            tags: ["Config"],
          },
        },
      )
  );
}

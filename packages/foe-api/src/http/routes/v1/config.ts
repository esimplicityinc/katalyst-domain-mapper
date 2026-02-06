import Elysia, { t } from "elysia";

export function createConfigRoutes(deps: {
  getAnthropicApiKey: () => string | undefined;
  setAnthropicApiKey: (key: string) => void;
}) {
  return new Elysia({ prefix: "/config" })

    // GET /config/status — check what's configured
    .get(
      "/status",
      () => {
        const hasKey = !!deps.getAnthropicApiKey();
        return {
          anthropicApiKey: hasKey,
          scannerEnabled: hasKey,
        };
      },
      {
        detail: { summary: "Check API configuration status", tags: ["Config"] },
      }
    )

    // PUT /config/api-key — set the Anthropic API key at runtime
    .put(
      "/api-key",
      ({ body, set }) => {
        if (!body.apiKey || body.apiKey.trim().length === 0) {
          set.status = 400;
          return { error: "apiKey is required" };
        }

        deps.setAnthropicApiKey(body.apiKey.trim());

        return {
          message: "API key configured",
          scannerEnabled: true,
        };
      },
      {
        body: t.Object({
          apiKey: t.String({ description: "Anthropic API key (sk-ant-...)" }),
        }),
        detail: { summary: "Set Anthropic API key", tags: ["Config"] },
      }
    );
}

import Elysia from "elysia";
import type { ScanOrchestrator } from "../../../ports/ScanOrchestrator.js";
import type { ChatOrchestrator } from "../../../ports/ChatOrchestrator.js";
import type { FeatureFlags } from "../../../ports/FeatureFlags.js";

/**
 * Orchestrator status route — exposes which agent runtime is active.
 *
 * GET /api/v1/orchestrator/status returns the current runtime for
 * both scan and chat pathways, along with feature flag values.
 */
export function createOrchestratorRoutes(deps: {
  scanOrchestrator: ScanOrchestrator;
  chatOrchestrator: ChatOrchestrator;
  featureFlags: FeatureFlags;
}) {
  return new Elysia({ prefix: "/orchestrator" })
    .get(
      "/status",
      async () => {
        const scanRuntime = deps.scanOrchestrator.runtime;
        const chatRuntime = deps.chatOrchestrator.runtime;

        const scanFlag = await deps.featureFlags.getStringValue(
          "scan.runtime",
          "opencode",
        );
        const chatFlag = await deps.featureFlags.getStringValue(
          "chat.runtime",
          "opencode",
        );

        return {
          scan: {
            runtime: scanRuntime,
            flagValue: scanFlag,
          },
          chat: {
            runtime: chatRuntime,
            flagValue: chatFlag,
          },
          supportedRuntimes: ["opencode", "langgraph"],
        };
      },
      {
        detail: {
          summary: "Get orchestrator runtime status",
          description:
            "Returns which agent runtime (OpenCode or LangGraph) is active for scan and chat pathways. Controlled by scan.runtime and chat.runtime feature flags.",
          tags: ["Config"],
        },
      },
    );
}

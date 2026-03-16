import Elysia from "elysia";
import type { FeatureFlags } from "../../../ports/FeatureFlags.js";

/**
 * Feature flags route — exposes flag values to the client.
 *
 * GET /api/v1/flags returns all evaluated flag values.
 * The client uses this to initialize the OpenFeature React provider.
 */
export function createFlagRoutes(deps: { featureFlags: FeatureFlags }) {
  return new Elysia({ prefix: "/flags" }).get(
    "/",
    async () => {
      return deps.featureFlags.getAllFlags();
    },
    {
      detail: {
        summary: "Get all feature flag values",
        description:
          "Returns current feature flag evaluations as a flat key-value map. Used by the web UI to initialize client-side flags.",
        tags: ["Config"],
      },
    },
  );
}

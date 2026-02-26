/**
 * Client-side OpenFeature initialization for React applications.
 *
 * This module provides helpers for setting up OpenFeature in the browser
 * using the React SDK. It receives pre-evaluated flag values from the server
 * (via GET /api/v1/flags) to ensure consistency.
 */

import { OpenFeature, InMemoryProvider } from "@openfeature/react-sdk";
import type { FlagKey } from "./flags.js";

/**
 * Build InMemoryProvider config from a flat flag value map (from server).
 * Each flag becomes a single-variant flag pointing to the server-evaluated value.
 */
function buildClientProviderConfig(
  flagValues: Record<string, boolean | string | number>,
) {
  const config: Record<
    string,
    {
      disabled: boolean;
      variants:
        | Record<string, boolean>
        | Record<string, string>
        | Record<string, number>;
      defaultVariant: string;
    }
  > = {};

  for (const [key, value] of Object.entries(flagValues)) {
    if (typeof value === "boolean") {
      config[key] = {
        disabled: false,
        variants: { on: true, off: false } satisfies Record<string, boolean>,
        defaultVariant: value ? "on" : "off",
      };
    } else if (typeof value === "number") {
      config[key] = {
        disabled: false,
        variants: { current: value } satisfies Record<string, number>,
        defaultVariant: "current",
      };
    } else {
      config[key] = {
        disabled: false,
        variants: { current: value } satisfies Record<string, string>,
        defaultVariant: "current",
      };
    }
  }

  return config;
}

/**
 * Initialize OpenFeature on the client side with server-provided flag values.
 *
 * Call this once at app startup, before rendering the OpenFeatureProvider.
 * The React SDK handles re-rendering automatically when the provider is ready.
 *
 * @param flagValues - Pre-evaluated flag values from GET /api/v1/flags
 */
export function initClientFlags(
  flagValues: Record<string, boolean | string | number>,
): void {
  const config = buildClientProviderConfig(flagValues);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OpenFeature.setProvider(new InMemoryProvider(config as any));
}

/**
 * Fetch flag values from the API and initialize the client provider.
 *
 * @param apiBaseUrl - Base URL for the API (defaults to same origin)
 */
export async function fetchAndInitFlags(
  apiBaseUrl: string = "",
): Promise<Record<string, boolean | string | number>> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/flags`);
    if (!response.ok) {
      console.warn(`[feature-flags] Failed to fetch flags: ${response.status}`);
      return {};
    }
    const data = await response.json();
    const flagValues = data.flags as Record<string, boolean | string | number>;
    initClientFlags(flagValues);
    return flagValues;
  } catch (error) {
    console.warn(
      "[feature-flags] Failed to fetch flags, using defaults",
      error,
    );
    return {};
  }
}

// Re-export React SDK essentials for consumer convenience
export {
  OpenFeature,
  OpenFeatureProvider,
  useFlag,
  useSuspenseFlag,
  useBooleanFlagValue,
  useBooleanFlagDetails,
  useStringFlagValue,
  useStringFlagDetails,
  useNumberFlagValue,
  useNumberFlagDetails,
  OpenFeatureTestProvider,
  InMemoryProvider,
} from "@openfeature/react-sdk";

export type { FlagKey };

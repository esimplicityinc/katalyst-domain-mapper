/**
 * Client-side feature flag initialization.
 *
 * Fetches flag values from the API and initializes the OpenFeature React provider.
 * Designed to be called once at app startup.
 */
import { fetchAndInitFlags } from "@foe/feature-flags/client";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

/** Cached flag values after fetch. Prevents redundant API calls. */
let flagsPromise: Promise<Record<string, boolean | string | number>> | null = null;

/**
 * Initialize feature flags by fetching from the API.
 * Returns cached promise if called multiple times.
 */
export function loadFlags(): Promise<Record<string, boolean | string | number>> {
  if (!flagsPromise) {
    flagsPromise = fetchAndInitFlags(API_BASE);
  }
  return flagsPromise;
}

// Re-export everything the UI needs from the client SDK
export {
  OpenFeatureProvider,
  useFlag,
  useBooleanFlagValue,
  useStringFlagValue,
  useNumberFlagValue,
  OpenFeatureTestProvider,
} from "@foe/feature-flags/client";

export { FLAG_KEYS } from "@foe/feature-flags/flags";

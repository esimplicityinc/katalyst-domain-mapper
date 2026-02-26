/**
 * @foe/feature-flags
 *
 * Vendor-agnostic feature flag management for the Katalyst platform.
 * Built on OpenFeature for provider portability.
 *
 * Entry points:
 *   - @foe/feature-flags/server  → Server-side (Bun/Node.js) flag evaluation
 *   - @foe/feature-flags/client  → Client-side (React) flag consumption
 *   - @foe/feature-flags/flags   → Typed flag keys and configuration schemas
 */

// Re-export shared flag definitions and types
export {
  FLAG_KEYS,
  FlagConfigSchema,
  FlagDefinitionSchema,
  FlagVariantsSchema,
  flagKeyToEnvVar,
  ENV_PREFIX,
  type FlagKey,
  type FlagConfig,
  type FlagDefinition,
  type FlagTypes,
} from "./flags.js";

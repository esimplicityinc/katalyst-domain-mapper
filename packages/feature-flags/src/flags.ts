import { z } from "zod";

// ── Flag configuration schema ────────────────────────────────────────────────
// Validates the flags.json format using Zod for runtime safety.

export const FlagVariantsSchema = z.record(
  z.string(),
  z.union([z.boolean(), z.number(), z.string()]),
);

export const FlagDefinitionSchema = z.object({
  description: z.string(),
  disabled: z.boolean().default(false),
  variants: FlagVariantsSchema,
  defaultVariant: z.string(),
  flagType: z.enum(["boolean", "string", "number"]),
});

export const FlagConfigSchema = z.object({
  flags: z.record(z.string(), FlagDefinitionSchema),
});

export type FlagDefinition = z.infer<typeof FlagDefinitionSchema>;
export type FlagConfig = z.infer<typeof FlagConfigSchema>;

// ── Typed flag keys ──────────────────────────────────────────────────────────
// Single source of truth for all flag key strings.
// Using a const object gives us autocompletion + compile-time safety.

export const FLAG_KEYS = {
  /** Controls whether the repository scanning feature is available */
  SCANNER_ENABLED: "scanner-enabled",
  /** Enables the new domain model editor experience */
  DOMAIN_MODEL_V2: "domain-model-v2",
  /** Enables strict mode for landscape linting */
  LANDSCAPE_LINT_STRICT: "landscape-lint-strict",
  /** Enables AI-powered insights in FOE scan reports */
  AI_INSIGHTS_ENABLED: "ai-insights-enabled",
  /** Enables the next-generation governance dashboard */
  GOVERNANCE_V2: "governance-v2",
  /** Maximum number of concurrent scan jobs allowed */
  MAX_CONCURRENT_SCANS: "max-concurrent-scans",
} as const;

/** Union type of all valid flag key values */
export type FlagKey = (typeof FLAG_KEYS)[keyof typeof FLAG_KEYS];

/** Type mapping from flag key to its expected value type */
export interface FlagTypes {
  [FLAG_KEYS.SCANNER_ENABLED]: boolean;
  [FLAG_KEYS.DOMAIN_MODEL_V2]: boolean;
  [FLAG_KEYS.LANDSCAPE_LINT_STRICT]: boolean;
  [FLAG_KEYS.AI_INSIGHTS_ENABLED]: boolean;
  [FLAG_KEYS.GOVERNANCE_V2]: boolean;
  [FLAG_KEYS.MAX_CONCURRENT_SCANS]: number;
}

// ── Environment variable override prefix ─────────────────────────────────────
// Flags can be overridden via environment variables using the pattern:
//   FF_SCANNER_ENABLED=true
//   FF_MAX_CONCURRENT_SCANS=5

export const ENV_PREFIX = "FF_";

/**
 * Convert a flag key (e.g. "scanner-enabled") to its env var name (e.g. "FF_SCANNER_ENABLED").
 */
export function flagKeyToEnvVar(flagKey: string): string {
  return `${ENV_PREFIX}${flagKey.replace(/-/g, "_").toUpperCase()}`;
}

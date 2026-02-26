/// <reference types="@types/bun" />
import {
  OpenFeature,
  InMemoryProvider as ServerInMemoryProvider,
} from "@openfeature/server-sdk";
import {
  FlagConfigSchema,
  flagKeyToEnvVar,
  type FlagConfig,
  type FlagDefinition,
} from "./flags.js";

/** InMemoryProvider flag configuration shape (mirrors OpenFeature's internal FlagConfiguration type). */
type FlagEntry = {
  disabled: boolean;
  variants: Record<string, boolean | string | number>;
  defaultVariant: string;
};
type ProviderConfig = Record<string, FlagEntry>;

/**
 * Converts our flags.json format into the OpenFeature InMemoryProvider format,
 * applying environment variable overrides where present.
 */
export function buildProviderConfig(flagConfig: FlagConfig): ProviderConfig {
  const config: ProviderConfig = {};

  for (const [key, def] of Object.entries(flagConfig.flags)) {
    // Check for environment variable override
    const envVar = flagKeyToEnvVar(key);
    const envValue = process.env[envVar];
    let defaultVariant = def.defaultVariant;

    if (envValue !== undefined && envValue !== "") {
      // Find a matching variant or create an override variant
      const matchingVariant = Object.entries(def.variants).find(
        ([, v]) => String(v) === envValue,
      );

      if (matchingVariant) {
        defaultVariant = matchingVariant[0];
      } else {
        // Create a runtime override variant
        let parsedValue: boolean | number | string = envValue;
        if (def.flagType === "boolean") {
          parsedValue = envValue.toLowerCase() === "true" || envValue === "1";
        } else if (def.flagType === "number") {
          parsedValue = Number(envValue);
        }

        (def.variants as Record<string, boolean | string | number>)[
          "_env_override"
        ] = parsedValue;
        defaultVariant = "_env_override";
      }
    }

    config[key] = {
      disabled: def.disabled,
      variants: def.variants as Record<string, boolean | string | number>,
      defaultVariant,
    };
  }

  return config;
}

export interface ServerFlagOptions {
  /** Override the default flag config (useful for testing) */
  flagConfig?: FlagConfig;
  /** Override the provider (for swapping to flagd, LaunchDarkly, etc.) */
  provider?: InstanceType<typeof ServerInMemoryProvider>;
}

/**
 * Initialize OpenFeature on the server side.
 *
 * Reads flags.json, applies environment variable overrides,
 * and registers the InMemoryProvider with the OpenFeature SDK.
 *
 * @returns The OpenFeature client for evaluating flags.
 */
export async function initServerFlags(options?: ServerFlagOptions) {
  let flagConfig: FlagConfig;

  if (options?.flagConfig) {
    flagConfig = options.flagConfig;
  } else {
    // Load and validate flags.json
    const flagsPath = new URL("../flags.json", import.meta.url);
    const raw = await Bun.file(flagsPath).json();
    flagConfig = FlagConfigSchema.parse(raw);
  }

  const providerConfig = buildProviderConfig(flagConfig);

  if (options?.provider) {
    await OpenFeature.setProviderAndWait(options.provider);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await OpenFeature.setProviderAndWait(
      new ServerInMemoryProvider(providerConfig as any),
    );
  }

  return OpenFeature.getClient();
}

/**
 * Evaluate all flags and return a flat key->value map.
 * Used by the /api/v1/flags endpoint to send current flag values to the client.
 */
export async function evaluateAllFlags(
  flagConfig?: FlagConfig,
): Promise<Record<string, boolean | string | number>> {
  let config: FlagConfig;

  if (flagConfig) {
    config = flagConfig;
  } else {
    const flagsPath = new URL("../flags.json", import.meta.url);
    const raw = await Bun.file(flagsPath).json();
    config = FlagConfigSchema.parse(raw);
  }

  const client = OpenFeature.getClient();
  const result: Record<string, boolean | string | number> = {};

  for (const [key, def] of Object.entries(config.flags)) {
    switch (def.flagType) {
      case "boolean":
        result[key] = await client.getBooleanValue(key, false);
        break;
      case "string":
        result[key] = await client.getStringValue(key, "");
        break;
      case "number":
        result[key] = await client.getNumberValue(key, 0);
        break;
    }
  }

  return result;
}

// Re-export for convenience
export { OpenFeature } from "@openfeature/server-sdk";
export type { Client as ServerClient } from "@openfeature/server-sdk";

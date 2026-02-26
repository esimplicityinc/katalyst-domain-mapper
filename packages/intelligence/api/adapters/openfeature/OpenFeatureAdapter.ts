import type { FeatureFlags } from "../../ports/FeatureFlags.js";
import type { Client } from "@openfeature/server-sdk";
import { evaluateAllFlags } from "@foe/feature-flags/server";

/**
 * OpenFeature adapter — implements the FeatureFlags port using the OpenFeature Server SDK.
 *
 * This adapter bridges the application layer (which depends on the FeatureFlags port)
 * to the OpenFeature infrastructure. Swapping providers (InMemory → flagd → LaunchDarkly)
 * happens at the provider level, not here.
 */
export class OpenFeatureAdapter implements FeatureFlags {
  constructor(private readonly client: Client) {}

  async getBooleanValue(flagKey: string, defaultValue: boolean): Promise<boolean> {
    return this.client.getBooleanValue(flagKey, defaultValue);
  }

  async getStringValue(flagKey: string, defaultValue: string): Promise<string> {
    return this.client.getStringValue(flagKey, defaultValue);
  }

  async getNumberValue(flagKey: string, defaultValue: number): Promise<number> {
    return this.client.getNumberValue(flagKey, defaultValue);
  }

  async getAllFlags(): Promise<Record<string, boolean | string | number>> {
    return evaluateAllFlags();
  }
}

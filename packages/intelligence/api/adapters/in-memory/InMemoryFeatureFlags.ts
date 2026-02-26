import type { FeatureFlags } from "../../ports/FeatureFlags.js";

/**
 * In-memory feature flags implementation for testing.
 *
 * Allows tests to control flag values without the OpenFeature SDK.
 * Follows the same pattern as ScanJobRepositoryInMemory / ReportRepositoryInMemory.
 */
export class InMemoryFeatureFlags implements FeatureFlags {
  private flags: Map<string, boolean | string | number> = new Map();

  constructor(initialFlags?: Record<string, boolean | string | number>) {
    if (initialFlags) {
      for (const [key, value] of Object.entries(initialFlags)) {
        this.flags.set(key, value);
      }
    }
  }

  /** Set a flag value at runtime (useful in tests). */
  setFlag(key: string, value: boolean | string | number): void {
    this.flags.set(key, value);
  }

  /** Clear all flag overrides. */
  clear(): void {
    this.flags.clear();
  }

  async getBooleanValue(flagKey: string, defaultValue: boolean): Promise<boolean> {
    const value = this.flags.get(flagKey);
    return typeof value === "boolean" ? value : defaultValue;
  }

  async getStringValue(flagKey: string, defaultValue: string): Promise<string> {
    const value = this.flags.get(flagKey);
    return typeof value === "string" ? value : defaultValue;
  }

  async getNumberValue(flagKey: string, defaultValue: number): Promise<number> {
    const value = this.flags.get(flagKey);
    return typeof value === "number" ? value : defaultValue;
  }

  async getAllFlags(): Promise<Record<string, boolean | string | number>> {
    const result: Record<string, boolean | string | number> = {};
    for (const [key, value] of this.flags) {
      result[key] = value;
    }
    return result;
  }
}

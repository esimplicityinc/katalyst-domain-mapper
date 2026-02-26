/**
 * FeatureFlags port — abstracts feature flag evaluation from infrastructure.
 *
 * This port follows the same pattern as Logger, ReportRepository, etc.
 * Domain and application layers depend on this interface, never on OpenFeature directly.
 */
export interface FeatureFlags {
  /** Evaluate a boolean feature flag. Returns defaultValue if flag is not found or evaluation fails. */
  getBooleanValue(flagKey: string, defaultValue: boolean): Promise<boolean>;

  /** Evaluate a string feature flag. Returns defaultValue if flag is not found or evaluation fails. */
  getStringValue(flagKey: string, defaultValue: string): Promise<string>;

  /** Evaluate a numeric feature flag. Returns defaultValue if flag is not found or evaluation fails. */
  getNumberValue(flagKey: string, defaultValue: number): Promise<number>;

  /** Evaluate all flags and return a flat key→value map. Used by the flags API endpoint. */
  getAllFlags(): Promise<Record<string, boolean | string | number>>;
}

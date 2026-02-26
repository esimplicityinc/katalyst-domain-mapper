import { useFlag } from "../flags";
import type { FlagKey } from "@foe/feature-flags/flags";

interface FeatureGateProps {
  /** The feature flag key to evaluate */
  flag: FlagKey;
  /** Content to render when the flag is enabled (truthy) */
  children: React.ReactNode;
  /** Optional content to render when the flag is disabled */
  fallback?: React.ReactNode;
}

/**
 * FeatureGate — conditionally renders children based on a boolean feature flag.
 *
 * Usage:
 * ```tsx
 * <FeatureGate flag="domain-model-v2" fallback={<LegacyEditor />}>
 *   <NewEditor />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  const { value: isEnabled } = useFlag(flag, false);

  if (isEnabled) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

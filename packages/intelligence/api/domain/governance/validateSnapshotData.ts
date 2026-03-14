import { taxonomy } from "@foe/schemas";
import { GovernanceValidationError } from "./GovernanceErrors.js";

// ── Re-export the type from @foe/schemas ───────────────────────────────────
// Consumers that import `ValidatedSnapshotData` will now get the Zod-inferred type.
export type ValidatedSnapshotData = taxonomy.GovernanceSnapshotInput;

// ── Validation Function ────────────────────────────────────────────────────
// Now delegates to the Zod schema for validation instead of hand-written checks.

export function validateSnapshotData(data: unknown): ValidatedSnapshotData {
  const result = taxonomy.GovernanceSnapshotInputSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.errors[0];
    const path = firstError?.path?.join(".") ?? "";
    const message = firstError?.message ?? "Invalid governance snapshot data";
    throw new GovernanceValidationError(
      path ? `Validation error at ${path}: ${message}` : message,
    );
  }
  return result.data;
}

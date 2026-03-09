/**
 * @katalyst/vocabulary
 *
 * Vocabulary management for Katalyst - methods, observations, keywords, and ubiquitous language.
 */

export * from "./config.js";
export * from "./parsers/index.js";
export * from "./builders/index.js";

// Re-export types from schemas for convenience
export type {
  Method,
  Observation,
  MethodsIndex,
} from "@foe/schemas/field-guide";

// Re-export taxonomy types (via namespace, formerly governance)
export type { taxonomy } from "@foe/schemas";

// Export CML adapter
export { CMLWriter } from "./adapters/cml/index.js";

/**
 * @foe/schemas
 *
 * Zod schemas for Flow Optimized Engineering (FOE) ecosystem.
 *
 * This package provides type-safe schemas for:
 * - FOE scan results and assessments
 * - Field Guide methods and observations
 * - Neo4j graph database nodes and relationships
 *
 * All schemas are validated using Zod for runtime type safety.
 */

// Scan schemas
export * from "./scan/index.js";

// Field Guide schemas
export * from "./field-guide/index.js";

// Neo4j graph schemas
export * from "./graph/index.js";

// DDD domain modeling schemas
export * from "./ddd/index.js";

// Governance schemas (namespaced to avoid conflicts with existing ddd/ exports)
export * as governance from "./governance/index.js";

/**
 * Package version
 */
export const VERSION = "0.1.0";

/**
 * @foe/schemas
 *
 * Zod schemas for Flow Optimized Engineering (FOE) ecosystem.
 *
 * This package provides type-safe schemas for:
 * - FOE scan results and assessments
 * - Field Guide methods and observations
 * - Neo4j graph database nodes and relationships
 * - Unified taxonomy (DDD domain modeling + governance lifecycle)
 *
 * All schemas are validated using Zod for runtime type safety.
 */

// Scan schemas
export * from "./scan/index.js";

// Field Guide schemas
export * from "./field-guide/index.js";

// Neo4j graph schemas
export * from "./graph/index.js";

// Taxonomy schemas (unified: DDD + governance + infrastructure)
// Namespaced to avoid collisions with scan PrioritySchema/Priority
export * as taxonomy from "./taxonomy/index.js";

/**
 * Package version
 */
export const VERSION = "0.2.0";

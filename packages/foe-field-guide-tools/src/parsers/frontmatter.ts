import matter from "gray-matter";
import { relative } from "node:path";
import { DOCS_ROOT } from "../config.js";

/**
 * Parse frontmatter from markdown content
 */
export function parseFrontmatter(content: string): {
  data: Record<string, any>;
  content: string;
} {
  const result = matter(content);
  return {
    data: result.data,
    content: result.content,
  };
}

/**
 * Normalize observation references to just the ID
 * Handles formats:
 * - "O123" -> "O123"
 * - "internal/O123-slug" -> "O123"
 * - "external/O123-slug" -> "O123"
 * - "observations/internal/O123-slug" -> "O123"
 * - "observations/external/O123-slug" -> "O123"
 */
export function normalizeObservationRef(ref: string): string {
  // Remove leading "observations/" directory if present
  let cleaned = ref.replace(/^observations\//, "");
  
  // Remove "internal/" or "external/" prefix
  cleaned = cleaned.replace(/^(internal|external)\//, "");

  // Extract observation ID (O followed by digits)
  const match = cleaned.match(/^(O\d+)/);
  if (match) {
    return match[1];
  }

  // If no match, return original (will likely fail validation)
  return ref;
}

/**
 * Extract field guide ID from file path
 * Example: /path/to/field-guides/agentic-coding/methods/M001.md -> "agentic-coding"
 */
export function extractFieldGuide(filePath: string): string | null {
  const match = filePath.match(/field-guides\/([^/]+)\//);
  return match ? match[1] : null;
}

/**
 * Extract framework name from file path
 * Example: /path/to/external-frameworks/dora/methods/M111.md -> "dora"
 */
export function extractFramework(filePath: string): string | null {
  const match = filePath.match(/external-frameworks\/([^/]+)\//);
  return match ? match[1] : null;
}

/**
 * Convert absolute path to relative path from docs root
 * Example: /Users/.../docs/docs/field-guides/agentic-coding/methods/M001.md
 *       -> field-guides/agentic-coding/methods/M001.md
 */
export function makeRelativePath(absolutePath: string): string {
  return relative(DOCS_ROOT, absolutePath);
}

/**
 * Determine if a method is from an external framework based on file path
 */
export function isExternalFramework(filePath: string): boolean {
  return filePath.includes("/external-frameworks/");
}

/**
 * Determine if an observation is external based on file path
 */
export function isExternalObservation(filePath: string): boolean {
  return filePath.includes("/observations/external/");
}

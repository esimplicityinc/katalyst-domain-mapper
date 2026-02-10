import type { Method } from "@foe/schemas/field-guide";
import { MethodSchema } from "@foe/schemas/field-guide";
import { readFile } from "node:fs/promises";
import {
  parseFrontmatter,
  normalizeObservationRef,
  extractFieldGuide,
  extractFramework,
  makeRelativePath,
} from "./frontmatter.js";
import { extractKeywords } from "../builders/keywords.js";

/**
 * Method frontmatter shape (before validation)
 */
interface MethodFrontmatter {
  methodId: string;
  title: string;
  maturity?: string;
  foe_maturity?: string;
  description?: string;
  observations?: string[];
  sidebar_position?: number;
  external_method?: {
    framework: string;
    method: string;
    id?: string;
  };
  pillar?: string;
}

/**
 * Parse a method markdown file
 */
export async function parseMethodFile(filePath: string): Promise<Method> {
  const fileContent = await readFile(filePath, "utf-8");
  const { data, content } = parseFrontmatter(fileContent);

  // Check if this is an external framework file
  const framework = extractFramework(filePath);
  const isExternal = !!framework || !!data.external_method;

  // Determine maturity (could be 'maturity' or 'foe_maturity' for external methods)
  const maturity = (data.foe_maturity || data.maturity) as Method["maturity"];

  // External framework methods don't require maturity (they're canonical framework definitions)
  // But field guide methods and adopted external methods do
  if (!isExternal && !maturity) {
    throw new Error(
      `Method ${data.methodId} missing maturity field in ${filePath}`,
    );
  }

  // Normalize observation references
  const observations = data.observations
    ? (data.observations as string[]).map(normalizeObservationRef)
    : undefined;

  // Build method object
  const method: Partial<Method> = {
    methodId: data.methodId,
    title: data.title,
    description: data.description,
    fieldGuide: extractFieldGuide(filePath) ?? undefined,
    observations,
    keywords: extractKeywords(data.title, content),
    path: makeRelativePath(filePath),
    sidebarPosition: data.sidebar_position,
  };

  // Set maturity only if provided
  if (maturity) {
    method.maturity = maturity;
  }

  // Handle external methods adopted in field guides
  if (data.external_method) {
    method.external = {
      framework: data.external_method.framework,
      method: data.external_method.method,
    };
    if (maturity) {
      method.foeMaturity = maturity;
    }
  }

  // Handle external framework detection from path
  if (framework && !method.external) {
    // This is an external framework method file
    method.external = {
      framework,
      method: data.methodId.toLowerCase(), // Use methodId as slug
    };
  }

  // Handle pillar (for external framework methods like DORA)
  if (data.pillar) {
    method.pillar = data.pillar;
  }

  // Validate against schema
  try {
    return MethodSchema.parse(method);
  } catch (err: any) {
    throw new Error(
      `Method ${data.methodId} validation failed in ${filePath}: ${err.message}`,
    );
  }
}

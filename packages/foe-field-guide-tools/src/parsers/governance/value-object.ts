import { governance } from "@foe/schemas";
import { readFile } from "node:fs/promises";
import { parseFrontmatter } from "../frontmatter.js";
import { makeGovernancePath } from "../governance-helpers.js";

/**
 * Parse a value object markdown file (ddd/value-objects/<slug>.md).
 *
 * Maps snake_case frontmatter fields to camelCase schema fields:
 *   validation_rules → validationRules
 *   source_file → sourceFile
 */
export async function parseValueObjectFile(
  filePath: string,
): Promise<governance.ValueObject> {
  const fileContent = await readFile(filePath, "utf-8");
  const { data } = parseFrontmatter(fileContent);

  const mapped = {
    slug: data.slug,
    title: data.title,
    context: data.context,
    description: data.description,
    properties: data.properties,
    validationRules: data.validation_rules,
    immutable: data.immutable,
    sourceFile: data.source_file,
    path: makeGovernancePath(filePath),
  };

  try {
    return governance.ValueObjectSchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Value object ${data.slug} validation failed in ${filePath}: ${message}`,
    );
  }
}

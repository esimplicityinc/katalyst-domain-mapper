import { governance } from "@foe/schemas";
import { readFile } from "node:fs/promises";
import { parseFrontmatter } from "../frontmatter.js";
import { makeGovernancePath } from "../governance-helpers.js";

/**
 * Parse a domain event markdown file (ddd/events/<slug>.md).
 *
 * Maps snake_case frontmatter fields to camelCase schema fields:
 *   consumed_by → consumedBy
 *   side_effects → sideEffects
 *   source_file → sourceFile
 */
export async function parseDomainEventFile(
  filePath: string,
): Promise<governance.DomainEvent> {
  const fileContent = await readFile(filePath, "utf-8");
  const { data } = parseFrontmatter(fileContent);

  const mapped = {
    slug: data.slug,
    title: data.title,
    context: data.context,
    aggregate: data.aggregate || undefined,
    description: data.description,
    payload: data.payload,
    consumedBy: data.consumed_by,
    triggers: data.triggers,
    sideEffects: data.side_effects,
    sourceFile: data.source_file,
    path: makeGovernancePath(filePath),
  };

  try {
    return governance.DomainEventSchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Domain event ${data.slug} validation failed in ${filePath}: ${message}`,
    );
  }
}

import { taxonomy } from "@foe/schemas";
import { readFile } from "node:fs/promises";
import { parseFrontmatter } from "../frontmatter.js";
import { makeGovernancePath } from "../governance-helpers.js";

/**
 * Parse a use case markdown file (UC-xxx.md).
 *
 * Maps snake_case frontmatter fields to camelCase schema fields:
 *   main_flow → mainFlow
 *   alternative_flows → alternativeFlows
 */
export async function parseUseCaseFile(
  filePath: string,
): Promise<taxonomy.UseCaseExt> {
  const fileContent = await readFile(filePath, "utf-8");
  const { data } = parseFrontmatter(fileContent);

  const mapped = {
    id: data.id,
    title: data.title,
    description: data.description,
    actors: data.actors,
    preconditions: data.preconditions,
    postconditions: data.postconditions,
    mainFlow: data.main_flow,
    alternativeFlows: data.alternative_flows,
    path: makeGovernancePath(filePath),
  };

  try {
    return taxonomy.UseCaseExtSchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Use case ${data.id} validation failed in ${filePath}: ${message}`,
    );
  }
}

import { taxonomy } from "@foe/schemas";
import { readFile } from "node:fs/promises";
import { parseFrontmatter } from "../frontmatter.js";

/**
 * Parse a competency markdown file (competencies/COMP-*.md).
 *
 * Frontmatter fields map 1:1 to schema (no snake_case conversion needed).
 */
export async function parseCompetencyFile(
  filePath: string,
): Promise<taxonomy.CompetencyExt> {
  const fileContent = await readFile(filePath, "utf-8");
  const { data } = parseFrontmatter(fileContent);

  const mapped = {
    title: data.title,
    practiceAreaId: data.practiceAreaId,
    competencyType: data.competencyType,
    skills: data.skills ?? [],
    levelDefinitions: data.levelDefinitions,
    dependencies: data.dependencies ?? [],
  };

  try {
    return taxonomy.CompetencyExtSchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Competency validation failed in ${filePath}: ${message}`);
  }
}

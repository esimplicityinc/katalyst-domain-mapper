import { taxonomy } from "@foe/schemas";
import { readFile } from "node:fs/promises";
import { parseFrontmatter } from "../frontmatter.js";

/**
 * Parse a practice area markdown file (practice-areas/PA-*.md).
 *
 * Frontmatter fields map 1:1 to schema (no snake_case conversion needed).
 */
export async function parsePracticeAreaFile(
  filePath: string,
): Promise<taxonomy.PracticeAreaExt> {
  const fileContent = await readFile(filePath, "utf-8");
  const { data } = parseFrontmatter(fileContent);

  const mapped = {
    title: data.title,
    canonical: data.canonical ?? false,
    pillars: data.pillars ?? [],
    competencies: data.competencies ?? [],
    methods: data.methods ?? [],
    tools: data.tools ?? [],
  };

  try {
    return taxonomy.PracticeAreaExtSchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Practice area validation failed in ${filePath}: ${message}`,
    );
  }
}

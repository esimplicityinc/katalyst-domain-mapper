import { governance } from '@foe/schemas';
import { readFile } from 'node:fs/promises';
import { parseFrontmatter } from '../frontmatter.js';
import { makeGovernancePath } from '../governance-helpers.js';

/**
 * Parse a user story markdown file (US-xxx.md).
 *
 * Maps snake_case frontmatter fields to camelCase schema fields:
 *   use_cases → useCases
 *   acceptance_criteria → acceptanceCriteria
 */
export async function parseUserStoryFile(filePath: string): Promise<governance.UserStory> {
  const fileContent = await readFile(filePath, 'utf-8');
  const { data } = parseFrontmatter(fileContent);

  const mapped = {
    id: data.id,
    title: data.title,
    persona: data.persona,
    status: data.status,
    capabilities: data.capabilities,
    useCases: data.use_cases,
    acceptanceCriteria: data.acceptance_criteria,
    path: makeGovernancePath(filePath),
  };

  try {
    return governance.UserStorySchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`User story ${data.id} validation failed in ${filePath}: ${message}`);
  }
}

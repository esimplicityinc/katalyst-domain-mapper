import { governance } from '@foe/schemas';
import { readFile } from 'node:fs/promises';
import { parseFrontmatter } from '../frontmatter.js';
import { makeGovernancePath } from '../governance-helpers.js';

/**
 * Parse an ADR markdown file (ADR-xxx.md).
 *
 * Maps snake_case frontmatter fields to camelCase schema fields:
 *   superseded_by → supersededBy
 *
 * Note: Empty string supersededBy is omitted (schema expects optional AdrIdPattern).
 */
export async function parseAdrFile(filePath: string): Promise<governance.Adr> {
  const fileContent = await readFile(filePath, 'utf-8');
  const { data } = parseFrontmatter(fileContent);

  const mapped: Record<string, unknown> = {
    id: data.id,
    title: data.title,
    status: data.status,
    category: data.category,
    scope: data.scope || 'project-wide',
    created: data.created,
    updated: data.updated,
    path: makeGovernancePath(filePath),
  };

  // Only include supersededBy if it's a non-empty string (schema expects ADR-xxx pattern)
  if (data.superseded_by && typeof data.superseded_by === 'string' && data.superseded_by.trim() !== '') {
    mapped.supersededBy = data.superseded_by;
  }

  try {
    return governance.AdrSchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`ADR ${data.id} validation failed in ${filePath}: ${message}`);
  }
}

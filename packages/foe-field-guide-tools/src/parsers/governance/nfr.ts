import { governance } from '@foe/schemas';
import { readFile } from 'node:fs/promises';
import { parseFrontmatter } from '../frontmatter.js';
import { makeGovernancePath, mapMoscowPriority } from '../governance-helpers.js';

/**
 * Parse an NFR markdown file (NFR-xxx-yyy.md).
 *
 * NFR frontmatter uses MoSCoW priority values (must/should/could) which
 * are mapped to the PrioritySchema values (high/medium/low).
 */
export async function parseNfrFile(filePath: string): Promise<governance.Nfr> {
  const fileContent = await readFile(filePath, 'utf-8');
  const { data } = parseFrontmatter(fileContent);

  const mapped = {
    id: data.id,
    title: data.title,
    category: data.category,
    priority: mapMoscowPriority(data.priority),
    status: data.status,
    created: data.created,
    threshold: data.threshold,
    measurement: data.measurement,
    path: makeGovernancePath(filePath),
  };

  try {
    return governance.NfrSchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`NFR ${data.id} validation failed in ${filePath}: ${message}`);
  }
}

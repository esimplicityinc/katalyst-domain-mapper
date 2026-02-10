import { governance } from '@foe/schemas';
import { readFile } from 'node:fs/promises';
import { parseFrontmatter } from '../frontmatter.js';
import { makeGovernancePath } from '../governance-helpers.js';

/**
 * Parse a bounded context markdown file (ddd/contexts/<slug>.md).
 *
 * Maps snake_case frontmatter fields to camelCase schema fields:
 *   source_directory → sourceDirectory
 *   communication_pattern → communicationPattern
 *   upstream_contexts → upstreamContexts
 *   downstream_contexts → downstreamContexts
 *   team_ownership → teamOwnership
 */
export async function parseBoundedContextFile(filePath: string): Promise<governance.BoundedContext> {
  const fileContent = await readFile(filePath, 'utf-8');
  const { data } = parseFrontmatter(fileContent);

  const mapped = {
    slug: data.slug,
    title: data.title,
    description: data.description,
    responsibility: data.responsibility,
    sourceDirectory: data.source_directory,
    aggregates: data.aggregates,
    communicationPattern: data.communication_pattern,
    upstreamContexts: data.upstream_contexts,
    downstreamContexts: data.downstream_contexts,
    teamOwnership: data.team_ownership,
    status: data.status,
    subdomainType: data.subdomain_type,
    path: makeGovernancePath(filePath),
  };

  try {
    return governance.BoundedContextSchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Bounded context ${data.slug} validation failed in ${filePath}: ${message}`);
  }
}

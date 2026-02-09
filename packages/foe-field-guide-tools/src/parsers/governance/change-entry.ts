import { governance } from '@foe/schemas';
import { readFile } from 'node:fs/promises';
import { parseFrontmatter } from '../frontmatter.js';
import { makeGovernancePath } from '../governance-helpers.js';

/**
 * Parse a change entry markdown file (CHANGE-xxx.md).
 *
 * Maps snake_case frontmatter fields to camelCase schema fields:
 *   road_id → roadId
 *   compliance.adr_check → compliance.adrCheck
 *   compliance.bdd_check → compliance.bddCheck
 *   compliance.nfr_checks → compliance.nfrChecks
 */
export async function parseChangeEntryFile(filePath: string): Promise<governance.ChangeEntry> {
  const fileContent = await readFile(filePath, 'utf-8');
  const { data } = parseFrontmatter(fileContent);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const mapNfrCheck = (check: any) => ({
    status: check?.status || 'pending',
    evidence: check?.evidence || '',
    validatedBy: check?.validated_by || check?.validatedBy || '',
  });

  const mapped = {
    id: data.id,
    roadId: data.road_id,
    title: data.title,
    date: data.date,
    version: data.version,
    status: data.status,
    categories: data.categories,
    compliance: {
      adrCheck: {
        status: data.compliance?.adr_check?.status || 'pending',
        validatedBy: data.compliance?.adr_check?.validated_by || data.compliance?.adr_check?.validatedBy || '',
        validatedAt: data.compliance?.adr_check?.validated_at || data.compliance?.adr_check?.validatedAt || '',
        notes: data.compliance?.adr_check?.notes || '',
      },
      bddCheck: {
        status: data.compliance?.bdd_check?.status || 'pending',
        scenarios: data.compliance?.bdd_check?.scenarios || 0,
        passed: data.compliance?.bdd_check?.passed || 0,
        coverage: data.compliance?.bdd_check?.coverage || '0%',
      },
      nfrChecks: {
        performance: mapNfrCheck(data.compliance?.nfr_checks?.performance),
        security: mapNfrCheck(data.compliance?.nfr_checks?.security),
        accessibility: mapNfrCheck(data.compliance?.nfr_checks?.accessibility),
      },
    },
    signatures: (data.signatures || []).map((s: any) => ({
      agent: s.agent,
      role: s.role,
      status: s.status,
      timestamp: s.timestamp,
    })),
    path: makeGovernancePath(filePath),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  try {
    return governance.ChangeEntrySchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Change entry ${data.id} validation failed in ${filePath}: ${message}`);
  }
}

import { governance } from '@foe/schemas';
import { readFile } from 'node:fs/promises';
import { parseFrontmatter } from '../frontmatter.js';
import { makeGovernancePath } from '../governance-helpers.js';

/**
 * Parse a road item markdown file (ROAD-xxx.md).
 *
 * This is the most complex parser due to the nested governance block
 * and dependency mapping:
 *   dependencies.requires → dependsOn
 *   dependencies.blocked_by → blockedBy
 *   dependencies.enables → blocks
 *   governance.adrs.validated_by → governance.adrs.validatedBy
 *   governance.adrs.validated_at → governance.adrs.validatedAt
 *   governance.adrs.compliance_check → governance.adrs.complianceCheck
 *   governance.bdd.feature_files → governance.bdd.featureFiles
 *   governance.bdd.approved_by → governance.bdd.approvedBy
 *   governance.bdd.test_results → governance.bdd.testResults
 */
export async function parseRoadItemFile(filePath: string): Promise<governance.RoadItem> {
  const fileContent = await readFile(filePath, 'utf-8');
  const { data } = parseFrontmatter(fileContent);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const mapped = {
    id: data.id,
    title: data.title,
    status: data.status,
    phase: data.phase,
    priority: data.priority,
    created: data.created,
    updated: data.updated,
    started: data.started || '',
    completed: data.completed || '',
    owner: data.owner || '',
    tags: data.tags || [],
    dependsOn: data.dependencies?.requires || [],
    blockedBy: data.dependencies?.blocked_by || [],
    blocks: data.dependencies?.enables || [],
    governance: {
      adrs: {
        validated: data.governance?.adrs?.validated ?? false,
        ids: data.governance?.adrs?.ids || [],
        validatedBy: data.governance?.adrs?.validated_by || '',
        validatedAt: data.governance?.adrs?.validated_at || '',
        complianceCheck: (data.governance?.adrs?.compliance_check || []).map((c: any) => ({
          adr: c.adr,
          compliant: c.compliant,
          notes: c.notes || '',
        })),
      },
      bdd: {
        status: data.governance?.bdd?.status || 'draft',
        featureFiles: data.governance?.bdd?.feature_files || [],
        scenarios: data.governance?.bdd?.scenarios || 0,
        passing: data.governance?.bdd?.passing || 0,
        approvedBy: (data.governance?.bdd?.approved_by || []).map((a: any) => ({
          agent: a.agent,
          timestamp: a.timestamp,
        })),
        testResults: data.governance?.bdd?.test_results
          ? {
              total: data.governance.bdd.test_results.total || 0,
              passed: data.governance.bdd.test_results.passed || 0,
              failed: data.governance.bdd.test_results.failed || 0,
              coverage: data.governance.bdd.test_results.coverage || '0%',
            }
          : undefined,
      },
      nfrs: {
        applicable: data.governance?.nfrs?.applicable || [],
        status: data.governance?.nfrs?.status || 'pending',
        results: data.governance?.nfrs?.results || {},
      },
      capabilities: data.governance?.capabilities || [],
    },
    path: makeGovernancePath(filePath),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  try {
    return governance.RoadItemSchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Road item ${data.id} validation failed in ${filePath}: ${message}`);
  }
}

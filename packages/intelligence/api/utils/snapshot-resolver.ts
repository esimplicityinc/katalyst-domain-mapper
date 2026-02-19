/**
 * Snapshot Resolver
 *
 * Shared utility for matching a domain model's bounded contexts to the
 * appropriate taxonomy and governance snapshots.
 *
 * This logic was previously inlined in the landscape route. It is extracted
 * here so the LintLandscape use case and the landscape route can both use it
 * without duplication.
 */

import type { TaxonomyRepository, TaxonomyHierarchy } from "../ports/TaxonomyRepository.js";
import type { GovernanceRepository, StoredSnapshot } from "../ports/GovernanceRepository.js";
import type { StoredTaxonomySnapshot } from "../ports/TaxonomyRepository.js";
import type { ValidatedSnapshotData } from "../domain/governance/validateSnapshotData.js";

export interface ResolvedSnapshots {
  taxonomySnapshot: StoredTaxonomySnapshot | null;
  taxonomyHierarchy: TaxonomyHierarchy | null;
  governanceSnapshot: StoredSnapshot | null;
  governanceRawIndex: ValidatedSnapshotData | null;
}

/**
 * Extract the root system names from the taxonomyNode FQTNs used by
 * a domain model's bounded contexts. E.g. "prima.engine.aiox" → "prima".
 */
export function extractSystemNames(
  boundedContexts: Array<{ taxonomyNode?: string | null }>,
): Set<string> {
  const names = new Set<string>();
  for (const ctx of boundedContexts) {
    const tn = ctx.taxonomyNode;
    if (tn && tn !== "taxonomy_node") {
      names.add(tn.split(".")[0]);
    }
  }
  return names;
}

/**
 * Resolve the best-matching taxonomy and governance snapshots for a
 * domain model. Uses the root system names from bounded context taxonomyNodes
 * to find the matching taxonomy snapshot, then looks up the governance
 * snapshot for the same project.
 *
 * Falls back to latest snapshots when no project-matched snapshot is found.
 */
export async function resolveSnapshots(
  systemNames: Set<string>,
  taxonomyRepo: TaxonomyRepository & {
    getHierarchyBySnapshotId?: (id: string) => Promise<TaxonomyHierarchy>;
    listSnapshots?: (limit?: number) => Promise<StoredTaxonomySnapshot[]>;
  },
  governanceRepo: GovernanceRepository & {
    getLatestSnapshotByProject?: (project: string) => Promise<StoredSnapshot | null>;
    getRawIndex?: (snapshotId: string) => Promise<ValidatedSnapshotData | null>;
  },
): Promise<ResolvedSnapshots> {
  let taxonomySnapshot: StoredTaxonomySnapshot | null = null;
  let taxonomyHierarchy: TaxonomyHierarchy | null = null;
  let governanceSnapshot: StoredSnapshot | null = null;
  let governanceRawIndex: ValidatedSnapshotData | null = null;

  if (systemNames.size > 0) {
    // Walk recent taxonomy snapshots looking for one whose root nodes match
    const taxSnapshots = await taxonomyRepo.listSnapshots?.(50) ?? [];

    for (const snap of taxSnapshots) {
      const hierarchy = await taxonomyRepo.getHierarchyBySnapshotId?.(snap.id).catch(
        () => null,
      );
      if (!hierarchy) continue;

      const snapSystemNames = new Set(hierarchy.systems.map((s) => s.name));
      const hasMatch = [...systemNames].some((name) => snapSystemNames.has(name));

      if (hasMatch) {
        taxonomySnapshot = snap;
        taxonomyHierarchy = hierarchy;

        // Attempt governance match by same project
        governanceSnapshot =
          (await governanceRepo.getLatestSnapshotByProject?.(snap.project).catch(
            () => null,
          )) ?? null;
        if (governanceSnapshot) {
          governanceRawIndex =
            (await governanceRepo.getRawIndex?.(governanceSnapshot.id).catch(
              () => null,
            )) ?? null;
        }
        break;
      }
    }
  }

  // Fall back to latest taxonomy snapshot
  if (!taxonomyHierarchy) {
    taxonomySnapshot = await taxonomyRepo.getLatestSnapshot().catch(() => null);
    if (taxonomySnapshot) {
      taxonomyHierarchy =
        (await taxonomyRepo.getHierarchyBySnapshotId?.(taxonomySnapshot.id).catch(
          () => null,
        )) ?? null;
    }
  }

  // Fall back to latest governance snapshot
  if (!governanceSnapshot) {
    governanceSnapshot = await governanceRepo.getLatestSnapshot().catch(() => null);
    if (governanceSnapshot) {
      governanceRawIndex =
        (await governanceRepo.getRawIndex?.(governanceSnapshot.id).catch(
          () => null,
        )) ?? null;
    }
  }

  return { taxonomySnapshot, taxonomyHierarchy, governanceSnapshot, governanceRawIndex };
}

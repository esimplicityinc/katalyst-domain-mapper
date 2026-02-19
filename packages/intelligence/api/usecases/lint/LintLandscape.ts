/**
 * LintLandscape Use Case
 *
 * Fetches raw data from the domain model, governance, and taxonomy repositories
 * and assembles a LintContext, then delegates to LandscapeLinter to produce
 * a LintReport.
 *
 * Uses raw data sources (not the assembled LandscapeGraph) so that lint rules
 * can detect issues that the landscape assembler would silently ignore.
 */

import type { DomainModelRepository } from "../../ports/DomainModelRepository.js";
import type { GovernanceRepository, StoredSnapshot } from "../../ports/GovernanceRepository.js";
import type { TaxonomyRepository, TaxonomyHierarchy, StoredTaxonomySnapshot } from "../../ports/TaxonomyRepository.js";
import type { ValidatedSnapshotData } from "../../domain/governance/validateSnapshotData.js";
import { LandscapeLinter } from "../../domain/lint/LandscapeLinter.js";
import type {
  LintReport,
  LintContext,
  LintPersona,
  LintUserStory,
  LintCapability,
  LintTaxonomyNode,
  LintTaxonomyCapability,
  LintBoundedContext,
  LintAggregate,
  LintDomainEvent,
  LintGlossaryTerm,
  LintWorkflow,
} from "../../domain/lint/LintReport.js";

// ── Augmented repo types (extra methods on SQLite adapters) ──────────────────

type GovernanceRepoDeps = GovernanceRepository & {
  getLatestSnapshotByProject?: (project: string) => Promise<StoredSnapshot | null>;
  getRawIndex?: (snapshotId: string) => Promise<ValidatedSnapshotData | null>;
};

type TaxonomyRepoDeps = TaxonomyRepository & {
  getHierarchyBySnapshotId?: (id: string) => Promise<TaxonomyHierarchy>;
  listSnapshots?: (limit?: number) => Promise<StoredTaxonomySnapshot[]>;
};

// ── Use Case ─────────────────────────────────────────────────────────────────

export class LintLandscape {
  private linter = new LandscapeLinter();

  constructor(
    private domainModelRepo: DomainModelRepository,
    private governanceRepo: GovernanceRepoDeps,
    private taxonomyRepo: TaxonomyRepoDeps,
  ) {}

  async execute(domainModelId: string): Promise<LintReport> {
    // ── 1. Fetch domain model with all artifacts ────────────────────────────
    const domainModel = await this.domainModelRepo.getById(domainModelId);
    if (!domainModel) {
      throw new Error(`Domain model "${domainModelId}" not found`);
    }

    // ── 2. Resolve matching taxonomy + governance snapshots ─────────────────
    // Extract root system names from bounded context taxonomyNode FQTNs
    const systemNames = new Set<string>();
    for (const bc of domainModel.boundedContexts) {
      const tn = bc.taxonomyNode;
      if (tn && tn !== "taxonomy_node") {
        systemNames.add(tn.split(".")[0]);
      }
    }

    let taxonomySnapshotId: string | undefined;
    let governanceSnapshotId: string | undefined;
    let governanceRawIndex: ValidatedSnapshotData | null = null;
    let taxonomyHierarchy: TaxonomyHierarchy | null = null;

    if (systemNames.size > 0) {
      const taxSnapshots = await this.taxonomyRepo.listSnapshots?.(50) ?? [];
      for (const snap of taxSnapshots) {
        const hier = await this.taxonomyRepo.getHierarchyBySnapshotId?.(snap.id).catch(() => null);
        if (!hier) continue;
        const snapSystemNames = new Set(hier.systems.map((s) => (s as { name: string }).name));
        const hasMatch = [...systemNames].some((n) => snapSystemNames.has(n));
        if (hasMatch) {
          taxonomySnapshotId = snap.id;
          taxonomyHierarchy = hier;
          const govSnap = await this.governanceRepo.getLatestSnapshotByProject?.(snap.project).catch(() => null);
          if (govSnap) {
            governanceSnapshotId = govSnap.id;
            governanceRawIndex = await this.governanceRepo.getRawIndex?.(govSnap.id).catch(() => null) ?? null;
          }
          break;
        }
      }
    }

    // Fallback: latest taxonomy
    if (!taxonomyHierarchy) {
      const latest = await this.taxonomyRepo.getLatestSnapshot().catch(() => null);
      if (latest) {
        taxonomySnapshotId = latest.id;
        taxonomyHierarchy = await this.taxonomyRepo.getHierarchyBySnapshotId?.(latest.id).catch(() => null) ?? null;
      }
    }

    // Fallback: latest governance
    if (!governanceRawIndex) {
      const latest = await this.governanceRepo.getLatestSnapshot().catch(() => null);
      if (latest) {
        governanceSnapshotId = latest.id;
        governanceRawIndex = await this.governanceRepo.getRawIndex?.(latest.id).catch(() => null) ?? null;
      }
    }

    // ── 3. Build LintContext ─────────────────────────────────────────────────

    // Governance: personas
    const personas: LintPersona[] = governanceRawIndex?.personas
      ? Object.values(governanceRawIndex.personas).map((p) => {
          const persona = p as Record<string, unknown>;
          return {
            id: String(persona["id"] ?? ""),
            name: String(persona["name"] ?? ""),
            type: String(persona["type"] ?? "human"),
            archetype: persona["archetype"] as string | undefined,
            typicalCapabilities: (persona["typicalCapabilities"] as string[]) ?? [],
          };
        })
      : [];

    // Governance: user stories
    const userStories: LintUserStory[] = governanceRawIndex?.userStories
      ? Object.values(governanceRawIndex.userStories).map((s) => {
          const story = s as Record<string, unknown>;
          return {
            id: String(story["id"] ?? ""),
            title: String(story["title"] ?? ""),
            persona: String(story["persona"] ?? ""),
            capabilities: (story["capabilities"] as string[]) ?? [],
            status: String(story["status"] ?? "draft"),
          };
        })
      : [];

    // Governance: capabilities (enriched with roadCount/storyCount from byCapability)
    const capabilities: LintCapability[] = governanceRawIndex?.capabilities
      ? Object.entries(governanceRawIndex.capabilities).map(([capId, cap]) => {
          const c = cap as Record<string, unknown>;
          const byCapEntry = governanceRawIndex?.byCapability?.[capId] as
            | Record<string, unknown>
            | undefined;
          return {
            id: String(c["id"] ?? capId),
            title: String(c["title"] ?? capId),
            status: String(c["status"] ?? "unknown"),
            taxonomyNode: c["taxonomyNode"] as string | undefined,
            roadCount: ((byCapEntry?.["roads"] as unknown[]) ?? []).length,
            storyCount: ((byCapEntry?.["stories"] as unknown[]) ?? []).length,
          };
        })
      : [];

    // Taxonomy: flatten hierarchy tree to node list
    const taxonomyNodes: LintTaxonomyNode[] = [];
    if (taxonomyHierarchy) {
      const flattenHierarchy = (
        nodes: Array<{ name: string; fqtn: string; nodeType: string; children: unknown[] }>,
      ): void => {
        for (const node of nodes) {
          taxonomyNodes.push({ name: node.name, fqtn: node.fqtn, nodeType: node.nodeType });
          if (node.children.length > 0) {
            flattenHierarchy(
              node.children as Array<{ name: string; fqtn: string; nodeType: string; children: unknown[] }>,
            );
          }
        }
      };
      flattenHierarchy(
        taxonomyHierarchy.systems as Array<{ name: string; fqtn: string; nodeType: string; children: unknown[] }>,
      );
    }

    // Taxonomy: load capability tree and flatten to LintTaxonomyCapability list
    const taxonomyCapabilities: LintTaxonomyCapability[] = [];
    if (taxonomySnapshotId) {
      const capTree = await this.taxonomyRepo
        .getCapabilityTreeBySnapshotId(taxonomySnapshotId)
        .catch(() => null);
      if (capTree) {
        const flattenCapTree = (
          nodes: Array<{ name: string; description: string; tag: string | null; derivedStatus: "planned" | "stable" | "deprecated"; taxonomyNodes: string[]; children: unknown[] }>,
          parentName: string | null,
        ): void => {
          for (const node of nodes) {
            taxonomyCapabilities.push({
              name: node.name,
              description: node.description,
              tag: node.tag,
              parentName,
              derivedStatus: node.derivedStatus,
              taxonomyNodes: node.taxonomyNodes,
            });
            if (node.children.length > 0) {
              flattenCapTree(
                node.children as Array<{ name: string; description: string; tag: string | null; derivedStatus: "planned" | "stable" | "deprecated"; taxonomyNodes: string[]; children: unknown[] }>,
                node.name,
              );
            }
          }
        };
        flattenCapTree(
          capTree.roots as Array<{ name: string; description: string; tag: string | null; derivedStatus: "planned" | "stable" | "deprecated"; taxonomyNodes: string[]; children: unknown[] }>,
          null,
        );
      }
    }

    // Domain model: bounded contexts (now with contextType + taxonomyNode from port)
    const boundedContexts: LintBoundedContext[] = domainModel.boundedContexts.map((bc) => ({
      id: bc.id,
      slug: bc.slug,
      title: bc.title,
      contextType: bc.contextType ?? null,
      subdomainType: bc.subdomainType ?? null,
      taxonomyNode: bc.taxonomyNode ?? null,
      relationships: (bc.relationships as Array<{
        targetContextId: string;
        type?: string;
        description?: string;
      }>) ?? [],
    }));

    const aggregates: LintAggregate[] = domainModel.aggregates.map((a) => ({
      id: a.id,
      contextId: a.contextId,
      slug: a.slug,
      title: a.title,
      rootEntity: a.rootEntity,
      events: a.events,
    }));

    const domainEvents: LintDomainEvent[] = domainModel.domainEvents.map((e) => ({
      id: e.id,
      contextId: e.contextId,
      aggregateId: e.aggregateId,
      slug: e.slug,
      title: e.title,
      consumedBy: e.consumedBy,
      triggers: e.triggers,
      sideEffects: e.sideEffects,
      sourceCapabilityId: e.sourceCapabilityId,
      targetCapabilityIds: e.targetCapabilityIds,
    }));

    const glossaryTerms: LintGlossaryTerm[] = domainModel.glossaryTerms.map((g) => ({
      id: g.id,
      contextId: g.contextId,
      term: g.term,
    }));

    const workflows: LintWorkflow[] = domainModel.workflows.map((w) => ({
      id: w.id,
      slug: w.slug,
      title: w.title,
      contextIds: w.contextIds,
      transitions: (w.transitions as LintWorkflow["transitions"]) ?? [],
    }));

    const lintContext: LintContext = {
      domainModelId,
      governanceSnapshotId,
      taxonomySnapshotId,
      personas,
      userStories,
      capabilities,
      boundedContexts,
      aggregates,
      domainEvents,
      glossaryTerms,
      workflows,
      taxonomyNodes,
      taxonomyCapabilities,
    };

    // ── 4. Run the linter ───────────────────────────────────────────────────
    return this.linter.lint(lintContext);
  }
}

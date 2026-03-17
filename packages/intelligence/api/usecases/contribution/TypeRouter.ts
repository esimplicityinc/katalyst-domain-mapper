// ── Type Router ──────────────────────────────────────────────────────────────
// Routes contribution-aware creates to the appropriate type-specific
// repository method. This is the bridge between the unified contribution
// endpoint and the underlying CRUD operations.

import type { TaxonomyRepository } from "../../ports/TaxonomyRepository.js";

// ── Supported Item Types ───────────────────────────────────────────────────

/**
 * Item types that have backing create methods in the TaxonomyRepository.
 * Items like road-item, adr, nfr, change-entry, use-case do not yet have
 * CRUD endpoints and are excluded.
 */
export type RoutableItemType =
  | "capability"
  | "user-type"
  | "user-story"
  | "bounded-context"
  | "aggregate"
  | "domain-event"
  | "value-object"
  | "glossary-term"
  | "workflow"
  | "practice-area"
  | "competency"
  | "team-adoption"
  | "individual-adoption";

const ROUTABLE_TYPES = new Set<string>([
  "capability",
  "user-type",
  "user-story",
  "bounded-context",
  "aggregate",
  "domain-event",
  "value-object",
  "glossary-term",
  "workflow",
  "practice-area",
  "competency",
  "team-adoption",
  "individual-adoption",
]);

// ── Input / Output Types ───────────────────────────────────────────────────

export interface CreateContributionInput {
  itemType: string;
  parentId?: string;
  data: Record<string, unknown>;
  submittedBy: string;
  contributionNote?: string;
}

export interface CreatedItem {
  id: string;
  itemType: string;
  itemData: Record<string, unknown>;
}

// ── Errors ─────────────────────────────────────────────────────────────────

export class UnsupportedItemTypeError extends Error {
  constructor(itemType: string) {
    super(`Unsupported item type for contribution create: '${itemType}'`);
    this.name = "UnsupportedItemTypeError";
  }
}

export class MissingParentIdError extends Error {
  constructor(itemType: string) {
    super(`Item type '${itemType}' requires a parentId (domain model ID)`);
    this.name = "MissingParentIdError";
  }
}

// ── Type Router ────────────────────────────────────────────────────────────

/**
 * Routes item creation to the correct TaxonomyRepository method based on
 * the item type. Domain model artifacts require a parentId (the model ID).
 */
export class TypeRouter {
  constructor(private taxonomyRepo: TaxonomyRepository) {}

  isRoutable(itemType: string): boolean {
    return ROUTABLE_TYPES.has(itemType);
  }

  async create(input: CreateContributionInput): Promise<CreatedItem> {
    const { itemType, parentId, data } = input;

    if (!this.isRoutable(itemType)) {
      throw new UnsupportedItemTypeError(itemType);
    }

    switch (itemType) {
      // ── Governance items (no parent scope) ──────────────────────────────
      case "capability": {
        const item = await this.taxonomyRepo.createGovernanceCapability(data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }
      case "user-type": {
        const item = await this.taxonomyRepo.createUserType(data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }
      case "user-story": {
        const item = await this.taxonomyRepo.createUserStory(data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }

      // ── Domain model artifacts (require parentId = modelId) ─────────────
      case "bounded-context": {
        this.requireParentId(itemType, parentId);
        const item = await this.taxonomyRepo.addBoundedContext(parentId!, data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }
      case "aggregate": {
        this.requireParentId(itemType, parentId);
        const item = await this.taxonomyRepo.addAggregate(parentId!, data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }
      case "domain-event": {
        this.requireParentId(itemType, parentId);
        const item = await this.taxonomyRepo.addDomainEvent(parentId!, data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }
      case "value-object": {
        this.requireParentId(itemType, parentId);
        const item = await this.taxonomyRepo.addValueObject(parentId!, data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }
      case "glossary-term": {
        this.requireParentId(itemType, parentId);
        const item = await this.taxonomyRepo.addGlossaryTerm(parentId!, data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }
      case "workflow": {
        this.requireParentId(itemType, parentId);
        const item = await this.taxonomyRepo.addWorkflow(parentId!, data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }

      // ── Practice area items (require parentId = snapshotId) ───────────
      case "practice-area": {
        this.requireParentId(itemType, parentId);
        const item = await this.taxonomyRepo.createPracticeArea(parentId!, data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }
      case "competency": {
        this.requireParentId(itemType, parentId);
        const item = await this.taxonomyRepo.createCompetency(parentId!, data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }
      case "team-adoption": {
        this.requireParentId(itemType, parentId);
        const item = await this.taxonomyRepo.createTeamAdoption(parentId!, data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }
      case "individual-adoption": {
        this.requireParentId(itemType, parentId);
        const item = await this.taxonomyRepo.createIndividualAdoption(parentId!, data as never);
        return { id: item.id, itemType, itemData: item as unknown as Record<string, unknown> };
      }

      default:
        throw new UnsupportedItemTypeError(itemType);
    }
  }

  private requireParentId(itemType: string, parentId?: string): asserts parentId is string {
    if (!parentId) {
      throw new MissingParentIdError(itemType);
    }
  }
}

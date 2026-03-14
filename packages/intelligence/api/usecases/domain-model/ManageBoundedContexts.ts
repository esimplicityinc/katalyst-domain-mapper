import type {
  TaxonomyRepository,
  StoredBoundedContext,
  CreateBoundedContextInput,
  UpdateBoundedContextInput,
} from "../../ports/TaxonomyRepository.js";
import {
  DomainModelNotFoundError,
  DomainModelValidationError,
} from "../../domain/domain-model/DomainModelErrors.js";

const VALID_SUBDOMAIN_TYPES = ["core", "supporting", "generic"];

export class ManageBoundedContexts {
  constructor(private repo: TaxonomyRepository) {}

  async add(
    modelId: string,
    input: CreateBoundedContextInput,
  ): Promise<StoredBoundedContext> {
    const exists = await this.repo.domainModelExists(modelId);
    if (!exists) {
      throw new DomainModelNotFoundError(modelId);
    }

    if (
      input.subdomainType &&
      !VALID_SUBDOMAIN_TYPES.includes(input.subdomainType)
    ) {
      throw new DomainModelValidationError("Invalid subdomain type", {
        message: `subdomainType must be one of: ${VALID_SUBDOMAIN_TYPES.join(", ")}`,
      });
    }

    return this.repo.addBoundedContext(modelId, input);
  }

  async update(
    ctxId: string,
    input: UpdateBoundedContextInput,
  ): Promise<{ id: string; updated: boolean; subdomainType: string | null }> {
    await this.repo.updateBoundedContext(ctxId, input);
    return {
      id: ctxId,
      updated: true,
      subdomainType: input.subdomainType ?? null,
    };
  }

  async delete(ctxId: string): Promise<{ message: string }> {
    await this.repo.deleteBoundedContext(ctxId);
    return { message: "Deleted" };
  }
}

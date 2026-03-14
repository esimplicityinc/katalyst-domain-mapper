import type { TaxonomyRepository } from "../../ports/TaxonomyRepository.js";
import { DomainModelNotFoundError } from "../../domain/domain-model/DomainModelErrors.js";

export class DeleteDomainModel {
  constructor(private repo: TaxonomyRepository) {}

  async execute(id: string): Promise<{ message: string }> {
    const exists = await this.repo.domainModelExists(id);
    if (!exists) {
      throw new DomainModelNotFoundError(id);
    }
    await this.repo.deleteDomainModel(id);
    return { message: "Deleted" };
  }
}

import type {
  TaxonomyRepository,
  UpdateDomainModelInput,
} from "../../ports/TaxonomyRepository.js";
import { DomainModelNotFoundError } from "../../domain/domain-model/DomainModelErrors.js";

export class UpdateDomainModel {
  constructor(private repo: TaxonomyRepository) {}

  async execute(
    id: string,
    input: UpdateDomainModelInput,
  ): Promise<{ message: string }> {
    const exists = await this.repo.domainModelExists(id);
    if (!exists) {
      throw new DomainModelNotFoundError(id);
    }
    await this.repo.updateDomainModel(id, input);
    return { message: "Updated" };
  }
}

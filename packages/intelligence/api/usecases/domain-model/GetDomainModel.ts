import type {
  TaxonomyRepository,
  DomainModelWithArtifacts,
} from "../../ports/TaxonomyRepository.js";
import { DomainModelNotFoundError } from "../../domain/domain-model/DomainModelErrors.js";

export class GetDomainModel {
  constructor(private repo: TaxonomyRepository) {}

  async execute(id: string): Promise<DomainModelWithArtifacts> {
    const model = await this.repo.getDomainModelById(id);
    if (!model) {
      throw new DomainModelNotFoundError(id);
    }
    return model;
  }
}

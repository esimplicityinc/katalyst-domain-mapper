import type {
  TaxonomyRepository,
  StoredDomainModel,
  CreateDomainModelInput,
} from "../../ports/TaxonomyRepository.js";

export class CreateDomainModel {
  constructor(private repo: TaxonomyRepository) {}

  async execute(
    input: CreateDomainModelInput,
  ): Promise<{ id: string; name: string; createdAt: string }> {
    const model: StoredDomainModel = await this.repo.createDomainModel(input);
    return { id: model.id, name: model.name, createdAt: model.createdAt };
  }
}

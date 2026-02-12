import type {
  DomainModelRepository,
  StoredDomainModel,
  CreateDomainModelInput,
} from "../../ports/DomainModelRepository.js";

export class CreateDomainModel {
  constructor(private repo: DomainModelRepository) {}

  async execute(
    input: CreateDomainModelInput,
  ): Promise<{ id: string; name: string; createdAt: string }> {
    const model: StoredDomainModel = await this.repo.create(input);
    return { id: model.id, name: model.name, createdAt: model.createdAt };
  }
}

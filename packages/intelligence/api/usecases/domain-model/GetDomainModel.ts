import type {
  DomainModelRepository,
  DomainModelWithArtifacts,
} from "../../ports/DomainModelRepository.js";
import { DomainModelNotFoundError } from "../../domain/domain-model/DomainModelErrors.js";

export class GetDomainModel {
  constructor(private repo: DomainModelRepository) {}

  async execute(id: string): Promise<DomainModelWithArtifacts> {
    const model = await this.repo.getById(id);
    if (!model) {
      throw new DomainModelNotFoundError(id);
    }
    return model;
  }
}

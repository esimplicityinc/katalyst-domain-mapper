import type {
  DomainModelRepository,
  UpdateDomainModelInput,
} from "../../ports/DomainModelRepository.js";
import { DomainModelNotFoundError } from "../../domain/domain-model/DomainModelErrors.js";

export class UpdateDomainModel {
  constructor(private repo: DomainModelRepository) {}

  async execute(
    id: string,
    input: UpdateDomainModelInput,
  ): Promise<{ message: string }> {
    const exists = await this.repo.exists(id);
    if (!exists) {
      throw new DomainModelNotFoundError(id);
    }
    await this.repo.update(id, input);
    return { message: "Updated" };
  }
}

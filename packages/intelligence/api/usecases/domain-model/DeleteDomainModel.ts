import type { DomainModelRepository } from "../../ports/DomainModelRepository.js";
import { DomainModelNotFoundError } from "../../domain/domain-model/DomainModelErrors.js";

export class DeleteDomainModel {
  constructor(private repo: DomainModelRepository) {}

  async execute(id: string): Promise<{ message: string }> {
    const exists = await this.repo.exists(id);
    if (!exists) {
      throw new DomainModelNotFoundError(id);
    }
    await this.repo.delete(id);
    return { message: "Deleted" };
  }
}

import type {
  DomainModelRepository,
  StoredGlossaryTerm,
  CreateGlossaryTermInput,
} from "../../ports/DomainModelRepository.js";
import { DomainModelNotFoundError } from "../../domain/domain-model/DomainModelErrors.js";

export class ManageGlossary {
  constructor(private repo: DomainModelRepository) {}

  async add(
    modelId: string,
    input: CreateGlossaryTermInput,
  ): Promise<{ id: string; term: string }> {
    const exists = await this.repo.exists(modelId);
    if (!exists) {
      throw new DomainModelNotFoundError(modelId);
    }
    const term: StoredGlossaryTerm = await this.repo.addGlossaryTerm(
      modelId,
      input,
    );
    return { id: term.id, term: term.term };
  }

  async list(modelId: string): Promise<StoredGlossaryTerm[]> {
    return this.repo.listGlossaryTerms(modelId);
  }

  async delete(termId: string): Promise<{ message: string }> {
    await this.repo.deleteGlossaryTerm(termId);
    return { message: "Deleted" };
  }
}

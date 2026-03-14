import type {
  TaxonomyRepository,
  StoredGlossaryTerm,
  CreateGlossaryTermInput,
  UpdateGlossaryTermInput,
} from "../../ports/TaxonomyRepository.js";
import { DomainModelNotFoundError } from "../../domain/domain-model/DomainModelErrors.js";

export class ManageGlossary {
  constructor(private repo: TaxonomyRepository) {}

  async add(
    modelId: string,
    input: CreateGlossaryTermInput,
  ): Promise<{ id: string; term: string }> {
    const exists = await this.repo.domainModelExists(modelId);
    if (!exists) {
      throw new DomainModelNotFoundError(modelId);
    }
    const term: StoredGlossaryTerm = await this.repo.addGlossaryTerm(
      modelId,
      input,
    );
    return { id: term.id, term: term.term };
  }

  async update(
    termId: string,
    input: UpdateGlossaryTermInput,
  ): Promise<{ message: string }> {
    await this.repo.updateGlossaryTerm(termId, input);
    return { message: "Updated" };
  }

  async list(modelId: string): Promise<StoredGlossaryTerm[]> {
    return this.repo.listGlossaryTerms(modelId);
  }

  async delete(termId: string): Promise<{ message: string }> {
    await this.repo.deleteGlossaryTerm(termId);
    return { message: "Deleted" };
  }
}

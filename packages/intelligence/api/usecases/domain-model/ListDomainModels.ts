import type {
  TaxonomyRepository,
  StoredDomainModel,
} from "../../ports/TaxonomyRepository.js";

export class ListDomainModels {
  constructor(private repo: TaxonomyRepository) {}

  async execute(): Promise<StoredDomainModel[]> {
    return this.repo.listDomainModels();
  }
}

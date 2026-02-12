import type {
  DomainModelRepository,
  StoredDomainModel,
} from "../../ports/DomainModelRepository.js";

export class ListDomainModels {
  constructor(private repo: DomainModelRepository) {}

  async execute(): Promise<StoredDomainModel[]> {
    return this.repo.list();
  }
}

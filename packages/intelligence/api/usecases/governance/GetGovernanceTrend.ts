import type {
  TaxonomyRepository,
  TrendPoint,
} from "../../ports/TaxonomyRepository.js";

export class GetGovernanceTrend {
  constructor(private governanceRepo: TaxonomyRepository) {}

  async execute(limit?: number): Promise<TrendPoint[]> {
    return this.governanceRepo.getTrends(limit);
  }
}

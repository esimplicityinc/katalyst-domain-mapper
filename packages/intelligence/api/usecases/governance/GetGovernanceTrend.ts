import type {
  GovernanceRepository,
  TrendPoint,
} from "../../ports/GovernanceRepository.js";

export class GetGovernanceTrend {
  constructor(private governanceRepo: GovernanceRepository) {}

  async execute(limit?: number): Promise<TrendPoint[]> {
    return this.governanceRepo.getTrends(limit);
  }
}

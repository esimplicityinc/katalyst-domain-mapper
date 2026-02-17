import { GovernanceRepository } from "../ports/GovernanceRepository";

export class QueryGovernanceState {
  constructor(private governanceRepo: GovernanceRepository) {}

  async getLatestSnapshot() {
    return this.governanceRepo.getLatestSnapshot();
  }

  async getRoadItems() {
    return this.governanceRepo.getRoadItems();
  }

  async getCapabilityCoverage() {
    return this.governanceRepo.getCapabilityCoverage();
  }
}

import type {
  GovernanceRepository,
  CapabilityCoverage,
  PersonaCoverage,
} from "../../ports/GovernanceRepository.js";

export class GetCapabilityCoverage {
  constructor(private governanceRepo: GovernanceRepository) {}

  async getCapabilities(): Promise<CapabilityCoverage[]> {
    return this.governanceRepo.getCapabilityCoverage();
  }

  async getPersonas(): Promise<PersonaCoverage[]> {
    return this.governanceRepo.getPersonaCoverage();
  }
}

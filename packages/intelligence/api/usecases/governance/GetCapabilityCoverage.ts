import type {
  TaxonomyRepository,
  CapabilityCoverage,
  UserTypeCoverage,
} from "../../ports/TaxonomyRepository.js";

export class GetCapabilityCoverage {
  constructor(private governanceRepo: TaxonomyRepository) {}

  async getCapabilities(): Promise<CapabilityCoverage[]> {
    return this.governanceRepo.getCapabilityCoverage();
  }

  async getUserTypes(): Promise<UserTypeCoverage[]> {
    return this.governanceRepo.getUserTypeCoverage();
  }
}

import type {
  TaxonomyRepository,
  StoredGovernanceSnapshot,
  RoadItemSummary,
  IntegrityReport,
} from "../../ports/TaxonomyRepository.js";

export class QueryGovernanceState {
  constructor(private governanceRepo: TaxonomyRepository) {}

  async getLatest(): Promise<StoredGovernanceSnapshot | null> {
    return this.governanceRepo.getLatestGovernanceSnapshot();
  }

  async getById(id: string): Promise<StoredGovernanceSnapshot | null> {
    return this.governanceRepo.getGovernanceSnapshotById(id);
  }

  async listSnapshots(): Promise<StoredGovernanceSnapshot[]> {
    return this.governanceRepo.listGovernanceSnapshots();
  }

  async getRoadItems(statusFilter?: string): Promise<RoadItemSummary[]> {
    return this.governanceRepo.getRoadItems(statusFilter);
  }

  async getIntegrity(): Promise<IntegrityReport> {
    return this.governanceRepo.getIntegrity();
  }
}

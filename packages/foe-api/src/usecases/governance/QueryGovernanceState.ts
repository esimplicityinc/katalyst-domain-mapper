import type {
  GovernanceRepository,
  StoredSnapshot,
  RoadItemSummary,
  IntegrityReport,
} from "../../ports/GovernanceRepository.js";

export class QueryGovernanceState {
  constructor(private governanceRepo: GovernanceRepository) {}

  async getLatest(): Promise<StoredSnapshot | null> {
    return this.governanceRepo.getLatestSnapshot();
  }

  async getById(id: string): Promise<StoredSnapshot | null> {
    return this.governanceRepo.getSnapshotById(id);
  }

  async listSnapshots(): Promise<StoredSnapshot[]> {
    return this.governanceRepo.listSnapshots();
  }

  async getRoadItems(statusFilter?: string): Promise<RoadItemSummary[]> {
    return this.governanceRepo.getRoadItems(statusFilter);
  }

  async getIntegrity(): Promise<IntegrityReport> {
    return this.governanceRepo.getIntegrity();
  }
}

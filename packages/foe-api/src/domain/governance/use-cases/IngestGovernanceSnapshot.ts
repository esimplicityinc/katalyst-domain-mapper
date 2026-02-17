import {
  GovernanceRepository,
  GovernanceIndex,
} from "../ports/GovernanceRepository";

export class IngestGovernanceSnapshot {
  constructor(private governanceRepo: GovernanceRepository) {}

  async execute(snapshot: GovernanceIndex): Promise<string> {
    // Validate snapshot structure
    if (!snapshot.version || !snapshot.generated || !snapshot.roadItems) {
      throw new Error("Invalid governance snapshot structure");
    }
    return await this.governanceRepo.saveSnapshot(snapshot);
  }
}

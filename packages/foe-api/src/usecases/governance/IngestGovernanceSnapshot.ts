import type {
  GovernanceRepository,
  StoredSnapshot,
} from "../../ports/GovernanceRepository.js";
import type { Logger } from "../../ports/Logger.js";
import { GovernanceValidationError } from "../../domain/governance/GovernanceErrors.js";
import { validateSnapshotData } from "../../domain/governance/validateSnapshotData.js";

export class IngestGovernanceSnapshot {
  constructor(
    private governanceRepo: GovernanceRepository,
    private logger: Logger,
  ) {}

  async execute(rawData: unknown): Promise<StoredSnapshot> {
    this.logger.info("Ingesting governance snapshot");

    // Domain-level validation
    const validated = validateSnapshotData(rawData);

    let snapshot: StoredSnapshot;
    try {
      snapshot = await this.governanceRepo.saveSnapshot(validated);
    } catch (err) {
      if (err instanceof GovernanceValidationError) {
        throw err;
      }
      throw new GovernanceValidationError(
        "Failed to ingest governance snapshot",
        {
          cause: String(err),
        },
      );
    }

    this.logger.info("Governance snapshot saved", {
      id: snapshot.id,
      project: snapshot.project,
      version: snapshot.version,
    });

    return snapshot;
  }
}

import type {
  TaxonomyRepository,
  StoredTaxonomySnapshot,
} from "../../ports/TaxonomyRepository.js";
import type { Logger } from "../../ports/Logger.js";
import { TaxonomyValidationError } from "../../domain/taxonomy/TaxonomyErrors.js";
import { validateTaxonomyData } from "../../domain/taxonomy/validateTaxonomyData.js";

export class IngestTaxonomySnapshot {
  constructor(
    private taxonomyRepo: TaxonomyRepository,
    private logger: Logger,
  ) {}

  async execute(rawData: unknown): Promise<StoredTaxonomySnapshot> {
    this.logger.info("Ingesting taxonomy snapshot");

    // Domain-level validation
    const validated = validateTaxonomyData(rawData);

    let snapshot: StoredTaxonomySnapshot;
    try {
      snapshot = await this.taxonomyRepo.saveSnapshot(validated);
    } catch (err) {
      if (err instanceof TaxonomyValidationError) {
        throw err;
      }
      throw new TaxonomyValidationError(
        "Failed to ingest taxonomy snapshot",
        { cause: String(err) },
      );
    }

    this.logger.info("Taxonomy snapshot saved", {
      id: snapshot.id,
      project: snapshot.project,
      version: snapshot.version,
      nodeCount: snapshot.nodeCount,
    });

    return snapshot;
  }
}

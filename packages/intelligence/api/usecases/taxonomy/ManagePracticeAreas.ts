import type { TaxonomyRepository } from "../../ports/TaxonomyRepository.js";
import type {
  StoredPracticeArea,
  CreatePracticeAreaInput,
  UpdatePracticeAreaInput,
} from "@foe/schemas/taxonomy";

export class ManagePracticeAreas {
  constructor(private readonly repo: TaxonomyRepository) {}

  async list(snapshotId: string): Promise<StoredPracticeArea[]> {
    return this.repo.listPracticeAreas(snapshotId);
  }

  async getById(snapshotId: string, id: string): Promise<StoredPracticeArea | null> {
    return this.repo.getPracticeAreaById(snapshotId, id);
  }

  async create(snapshotId: string, input: CreatePracticeAreaInput): Promise<StoredPracticeArea> {
    return this.repo.createPracticeArea(snapshotId, input);
  }

  async update(
    snapshotId: string,
    id: string,
    input: UpdatePracticeAreaInput,
  ): Promise<StoredPracticeArea> {
    // Verify existence first
    const existing = await this.repo.getPracticeAreaById(snapshotId, id);
    if (!existing) {
      throw new Error(`Practice area not found: ${id}`);
    }
    return this.repo.updatePracticeArea(snapshotId, id, input);
  }

  async delete(snapshotId: string, id: string): Promise<void> {
    const existing = await this.repo.getPracticeAreaById(snapshotId, id);
    if (!existing) {
      throw new Error(`Practice area not found: ${id}`);
    }
    return this.repo.deletePracticeArea(snapshotId, id);
  }

  async listCompetencies(snapshotId: string, practiceAreaId: string) {
    return this.repo.listCompetencies(snapshotId, practiceAreaId);
  }
}

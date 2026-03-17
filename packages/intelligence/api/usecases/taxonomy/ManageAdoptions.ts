import type { TaxonomyRepository } from "../../ports/TaxonomyRepository.js";
import type {
  StoredTeamAdoption,
  CreateTeamAdoptionInput,
  UpdateTeamAdoptionInput,
  StoredIndividualAdoption,
  CreateIndividualAdoptionInput,
  UpdateIndividualAdoptionInput,
} from "@foe/schemas/taxonomy";

export class ManageAdoptions {
  constructor(private readonly repo: TaxonomyRepository) {}

  // ── Team Adoptions ────────────────────────────────────────────────────

  async listTeamAdoptions(snapshotId: string, teamName?: string): Promise<StoredTeamAdoption[]> {
    return this.repo.listTeamAdoptions(snapshotId, teamName);
  }

  async getTeamAdoption(
    snapshotId: string,
    teamName: string,
    practiceAreaId: string,
  ): Promise<StoredTeamAdoption | null> {
    return this.repo.getTeamAdoption(snapshotId, teamName, practiceAreaId);
  }

  async createTeamAdoption(
    snapshotId: string,
    input: CreateTeamAdoptionInput,
  ): Promise<StoredTeamAdoption> {
    // Check for duplicate
    const existing = await this.repo.getTeamAdoption(
      snapshotId,
      input.teamName,
      input.practiceAreaId,
    );
    if (existing) {
      throw new Error(
        `Team ${input.teamName} already has an adoption for practice area ${input.practiceAreaId}`,
      );
    }
    return this.repo.createTeamAdoption(snapshotId, input);
  }

  async updateTeamAdoption(
    snapshotId: string,
    id: string,
    input: UpdateTeamAdoptionInput,
  ): Promise<StoredTeamAdoption> {
    return this.repo.updateTeamAdoption(snapshotId, id, input);
  }

  async deleteTeamAdoption(snapshotId: string, id: string): Promise<void> {
    return this.repo.deleteTeamAdoption(snapshotId, id);
  }

  // ── Individual Adoptions ──────────────────────────────────────────────

  async listIndividualAdoptions(
    snapshotId: string,
    personName?: string,
  ): Promise<StoredIndividualAdoption[]> {
    return this.repo.listIndividualAdoptions(snapshotId, personName);
  }

  async getIndividualAdoption(
    snapshotId: string,
    personName: string,
    practiceAreaId: string,
  ): Promise<StoredIndividualAdoption | null> {
    return this.repo.getIndividualAdoption(snapshotId, personName, practiceAreaId);
  }

  async createIndividualAdoption(
    snapshotId: string,
    input: CreateIndividualAdoptionInput,
  ): Promise<StoredIndividualAdoption> {
    const existing = await this.repo.getIndividualAdoption(
      snapshotId,
      input.personName,
      input.practiceAreaId,
    );
    if (existing) {
      throw new Error(
        `Person ${input.personName} already has an adoption for practice area ${input.practiceAreaId}`,
      );
    }
    return this.repo.createIndividualAdoption(snapshotId, input);
  }

  async updateIndividualAdoption(
    snapshotId: string,
    id: string,
    input: UpdateIndividualAdoptionInput,
  ): Promise<StoredIndividualAdoption> {
    return this.repo.updateIndividualAdoption(snapshotId, id, input);
  }

  async deleteIndividualAdoption(snapshotId: string, id: string): Promise<void> {
    return this.repo.deleteIndividualAdoption(snapshotId, id);
  }
}

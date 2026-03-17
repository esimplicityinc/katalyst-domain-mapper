import type { TaxonomyRepository } from "../../ports/TaxonomyRepository.js";
import type {
  StoredCompetency,
  CreateCompetencyInput,
  UpdateCompetencyInput,
} from "@foe/schemas/taxonomy";
import {
  validateDependencyDag,
  validateDependencyRefs,
  type CompetencyDependencyEntry,
} from "../../domain/taxonomy/validateDependencyDag.js";

export class ManageCompetencies {
  constructor(private readonly repo: TaxonomyRepository) {}

  async list(snapshotId: string, practiceAreaId?: string): Promise<StoredCompetency[]> {
    return this.repo.listCompetencies(snapshotId, practiceAreaId);
  }

  async getById(snapshotId: string, id: string): Promise<StoredCompetency | null> {
    return this.repo.getCompetencyById(snapshotId, id);
  }

  async create(snapshotId: string, input: CreateCompetencyInput): Promise<StoredCompetency> {
    // Validate DAG if dependencies are provided
    if (input.dependencies && input.dependencies.length > 0) {
      await this.validateDag(snapshotId, undefined, input.dependencies as CompetencyDependencyEntry[]);
    }
    return this.repo.createCompetency(snapshotId, input);
  }

  async update(
    snapshotId: string,
    id: string,
    input: UpdateCompetencyInput,
  ): Promise<StoredCompetency> {
    const existing = await this.repo.getCompetencyById(snapshotId, id);
    if (!existing) {
      throw new Error(`Competency not found: ${id}`);
    }
    // Validate DAG if dependencies are being updated
    if (input.dependencies) {
      await this.validateDag(snapshotId, id, input.dependencies as CompetencyDependencyEntry[]);
    }
    return this.repo.updateCompetency(snapshotId, id, input);
  }

  async delete(snapshotId: string, id: string): Promise<void> {
    const existing = await this.repo.getCompetencyById(snapshotId, id);
    if (!existing) {
      throw new Error(`Competency not found: ${id}`);
    }
    return this.repo.deleteCompetency(snapshotId, id);
  }

  async getPrerequisites(snapshotId: string, id: string) {
    const all = await this.repo.listCompetencies(snapshotId);
    const depMap = new Map<string, CompetencyDependencyEntry[]>();
    for (const comp of all) {
      const deps = typeof comp.dependencies === "string"
        ? JSON.parse(comp.dependencies)
        : comp.dependencies;
      depMap.set(comp.id, deps ?? []);
    }

    const { getPrerequisiteChain } = await import("../../domain/taxonomy/validateDependencyDag.js");
    return getPrerequisiteChain(id, "basic", depMap);
  }

  private async validateDag(
    snapshotId: string,
    currentId: string | undefined,
    newDeps: CompetencyDependencyEntry[],
  ): Promise<void> {
    // Build the full dependency map from all competencies
    const all = await this.repo.listCompetencies(snapshotId);
    const depMap = new Map<string, CompetencyDependencyEntry[]>();

    for (const comp of all) {
      const deps = typeof comp.dependencies === "string"
        ? JSON.parse(comp.dependencies)
        : comp.dependencies;
      depMap.set(comp.id, deps ?? []);
    }

    // Override with the new dependencies for the competency being created/updated
    if (currentId) {
      depMap.set(currentId, newDeps);
    } else {
      // For new competencies, use a temporary ID
      depMap.set("__new__", newDeps);
    }

    // Check for missing references
    const missing = validateDependencyRefs(depMap);
    if (missing.length > 0) {
      throw new Error(`Competency dependencies reference unknown competencies: ${missing.join(", ")}`);
    }

    // Check for cycles
    const result = validateDependencyDag(depMap);
    if (!result.valid) {
      throw new Error(`Competency dependency cycle detected: ${result.cycle?.join(" -> ")}`);
    }
  }
}

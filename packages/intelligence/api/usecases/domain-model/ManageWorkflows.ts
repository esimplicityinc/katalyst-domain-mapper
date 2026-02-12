import type {
  DomainModelRepository,
  StoredWorkflow,
  CreateWorkflowInput,
} from "../../ports/DomainModelRepository.js";
import { DomainModelNotFoundError } from "../../domain/domain-model/DomainModelErrors.js";

export class ManageWorkflows {
  constructor(private repo: DomainModelRepository) {}

  async add(
    modelId: string,
    input: CreateWorkflowInput,
  ): Promise<{ id: string; slug: string; title: string }> {
    const exists = await this.repo.exists(modelId);
    if (!exists) {
      throw new DomainModelNotFoundError(modelId);
    }
    const wf: StoredWorkflow = await this.repo.addWorkflow(modelId, input);
    return { id: wf.id, slug: wf.slug, title: wf.title };
  }

  async list(modelId: string): Promise<StoredWorkflow[]> {
    return this.repo.listWorkflows(modelId);
  }

  async delete(wfId: string): Promise<{ message: string }> {
    await this.repo.deleteWorkflow(wfId);
    return { message: "Deleted" };
  }
}

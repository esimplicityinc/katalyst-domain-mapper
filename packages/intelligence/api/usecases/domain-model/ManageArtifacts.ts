import type {
  DomainModelRepository,
  StoredAggregate,
  StoredDomainEvent,
  StoredValueObject,
  CreateAggregateInput,
  UpdateAggregateInput,
  CreateDomainEventInput,
  UpdateDomainEventInput,
  CreateValueObjectInput,
  UpdateValueObjectInput,
} from "../../ports/DomainModelRepository.js";
import { DomainModelNotFoundError } from "../../domain/domain-model/DomainModelErrors.js";

export class ManageArtifacts {
  constructor(private repo: DomainModelRepository) {}

  // ── Aggregates ──────────────────────────────────────────────────────────────

  async addAggregate(
    modelId: string,
    input: CreateAggregateInput,
  ): Promise<{ id: string; slug: string; title: string }> {
    const exists = await this.repo.exists(modelId);
    if (!exists) {
      throw new DomainModelNotFoundError(modelId);
    }
    const agg: StoredAggregate = await this.repo.addAggregate(modelId, input);
    return { id: agg.id, slug: agg.slug, title: agg.title };
  }

  async updateAggregate(
    aggId: string,
    input: UpdateAggregateInput,
  ): Promise<{ id: string; updated: boolean }> {
    await this.repo.updateAggregate(aggId, input);
    return { id: aggId, updated: true };
  }

  async deleteAggregate(aggId: string): Promise<{ message: string }> {
    await this.repo.deleteAggregate(aggId);
    return { message: "Deleted" };
  }

  // ── Domain Events ───────────────────────────────────────────────────────────

  async addDomainEvent(
    modelId: string,
    input: CreateDomainEventInput,
  ): Promise<{ id: string; slug: string; title: string }> {
    const exists = await this.repo.exists(modelId);
    if (!exists) {
      throw new DomainModelNotFoundError(modelId);
    }
    const event: StoredDomainEvent = await this.repo.addDomainEvent(
      modelId,
      input,
    );
    return { id: event.id, slug: event.slug, title: event.title };
  }

  async updateDomainEvent(
    eventId: string,
    input: UpdateDomainEventInput,
  ): Promise<{ id: string; updated: boolean }> {
    await this.repo.updateDomainEvent(eventId, input);
    return { id: eventId, updated: true };
  }

  async deleteDomainEvent(eventId: string): Promise<{ message: string }> {
    await this.repo.deleteDomainEvent(eventId);
    return { message: "Deleted" };
  }

  // ── Value Objects ───────────────────────────────────────────────────────────

  async addValueObject(
    modelId: string,
    input: CreateValueObjectInput,
  ): Promise<{ id: string; slug: string; title: string }> {
    const exists = await this.repo.exists(modelId);
    if (!exists) {
      throw new DomainModelNotFoundError(modelId);
    }
    const vo: StoredValueObject = await this.repo.addValueObject(
      modelId,
      input,
    );
    return { id: vo.id, slug: vo.slug, title: vo.title };
  }

  async updateValueObject(
    voId: string,
    input: UpdateValueObjectInput,
  ): Promise<{ id: string; updated: boolean }> {
    await this.repo.updateValueObject(voId, input);
    return { id: voId, updated: true };
  }

  async deleteValueObject(voId: string): Promise<{ message: string }> {
    await this.repo.deleteValueObject(voId);
    return { message: "Deleted" };
  }
}

/**
 * API client for Katalyst Bard.
 *
 * All endpoints are relative to the same origin (/api/v1/...).
 * This is a simplified port of the source intelligence web client.
 */

import type {
  DomainModel,
  DomainModelFull,
  BoundedContext,
  Aggregate,
  DomainEvent,
  ValueObject,
  GlossaryTerm,
  DomainWorkflow,
  ContributionItem,
  ContributionCounts,
} from '../types/domain';

// ── Generic fetch wrapper ──────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      (body as Record<string, string>).error ??
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(`${res.status}: ${msg}`);
  }

  return res.json();
}

// ── API client object ──────────────────────────────────────────────────────

export const api = {
  // ── Health ──────────────────────────────────────────────────────────────
  ready(): Promise<{ status: string; database: string; tables?: number }> {
    return request('/api/v1/ready');
  },

  // ── Domain Models ──────────────────────────────────────────────────────

  listDomainModels(): Promise<DomainModel[]> {
    return request('/api/v1/taxonomy/domain-models');
  },

  getDomainModel(id: string): Promise<DomainModelFull> {
    return request(`/api/v1/taxonomy/domain-models/${id}`);
  },

  createDomainModel(data: {
    name: string;
    description?: string;
  }): Promise<DomainModel> {
    return request('/api/v1/taxonomy/domain-models', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDomainModel(
    id: string,
    data: { name?: string; description?: string }
  ): Promise<{ message: string }> {
    return request(`/api/v1/taxonomy/domain-models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDomainModel(id: string): Promise<{ deleted: boolean }> {
    return request(`/api/v1/taxonomy/domain-models/${id}`, {
      method: 'DELETE',
    });
  },

  // ── Bounded Contexts ───────────────────────────────────────────────────

  createBoundedContext(
    modelId: string,
    data: {
      slug: string;
      title: string;
      responsibility: string;
      description?: string;
      sourceDirectory?: string;
      subdomainType?: 'core' | 'supporting' | 'generic';
    }
  ): Promise<BoundedContext> {
    return request(`/api/v1/taxonomy/domain-models/${modelId}/contexts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBoundedContext(
    modelId: string,
    contextId: string,
    data: Partial<{
      title: string;
      responsibility: string;
      description: string;
      sourceDirectory: string;
      subdomainType: 'core' | 'supporting' | 'generic' | null;
    }>
  ): Promise<BoundedContext> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/contexts/${contextId}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  },

  deleteBoundedContext(
    modelId: string,
    contextId: string
  ): Promise<{ deleted: boolean }> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/contexts/${contextId}`,
      { method: 'DELETE' }
    );
  },

  // ── Aggregates ─────────────────────────────────────────────────────────

  createAggregate(
    modelId: string,
    data: {
      contextId: string;
      slug: string;
      title: string;
      rootEntity: string;
      entities?: string[];
      valueObjects?: string[];
      events?: string[];
      commands?: string[];
      invariants?: { rule: string; description?: string }[];
      sourceFile?: string;
      status?: string;
    }
  ): Promise<Aggregate> {
    return request(`/api/v1/taxonomy/domain-models/${modelId}/aggregates`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAggregate(
    modelId: string,
    aggregateId: string,
    data: Partial<Aggregate>
  ): Promise<Aggregate> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/aggregates/${aggregateId}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  },

  deleteAggregate(modelId: string, aggregateId: string): Promise<void> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/aggregates/${aggregateId}`,
      { method: 'DELETE' }
    );
  },

  // ── Domain Events ──────────────────────────────────────────────────────

  createDomainEvent(
    modelId: string,
    data: {
      contextId: string;
      aggregateId?: string;
      slug: string;
      title: string;
      description?: string;
      payload?: { name: string; type: string; description?: string }[];
      consumedBy?: string[];
      triggers?: string[];
      sideEffects?: string[];
      sourceFile?: string;
    }
  ): Promise<DomainEvent> {
    return request(`/api/v1/taxonomy/domain-models/${modelId}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDomainEvent(
    modelId: string,
    eventId: string,
    data: Partial<DomainEvent>
  ): Promise<DomainEvent> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/events/${eventId}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  },

  deleteDomainEvent(modelId: string, eventId: string): Promise<void> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/events/${eventId}`,
      { method: 'DELETE' }
    );
  },

  // ── Value Objects ──────────────────────────────────────────────────────

  createValueObject(
    modelId: string,
    data: {
      contextId: string;
      slug: string;
      title: string;
      description?: string;
      properties?: { name: string; type: string; description?: string }[];
      validationRules?: string[];
      immutable?: boolean;
      sourceFile?: string;
    }
  ): Promise<ValueObject> {
    return request(`/api/v1/taxonomy/domain-models/${modelId}/value-objects`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateValueObject(
    modelId: string,
    voId: string,
    data: Partial<ValueObject>
  ): Promise<ValueObject> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/value-objects/${voId}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  },

  deleteValueObject(modelId: string, voId: string): Promise<void> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/value-objects/${voId}`,
      { method: 'DELETE' }
    );
  },

  // ── Glossary ───────────────────────────────────────────────────────────

  createGlossaryTerm(
    modelId: string,
    data: {
      term: string;
      definition: string;
      contextId?: string;
      aliases?: string[];
      examples?: string[];
    }
  ): Promise<GlossaryTerm> {
    return request(`/api/v1/taxonomy/domain-models/${modelId}/glossary`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGlossaryTerm(
    modelId: string,
    termId: string,
    data: Partial<GlossaryTerm>
  ): Promise<GlossaryTerm> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/glossary/${termId}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  },

  deleteGlossaryTerm(modelId: string, termId: string): Promise<void> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/glossary/${termId}`,
      { method: 'DELETE' }
    );
  },

  // ── Workflows ──────────────────────────────────────────────────────────

  listWorkflows(modelId: string): Promise<DomainWorkflow[]> {
    return request(`/api/v1/taxonomy/domain-models/${modelId}/workflows`);
  },

  createWorkflow(
    modelId: string,
    data: {
      slug: string;
      title: string;
      description?: string;
      states?: { name: string; description?: string; isTerminal?: boolean; isError?: boolean }[];
      transitions?: { from: string; to: string; label?: string; isAsync?: boolean }[];
    }
  ): Promise<DomainWorkflow> {
    return request(`/api/v1/taxonomy/domain-models/${modelId}/workflows`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateWorkflow(
    modelId: string,
    wfId: string,
    data: Partial<DomainWorkflow>
  ): Promise<DomainWorkflow> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/workflows/${wfId}`,
      { method: 'PUT', body: JSON.stringify(data) }
    );
  },

  deleteWorkflow(modelId: string, workflowId: string): Promise<void> {
    return request(
      `/api/v1/taxonomy/domain-models/${modelId}/workflows/${workflowId}`,
      { method: 'DELETE' }
    );
  },

  // ── Contributions ──────────────────────────────────────────────────────

  contributions: {
    async list(params?: {
      status?: string;
      type?: string;
      search?: string;
      limit?: number;
    }): Promise<{ items: ContributionItem[]; counts: Record<string, number> }> {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.type) qs.set('type', params.type);
      if (params?.search) qs.set('search', params.search);
      if (params?.limit) qs.set('limit', String(params.limit));
      const query = qs.toString();
      const result = await request<ContributionItem[] | { items: ContributionItem[]; counts: Record<string, number> }>(`/api/v1/contributions${query ? `?${query}` : ''}`);
      // Server returns a flat array; normalize to { items, counts }
      if (Array.isArray(result)) {
        return { items: result, counts: {} };
      }
      return result;
    },

    counts(): Promise<ContributionCounts> {
      return request('/api/v1/contributions/counts');
    },

    accept(_type: string, id: string): Promise<{ status: string }> {
      return request(`/api/v1/contributions/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ action: 'accept', actor: 'reviewer' }),
      });
    },

    reject(
      _type: string,
      id: string,
      feedback: string
    ): Promise<{ status: string }> {
      return request(`/api/v1/contributions/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ action: 'reject', actor: 'reviewer', feedback }),
      });
    },

    submit(_type: string, id: string): Promise<{ status: string }> {
      return request(`/api/v1/contributions/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ action: 'submit', actor: 'contributor' }),
      });
    },
  },
};

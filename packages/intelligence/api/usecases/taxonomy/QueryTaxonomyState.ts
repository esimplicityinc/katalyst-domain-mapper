import type {
  TaxonomyRepository,
  StoredTaxonomySnapshot,
  TaxonomyNodeSummary,
  TaxonomyEnvironmentSummary,
  TaxonomyHierarchy,
  TaxonomyPluginSummary,
} from "../../ports/TaxonomyRepository.js";

export class QueryTaxonomyState {
  constructor(private taxonomyRepo: TaxonomyRepository) {}

  async getLatest(): Promise<StoredTaxonomySnapshot | null> {
    return this.taxonomyRepo.getLatestSnapshot();
  }

  async getById(id: string): Promise<StoredTaxonomySnapshot | null> {
    return this.taxonomyRepo.getSnapshotById(id);
  }

  async listSnapshots(limit?: number): Promise<StoredTaxonomySnapshot[]> {
    return this.taxonomyRepo.listSnapshots(limit);
  }

  async getNodes(nodeType?: string): Promise<TaxonomyNodeSummary[]> {
    return this.taxonomyRepo.getNodes(nodeType);
  }

  async getHierarchy(): Promise<TaxonomyHierarchy> {
    return this.taxonomyRepo.getHierarchy();
  }

  async getEnvironments(): Promise<TaxonomyEnvironmentSummary[]> {
    return this.taxonomyRepo.getEnvironments();
  }

  async getPluginSummary(): Promise<TaxonomyPluginSummary> {
    return this.taxonomyRepo.getPluginSummary();
  }

  async getCapabilitiesForNode(nodeName: string): Promise<string[]> {
    return this.taxonomyRepo.getCapabilitiesByNode(nodeName);
  }
}

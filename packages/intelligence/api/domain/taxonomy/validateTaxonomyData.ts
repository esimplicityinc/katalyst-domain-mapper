import { TaxonomyValidationError } from "./TaxonomyErrors.js";

// ── Validated Input Shape ──────────────────────────────────────────────────

export interface ValidatedTaxonomyNode {
  name: string;
  nodeType: string;
  fqtn: string;
  description: string | null;
  parentNode: string | null;
  owners: string[];
  environments: string[];
  labels: Record<string, string>;
  dependsOn: string[];
}

export interface ValidatedTaxonomyEnvironment {
  name: string;
  description: string | null;
  parentEnvironment: string | null;
  promotionTargets: string[];
  templateReplacements: Record<string, string>;
}

export interface ValidatedTaxonomyLayerType {
  name: string;
  description: string | null;
  defaultLayerDir: string | null;
}

export interface ValidatedTaxonomyCapability {
  name: string;
  description: string;
  categories: string[];
  dependsOn: string[];
}

export interface ValidatedTaxonomyCapabilityRel {
  name: string;
  node: string;
  relationshipType: string;
  capabilities: string[];
}

export interface ValidatedTaxonomyAction {
  name: string;
  actionType: string;
  layerType: string | null;
  tags: string[];
}

export interface ValidatedTaxonomyStage {
  name: string;
  description: string | null;
  dependsOn: string[];
}

export interface ValidatedTaxonomyTool {
  name: string;
  description: string;
  actions: string[];
}

export interface ValidatedTaxonomyData {
  project: string;
  version: string;
  generated: string;
  nodes: ValidatedTaxonomyNode[];
  environments: ValidatedTaxonomyEnvironment[];
  layerTypes: ValidatedTaxonomyLayerType[];
  capabilities: ValidatedTaxonomyCapability[];
  capabilityRels: ValidatedTaxonomyCapabilityRel[];
  actions: ValidatedTaxonomyAction[];
  stages: ValidatedTaxonomyStage[];
  tools: ValidatedTaxonomyTool[];
  rawPayload: Record<string, unknown>;
}

// ── Validation Function ────────────────────────────────────────────────────

const VALID_NODE_TYPES = new Set([
  "system",
  "subsystem",
  "stack",
  "layer",
  "user",
  "org_unit",
]);

export function validateTaxonomyData(data: unknown): ValidatedTaxonomyData {
  if (!data || typeof data !== "object") {
    throw new TaxonomyValidationError("Payload must be a JSON object");
  }

  const raw = data as Record<string, unknown>;

  // Required top-level fields
  if (!raw.project || typeof raw.project !== "string") {
    throw new TaxonomyValidationError("Missing required field: project");
  }
  if (!raw.version || typeof raw.version !== "string") {
    throw new TaxonomyValidationError("Missing required field: version");
  }

  const generated =
    typeof raw.generated === "string"
      ? raw.generated
      : new Date().toISOString();

  // Parse documents array (taxonomy nodes)
  const documents = Array.isArray(raw.documents) ? raw.documents : [];
  const nodes: ValidatedTaxonomyNode[] = [];

  // Build a name->FQTN map by resolving parent chains
  const parentMap = new Map<string, string>();
  for (const doc of documents) {
    if (!doc || typeof doc !== "object") continue;
    const d = doc as Record<string, unknown>;
    const metadata = d.metadata as Record<string, unknown> | undefined;
    const spec = d.spec as Record<string, unknown> | undefined;
    const name = metadata?.name as string | undefined;
    const parents = spec?.parents as Record<string, unknown> | undefined;
    const parentNode = parents?.node as string | undefined;
    if (name) {
      parentMap.set(name, parentNode ?? "");
    }
  }

  // Compute FQTN by walking parent chain
  function computeFqtn(name: string): string {
    const chain: string[] = [];
    let current: string | undefined = name;
    const visited = new Set<string>();
    while (current && !visited.has(current)) {
      visited.add(current);
      chain.unshift(current);
      const parent = parentMap.get(current);
      current = parent || undefined;
    }
    return chain.join(".");
  }

  for (const doc of documents) {
    if (!doc || typeof doc !== "object") continue;
    const d = doc as Record<string, unknown>;

    const metadata = (d.metadata as Record<string, unknown>) ?? {};
    const spec = (d.spec as Record<string, unknown>) ?? {};
    const name = metadata.name as string;
    const nodeType = (d.taxonomyNodeType ?? d.taxonomy_node_type) as string;

    if (!name || typeof name !== "string") continue;
    if (!nodeType || !VALID_NODE_TYPES.has(nodeType)) continue;

    const parents = spec.parents as Record<string, unknown> | undefined;
    const dependsOnObj = spec.dependsOn as
      | Record<string, unknown>
      | undefined;
    const labels = (metadata.labels as Record<string, string>) ?? {};

    nodes.push({
      name,
      nodeType,
      fqtn: computeFqtn(name),
      description: (spec.description as string) ?? null,
      parentNode: (parents?.node as string) ?? null,
      owners: Array.isArray(spec.owners) ? spec.owners : [],
      environments: Array.isArray(spec.environments) ? spec.environments : [],
      labels,
      dependsOn: Array.isArray(dependsOnObj?.nodes) ? dependsOnObj.nodes : [],
    });
  }

  // Parse environments
  const rawEnvs = Array.isArray(raw.environments) ? raw.environments : [];
  const environments: ValidatedTaxonomyEnvironment[] = [];

  for (const env of rawEnvs) {
    if (!env || typeof env !== "object") continue;
    const e = env as Record<string, unknown>;
    const name = e.name as string;
    if (!name) continue;

    const spec = (e.spec as Record<string, unknown>) ?? e;
    const parents = spec.parents as Record<string, unknown> | undefined;

    environments.push({
      name,
      description: (e.description as string) ?? (spec.description as string) ?? null,
      parentEnvironment: (parents?.environment as string) ?? null,
      promotionTargets: Array.isArray(spec.promotionTargets)
        ? spec.promotionTargets
        : [],
      templateReplacements:
        (e.templateReplacements as Record<string, string>) ??
        (spec.templateReplacements as Record<string, string>) ??
        {},
    });
  }

  // Parse plugins (optional arrays in payload)
  const layerTypes: ValidatedTaxonomyLayerType[] = parseArrayField(
    raw.layerTypes,
    (item) => ({
      name: item.name as string,
      description: (item.description as string) ?? null,
      defaultLayerDir: (item.defaultLayerDir ?? item.default_layer_dir) as string ?? null,
    }),
  );

  const capabilities: ValidatedTaxonomyCapability[] = parseArrayField(
    raw.capabilities,
    (item) => ({
      name: item.name as string,
      description: (item.description as string) ?? "",
      categories: Array.isArray(item.categories) ? item.categories : [],
      dependsOn: Array.isArray(item.dependsOnCapabilities ?? item.depends_on_capabilities)
        ? (item.dependsOnCapabilities ?? item.depends_on_capabilities) as string[]
        : [],
    }),
  );

  const capabilityRels: ValidatedTaxonomyCapabilityRel[] = parseArrayField(
    raw.capabilityRels ?? raw.capabilityRelationships,
    (item) => ({
      name: item.name as string,
      node: item.node as string,
      relationshipType:
        (item.relationshipType ?? item.relationship_type) as string,
      capabilities: Array.isArray(item.capabilities) ? item.capabilities : [],
    }),
  );

  const actions: ValidatedTaxonomyAction[] = parseArrayField(
    raw.actions,
    (item) => ({
      name: item.name as string,
      actionType: (item.actionType ?? item.action_type) as string,
      layerType: (item.layerType ?? item.layer_type) as string ?? null,
      tags: Array.isArray(item.tags) ? item.tags : [],
    }),
  );

  const stages: ValidatedTaxonomyStage[] = parseArrayField(
    raw.stages,
    (item) => ({
      name: item.name as string,
      description: (item.description as string) ?? null,
      dependsOn: Array.isArray(item.dependsOn ?? item.depends_on)
        ? (item.dependsOn ?? item.depends_on) as string[]
        : [],
    }),
  );

  const tools: ValidatedTaxonomyTool[] = parseArrayField(
    raw.tools,
    (item) => ({
      name: item.name as string,
      description: (item.description as string) ?? "",
      actions: Array.isArray(item.actions) ? item.actions : [],
    }),
  );

  return {
    project: raw.project as string,
    version: raw.version as string,
    generated,
    nodes,
    environments,
    layerTypes,
    capabilities,
    capabilityRels,
    actions,
    stages,
    tools,
    rawPayload: raw as Record<string, unknown>,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseArrayField<T>(
  field: unknown,
  mapper: (item: Record<string, unknown>) => T,
): T[] {
  if (!Array.isArray(field)) return [];
  const results: T[] = [];
  for (const item of field) {
    if (!item || typeof item !== "object") continue;
    try {
      const mapped = mapper(item as Record<string, unknown>);
      results.push(mapped);
    } catch {
      // Skip invalid items
    }
  }
  return results;
}

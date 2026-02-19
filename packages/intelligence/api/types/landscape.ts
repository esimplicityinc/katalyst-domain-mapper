/**
 * Business Landscape Types (API-only)
 *
 * Graph data types for the landscape endpoint.
 * Layout types (positions, system bounds, etc.) live in the
 * frontend package since layout is a client-side concern.
 */

// ── System Nodes (from Taxonomy) ──────────────────────────────────────────

export interface TaxonomySystemNode {
  name: string;
  nodeType: "system" | "subsystem" | "stack" | "layer";
  fqtn: string;
  description: string | null;
  children: TaxonomySystemNode[];
  owners?: string[];
  environments?: string[];
}

// ── Bounded Context Resolution ──────────────────────────────────────────────

export type ContextType = "internal" | "external-system" | "human-process" | "unknown";

export interface ResolvedContext {
  id: string;
  slug: string;
  title: string;
  contextType: ContextType;
  taxonomyNode?: string; // FQTN or node name
  subdomainType?: "core" | "supporting" | "generic" | null;
  teamOwnership?: string;
}

// ── Capabilities ────────────────────────────────────────────────────────────

export interface LandscapeCapability {
  id: string;
  name: string;
  category: string;
  taxonomyNode?: string;
  tag?: string; // @CAP-xxx or display tag for traceability
  status: "planned" | "stable" | "deprecated";
  /** Derived status rolled up from children (equals status for leaves) */
  derivedStatus: "planned" | "stable" | "deprecated";
  // From taxonomy capability relationships
  relationshipType?: "supports" | "depends-on" | "implements" | "enables";
  /** Source of this capability: "governance" | "taxonomy" | "merged" */
  source: "governance" | "taxonomy" | "merged";
  /** Slug of the parent taxonomy capability (null = root) */
  parentName: string | null;
  /** Taxonomy node(s) that implement this capability */
  taxonomyNodes: string[];
}

// ── Domain Events (Cross-System Edges) ─────────────────────────────────────

export interface LandscapeEvent {
  id: string;
  slug: string;
  title: string;
  sourceContextId: string; // Producer
  sourceContextSlug: string;
  consumedBy: string[]; // Consumer slugs (may be unresolved)
  resolvedConsumers: ResolvedConsumer[];
  unresolvedConsumers: string[];
  triggers?: string[];
  sideEffects?: string[];
  payload?: Array<{ name: string; type: string; description?: string }>;
  sourceCapabilityId?: string;
  targetCapabilityIds?: string[];
}

export interface ResolvedConsumer {
  slug: string;
  contextId?: string; // If resolved to a known context
  contextType: ContextType;
  title?: string;
}

// ── Workflows (Business Processes) ────────────────────────────────────────

export interface LandscapeWorkflow {
  id: string;
  slug: string;
  title: string;
  description?: string;
  contextIds: string[]; // Contexts this workflow spans
  capabilityIds?: string[]; // Capabilities this workflow threads through (ordered)
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface WorkflowState {
  name: string;
  type: "initial" | "intermediate" | "terminal";
  isError?: boolean;
  x?: number;
  y?: number;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  label?: string;
  isAsync?: boolean;
  trigger?: string; // Event that triggers this transition
}

// ── Personas & User Stories ────────────────────────────────────────────────

export interface LandscapePersona {
  id: string; // PER-xxx
  name: string;
  type: "human" | "bot" | "system" | "external_api";
  archetype?: string;
  typicalCapabilities?: string[]; // Capability IDs
  tag: string; // @PER-xxx
}

export interface LandscapeUserStory {
  id: string; // US-xxx
  title: string;
  persona: string; // PER-xxx
  capabilities: string[]; // CAP-xxx IDs (min 1)
  status: "draft" | "approved" | "implementing" | "complete" | "deprecated";
}

// ── Inferred Unknown Systems ───────────────────────────────────────────────

export interface InferredSystem {
  slug: string; // From unresolved consumedBy reference
  inferredFrom: string[]; // Event IDs that reference this
  contextType: "unknown";
}

// ── Capability Tree Node (for hierarchy-aware consumers) ──────────────────

export interface LandscapeCapabilityNode {
  id: string;
  name: string;
  description: string;
  tag: string | null;
  status: "planned" | "stable" | "deprecated";
  derivedStatus: "planned" | "stable" | "deprecated";
  taxonomyNodes: string[];
  children: LandscapeCapabilityNode[];
}

// ── The Complete Landscape Graph ───────────────────────────────────────────

export interface LandscapeGraph {
  // Taxonomy hierarchy
  systems: TaxonomySystemNode[];

  // Domain Model entities
  contexts: ResolvedContext[];
  events: LandscapeEvent[];
  workflows: LandscapeWorkflow[];

  // Governance + Taxonomy capabilities (merged flat list for indexing)
  capabilities: LandscapeCapability[];

  /**
   * Hierarchical capability tree sourced from taxonomy.
   * Use this for tree-based UI rendering; use `capabilities` for flat lookups.
   */
  capabilityTree: LandscapeCapabilityNode[];

  // Governance entities
  personas: LandscapePersona[];
  userStories: LandscapeUserStory[];

  // Inferred entities
  inferredSystems: InferredSystem[];

  // Metadata
  domainModelId?: string;
  taxonomySnapshotId?: string;
  governanceSnapshotId?: string;
  generatedAt: string;
}

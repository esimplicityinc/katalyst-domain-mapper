/**
 * Business Landscape Types
 * 
 * Types for the Business Landscape visualization that merges:
 * - Taxonomy (system hierarchy)
 * - Governance (capabilities, personas, user stories)
 * - Domain Model (contexts, events, workflows, aggregates)
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
  tag?: string; // @CAP-xxx
  status: "planned" | "stable" | "deprecated";
  // From taxonomy capability relationships
  relationshipType?: "supports" | "depends-on" | "implements" | "enables";
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

// ── Persona → User Story → Capability Lines ────────────────────────────────

/** A line from a user story box to a capability */
export interface PersonaStoryLine {
  personaId: string;
  personaIndex: number;
  userStoryId: string;
  userStoryTitle: string;
  userStoryStatus: string;
  capabilityId: string;
  /** Position of the user story box (right edge center for line origin) */
  storyBoxPos: Position;
  /** SVG path from story box right edge to capability */
  path: PathData;
}

/** Positioned user story box in the left column */
export interface UserStoryBox {
  id: string;
  title: string;
  personaId: string;
  personaIndex: number;
  capabilities: string[];
  status: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── Collapsed Persona Groups ───────────────────────────────────────────────

/** A collapsed group box representing all stories for a persona */
export interface CollapsedPersonaGroup {
  personaId: string;
  personaIndex: number;
  personaName: string;
  storyCount: number;
  /** Union of all capability IDs across this persona's stories */
  uniqueCapabilities: string[];
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── Animated Persona Dots (Phase C) ────────────────────────────────────────

/** A single animated dot representing a persona interacting with a workflow */
export interface PersonaWorkflowDot {
  personaId: string;
  personaName: string;
  personaIndex: number; // For deterministic color assignment
  workflowId: string;
  workflowSlug: string;
  /** Stagger offset (0-based) among dots on the same workflow */
  staggerIndex: number;
  /** Total dots on this workflow (for even spacing) */
  totalOnWorkflow: number;
}

// ── Inferred Unknown Systems ───────────────────────────────────────────────

export interface InferredSystem {
  slug: string; // From unresolved consumedBy reference
  inferredFrom: string[]; // Event IDs that reference this
  contextType: "unknown";
}

// ── The Complete Landscape Graph ───────────────────────────────────────────

export interface LandscapeGraph {
  // Taxonomy hierarchy
  systems: TaxonomySystemNode[];
  
  // Domain Model entities
  contexts: ResolvedContext[];
  events: LandscapeEvent[];
  workflows: LandscapeWorkflow[];
  
  // Governance entities
  capabilities: LandscapeCapability[];
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

// ── Layout Engine Abstraction ──────────────────────────────────────────────

/** Visual grouping box (e.g. "CORE DOMAIN", "EXTERNAL SYSTEMS") */
export interface GroupBox {
  label: string;
  /** Subdomain type key or "external" */
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LandscapePositions {
  /** Context node positions keyed by context ID (DEPRECATED - use contextOverlays) */
  contextPositions: Map<string, Position>;

  /** Context overlay bounding boxes keyed by context ID */
  contextOverlays: Map<string, ContextOverlay>;

  /** Visual subdomain/type group boxes */
  groupBoxes: GroupBox[];

  /** Inferred unknown system positions keyed by slug */
  inferredPositions: Map<string, Position>;

  /** System bounding boxes from taxonomy (can be nested) */
  systemBounds: Map<string, SystemBounds>;

  /** Capability port-node positions keyed by capability ID */
  capabilityPositions: Map<string, Position>;

  /** Persona badge positions keyed by persona ID */
  personaPositions: Map<string, Position>;

  /** User story boxes positioned in left column */
  userStoryBoxes: UserStoryBox[];

  /** Pre-computed event edge SVG paths keyed by edge key */
  eventPaths: Map<string, PathData>;

  /** Pre-computed workflow flow paths (invisible, used for dot animation) */
  workflowPaths: Map<string, PathData>;

  /** Persona → User Story → Capability connection lines */
  personaStoryLines: PersonaStoryLine[];

  /** Animated persona dots riding on workflow event chains */
  personaFlowDots: PersonaWorkflowDot[];

  /** Event edge key → human-readable event name for labels */
  eventLabels: Map<string, string>;

  /** Event edge key → workflow IDs that contain this edge */
  eventWorkflowMap: Map<string, string[]>;

  /** Chained event-edge SVG paths per workflow (concatenated for dot animation) */
  workflowEventChains: Map<string, PathData>;

  // ── Collapsed persona group data ────────────────────────────────────

  /** Collapsed group boxes (one per persona) */
  collapsedPersonaGroups: CollapsedPersonaGroup[];

  /** Connection lines from collapsed groups to capabilities (one per unique cap per persona) */
  collapsedPersonaLines: PersonaStoryLine[];

  /** Persona badge positions when all groups are collapsed (tighter vertical spacing) */
  collapsedPersonaPositions: Map<string, Position>;

  /** User story boxes positioned for collapsed layout (used for animation targets) */
  collapsedUserStoryBoxes: UserStoryBox[];

  /** Context node radius (for consistent sizing) */
  contextRadius: number;

  /** Canvas dimensions */
  canvasWidth: number;
  canvasHeight: number;
}

export interface SystemBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  fqtn: string;
  nodeType: string;
  depth: number; // 0 = root system, 1 = subsystem, 2 = stack, ...
  children?: SystemBounds[]; // Nested subsystems/stacks
}

/** Bounded context as a transparent overlay box spanning taxonomy nodes */
export interface ContextOverlay {
  contextId: string;
  title: string;
  contextType: ContextType;
  subdomainType?: "core" | "supporting" | "generic" | null;
  x: number;
  y: number;
  width: number;
  height: number;
  /** FQTNs of taxonomy nodes this context overlays */
  spansTaxonomyNodes: string[];
}

export interface Position {
  x: number;
  y: number;
}

export interface PathData {
  d: string; // SVG path data
  points?: Position[]; // Underlying points for hover/interaction
}

// ── Layout Engine Interface ────────────────────────────────────────────────

export interface LandscapeLayoutEngine {
  name: string;
  layout(graph: LandscapeGraph): Promise<LandscapePositions>;
}

/**
 * Landscape Lint Report Types
 *
 * Output types for the landscape integrity linter. Every finding includes
 * a rule identifier, severity, category, human-readable message, the
 * affected entity, and an actionable suggestion.
 */

// ── Severity ──────────────────────────────────────────────────────────────────

/**
 * error   - Data is inconsistent; a referenced entity does not exist.
 * warning - Data is valid but a significant gap or coverage hole exists.
 * info    - Advisory signal; worth noting but not blocking.
 */
export type LintSeverity = "error" | "warning" | "info";

// ── Category ──────────────────────────────────────────────────────────────────

export type LintCategory =
  /** An ID/slug reference points to a non-existent entity */
  | "broken-reference"
  /** An entity exists but nothing in the model references it */
  | "orphaned-entity"
  /** An expected relationship between two entities is absent */
  | "missing-link"
  /** Coverage is partial (e.g. a persona has no user stories) */
  | "incomplete-coverage"
  /** A workflow spans contexts that have no connecting domain events */
  | "disconnected-workflow"
  /** A logical inconsistency in the model (semantic mismatch) */
  | "semantic-gap";

// ── Finding ───────────────────────────────────────────────────────────────────

export interface LintRelatedEntity {
  type: string;
  id: string;
  name?: string;
}

export interface LintFinding {
  /** Machine-readable rule identifier, e.g. "story-persona-exists" */
  rule: string;
  severity: LintSeverity;
  category: LintCategory;
  /** Human-readable description of the problem */
  message: string;
  /** The primary entity type affected */
  entityType: string;
  /** The primary entity's ID */
  entityId: string;
  /** Human-readable name for display purposes */
  entityName?: string;
  /** Other entities involved in this finding */
  relatedEntities?: LintRelatedEntity[];
  /** Actionable suggestion for how to resolve the finding */
  suggestion?: string;
}

// ── Coverage Scores ───────────────────────────────────────────────────────────

export interface LintCoverageScores {
  /** Percentage (0-100) of personas referenced by at least one user story */
  personaToStory: number;
  /** Percentage of user stories referencing at least one valid capability */
  storyToCapability: number;
  /** Percentage of capabilities mapped to a bounded context via taxonomyNode */
  capabilityToContext: number;
  /** Percentage of bounded contexts that produce at least one domain event */
  contextToEvent: number;
  /** Percentage of domain events with at least one resolved consumer */
  eventToConsumer: number;
  /** Percentage of workflows where all contextIds resolve to known contexts */
  workflowToContext: number;
  /** Percentage of domain events with a sourceCapabilityId set */
  eventToCapability: number;
}

// ── Summary ───────────────────────────────────────────────────────────────────

export interface LintSummary {
  total: number;
  byCategory: Record<LintCategory, number>;
  bySeverity: Record<LintSeverity, number>;
  coverageScores: LintCoverageScores;
}

// ── Report ────────────────────────────────────────────────────────────────────

export interface LintReport {
  domainModelId: string;
  governanceSnapshotId?: string;
  taxonomySnapshotId?: string;
  generatedAt: string;
  findings: LintFinding[];
  summary: LintSummary;
}

// ── Input context for the linter ──────────────────────────────────────────────

/**
 * Normalized persona from governance raw index
 */
export interface LintPersona {
  id: string;
  name: string;
  type: string;
  archetype?: string;
  typicalCapabilities?: string[];
}

/**
 * Normalized user story from governance raw index
 */
export interface LintUserStory {
  id: string;
  title: string;
  persona: string;
  capabilities: string[];
  status: string;
}

/**
 * Normalized governance capability
 */
export interface LintCapability {
  id: string;
  title: string;
  status: string;
  taxonomyNode?: string;
  roadCount?: number;
  storyCount?: number;
}

/**
 * Normalized taxonomy node (name + fqtn sufficient for lint checks)
 */
export interface LintTaxonomyNode {
  name: string;
  fqtn: string;
  nodeType: string;
}

/**
 * Bounded context (from DomainModelWithArtifacts)
 */
export interface LintBoundedContext {
  id: string;
  slug: string;
  title: string;
  contextType: string | null;
  subdomainType: string | null;
  taxonomyNode?: string | null;
  relationships: Array<{ targetContextId: string; type?: string; description?: string }>;
}

/**
 * Aggregate (from DomainModelWithArtifacts)
 */
export interface LintAggregate {
  id: string;
  contextId: string;
  slug: string;
  title: string;
  rootEntity: string;
  events: string[];
}

/**
 * Domain event (from DomainModelWithArtifacts)
 */
export interface LintDomainEvent {
  id: string;
  contextId: string;
  aggregateId: string | null;
  slug: string;
  title: string;
  consumedBy: string[];
  triggers: string[];
  sideEffects: string[];
  sourceCapabilityId: string | null;
  targetCapabilityIds: string[];
}

/**
 * Glossary term (from DomainModelWithArtifacts)
 */
export interface LintGlossaryTerm {
  id: string;
  contextId: string | null;
  term: string;
}

/**
 * Workflow (from DomainModelWithArtifacts)
 */
export interface LintWorkflow {
  id: string;
  slug: string;
  title: string;
  contextIds: string[];
  transitions: Array<{
    from: string;
    to: string;
    trigger?: string;
    label?: string;
    isAsync?: boolean;
  }>;
}

/**
 * The full input context passed to every lint rule.
 * All data pre-loaded; rules are pure functions.
 */
export interface LintContext {
  domainModelId: string;
  governanceSnapshotId?: string;
  taxonomySnapshotId?: string;

  // Governance domain
  personas: LintPersona[];
  userStories: LintUserStory[];
  capabilities: LintCapability[];

  // Domain model domain
  boundedContexts: LintBoundedContext[];
  aggregates: LintAggregate[];
  domainEvents: LintDomainEvent[];
  glossaryTerms: LintGlossaryTerm[];
  workflows: LintWorkflow[];

  // Taxonomy domain
  taxonomyNodes: LintTaxonomyNode[];
}

/**
 * Test fixtures for lint rule unit tests.
 *
 * Every builder returns a minimal valid entity. Tests override specific
 * fields to trigger the rule under test.
 */

import type {
  LintContext,
  LintPersona,
  LintUserStory,
  LintCapability,
  LintTaxonomyNode,
  LintTaxonomyCapability,
  LintBoundedContext,
  LintAggregate,
  LintDomainEvent,
  LintGlossaryTerm,
  LintWorkflow,
} from "../LintReport.js";

// ── Builders ──────────────────────────────────────────────────────────────────

export function makePersona(overrides: Partial<LintPersona> = {}): LintPersona {
  return {
    id: "PER-001",
    name: "Test Persona",
    type: "human",
    typicalCapabilities: ["CAP-001"],
    ...overrides,
  };
}

export function makeUserStory(overrides: Partial<LintUserStory> = {}): LintUserStory {
  return {
    id: "US-001",
    title: "Test User Story",
    persona: "PER-001",
    capabilities: ["CAP-001"],
    status: "approved",
    ...overrides,
  };
}

export function makeCapability(overrides: Partial<LintCapability> = {}): LintCapability {
  return {
    id: "CAP-001",
    title: "Test Capability",
    status: "stable",
    taxonomyNode: "system-a",
    roadCount: 1,
    storyCount: 1,
    ...overrides,
  };
}

export function makeTaxonomyNode(overrides: Partial<LintTaxonomyNode> = {}): LintTaxonomyNode {
  return {
    name: "system-a",
    fqtn: "system-a",
    nodeType: "system",
    ...overrides,
  };
}

export function makeTaxonomyCapability(overrides: Partial<LintTaxonomyCapability> = {}): LintTaxonomyCapability {
  return {
    name: "regulatory-compliance",
    description: "Regulatory compliance capability",
    tag: null,
    parentName: null,
    derivedStatus: "stable",
    taxonomyNodes: ["system-a"],
    ...overrides,
  };
}

export function makeBoundedContext(overrides: Partial<LintBoundedContext> = {}): LintBoundedContext {
  return {
    id: "ctx-001",
    slug: "context-a",
    title: "Context A",
    contextType: "internal",
    subdomainType: "core",
    taxonomyNode: "system-a",
    relationships: [],
    ...overrides,
  };
}

export function makeAggregate(overrides: Partial<LintAggregate> = {}): LintAggregate {
  return {
    id: "agg-001",
    contextId: "ctx-001",
    slug: "order",
    title: "Order",
    rootEntity: "Order",
    events: ["order-placed"],
    ...overrides,
  };
}

export function makeDomainEvent(overrides: Partial<LintDomainEvent> = {}): LintDomainEvent {
  return {
    id: "evt-001",
    contextId: "ctx-001",
    aggregateId: "agg-001",
    slug: "order-placed",
    title: "Order Placed",
    consumedBy: ["context-b"],
    triggers: [],
    sideEffects: [],
    sourceCapabilityId: "CAP-001",
    targetCapabilityIds: [],
    ...overrides,
  };
}

export function makeGlossaryTerm(overrides: Partial<LintGlossaryTerm> = {}): LintGlossaryTerm {
  return {
    id: "gls-001",
    contextId: "ctx-001",
    term: "Order",
    ...overrides,
  };
}

export function makeWorkflow(overrides: Partial<LintWorkflow> = {}): LintWorkflow {
  return {
    id: "wf-001",
    slug: "order-flow",
    title: "Order Flow",
    contextIds: ["ctx-001", "ctx-002"],
    transitions: [
      { from: "pending", to: "confirmed", trigger: "order-placed" },
    ],
    ...overrides,
  };
}

// ── Empty context ─────────────────────────────────────────────────────────────

export function emptyContext(overrides: Partial<LintContext> = {}): LintContext {
  return {
    domainModelId: "model-001",
    personas: [],
    userStories: [],
    capabilities: [],
    boundedContexts: [],
    aggregates: [],
    domainEvents: [],
    glossaryTerms: [],
    workflows: [],
    taxonomyNodes: [],
    taxonomyCapabilities: [],
    ...overrides,
  };
}

// ── Full valid context (no findings expected from referential/coverage rules) ─

export function validContext(): LintContext {
  const persona = makePersona();
  const capability = makeCapability();
  const story = makeUserStory();
  const taxNode = makeTaxonomyNode();
  const ctxA = makeBoundedContext({ id: "ctx-001", slug: "context-a" });
  const ctxB = makeBoundedContext({
    id: "ctx-002",
    slug: "context-b",
    title: "Context B",
    relationships: [{ targetContextId: "ctx-001", type: "upstream" }],
  });
  const aggregate = makeAggregate({ contextId: ctxA.id });
  const event = makeDomainEvent({
    contextId: ctxA.id,
    aggregateId: aggregate.id,
    consumedBy: [ctxB.slug],
    sourceCapabilityId: capability.id,
  });
  const glossary = makeGlossaryTerm({ contextId: ctxA.id, term: "Order" });
  const workflow = makeWorkflow({
    contextIds: [ctxA.id, ctxB.id],
    transitions: [{ from: "start", to: "end", trigger: event.slug }],
  });

  return {
    domainModelId: "model-001",
    personas: [persona],
    userStories: [story],
    capabilities: [capability],
    boundedContexts: [ctxA, ctxB],
    aggregates: [aggregate],
    domainEvents: [event],
    glossaryTerms: [glossary],
    workflows: [workflow],
    taxonomyNodes: [taxNode],
    taxonomyCapabilities: [],
  };
}

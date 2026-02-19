/**
 * Coverage & Orphan Lint Rules
 *
 * These rules detect gaps where entities exist but lack expected connections:
 * orphaned personas, uncovered capabilities, contexts without events, etc.
 * Violations are `warning` severity unless otherwise noted.
 */

import type { LintContext, LintFinding } from "../LintReport.js";

// ── Rule: persona-has-stories ─────────────────────────────────────────────────

/**
 * Every persona should be referenced by at least one user story.
 * A persona with zero stories may be stale or not yet translated into requirements.
 */
export function checkPersonaHasStories(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const personasWithStories = new Set(ctx.userStories.map((s) => s.persona));

  for (const persona of ctx.personas) {
    if (!personasWithStories.has(persona.id)) {
      findings.push({
        rule: "persona-has-stories",
        severity: "warning",
        category: "incomplete-coverage",
        message: `Persona "${persona.name}" has no user stories.`,
        entityType: "persona",
        entityId: persona.id,
        entityName: persona.name,
        suggestion: `Write at least one user story that maps persona ${persona.id} to a capability they need.`,
      });
    }
  }

  return findings;
}

// ── Rule: persona-has-capabilities ────────────────────────────────────────────

/**
 * Every persona should list at least one typical capability.
 * An empty typicalCapabilities array means the persona's scope is unclear.
 */
export function checkPersonaHasCapabilities(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];

  for (const persona of ctx.personas) {
    if (!persona.typicalCapabilities || persona.typicalCapabilities.length === 0) {
      findings.push({
        rule: "persona-has-capabilities",
        severity: "warning",
        category: "incomplete-coverage",
        message: `Persona "${persona.name}" has no typical capabilities defined.`,
        entityType: "persona",
        entityId: persona.id,
        entityName: persona.name,
        suggestion: `Add at least one capability ID to persona ${persona.id}.typicalCapabilities to clarify the persona's scope.`,
      });
    }
  }

  return findings;
}

// ── Rule: capability-has-stories ──────────────────────────────────────────────

/**
 * Every capability should be referenced by at least one user story.
 * Capabilities without stories may never be tested against user needs.
 */
export function checkCapabilityHasStories(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const capsWithStories = new Set(ctx.userStories.flatMap((s) => s.capabilities));

  for (const capability of ctx.capabilities) {
    if (!capsWithStories.has(capability.id)) {
      findings.push({
        rule: "capability-has-stories",
        severity: "warning",
        category: "orphaned-entity",
        message: `Capability "${capability.title}" is not referenced by any user story.`,
        entityType: "capability",
        entityId: capability.id,
        entityName: capability.title,
        suggestion: `Create a user story that expresses a user need fulfilled by capability ${capability.id}.`,
      });
    }
  }

  return findings;
}

// ── Rule: capability-has-context ──────────────────────────────────────────────

/**
 * Every governance capability should map to a bounded context via taxonomyNode.
 * Without this link, it's unclear which part of the system delivers the capability.
 */
export function checkCapabilityHasContext(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];

  // Build a set of taxonomy nodes used by bounded contexts
  const contextTaxonomyNodes = new Set(
    ctx.boundedContexts
      .map((c) => c.taxonomyNode)
      .filter((tn): tn is string => !!tn && tn !== "taxonomy_node"),
  );

  for (const capability of ctx.capabilities) {
    if (!capability.taxonomyNode) {
      findings.push({
        rule: "capability-has-context",
        severity: "warning",
        category: "missing-link",
        message: `Capability "${capability.title}" has no taxonomyNode, so it cannot be linked to a bounded context.`,
        entityType: "capability",
        entityId: capability.id,
        entityName: capability.title,
        suggestion: `Set a taxonomyNode on capability ${capability.id} that matches the FQTN of the bounded context that delivers it.`,
      });
    } else if (!contextTaxonomyNodes.has(capability.taxonomyNode)) {
      // The node is set but no context uses it
      findings.push({
        rule: "capability-has-context",
        severity: "info",
        category: "missing-link",
        message: `Capability "${capability.title}" has taxonomyNode "${capability.taxonomyNode}" but no bounded context maps to that node.`,
        entityType: "capability",
        entityId: capability.id,
        entityName: capability.title,
        relatedEntities: [{ type: "taxonomyNode", id: capability.taxonomyNode, name: capability.taxonomyNode }],
        suggestion: `Assign taxonomyNode "${capability.taxonomyNode}" to the bounded context that delivers capability ${capability.id}.`,
      });
    }
  }

  return findings;
}

// ── Rule: context-has-events ──────────────────────────────────────────────────

/**
 * Every bounded context should produce or consume at least one domain event.
 * Contexts with no event activity may be isolated islands.
 */
export function checkContextHasEvents(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];

  // Contexts that produce events
  const producerContextIds = new Set(ctx.domainEvents.map((e) => e.contextId));

  // Contexts that consume events (by slug, resolved to id)
  const contextBySlug = new Map(ctx.boundedContexts.map((c) => [c.slug, c.id]));
  const consumerContextIds = new Set<string>();
  for (const event of ctx.domainEvents) {
    for (const slug of event.consumedBy) {
      const id = contextBySlug.get(slug);
      if (id) consumerContextIds.add(id);
    }
  }

  for (const context of ctx.boundedContexts) {
    // Only flag internal contexts — external systems and human processes don't need events
    if (context.contextType === "external-system" || context.contextType === "human-process") {
      continue;
    }
    const produces = producerContextIds.has(context.id);
    const consumes = consumerContextIds.has(context.id);
    if (!produces && !consumes) {
      findings.push({
        rule: "context-has-events",
        severity: "warning",
        category: "orphaned-entity",
        message: `Bounded context "${context.title}" neither produces nor consumes any domain events.`,
        entityType: "boundedContext",
        entityId: context.id,
        entityName: context.title,
        suggestion: `Define at least one domain event produced by "${context.title}", or add it as a consumer of an existing event.`,
      });
    }
  }

  return findings;
}

// ── Rule: context-has-aggregates ──────────────────────────────────────────────

/**
 * Every internal bounded context should contain at least one aggregate.
 * External systems and human processes are exempt.
 */
export function checkContextHasAggregates(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const contextsWithAggregates = new Set(ctx.aggregates.map((a) => a.contextId));

  for (const context of ctx.boundedContexts) {
    // Only internal contexts need aggregates
    if (context.contextType === "external-system" || context.contextType === "human-process") {
      continue;
    }
    if (!contextsWithAggregates.has(context.id)) {
      findings.push({
        rule: "context-has-aggregates",
        severity: "warning",
        category: "incomplete-coverage",
        message: `Internal bounded context "${context.title}" has no aggregates defined.`,
        entityType: "boundedContext",
        entityId: context.id,
        entityName: context.title,
        suggestion: `Add at least one aggregate to context "${context.title}" to model the core domain objects it owns.`,
      });
    }
  }

  return findings;
}

// ── Rule: event-has-consumers ─────────────────────────────────────────────────

/**
 * Every domain event should have at least one consumer (resolved to a known context).
 * An event with no consumers may be dead code or missing integration.
 */
export function checkEventHasConsumers(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const contextSlugs = new Set(ctx.boundedContexts.map((c) => c.slug));

  for (const event of ctx.domainEvents) {
    const resolvedConsumers = event.consumedBy.filter((slug) => contextSlugs.has(slug));
    if (resolvedConsumers.length === 0) {
      findings.push({
        rule: "event-has-consumers",
        severity: "warning",
        category: "orphaned-entity",
        message: `Domain event "${event.title}" has no resolved consumers.`,
        entityType: "domainEvent",
        entityId: event.id,
        entityName: event.title,
        suggestion: `Add at least one consuming bounded context slug to event ${event.id}.consumedBy, or remove the event if it is no longer needed.`,
      });
    }
  }

  return findings;
}

// ── Rule: event-has-capability-link ───────────────────────────────────────────

/**
 * Every domain event should have a sourceCapabilityId linking it to the
 * governance capability that triggers it. Without this, events float free
 * of the product roadmap.
 */
export function checkEventHasCapabilityLink(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];

  // Skip entirely when no governance capabilities are loaded
  if (ctx.capabilities.length === 0) return findings;

  for (const event of ctx.domainEvents) {
    if (!event.sourceCapabilityId) {
      findings.push({
        rule: "event-has-capability-link",
        severity: "info",
        category: "missing-link",
        message: `Domain event "${event.title}" has no sourceCapabilityId — it is not linked to any capability.`,
        entityType: "domainEvent",
        entityId: event.id,
        entityName: event.title,
        suggestion: `Set sourceCapabilityId on event ${event.id} to the capability that initiates this event (e.g. "CAP-001").`,
      });
    }
  }

  return findings;
}

// ── Rule: story-has-workflow ───────────────────────────────────────────────────

/**
 * Each user story's capabilities should be covered by at least one workflow.
 * A story whose capabilities never appear in a workflow has no modelled process path.
 */
export function checkStoryHasWorkflow(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];

  // Build: capability -> set of context IDs that deliver it (via taxonomyNode)
  // Then: workflow covers contextIds — map context -> workflow
  const contextIdToWorkflows = new Map<string, string[]>();
  for (const workflow of ctx.workflows) {
    for (const ctxId of workflow.contextIds) {
      if (!contextIdToWorkflows.has(ctxId)) contextIdToWorkflows.set(ctxId, []);
      contextIdToWorkflows.get(ctxId)!.push(workflow.id);
    }
  }

  // capability -> contexts (via taxonomyNode matching)
  const taxNodeToContextIds = new Map<string, string[]>();
  for (const context of ctx.boundedContexts) {
    if (!context.taxonomyNode || context.taxonomyNode === "taxonomy_node") continue;
    if (!taxNodeToContextIds.has(context.taxonomyNode)) {
      taxNodeToContextIds.set(context.taxonomyNode, []);
    }
    taxNodeToContextIds.get(context.taxonomyNode)!.push(context.id);
  }

  for (const story of ctx.userStories) {
    const coveredByWorkflow = story.capabilities.some((capId) => {
      const cap = ctx.capabilities.find((c) => c.id === capId);
      if (!cap?.taxonomyNode) return false;
      const contextIds = taxNodeToContextIds.get(cap.taxonomyNode) ?? [];
      return contextIds.some((ctxId) => (contextIdToWorkflows.get(ctxId) ?? []).length > 0);
    });

    if (!coveredByWorkflow && story.capabilities.length > 0) {
      findings.push({
        rule: "story-has-workflow",
        severity: "info",
        category: "missing-link",
        message: `User story "${story.title}" — none of its capabilities are covered by a domain workflow.`,
        entityType: "userStory",
        entityId: story.id,
        entityName: story.title,
        suggestion: `Create or update a workflow to include the bounded contexts that deliver the capabilities of story ${story.id}.`,
      });
    }
  }

  return findings;
}

// ── Rule: workflow-has-events ─────────────────────────────────────────────────

/**
 * A workflow spanning multiple contexts should have at least one domain event
 * connecting those contexts. Without events, the flow is purely aspirational.
 */
export function checkWorkflowHasEvents(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];

  // Build event slugs per context-pair (producer->consumer)
  const eventsByContextPair = new Map<string, string[]>();
  const contextBySlug = new Map(ctx.boundedContexts.map((c) => [c.slug, c.id]));

  for (const event of ctx.domainEvents) {
    for (const consumerSlug of event.consumedBy) {
      const consumerId = contextBySlug.get(consumerSlug);
      if (!consumerId) continue;
      const key = `${event.contextId}:${consumerId}`;
      if (!eventsByContextPair.has(key)) eventsByContextPair.set(key, []);
      eventsByContextPair.get(key)!.push(event.id);
    }
  }

  for (const workflow of ctx.workflows) {
    if (workflow.contextIds.length < 2) continue; // single-context workflows don't need events

    // Check that at least one adjacent pair in contextIds has an event
    let hasAnyEvent = false;
    for (let i = 0; i < workflow.contextIds.length - 1; i++) {
      const a = workflow.contextIds[i];
      const b = workflow.contextIds[i + 1];
      if (
        eventsByContextPair.has(`${a}:${b}`) ||
        eventsByContextPair.has(`${b}:${a}`)
      ) {
        hasAnyEvent = true;
        break;
      }
    }

    if (!hasAnyEvent) {
      findings.push({
        rule: "workflow-has-events",
        severity: "warning",
        category: "disconnected-workflow",
        message: `Workflow "${workflow.title}" spans ${workflow.contextIds.length} contexts but has no domain events connecting any of them.`,
        entityType: "workflow",
        entityId: workflow.id,
        entityName: workflow.title,
        suggestion: `Add domain events that flow between the contexts in workflow "${workflow.title}" (contextIds: ${workflow.contextIds.join(", ")}).`,
      });
    }
  }

  return findings;
}

// ── Rule: aggregate-has-events ────────────────────────────────────────────────

/**
 * Every aggregate should be associated with at least one domain event.
 * Aggregates that never emit events may be passive data holders rather than
 * true DDD aggregates.
 */
export function checkAggregateHasEvents(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const aggregatesWithEvents = new Set(
    ctx.domainEvents
      .filter((e) => e.aggregateId)
      .map((e) => e.aggregateId!),
  );

  for (const aggregate of ctx.aggregates) {
    // Also check the aggregate's own events list (names, not IDs)
    const hasEventsByList = aggregate.events.length > 0;
    const hasEventsByLink = aggregatesWithEvents.has(aggregate.id);

    if (!hasEventsByList && !hasEventsByLink) {
      findings.push({
        rule: "aggregate-has-events",
        severity: "warning",
        category: "incomplete-coverage",
        message: `Aggregate "${aggregate.title}" has no associated domain events.`,
        entityType: "aggregate",
        entityId: aggregate.id,
        entityName: aggregate.title,
        suggestion: `Add domain events to aggregate "${aggregate.title}" that describe what happens when its state changes.`,
      });
    }
  }

  return findings;
}

// ── Rule: glossary-covers-aggregates ─────────────────────────────────────────

/**
 * Every aggregate's rootEntity should have a corresponding glossary term.
 * This ensures ubiquitous language is maintained in the domain model.
 */
export function checkGlossaryCoversAggregates(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const glossaryTerms = new Set(
    ctx.glossaryTerms.map((t) => t.term.toLowerCase().trim()),
  );

  for (const aggregate of ctx.aggregates) {
    const rootEntityNormalized = aggregate.rootEntity.toLowerCase().trim();
    if (!glossaryTerms.has(rootEntityNormalized)) {
      findings.push({
        rule: "glossary-covers-aggregates",
        severity: "info",
        category: "missing-link",
        message: `Aggregate "${aggregate.title}" has root entity "${aggregate.rootEntity}" which has no glossary term.`,
        entityType: "aggregate",
        entityId: aggregate.id,
        entityName: aggregate.title,
        suggestion: `Add a glossary term for "${aggregate.rootEntity}" to reinforce ubiquitous language in the domain model.`,
      });
    }
  }

  return findings;
}

// ── Composite export ──────────────────────────────────────────────────────────

export function runCoverageRules(ctx: LintContext): LintFinding[] {
  return [
    ...checkPersonaHasStories(ctx),
    ...checkPersonaHasCapabilities(ctx),
    ...checkCapabilityHasStories(ctx),
    ...checkCapabilityHasContext(ctx),
    ...checkContextHasEvents(ctx),
    ...checkContextHasAggregates(ctx),
    ...checkEventHasConsumers(ctx),
    ...checkEventHasCapabilityLink(ctx),
    ...checkStoryHasWorkflow(ctx),
    ...checkWorkflowHasEvents(ctx),
    ...checkAggregateHasEvents(ctx),
    ...checkGlossaryCoversAggregates(ctx),
  ];
}

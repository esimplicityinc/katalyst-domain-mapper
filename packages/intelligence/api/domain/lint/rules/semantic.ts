/**
 * Semantic & Logical Gap Lint Rules
 *
 * These rules detect higher-level logical inconsistencies: workflows whose
 * contexts aren't connected by events, missing bidirectional context
 * relationships, mismatched persona types, orphan inferred systems, stale
 * capabilities, and workflow transitions that reference unknown event slugs.
 *
 * Violations are `warning` or `info` severity.
 */

import type { LintContext, LintFinding } from "../LintReport.js";

// ── Rule: workflow-contexts-connected ─────────────────────────────────────────

/**
 * A workflow spanning contexts A → B → C should have domain events flowing
 * between each adjacent pair of contexts. This goes beyond
 * `workflow-has-events` (which only needs ONE event anywhere) — this verifies
 * that the full sequence is wired.
 */
export function checkWorkflowContextsConnected(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];

  const contextBySlug = new Map(ctx.boundedContexts.map((c) => [c.slug, c.id]));
  const contextById = new Map(ctx.boundedContexts.map((c) => [c.id, c]));

  // Build directed adjacency: producerContextId → Set<consumerContextId>
  const eventEdges = new Map<string, Set<string>>();
  for (const event of ctx.domainEvents) {
    if (!eventEdges.has(event.contextId)) eventEdges.set(event.contextId, new Set());
    for (const slug of event.consumedBy) {
      const consumerId = contextBySlug.get(slug);
      if (consumerId) eventEdges.get(event.contextId)!.add(consumerId);
    }
  }

  for (const workflow of ctx.workflows) {
    if (workflow.contextIds.length < 2) continue;

    const disconnectedPairs: Array<{ from: string; to: string }> = [];

    for (let i = 0; i < workflow.contextIds.length - 1; i++) {
      const a = workflow.contextIds[i];
      const b = workflow.contextIds[i + 1];

      const aToB = eventEdges.get(a)?.has(b) ?? false;
      const bToA = eventEdges.get(b)?.has(a) ?? false;

      if (!aToB && !bToA) {
        const ctxA = contextById.get(a);
        const ctxB = contextById.get(b);
        disconnectedPairs.push({
          from: ctxA?.title ?? a,
          to: ctxB?.title ?? b,
        });
      }
    }

    if (disconnectedPairs.length > 0) {
      const pairDescriptions = disconnectedPairs.map((p) => `"${p.from}" ↔ "${p.to}"`).join(", ");
      findings.push({
        rule: "workflow-contexts-connected",
        severity: "warning",
        category: "disconnected-workflow",
        message: `Workflow "${workflow.title}" has ${disconnectedPairs.length} adjacent context pair(s) with no connecting domain events: ${pairDescriptions}.`,
        entityType: "workflow",
        entityId: workflow.id,
        entityName: workflow.title,
        relatedEntities: disconnectedPairs.map((p) => ({
          type: "contextPair",
          id: `${p.from}:${p.to}`,
          name: `${p.from} ↔ ${p.to}`,
        })),
        suggestion: `Add domain events that flow between the disconnected context pairs in workflow "${workflow.title}".`,
      });
    }
  }

  return findings;
}

// ── Rule: event-consumer-bidirectional ───────────────────────────────────────

/**
 * If context A produces an event consumed by context B, then context A's
 * relationships should include context B (and vice versa). Missing explicit
 * relationships indicate the DDD context map is incomplete.
 */
export function checkEventConsumerBidirectional(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];

  const contextBySlug = new Map(ctx.boundedContexts.map((c) => [c.slug, c]));
  const contextById = new Map(ctx.boundedContexts.map((c) => [c.id, c]));

  // Build a set of declared relationships: "sourceId:targetId"
  const declaredRelationships = new Set<string>();
  for (const context of ctx.boundedContexts) {
    for (const rel of context.relationships) {
      declaredRelationships.add(`${context.id}:${rel.targetContextId}`);
    }
  }

  // Already-reported pairs to avoid duplicate findings
  const reported = new Set<string>();

  for (const event of ctx.domainEvents) {
    const producer = contextById.get(event.contextId);
    if (!producer) continue;

    for (const slug of event.consumedBy) {
      const consumer = contextBySlug.get(slug);
      if (!consumer) continue; // unresolved consumer — covered by referential rules

      const pairKey = [producer.id, consumer.id].sort().join(":");
      if (reported.has(pairKey)) continue;

      const producerKnowsConsumer = declaredRelationships.has(`${producer.id}:${consumer.id}`);
      const consumerKnowsProducer = declaredRelationships.has(`${consumer.id}:${producer.id}`);

      if (!producerKnowsConsumer && !consumerKnowsProducer) {
        reported.add(pairKey);
        findings.push({
          rule: "event-consumer-bidirectional",
          severity: "info",
          category: "semantic-gap",
          message: `Context "${producer.title}" produces events consumed by "${consumer.title}" but neither context declares a relationship to the other.`,
          entityType: "boundedContext",
          entityId: producer.id,
          entityName: producer.title,
          relatedEntities: [
            { type: "boundedContext", id: consumer.id, name: consumer.title },
            { type: "domainEvent", id: event.id, name: event.title },
          ],
          suggestion: `Add a relationship from "${producer.title}" to "${consumer.title}" (or vice versa) to make the context map explicit.`,
        });
      }
    }
  }

  return findings;
}

// ── Rule: persona-archetype-type-alignment ────────────────────────────────────

/**
 * A "bot" or "system" persona should not own capabilities that are clearly
 * human-facing (heuristic: capability title contains "review", "approve",
 * "manually", "sign-off", etc.).
 *
 * This is a lightweight heuristic — `info` severity to avoid false positives.
 */
const HUMAN_INTERACTION_KEYWORDS = [
  "review",
  "approve",
  "manually",
  "sign-off",
  "sign off",
  "authorise",
  "authorize",
  "human",
  "manager",
  "officer",
];

export function checkPersonaArchetypeTypeAlignment(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const capabilityById = new Map(ctx.capabilities.map((c) => [c.id, c]));

  for (const persona of ctx.personas) {
    if (persona.type !== "bot" && persona.type !== "system") continue;

    for (const capId of persona.typicalCapabilities ?? []) {
      const cap = capabilityById.get(capId);
      if (!cap) continue;

      const titleLower = cap.title.toLowerCase();
      const matchedKeyword = HUMAN_INTERACTION_KEYWORDS.find((kw) =>
        titleLower.includes(kw),
      );

      if (matchedKeyword) {
        findings.push({
          rule: "persona-archetype-type-alignment",
          severity: "info",
          category: "semantic-gap",
          message: `${persona.type} persona "${persona.name}" is mapped to capability "${cap.title}" which appears to require human interaction (keyword: "${matchedKeyword}").`,
          entityType: "persona",
          entityId: persona.id,
          entityName: persona.name,
          relatedEntities: [{ type: "capability", id: cap.id, name: cap.title }],
          suggestion: `Verify that a ${persona.type} can fulfil capability "${cap.title}", or reassign it to a human persona.`,
        });
      }
    }
  }

  return findings;
}

// ── Rule: orphan-inferred-systems ─────────────────────────────────────────────

/**
 * Domain events whose consumedBy slugs don't resolve to any known context
 * represent unknown/external system references. These should either be modelled
 * as external-system bounded contexts or cleaned up.
 */
export function checkOrphanInferredSystems(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const contextSlugs = new Set(ctx.boundedContexts.map((c) => c.slug));

  // Collect unresolved consumer slugs grouped by slug → event IDs
  const unresolvedMap = new Map<string, string[]>();
  for (const event of ctx.domainEvents) {
    for (const slug of event.consumedBy) {
      if (!contextSlugs.has(slug)) {
        if (!unresolvedMap.has(slug)) unresolvedMap.set(slug, []);
        unresolvedMap.get(slug)!.push(event.id);
      }
    }
  }

  for (const [slug, eventIds] of unresolvedMap) {
    findings.push({
      rule: "orphan-inferred-systems",
      severity: "warning",
      category: "semantic-gap",
      message: `Consumer slug "${slug}" appears in ${eventIds.length} event(s) but has no matching bounded context — inferred as unknown external system.`,
      entityType: "domainEvent",
      entityId: eventIds[0],
      entityName: slug,
      relatedEntities: eventIds.map((id) => ({ type: "domainEvent", id })),
      suggestion: `Either add a bounded context with slug "${slug}" (contextType: "external-system") or correct the consumedBy reference in the affected events.`,
    });
  }

  return findings;
}

// ── Rule: capability-no-road-items ────────────────────────────────────────────

/**
 * Capabilities with zero road items may be stale, underdeveloped, or not yet
 * planned. This is an advisory signal rather than a hard error.
 */
export function checkCapabilityNoRoadItems(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];

  for (const capability of ctx.capabilities) {
    if ((capability.roadCount ?? 0) === 0 && capability.status !== "deprecated") {
      findings.push({
        rule: "capability-no-road-items",
        severity: "info",
        category: "incomplete-coverage",
        message: `Capability "${capability.title}" has no road items — it may not be on any delivery roadmap.`,
        entityType: "capability",
        entityId: capability.id,
        entityName: capability.title,
        suggestion: `Create at least one road item for capability "${capability.title}" to link it to the delivery roadmap, or mark it as deprecated if it is no longer active.`,
      });
    }
  }

  return findings;
}

// ── Rule: workflow-transition-trigger-event-exists ────────────────────────────

/**
 * If a workflow transition has a `trigger` field, that trigger value should
 * match the slug of a known domain event. Mismatched triggers indicate the
 * state machine and the event model are out of sync.
 */
export function checkWorkflowTransitionTriggerEventExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const eventSlugs = new Set(ctx.domainEvents.map((e) => e.slug));

  for (const workflow of ctx.workflows) {
    for (const transition of workflow.transitions) {
      if (!transition.trigger) continue;

      if (!eventSlugs.has(transition.trigger)) {
        findings.push({
          rule: "workflow-transition-trigger-event-exists",
          severity: "warning",
          category: "broken-reference",
          message: `Workflow "${workflow.title}" has a transition from "${transition.from}" → "${transition.to}" triggered by "${transition.trigger}" which does not match any domain event slug.`,
          entityType: "workflow",
          entityId: workflow.id,
          entityName: workflow.title,
          relatedEntities: [{ type: "domainEvent", id: transition.trigger, name: transition.trigger }],
          suggestion: `Create a domain event with slug "${transition.trigger}", or update the transition trigger to match an existing event slug.`,
        });
      }
    }
  }

  return findings;
}

// ── Composite export ──────────────────────────────────────────────────────────

export function runSemanticRules(ctx: LintContext): LintFinding[] {
  return [
    ...checkWorkflowContextsConnected(ctx),
    ...checkEventConsumerBidirectional(ctx),
    ...checkPersonaArchetypeTypeAlignment(ctx),
    ...checkOrphanInferredSystems(ctx),
    ...checkCapabilityNoRoadItems(ctx),
    ...checkWorkflowTransitionTriggerEventExists(ctx),
  ];
}

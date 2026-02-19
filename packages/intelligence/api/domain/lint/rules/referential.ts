/**
 * Referential Integrity Lint Rules
 *
 * These rules check that every ID/slug reference points to an entity that
 * actually exists in the model. Violations are always `error` severity.
 */

import type { LintContext, LintFinding } from "../LintReport.js";

// ── Rule: story-persona-exists ────────────────────────────────────────────────

/**
 * Every userStory.persona (PER-xxx) must exist in the personas collection.
 */
export function checkStoryPersonaExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const personaIds = new Set(ctx.personas.map((p) => p.id));

  for (const story of ctx.userStories) {
    if (!story.persona) {
      findings.push({
        rule: "story-persona-exists",
        severity: "error",
        category: "broken-reference",
        message: `User story "${story.title}" has no persona assigned.`,
        entityType: "userStory",
        entityId: story.id,
        entityName: story.title,
        suggestion: `Assign a valid persona ID (e.g. "PER-001") to the persona field of user story ${story.id}.`,
      });
    } else if (!personaIds.has(story.persona)) {
      findings.push({
        rule: "story-persona-exists",
        severity: "error",
        category: "broken-reference",
        message: `User story "${story.title}" references persona "${story.persona}" which does not exist.`,
        entityType: "userStory",
        entityId: story.id,
        entityName: story.title,
        relatedEntities: [{ type: "persona", id: story.persona }],
        suggestion: `Create persona "${story.persona}" or update the story to reference an existing persona.`,
      });
    }
  }

  return findings;
}

// ── Rule: story-capability-exists ─────────────────────────────────────────────

/**
 * Every capability ID in userStory.capabilities[] must exist in capabilities.
 */
export function checkStoryCapabilityExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const capabilityIds = new Set(ctx.capabilities.map((c) => c.id));

  for (const story of ctx.userStories) {
    for (const capId of story.capabilities) {
      if (!capabilityIds.has(capId)) {
        findings.push({
          rule: "story-capability-exists",
          severity: "error",
          category: "broken-reference",
          message: `User story "${story.title}" references capability "${capId}" which does not exist.`,
          entityType: "userStory",
          entityId: story.id,
          entityName: story.title,
          relatedEntities: [{ type: "capability", id: capId }],
          suggestion: `Create capability "${capId}" or remove it from user story ${story.id}.capabilities.`,
        });
      }
    }
  }

  return findings;
}

// ── Rule: persona-capability-exists ───────────────────────────────────────────

/**
 * Every capability ID in persona.typicalCapabilities[] must exist.
 */
export function checkPersonaCapabilityExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const capabilityIds = new Set(ctx.capabilities.map((c) => c.id));

  for (const persona of ctx.personas) {
    for (const capId of persona.typicalCapabilities ?? []) {
      if (!capabilityIds.has(capId)) {
        findings.push({
          rule: "persona-capability-exists",
          severity: "error",
          category: "broken-reference",
          message: `Persona "${persona.name}" references capability "${capId}" which does not exist.`,
          entityType: "persona",
          entityId: persona.id,
          entityName: persona.name,
          relatedEntities: [{ type: "capability", id: capId }],
          suggestion: `Create capability "${capId}" or remove it from persona ${persona.id}.typicalCapabilities.`,
        });
      }
    }
  }

  return findings;
}

// ── Rule: event-context-exists ────────────────────────────────────────────────

/**
 * Every domainEvent.contextId must resolve to a known bounded context.
 */
export function checkEventContextExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const contextIds = new Set(ctx.boundedContexts.map((c) => c.id));

  for (const event of ctx.domainEvents) {
    if (!contextIds.has(event.contextId)) {
      findings.push({
        rule: "event-context-exists",
        severity: "error",
        category: "broken-reference",
        message: `Domain event "${event.title}" references context "${event.contextId}" which does not exist.`,
        entityType: "domainEvent",
        entityId: event.id,
        entityName: event.title,
        relatedEntities: [{ type: "boundedContext", id: event.contextId }],
        suggestion: `Ensure context "${event.contextId}" exists or update the event to reference the correct context.`,
      });
    }
  }

  return findings;
}

// ── Rule: event-aggregate-exists ──────────────────────────────────────────────

/**
 * If domainEvent.aggregateId is set, it must resolve to a known aggregate.
 */
export function checkEventAggregateExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const aggregateIds = new Set(ctx.aggregates.map((a) => a.id));

  for (const event of ctx.domainEvents) {
    if (event.aggregateId && !aggregateIds.has(event.aggregateId)) {
      findings.push({
        rule: "event-aggregate-exists",
        severity: "error",
        category: "broken-reference",
        message: `Domain event "${event.title}" references aggregate "${event.aggregateId}" which does not exist.`,
        entityType: "domainEvent",
        entityId: event.id,
        entityName: event.title,
        relatedEntities: [{ type: "aggregate", id: event.aggregateId }],
        suggestion: `Create aggregate "${event.aggregateId}" or clear the aggregateId on event ${event.id}.`,
      });
    }
  }

  return findings;
}

// ── Rule: event-source-capability-exists ──────────────────────────────────────

/**
 * If domainEvent.sourceCapabilityId is set, it must resolve to a known capability.
 */
export function checkEventSourceCapabilityExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const capabilityIds = new Set(ctx.capabilities.map((c) => c.id));

  for (const event of ctx.domainEvents) {
    if (event.sourceCapabilityId && !capabilityIds.has(event.sourceCapabilityId)) {
      findings.push({
        rule: "event-source-capability-exists",
        severity: "error",
        category: "broken-reference",
        message: `Domain event "${event.title}" has sourceCapabilityId "${event.sourceCapabilityId}" which does not exist.`,
        entityType: "domainEvent",
        entityId: event.id,
        entityName: event.title,
        relatedEntities: [{ type: "capability", id: event.sourceCapabilityId }],
        suggestion: `Create capability "${event.sourceCapabilityId}" or update the event's sourceCapabilityId to a valid value.`,
      });
    }
  }

  return findings;
}

// ── Rule: event-target-capabilities-exist ─────────────────────────────────────

/**
 * Every ID in domainEvent.targetCapabilityIds[] must resolve to a known capability.
 */
export function checkEventTargetCapabilitiesExist(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const capabilityIds = new Set(ctx.capabilities.map((c) => c.id));

  for (const event of ctx.domainEvents) {
    for (const capId of event.targetCapabilityIds) {
      if (!capabilityIds.has(capId)) {
        findings.push({
          rule: "event-target-capabilities-exist",
          severity: "error",
          category: "broken-reference",
          message: `Domain event "${event.title}" has target capability "${capId}" which does not exist.`,
          entityType: "domainEvent",
          entityId: event.id,
          entityName: event.title,
          relatedEntities: [{ type: "capability", id: capId }],
          suggestion: `Create capability "${capId}" or remove it from event ${event.id}.targetCapabilityIds.`,
        });
      }
    }
  }

  return findings;
}

// ── Rule: workflow-context-exists ─────────────────────────────────────────────

/**
 * Every context ID in workflow.contextIds[] must resolve to a known bounded context.
 */
export function checkWorkflowContextExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const contextIds = new Set(ctx.boundedContexts.map((c) => c.id));

  for (const workflow of ctx.workflows) {
    for (const ctxId of workflow.contextIds) {
      if (!contextIds.has(ctxId)) {
        findings.push({
          rule: "workflow-context-exists",
          severity: "error",
          category: "broken-reference",
          message: `Workflow "${workflow.title}" references context "${ctxId}" which does not exist.`,
          entityType: "workflow",
          entityId: workflow.id,
          entityName: workflow.title,
          relatedEntities: [{ type: "boundedContext", id: ctxId }],
          suggestion: `Create bounded context "${ctxId}" or remove it from workflow ${workflow.id}.contextIds.`,
        });
      }
    }
  }

  return findings;
}

// ── Rule: aggregate-context-exists ────────────────────────────────────────────

/**
 * Every aggregate.contextId must resolve to a known bounded context.
 */
export function checkAggregateContextExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const contextIds = new Set(ctx.boundedContexts.map((c) => c.id));

  for (const aggregate of ctx.aggregates) {
    if (!contextIds.has(aggregate.contextId)) {
      findings.push({
        rule: "aggregate-context-exists",
        severity: "error",
        category: "broken-reference",
        message: `Aggregate "${aggregate.title}" references context "${aggregate.contextId}" which does not exist.`,
        entityType: "aggregate",
        entityId: aggregate.id,
        entityName: aggregate.title,
        relatedEntities: [{ type: "boundedContext", id: aggregate.contextId }],
        suggestion: `Ensure bounded context "${aggregate.contextId}" exists or reassign aggregate ${aggregate.id} to the correct context.`,
      });
    }
  }

  return findings;
}

// ── Rule: context-relationship-target-exists ──────────────────────────────────

/**
 * Every relationship.targetContextId on a bounded context must resolve to
 * a known bounded context.
 */
export function checkContextRelationshipTargetExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];
  const contextIds = new Set(ctx.boundedContexts.map((c) => c.id));

  for (const context of ctx.boundedContexts) {
    for (const rel of context.relationships) {
      if (!contextIds.has(rel.targetContextId)) {
        findings.push({
          rule: "context-relationship-target-exists",
          severity: "error",
          category: "broken-reference",
          message: `Bounded context "${context.title}" has a relationship targeting context "${rel.targetContextId}" which does not exist.`,
          entityType: "boundedContext",
          entityId: context.id,
          entityName: context.title,
          relatedEntities: [{ type: "boundedContext", id: rel.targetContextId }],
          suggestion: `Create the target context "${rel.targetContextId}" or remove the relationship from context ${context.id}.`,
        });
      }
    }
  }

  return findings;
}

// ── Rule: context-taxonomy-node-exists ────────────────────────────────────────

/**
 * If a bounded context has a taxonomyNode set, that node must exist in the
 * taxonomy snapshot (matched by name or fqtn).
 */
export function checkContextTaxonomyNodeExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];

  // Skip if no taxonomy data is available
  if (ctx.taxonomyNodes.length === 0) return findings;

  const nodeNames = new Set(ctx.taxonomyNodes.map((n) => n.name));
  const nodeFqtns = new Set(ctx.taxonomyNodes.map((n) => n.fqtn));

  for (const context of ctx.boundedContexts) {
    if (!context.taxonomyNode || context.taxonomyNode === "taxonomy_node") continue;

    const exists = nodeNames.has(context.taxonomyNode) || nodeFqtns.has(context.taxonomyNode);
    if (!exists) {
      findings.push({
        rule: "context-taxonomy-node-exists",
        severity: "error",
        category: "broken-reference",
        message: `Bounded context "${context.title}" references taxonomy node "${context.taxonomyNode}" which does not exist in the taxonomy snapshot.`,
        entityType: "boundedContext",
        entityId: context.id,
        entityName: context.title,
        relatedEntities: [{ type: "taxonomyNode", id: context.taxonomyNode, name: context.taxonomyNode }],
        suggestion: `Update the taxonomy snapshot to include node "${context.taxonomyNode}", or correct the taxonomyNode field on context ${context.id}.`,
      });
    }
  }

  return findings;
}

// ── Rule: capability-taxonomy-node-exists ─────────────────────────────────────

/**
 * If a governance capability has a taxonomyNode set, that node must exist
 * in the taxonomy snapshot.
 */
export function checkCapabilityTaxonomyNodeExists(ctx: LintContext): LintFinding[] {
  const findings: LintFinding[] = [];

  // Skip if no taxonomy data is available
  if (ctx.taxonomyNodes.length === 0) return findings;

  const nodeNames = new Set(ctx.taxonomyNodes.map((n) => n.name));
  const nodeFqtns = new Set(ctx.taxonomyNodes.map((n) => n.fqtn));

  for (const capability of ctx.capabilities) {
    if (!capability.taxonomyNode) continue;

    const exists = nodeNames.has(capability.taxonomyNode) || nodeFqtns.has(capability.taxonomyNode);
    if (!exists) {
      findings.push({
        rule: "capability-taxonomy-node-exists",
        severity: "error",
        category: "broken-reference",
        message: `Capability "${capability.title}" references taxonomy node "${capability.taxonomyNode}" which does not exist.`,
        entityType: "capability",
        entityId: capability.id,
        entityName: capability.title,
        relatedEntities: [{ type: "taxonomyNode", id: capability.taxonomyNode, name: capability.taxonomyNode }],
        suggestion: `Update the taxonomy snapshot to include node "${capability.taxonomyNode}", or remove the taxonomyNode mapping from capability ${capability.id}.`,
      });
    }
  }

  return findings;
}

// ── Composite export ──────────────────────────────────────────────────────────

export function runReferentialRules(ctx: LintContext): LintFinding[] {
  return [
    ...checkStoryPersonaExists(ctx),
    ...checkStoryCapabilityExists(ctx),
    ...checkPersonaCapabilityExists(ctx),
    ...checkEventContextExists(ctx),
    ...checkEventAggregateExists(ctx),
    ...checkEventSourceCapabilityExists(ctx),
    ...checkEventTargetCapabilitiesExist(ctx),
    ...checkWorkflowContextExists(ctx),
    ...checkAggregateContextExists(ctx),
    ...checkContextRelationshipTargetExists(ctx),
    ...checkContextTaxonomyNodeExists(ctx),
    ...checkCapabilityTaxonomyNodeExists(ctx),
  ];
}

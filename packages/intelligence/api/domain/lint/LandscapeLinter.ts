/**
 * Landscape Linter
 *
 * Orchestrates all lint rule sets against a LintContext and produces a
 * fully structured LintReport including per-category/severity counts and
 * computed coverage scores.
 */

import type {
  LintContext,
  LintReport,
  LintFinding,
  LintCategory,
  LintSeverity,
  LintCoverageScores,
} from "./LintReport.js";
import { runReferentialRules } from "./rules/referential.js";
import { runCoverageRules } from "./rules/coverage.js";
import { runSemanticRules } from "./rules/semantic.js";

export class LandscapeLinter {
  /**
   * Run all lint rules against the provided context and return a complete
   * LintReport. This is a pure function — no I/O, no side effects.
   */
  lint(ctx: LintContext): LintReport {
    // Run all rule sets
    const findings: LintFinding[] = [
      ...runReferentialRules(ctx),
      ...runCoverageRules(ctx),
      ...runSemanticRules(ctx),
    ];

    return {
      domainModelId: ctx.domainModelId,
      governanceSnapshotId: ctx.governanceSnapshotId,
      taxonomySnapshotId: ctx.taxonomySnapshotId,
      generatedAt: new Date().toISOString(),
      findings,
      summary: this.buildSummary(ctx, findings),
    };
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private buildSummary(
    ctx: LintContext,
    findings: LintFinding[],
  ): LintReport["summary"] {
    // Counts by category
    const categoryOrder: LintCategory[] = [
      "broken-reference",
      "orphaned-entity",
      "missing-link",
      "incomplete-coverage",
      "disconnected-workflow",
      "semantic-gap",
    ];
    const byCategory = Object.fromEntries(
      categoryOrder.map((c) => [c, 0]),
    ) as Record<LintCategory, number>;

    const severityOrder: LintSeverity[] = ["error", "warning", "info"];
    const bySeverity = Object.fromEntries(
      severityOrder.map((s) => [s, 0]),
    ) as Record<LintSeverity, number>;

    for (const f of findings) {
      byCategory[f.category] = (byCategory[f.category] ?? 0) + 1;
      bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;
    }

    return {
      total: findings.length,
      byCategory,
      bySeverity,
      coverageScores: this.computeCoverageScores(ctx),
    };
  }

  private computeCoverageScores(ctx: LintContext): LintCoverageScores {
    // 1. personaToStory: % of personas with ≥1 user story
    const personaToStory = this.pct(
      ctx.personas.filter((p) =>
        ctx.userStories.some((s) => s.persona === p.id),
      ).length,
      ctx.personas.length,
    );

    // 2. storyToCapability: % of user stories with ≥1 valid capability
    const capabilityIds = new Set(ctx.capabilities.map((c) => c.id));
    const storyToCapability = this.pct(
      ctx.userStories.filter((s) =>
        s.capabilities.some((capId) => capabilityIds.has(capId)),
      ).length,
      ctx.userStories.length,
    );

    // 3. capabilityToContext: % of capabilities whose taxonomyNode appears on
    //    at least one bounded context's taxonomyNode
    const contextTaxNodes = new Set(
      ctx.boundedContexts
        .filter((c) => c.taxonomyNode && c.taxonomyNode !== "taxonomy_node")
        .map((c) => c.taxonomyNode as string),
    );
    const capabilityToContext = this.pct(
      ctx.capabilities.filter(
        (cap) => cap.taxonomyNode && contextTaxNodes.has(cap.taxonomyNode),
      ).length,
      ctx.capabilities.length,
    );

    // 4. contextToEvent: % of internal bounded contexts that produce ≥1 event
    const internalContexts = ctx.boundedContexts.filter(
      (c) => !c.contextType || c.contextType === "internal",
    );
    const producerContextIds = new Set(ctx.domainEvents.map((e) => e.contextId));
    const contextToEvent = this.pct(
      internalContexts.filter((c) => producerContextIds.has(c.id)).length,
      internalContexts.length,
    );

    // 5. eventToConsumer: % of events with ≥1 resolved consumer
    const contextSlugs = new Set(ctx.boundedContexts.map((c) => c.slug));
    const eventToConsumer = this.pct(
      ctx.domainEvents.filter((e) =>
        e.consumedBy.some((slug) => contextSlugs.has(slug)),
      ).length,
      ctx.domainEvents.length,
    );

    // 6. workflowToContext: % of workflows where ALL contextIds resolve
    const contextIds = new Set(ctx.boundedContexts.map((c) => c.id));
    const workflowToContext = this.pct(
      ctx.workflows.filter((wf) =>
        wf.contextIds.every((id) => contextIds.has(id)),
      ).length,
      ctx.workflows.length,
    );

    // 7. eventToCapability: % of events with sourceCapabilityId set
    const eventToCapability = this.pct(
      ctx.domainEvents.filter((e) => !!e.sourceCapabilityId).length,
      ctx.domainEvents.length,
    );

    return {
      personaToStory,
      storyToCapability,
      capabilityToContext,
      contextToEvent,
      eventToConsumer,
      workflowToContext,
      eventToCapability,
    };
  }

  /** Return a percentage (0–100) rounded to 1 decimal, or 100 if denominator is 0 */
  private pct(numerator: number, denominator: number): number {
    if (denominator === 0) return 100;
    return Math.round((numerator / denominator) * 1000) / 10;
  }
}

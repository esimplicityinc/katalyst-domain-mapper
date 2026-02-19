/**
 * Lint API Routes
 *
 * GET /landscape/:domainModelId/lint
 *
 * Runs the landscape integrity linter against the specified domain model and
 * returns a structured LintReport containing all findings grouped by severity
 * and category, plus quantitative coverage scores.
 */

import Elysia, { t } from "elysia";
import type { LintLandscape } from "../../../usecases/lint/LintLandscape.js";

interface LintRouteDeps {
  lintLandscape: LintLandscape;
}

export function createLintRoutes(deps: LintRouteDeps) {
  return new Elysia({ prefix: "/landscape" }).get(
    "/:domainModelId/lint",
    async ({ params, query, set }) => {
      const { domainModelId } = params;

      let report;
      try {
        report = await deps.lintLandscape.execute(domainModelId);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("not found")) {
          set.status = 404;
          return { error: message };
        }
        throw err;
      }

      // Optional filtering by severity or category
      let findings = report.findings;

      if (query.severity) {
        const severities = query.severity.split(",").map((s) => s.trim());
        findings = findings.filter((f) => severities.includes(f.severity));
      }

      if (query.category) {
        const categories = query.category.split(",").map((c) => c.trim());
        findings = findings.filter((f) => categories.includes(f.category));
      }

      if (query.entityType) {
        const types = query.entityType.split(",").map((t) => t.trim());
        findings = findings.filter((f) => types.includes(f.entityType));
      }

      // Return filtered findings but always include the full summary
      return {
        ...report,
        findings,
        // Recompute filtered count for the response
        filteredCount: findings.length,
      };
    },
    {
      params: t.Object({
        domainModelId: t.String(),
      }),
      query: t.Object({
        /** Comma-separated severity levels to include: "error,warning,info" */
        severity: t.Optional(t.String()),
        /** Comma-separated category names to include */
        category: t.Optional(t.String()),
        /** Comma-separated entity types to include: "persona,capability,domainEvent" */
        entityType: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Lint"],
        summary: "Lint landscape integrity",
        description:
          "Runs the landscape integrity linter against a domain model and returns findings for broken references, coverage gaps, and semantic inconsistencies.",
      },
    },
  );
}

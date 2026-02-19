/**
 * Integration tests for LandscapeLinter.
 *
 * Tests the full lint pipeline (all rule sets together) and verifies
 * the LintReport structure including summary counts and coverage scores.
 */

import { describe, it, expect } from "bun:test";
import { LandscapeLinter } from "../LandscapeLinter.js";
import { emptyContext, validContext, makePersona, makeUserStory, makeBoundedContext, makeDomainEvent } from "./fixtures.js";

const linter = new LandscapeLinter();

describe("LandscapeLinter", () => {
  describe("report structure", () => {
    it("returns a well-formed LintReport", () => {
      const report = linter.lint(emptyContext());
      expect(report).toHaveProperty("domainModelId", "model-001");
      expect(report).toHaveProperty("generatedAt");
      expect(report).toHaveProperty("findings");
      expect(report).toHaveProperty("summary");
      expect(report.summary).toHaveProperty("total");
      expect(report.summary).toHaveProperty("byCategory");
      expect(report.summary).toHaveProperty("bySeverity");
      expect(report.summary).toHaveProperty("coverageScores");
    });

    it("summary total equals findings length", () => {
      const ctx = emptyContext({
        personas: [makePersona({ id: "PER-001" })],
        userStories: [makeUserStory({ persona: "PER-GHOST", capabilities: ["CAP-GHOST"] })],
      });
      const report = linter.lint(ctx);
      expect(report.summary.total).toBe(report.findings.length);
    });

    it("bySeverity counts add up to total", () => {
      const report = linter.lint(emptyContext());
      const sumBySeverity =
        report.summary.bySeverity.error +
        report.summary.bySeverity.warning +
        report.summary.bySeverity.info;
      expect(sumBySeverity).toBe(report.summary.total);
    });

    it("byCategory counts add up to total", () => {
      const report = linter.lint(emptyContext());
      const sumByCategory = Object.values(report.summary.byCategory).reduce((a, b) => a + b, 0);
      expect(sumByCategory).toBe(report.summary.total);
    });
  });

  describe("coverage scores", () => {
    it("returns 100 for all scores when there are no entities (vacuously complete)", () => {
      const report = linter.lint(emptyContext());
      const scores = report.summary.coverageScores;
      expect(scores.personaToStory).toBe(100);
      expect(scores.storyToCapability).toBe(100);
      expect(scores.capabilityToContext).toBe(100);
      expect(scores.contextToEvent).toBe(100);
      expect(scores.eventToConsumer).toBe(100);
      expect(scores.workflowToContext).toBe(100);
      expect(scores.eventToCapability).toBe(100);
    });

    it("computes personaToStory as 50% when 1 of 2 personas has stories", () => {
      const ctx = emptyContext({
        personas: [makePersona({ id: "PER-001" }), makePersona({ id: "PER-002", name: "B" })],
        userStories: [makeUserStory({ persona: "PER-001" })],
      });
      const report = linter.lint(ctx);
      expect(report.summary.coverageScores.personaToStory).toBe(50);
    });

    it("computes eventToCapability correctly", () => {
      const ctx = emptyContext({
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
        domainEvents: [
          makeDomainEvent({ id: "evt-001", contextId: "ctx-001", sourceCapabilityId: "CAP-001" }),
          makeDomainEvent({ id: "evt-002", contextId: "ctx-001", sourceCapabilityId: null }),
        ],
      });
      const report = linter.lint(ctx);
      expect(report.summary.coverageScores.eventToCapability).toBe(50);
    });
  });

  describe("valid context produces no error findings", () => {
    it("a fully wired model has no error-severity findings", () => {
      const report = linter.lint(validContext());
      const errors = report.findings.filter((f) => f.severity === "error");
      expect(errors).toHaveLength(0);
    });
  });

  describe("broken references", () => {
    it("detects multiple error-level violations in one report", () => {
      const ctx = emptyContext({
        personas: [makePersona({ id: "PER-001" })],
        userStories: [
          makeUserStory({ persona: "PER-GHOST", capabilities: ["CAP-GHOST"] }),
        ],
        capabilities: [],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
        domainEvents: [makeDomainEvent({ contextId: "ctx-GHOST" })],
      });
      const report = linter.lint(ctx);
      const errors = report.findings.filter((f) => f.severity === "error");
      // story-persona-exists + story-capability-exists + event-context-exists
      expect(errors.length).toBeGreaterThanOrEqual(3);
      expect(report.summary.bySeverity.error).toBe(errors.length);
    });
  });
});

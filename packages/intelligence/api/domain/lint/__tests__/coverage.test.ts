/**
 * Unit tests for coverage / orphan detection lint rules.
 */

import { describe, it, expect } from "bun:test";
import { runCoverageRules } from "../rules/coverage.js";
import {
  emptyContext,
  makePersona,
  makeUserStory,
  makeCapability,
  makeBoundedContext,
  makeAggregate,
  makeDomainEvent,
  makeGlossaryTerm,
  makeWorkflow,
} from "./fixtures.js";

describe("coverage rules", () => {
  describe("persona-has-stories", () => {
    it("flags persona with no user stories", () => {
      const ctx = emptyContext({
        personas: [makePersona({ id: "PER-001" })],
        userStories: [],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "persona-has-stories");
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("warning");
    });

    it("passes when persona has at least one story", () => {
      const ctx = emptyContext({
        personas: [makePersona({ id: "PER-001" })],
        userStories: [makeUserStory({ persona: "PER-001" })],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "persona-has-stories");
      expect(findings).toHaveLength(0);
    });
  });

  describe("persona-has-capabilities", () => {
    it("flags persona with empty typicalCapabilities", () => {
      const ctx = emptyContext({
        personas: [makePersona({ typicalCapabilities: [] })],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "persona-has-capabilities");
      expect(findings).toHaveLength(1);
    });

    it("passes when persona has capabilities", () => {
      const ctx = emptyContext({
        personas: [makePersona({ typicalCapabilities: ["CAP-001"] })],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "persona-has-capabilities");
      expect(findings).toHaveLength(0);
    });
  });

  describe("capability-has-stories", () => {
    it("flags capability not referenced by any story", () => {
      const ctx = emptyContext({
        capabilities: [makeCapability({ id: "CAP-001" })],
        userStories: [makeUserStory({ capabilities: ["CAP-002"] })], // different ID
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "capability-has-stories");
      expect(findings).toHaveLength(1);
      expect(findings[0].category).toBe("orphaned-entity");
    });

    it("passes when capability is used in a story", () => {
      const ctx = emptyContext({
        capabilities: [makeCapability({ id: "CAP-001" })],
        userStories: [makeUserStory({ capabilities: ["CAP-001"] })],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "capability-has-stories");
      expect(findings).toHaveLength(0);
    });
  });

  describe("capability-has-context", () => {
    it("flags capability with no taxonomyNode", () => {
      const ctx = emptyContext({
        capabilities: [makeCapability({ taxonomyNode: undefined })],
        boundedContexts: [makeBoundedContext()],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "capability-has-context");
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("warning");
    });

    it("produces info finding when taxonomyNode set but no context uses it", () => {
      const ctx = emptyContext({
        capabilities: [makeCapability({ taxonomyNode: "orphan-node" })],
        boundedContexts: [makeBoundedContext({ taxonomyNode: "system-a" })],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "capability-has-context");
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("info");
    });

    it("passes when taxonomyNode matches a context", () => {
      const ctx = emptyContext({
        capabilities: [makeCapability({ taxonomyNode: "system-a" })],
        boundedContexts: [makeBoundedContext({ taxonomyNode: "system-a" })],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "capability-has-context");
      expect(findings).toHaveLength(0);
    });
  });

  describe("context-has-events", () => {
    it("flags internal context with no events", () => {
      const ctx = emptyContext({
        boundedContexts: [makeBoundedContext({ id: "ctx-001", contextType: "internal" })],
        domainEvents: [],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "context-has-events");
      expect(findings).toHaveLength(1);
    });

    it("does not flag external-system context with no events", () => {
      const ctx = emptyContext({
        boundedContexts: [makeBoundedContext({ contextType: "external-system" })],
        domainEvents: [],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "context-has-events");
      expect(findings).toHaveLength(0);
    });

    it("passes when context is a consumer", () => {
      const ctx = emptyContext({
        boundedContexts: [
          makeBoundedContext({ id: "ctx-001", slug: "context-a", contextType: "internal" }),
          makeBoundedContext({ id: "ctx-002", slug: "context-b", contextType: "internal" }),
        ],
        domainEvents: [
          makeDomainEvent({ contextId: "ctx-001", consumedBy: ["context-b"] }),
        ],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "context-has-events");
      expect(findings).toHaveLength(0);
    });
  });

  describe("context-has-aggregates", () => {
    it("flags internal context with no aggregates", () => {
      const ctx = emptyContext({
        boundedContexts: [makeBoundedContext({ id: "ctx-001", contextType: "internal" })],
        aggregates: [],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "context-has-aggregates");
      expect(findings).toHaveLength(1);
    });

    it("does not flag human-process context", () => {
      const ctx = emptyContext({
        boundedContexts: [makeBoundedContext({ contextType: "human-process" })],
        aggregates: [],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "context-has-aggregates");
      expect(findings).toHaveLength(0);
    });
  });

  describe("event-has-consumers", () => {
    it("flags event with no consumedBy entries", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ consumedBy: [] })],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "event-has-consumers");
      expect(findings).toHaveLength(1);
    });

    it("flags event whose consumers don't resolve to known contexts", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ consumedBy: ["ctx-ghost"] })],
        boundedContexts: [makeBoundedContext({ id: "ctx-001", slug: "context-a" })],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "event-has-consumers");
      expect(findings).toHaveLength(1);
    });

    it("passes when at least one consumer resolves", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ consumedBy: ["context-b"] })],
        boundedContexts: [
          makeBoundedContext({ id: "ctx-001", slug: "context-a" }),
          makeBoundedContext({ id: "ctx-002", slug: "context-b" }),
        ],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "event-has-consumers");
      expect(findings).toHaveLength(0);
    });
  });

  describe("event-has-capability-link", () => {
    it("flags event with no sourceCapabilityId when capabilities exist", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ sourceCapabilityId: null })],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
        capabilities: [makeCapability()],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "event-has-capability-link");
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("info");
    });

    it("skips check when no capabilities loaded (no governance snapshot)", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ sourceCapabilityId: null })],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
        capabilities: [],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "event-has-capability-link");
      expect(findings).toHaveLength(0);
    });
  });

  describe("workflow-has-events", () => {
    it("flags multi-context workflow where no context has events", () => {
      const ctx = emptyContext({
        workflows: [makeWorkflow({ contextIds: ["ctx-001", "ctx-002"] })],
        domainEvents: [],
        boundedContexts: [
          makeBoundedContext({ id: "ctx-001" }),
          makeBoundedContext({ id: "ctx-002", slug: "context-b" }),
        ],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "workflow-has-events");
      expect(findings).toHaveLength(1);
    });

    it("passes for single-context workflow", () => {
      const ctx = emptyContext({
        workflows: [makeWorkflow({ contextIds: ["ctx-001"] })],
        domainEvents: [],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "workflow-has-events");
      expect(findings).toHaveLength(0);
    });
  });

  describe("aggregate-has-events", () => {
    it("flags aggregate with no events list and no linked events", () => {
      const ctx = emptyContext({
        aggregates: [makeAggregate({ events: [] })],
        domainEvents: [makeDomainEvent({ aggregateId: null })],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "aggregate-has-events");
      expect(findings).toHaveLength(1);
    });

    it("passes when aggregate.events list is non-empty", () => {
      const ctx = emptyContext({
        aggregates: [makeAggregate({ events: ["order-placed"] })],
        domainEvents: [],
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "aggregate-has-events");
      expect(findings).toHaveLength(0);
    });
  });

  describe("glossary-covers-aggregates", () => {
    it("flags aggregate root entity with no glossary term", () => {
      const ctx = emptyContext({
        aggregates: [makeAggregate({ rootEntity: "Invoice" })],
        glossaryTerms: [makeGlossaryTerm({ term: "Order" })], // different term
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "glossary-covers-aggregates");
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("info");
    });

    it("passes when glossary term exists (case-insensitive)", () => {
      const ctx = emptyContext({
        aggregates: [makeAggregate({ rootEntity: "Order" })],
        glossaryTerms: [makeGlossaryTerm({ term: "order" })], // lowercase match
      });
      const findings = runCoverageRules(ctx).filter((f) => f.rule === "glossary-covers-aggregates");
      expect(findings).toHaveLength(0);
    });
  });
});

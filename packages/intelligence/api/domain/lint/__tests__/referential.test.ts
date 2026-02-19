/**
 * Unit tests for referential integrity lint rules.
 */

import { describe, it, expect } from "bun:test";
import { runReferentialRules } from "../rules/referential.js";
import {
  emptyContext,
  makePersona,
  makeUserStory,
  makeCapability,
  makeBoundedContext,
  makeAggregate,
  makeDomainEvent,
  makeWorkflow,
  makeTaxonomyNode,
} from "./fixtures.js";

describe("referential rules", () => {
  describe("story-persona-exists", () => {
    it("passes when story persona exists", () => {
      const ctx = emptyContext({
        personas: [makePersona({ id: "PER-001" })],
        userStories: [makeUserStory({ persona: "PER-001" })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "story-persona-exists");
      expect(findings).toHaveLength(0);
    });

    it("flags story with missing persona", () => {
      const ctx = emptyContext({
        personas: [],
        userStories: [makeUserStory({ persona: "PER-GHOST" })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "story-persona-exists");
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("error");
      expect(findings[0].category).toBe("broken-reference");
    });

    it("flags story with no persona at all", () => {
      const ctx = emptyContext({
        personas: [makePersona()],
        userStories: [makeUserStory({ persona: "" })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "story-persona-exists");
      expect(findings).toHaveLength(1);
    });
  });

  describe("story-capability-exists", () => {
    it("flags story referencing unknown capability", () => {
      const ctx = emptyContext({
        capabilities: [makeCapability({ id: "CAP-001" })],
        userStories: [makeUserStory({ capabilities: ["CAP-001", "CAP-GHOST"] })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "story-capability-exists");
      expect(findings).toHaveLength(1);
      expect(findings[0].relatedEntities?.[0].id).toBe("CAP-GHOST");
    });

    it("passes when all capabilities exist", () => {
      const ctx = emptyContext({
        capabilities: [makeCapability({ id: "CAP-001" })],
        userStories: [makeUserStory({ capabilities: ["CAP-001"] })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "story-capability-exists");
      expect(findings).toHaveLength(0);
    });
  });

  describe("persona-capability-exists", () => {
    it("flags persona with nonexistent typicalCapability", () => {
      const ctx = emptyContext({
        personas: [makePersona({ typicalCapabilities: ["CAP-GHOST"] })],
        capabilities: [],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "persona-capability-exists");
      expect(findings).toHaveLength(1);
    });
  });

  describe("event-context-exists", () => {
    it("flags event whose contextId has no matching bounded context", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ contextId: "ctx-ghost" })],
        boundedContexts: [],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "event-context-exists");
      expect(findings).toHaveLength(1);
    });

    it("passes when context exists", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ contextId: "ctx-001" })],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "event-context-exists");
      expect(findings).toHaveLength(0);
    });
  });

  describe("event-aggregate-exists", () => {
    it("flags event with missing aggregateId", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ aggregateId: "agg-ghost" })],
        aggregates: [],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "event-aggregate-exists");
      expect(findings).toHaveLength(1);
    });

    it("passes when aggregateId is null", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ aggregateId: null })],
        aggregates: [],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "event-aggregate-exists");
      expect(findings).toHaveLength(0);
    });
  });

  describe("event-source-capability-exists", () => {
    it("flags event with missing sourceCapabilityId", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ sourceCapabilityId: "CAP-GHOST" })],
        capabilities: [],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "event-source-capability-exists");
      expect(findings).toHaveLength(1);
    });

    it("passes when sourceCapabilityId is null", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ sourceCapabilityId: null })],
        capabilities: [makeCapability()],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "event-source-capability-exists");
      expect(findings).toHaveLength(0);
    });
  });

  describe("event-target-capabilities-exist", () => {
    it("flags event with unknown target capability", () => {
      const ctx = emptyContext({
        domainEvents: [makeDomainEvent({ targetCapabilityIds: ["CAP-001", "CAP-GHOST"] })],
        capabilities: [makeCapability({ id: "CAP-001" })],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "event-target-capabilities-exist");
      expect(findings).toHaveLength(1);
      expect(findings[0].relatedEntities?.[0].id).toBe("CAP-GHOST");
    });
  });

  describe("workflow-context-exists", () => {
    it("flags workflow with unknown context in contextIds", () => {
      const ctx = emptyContext({
        workflows: [makeWorkflow({ contextIds: ["ctx-001", "ctx-ghost"] })],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "workflow-context-exists");
      expect(findings).toHaveLength(1);
      expect(findings[0].relatedEntities?.[0].id).toBe("ctx-ghost");
    });
  });

  describe("aggregate-context-exists", () => {
    it("flags aggregate whose contextId has no context", () => {
      const ctx = emptyContext({
        aggregates: [makeAggregate({ contextId: "ctx-ghost" })],
        boundedContexts: [],
      });
      const findings = runReferentialRules(ctx).filter((f) => f.rule === "aggregate-context-exists");
      expect(findings).toHaveLength(1);
    });
  });

  describe("context-relationship-target-exists", () => {
    it("flags relationship pointing to nonexistent context", () => {
      const ctx = emptyContext({
        boundedContexts: [
          makeBoundedContext({
            id: "ctx-001",
            relationships: [{ targetContextId: "ctx-ghost" }],
          }),
        ],
      });
      const findings = runReferentialRules(ctx).filter(
        (f) => f.rule === "context-relationship-target-exists",
      );
      expect(findings).toHaveLength(1);
    });

    it("passes when target exists", () => {
      const ctx = emptyContext({
        boundedContexts: [
          makeBoundedContext({ id: "ctx-001", relationships: [{ targetContextId: "ctx-002" }] }),
          makeBoundedContext({ id: "ctx-002", slug: "context-b" }),
        ],
      });
      const findings = runReferentialRules(ctx).filter(
        (f) => f.rule === "context-relationship-target-exists",
      );
      expect(findings).toHaveLength(0);
    });
  });

  describe("context-taxonomy-node-exists", () => {
    it("flags context with unrecognised taxonomyNode when taxonomy is available", () => {
      const ctx = emptyContext({
        boundedContexts: [makeBoundedContext({ taxonomyNode: "node-ghost" })],
        taxonomyNodes: [makeTaxonomyNode({ name: "system-a", fqtn: "system-a" })],
      });
      const findings = runReferentialRules(ctx).filter(
        (f) => f.rule === "context-taxonomy-node-exists",
      );
      expect(findings).toHaveLength(1);
    });

    it("passes when no taxonomy data is available (no snapshot)", () => {
      const ctx = emptyContext({
        boundedContexts: [makeBoundedContext({ taxonomyNode: "any-node" })],
        taxonomyNodes: [], // no taxonomy loaded
      });
      const findings = runReferentialRules(ctx).filter(
        (f) => f.rule === "context-taxonomy-node-exists",
      );
      expect(findings).toHaveLength(0);
    });

    it("passes when taxonomyNode matches by name", () => {
      const ctx = emptyContext({
        boundedContexts: [makeBoundedContext({ taxonomyNode: "system-a" })],
        taxonomyNodes: [makeTaxonomyNode({ name: "system-a" })],
      });
      const findings = runReferentialRules(ctx).filter(
        (f) => f.rule === "context-taxonomy-node-exists",
      );
      expect(findings).toHaveLength(0);
    });
  });

  describe("capability-taxonomy-node-exists", () => {
    it("flags capability with unrecognised taxonomyNode", () => {
      const ctx = emptyContext({
        capabilities: [makeCapability({ taxonomyNode: "node-ghost" })],
        taxonomyNodes: [makeTaxonomyNode({ name: "system-a" })],
      });
      const findings = runReferentialRules(ctx).filter(
        (f) => f.rule === "capability-taxonomy-node-exists",
      );
      expect(findings).toHaveLength(1);
    });

    it("passes when taxonomyNode is undefined", () => {
      const ctx = emptyContext({
        capabilities: [makeCapability({ taxonomyNode: undefined })],
        taxonomyNodes: [makeTaxonomyNode()],
      });
      const findings = runReferentialRules(ctx).filter(
        (f) => f.rule === "capability-taxonomy-node-exists",
      );
      expect(findings).toHaveLength(0);
    });
  });
});

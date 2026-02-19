/**
 * Unit tests for semantic / logical gap lint rules.
 */

import { describe, it, expect } from "bun:test";
import { runSemanticRules } from "../rules/semantic.js";
import {
  emptyContext,
  makePersona,
  makeCapability,
  makeBoundedContext,
  makeDomainEvent,
  makeWorkflow,
} from "./fixtures.js";

describe("semantic rules", () => {
  describe("workflow-contexts-connected", () => {
    it("flags workflow where adjacent contexts have no events between them", () => {
      const ctx = emptyContext({
        boundedContexts: [
          makeBoundedContext({ id: "ctx-001", slug: "context-a" }),
          makeBoundedContext({ id: "ctx-002", slug: "context-b" }),
        ],
        workflows: [makeWorkflow({ contextIds: ["ctx-001", "ctx-002"] })],
        domainEvents: [], // no events at all
      });
      const findings = runSemanticRules(ctx).filter(
        (f) => f.rule === "workflow-contexts-connected",
      );
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("warning");
    });

    it("passes when there is an event connecting the adjacent pair", () => {
      const ctx = emptyContext({
        boundedContexts: [
          makeBoundedContext({ id: "ctx-001", slug: "context-a" }),
          makeBoundedContext({ id: "ctx-002", slug: "context-b" }),
        ],
        workflows: [makeWorkflow({ contextIds: ["ctx-001", "ctx-002"] })],
        domainEvents: [
          makeDomainEvent({
            contextId: "ctx-001",
            consumedBy: ["context-b"],
          }),
        ],
      });
      const findings = runSemanticRules(ctx).filter(
        (f) => f.rule === "workflow-contexts-connected",
      );
      expect(findings).toHaveLength(0);
    });

    it("skips single-context workflows", () => {
      const ctx = emptyContext({
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
        workflows: [makeWorkflow({ contextIds: ["ctx-001"] })],
        domainEvents: [],
      });
      const findings = runSemanticRules(ctx).filter(
        (f) => f.rule === "workflow-contexts-connected",
      );
      expect(findings).toHaveLength(0);
    });
  });

  describe("event-consumer-bidirectional", () => {
    it("flags when producer context has no declared relationship to consumer", () => {
      const producer = makeBoundedContext({
        id: "ctx-001",
        slug: "context-a",
        relationships: [], // no declared relationships
      });
      const consumer = makeBoundedContext({ id: "ctx-002", slug: "context-b" });
      const ctx = emptyContext({
        boundedContexts: [producer, consumer],
        domainEvents: [
          makeDomainEvent({ contextId: "ctx-001", consumedBy: ["context-b"] }),
        ],
      });
      const findings = runSemanticRules(ctx).filter(
        (f) => f.rule === "event-consumer-bidirectional",
      );
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("info");
    });

    it("passes when producer declares relationship to consumer", () => {
      const producer = makeBoundedContext({
        id: "ctx-001",
        slug: "context-a",
        relationships: [{ targetContextId: "ctx-002", type: "downstream" }],
      });
      const consumer = makeBoundedContext({ id: "ctx-002", slug: "context-b" });
      const ctx = emptyContext({
        boundedContexts: [producer, consumer],
        domainEvents: [
          makeDomainEvent({ contextId: "ctx-001", consumedBy: ["context-b"] }),
        ],
      });
      const findings = runSemanticRules(ctx).filter(
        (f) => f.rule === "event-consumer-bidirectional",
      );
      expect(findings).toHaveLength(0);
    });
  });

  describe("persona-archetype-type-alignment", () => {
    it("flags bot persona linked to approval capability", () => {
      const ctx = emptyContext({
        personas: [
          makePersona({
            id: "PER-BOT",
            name: "CI Bot",
            type: "bot",
            typicalCapabilities: ["CAP-001"],
          }),
        ],
        capabilities: [
          makeCapability({ id: "CAP-001", title: "Approve Release to Production" }),
        ],
      });
      const findings = runSemanticRules(ctx).filter(
        (f) => f.rule === "persona-archetype-type-alignment",
      );
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("info");
    });

    it("does not flag human persona with approval capability", () => {
      const ctx = emptyContext({
        personas: [makePersona({ type: "human", typicalCapabilities: ["CAP-001"] })],
        capabilities: [makeCapability({ id: "CAP-001", title: "Manager Approval" })],
      });
      const findings = runSemanticRules(ctx).filter(
        (f) => f.rule === "persona-archetype-type-alignment",
      );
      expect(findings).toHaveLength(0);
    });

    it("does not flag bot persona with unambiguous capability", () => {
      const ctx = emptyContext({
        personas: [makePersona({ type: "bot", typicalCapabilities: ["CAP-001"] })],
        capabilities: [makeCapability({ id: "CAP-001", title: "Scan Repository" })],
      });
      const findings = runSemanticRules(ctx).filter(
        (f) => f.rule === "persona-archetype-type-alignment",
      );
      expect(findings).toHaveLength(0);
    });
  });

  describe("capability-no-road-items", () => {
    it("flags capability with zero road items", () => {
      const ctx = emptyContext({
        capabilities: [makeCapability({ id: "CAP-001", roadCount: 0 })],
      });
      const findings = runSemanticRules(ctx).filter((f) => f.rule === "capability-no-road-items");
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("info");
    });

    it("passes when capability has road items", () => {
      const ctx = emptyContext({
        capabilities: [makeCapability({ id: "CAP-001", roadCount: 2 })],
      });
      const findings = runSemanticRules(ctx).filter((f) => f.rule === "capability-no-road-items");
      expect(findings).toHaveLength(0);
    });
  });

  describe("workflow-transition-trigger-event-exists", () => {
    it("flags transition whose trigger does not match any event slug", () => {
      const ctx = emptyContext({
        workflows: [
          makeWorkflow({
            transitions: [{ from: "a", to: "b", trigger: "ghost-event-slug" }],
          }),
        ],
        domainEvents: [makeDomainEvent({ slug: "order-placed" })],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
      });
      const findings = runSemanticRules(ctx).filter(
        (f) => f.rule === "workflow-transition-trigger-event-exists",
      );
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("warning");
    });

    it("passes when trigger matches an event slug", () => {
      const ctx = emptyContext({
        workflows: [
          makeWorkflow({
            transitions: [{ from: "a", to: "b", trigger: "order-placed" }],
          }),
        ],
        domainEvents: [makeDomainEvent({ slug: "order-placed" })],
        boundedContexts: [makeBoundedContext({ id: "ctx-001" })],
      });
      const findings = runSemanticRules(ctx).filter(
        (f) => f.rule === "workflow-transition-trigger-event-exists",
      );
      expect(findings).toHaveLength(0);
    });

    it("skips transitions with no trigger set", () => {
      const ctx = emptyContext({
        workflows: [makeWorkflow({ transitions: [{ from: "a", to: "b" }] })],
        domainEvents: [],
      });
      const findings = runSemanticRules(ctx).filter(
        (f) => f.rule === "workflow-transition-trigger-event-exists",
      );
      expect(findings).toHaveLength(0);
    });
  });

  describe("orphan-inferred-systems", () => {
    it("flags unresolved consumer slugs", () => {
      const ctx = emptyContext({
        boundedContexts: [makeBoundedContext({ id: "ctx-001", slug: "context-a" })],
        domainEvents: [
          makeDomainEvent({
            id: "evt-001",
            contextId: "ctx-001",
            consumedBy: ["unknown-external-system"],
          }),
        ],
      });
      const findings = runSemanticRules(ctx).filter((f) => f.rule === "orphan-inferred-systems");
      expect(findings).toHaveLength(1);
      expect(findings[0].severity).toBe("warning");
      expect(findings[0].entityName).toBe("unknown-external-system");
    });

    it("passes when all consumers resolve", () => {
      const ctx = emptyContext({
        boundedContexts: [
          makeBoundedContext({ id: "ctx-001", slug: "context-a" }),
          makeBoundedContext({ id: "ctx-002", slug: "context-b" }),
        ],
        domainEvents: [
          makeDomainEvent({ contextId: "ctx-001", consumedBy: ["context-b"] }),
        ],
      });
      const findings = runSemanticRules(ctx).filter((f) => f.rule === "orphan-inferred-systems");
      expect(findings).toHaveLength(0);
    });
  });
});

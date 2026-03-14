import { describe, it, expect } from "bun:test";
import { CMLWriter } from "./CMLWriter.js";
import type { CMLDomainInput } from "./CMLWriter.js";

// Shared contribution block for test fixtures
const testContribution = {
  status: "accepted" as const,
  version: 1,
  supersedes: null,
  supersededBy: null,
  submittedAt: null,
  submittedBy: null,
  reviewedAt: null,
  reviewedBy: null,
  reviewFeedback: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("CMLWriter", () => {
  const writer = new CMLWriter();

  it("should export minimal domain model", () => {
    const model: CMLDomainInput = {
      name: "Test Domain",
      boundedContexts: [],
    };

    const cml = writer.write(model);

    expect(cml).toContain("ContextMap TestDomainContextMap");
    expect(cml).toContain("type SYSTEM_LANDSCAPE");
    expect(cml).toContain("state AS_IS");
  });

  it("should export bounded contexts with subdomain types", () => {
    const model: CMLDomainInput = {
      name: "E-Commerce",
      boundedContexts: [
        {
          slug: "order-management",
          responsibility: "Manages orders and fulfillment",
          subdomainType: "core",
          status: "stable",
          aggregates: [],
          relationships: [],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
          contribution: testContribution,
        },
        {
          slug: "inventory",
          responsibility: "Tracks product inventory",
          subdomainType: "supporting",
          status: "stable",
          aggregates: [],
          relationships: [],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
          contribution: testContribution,
        },
      ],
    };

    const cml = writer.write(model);

    expect(cml).toContain("contains OrderManagementContext");
    expect(cml).toContain("contains InventoryContext");
    expect(cml).toContain("BoundedContext OrderManagementContext");
    expect(cml).toContain("type CORE_DOMAIN");
    expect(cml).toContain("type SUPPORTING_DOMAIN");
    expect(cml).toContain(
      'domainVisionStatement "Manages orders and fulfillment"',
    );
  });

  it("should export upstream-downstream relationships", () => {
    const model: CMLDomainInput = {
      name: "Test",
      boundedContexts: [
        {
          slug: "upstream",
          responsibility: "Upstream context",
          subdomainType: "core",
          status: "stable",
          aggregates: [],
          relationships: [],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
          contribution: testContribution,
        },
        {
          slug: "downstream",
          responsibility: "Downstream context",
          subdomainType: "supporting",
          status: "stable",
          aggregates: [],
          relationships: [
            {
              targetContext: "upstream",
              targetContextId: "upstream",
              type: "upstream",
              communicationPattern: "domain-events",
              description: "Upstream dependency",
            },
          ],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
          contribution: testContribution,
        },
      ],
    };

    const cml = writer.write(model);

    expect(cml).toContain("UpstreamContext [U]->[D] DownstreamContext");
    expect(cml).toContain(': "Upstream dependency"');
  });

  it("should export partnership relationships", () => {
    const model: CMLDomainInput = {
      name: "Test",
      boundedContexts: [
        {
          slug: "partner-a",
          responsibility: "Partner A",
          subdomainType: "core",
          status: "stable",
          aggregates: [],
          relationships: [
            {
              targetContext: "partner-b",
              targetContextId: "partner-b",
              type: "partnership",
              communicationPattern: undefined,
              description: undefined,
            },
          ],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
          contribution: testContribution,
        },
        {
          slug: "partner-b",
          responsibility: "Partner B",
          subdomainType: "core",
          status: "stable",
          aggregates: [],
          relationships: [],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
          contribution: testContribution,
        },
      ],
    };

    const cml = writer.write(model);

    expect(cml).toContain("PartnerAContext [P]<->[P] PartnerBContext");
  });

  it("should export shared kernel relationships", () => {
    const model: CMLDomainInput = {
      name: "Test",
      boundedContexts: [
        {
          slug: "shared-a",
          responsibility: "Shared A",
          subdomainType: "core",
          status: "stable",
          aggregates: [],
          relationships: [
            {
              targetContext: "shared-b",
              targetContextId: "shared-b",
              type: "shared-kernel",
              communicationPattern: undefined,
              description: undefined,
            },
          ],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
          contribution: testContribution,
        },
        {
          slug: "shared-b",
          responsibility: "Shared B",
          subdomainType: "core",
          status: "stable",
          aggregates: [],
          relationships: [],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
          contribution: testContribution,
        },
      ],
    };

    const cml = writer.write(model);

    expect(cml).toContain("SharedAContext [SK]<->[SK] SharedBContext");
  });

  it("should export separate ways relationships", () => {
    const model: CMLDomainInput = {
      name: "Test",
      boundedContexts: [
        {
          slug: "separate-a",
          responsibility: "Separate A",
          subdomainType: "generic",
          status: "stable",
          aggregates: [],
          relationships: [
            {
              targetContext: "separate-b",
              targetContextId: "separate-b",
              type: "separate-ways",
              communicationPattern: undefined,
              description: undefined,
            },
          ],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
          contribution: testContribution,
        },
        {
          slug: "separate-b",
          responsibility: "Separate B",
          subdomainType: "generic",
          status: "stable",
          aggregates: [],
          relationships: [],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
          contribution: testContribution,
        },
      ],
    };

    const cml = writer.write(model);

    expect(cml).toContain(
      "SeparateAContext [PL] Separate-Ways SeparateBContext",
    );
  });

  it("should include generation metadata", () => {
    const model: CMLDomainInput = {
      name: "Test",
      boundedContexts: [],
    };

    const cml = writer.write(model);

    expect(cml).toContain("// Generated from Katalyst Domain Model: Test");
    expect(cml).toContain("// Generated at:");
  });
});

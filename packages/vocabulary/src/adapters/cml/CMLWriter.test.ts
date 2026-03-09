import { describe, it, expect } from "bun:test";
import { CMLWriter } from "./CMLWriter.js";
import type { CMLDomainInput } from "./CMLWriter.js";

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
              type: "upstream",
              description: "Upstream dependency",
            },
          ],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
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
              type: "partnership",
            },
          ],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
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
              type: "shared-kernel",
            },
          ],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
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
              type: "separate-ways",
            },
          ],
          communicationPattern: "domain-events",
          upstreamContexts: [],
          downstreamContexts: [],
          contextType: "internal",
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

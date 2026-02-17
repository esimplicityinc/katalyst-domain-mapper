import { describe, it, expect } from "bun:test";
import { CMLWriter } from "./CMLWriter.js";
import type { DomainModel } from "@foe/schemas/ddd";

describe("CMLWriter", () => {
  const writer = new CMLWriter();

  it("should export minimal domain model", () => {
    const model: DomainModel = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Domain",
      description: "A test domain",
      boundedContexts: [],
      aggregates: [],
      valueObjects: [],
      domainEvents: [],
      glossary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const cml = writer.write(model);

    expect(cml).toContain("ContextMap TestDomainContextMap");
    expect(cml).toContain("type SYSTEM_LANDSCAPE");
    expect(cml).toContain("state AS_IS");
  });

  it("should export bounded contexts with subdomain types", () => {
    const model: DomainModel = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "E-Commerce",
      boundedContexts: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          slug: "order-management",
          title: "Order Management",
          responsibility: "Manages orders and fulfillment",
          subdomainType: "core",
          status: "stable",
          aggregates: [],
          relationships: [],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          slug: "inventory",
          title: "Inventory",
          responsibility: "Tracks product inventory",
          subdomainType: "supporting",
          status: "stable",
          aggregates: [],
          relationships: [],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ],
      aggregates: [],
      valueObjects: [],
      domainEvents: [],
      glossary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
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
    const model: DomainModel = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test",
      boundedContexts: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          slug: "upstream",
          title: "Upstream",
          responsibility: "Upstream context",
          subdomainType: "core",
          status: "stable",
          aggregates: [],
          relationships: [],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          slug: "downstream",
          title: "Downstream",
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
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ],
      aggregates: [],
      valueObjects: [],
      domainEvents: [],
      glossary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const cml = writer.write(model);

    expect(cml).toContain("UpstreamContext [U]->[D] DownstreamContext");
    expect(cml).toContain(': "Upstream dependency"');
  });

  it("should export partnership relationships", () => {
    const model: DomainModel = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test",
      boundedContexts: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          slug: "partner-a",
          title: "Partner A",
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
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          slug: "partner-b",
          title: "Partner B",
          responsibility: "Partner B",
          subdomainType: "core",
          status: "stable",
          aggregates: [],
          relationships: [],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ],
      aggregates: [],
      valueObjects: [],
      domainEvents: [],
      glossary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const cml = writer.write(model);

    expect(cml).toContain("PartnerAContext [P]<->[P] PartnerBContext");
  });

  it("should export shared kernel relationships", () => {
    const model: DomainModel = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test",
      boundedContexts: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          slug: "shared-a",
          title: "Shared A",
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
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          slug: "shared-b",
          title: "Shared B",
          responsibility: "Shared B",
          subdomainType: "core",
          status: "stable",
          aggregates: [],
          relationships: [],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ],
      aggregates: [],
      valueObjects: [],
      domainEvents: [],
      glossary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const cml = writer.write(model);

    expect(cml).toContain("SharedAContext [SK]<->[SK] SharedBContext");
  });

  it("should export separate ways relationships", () => {
    const model: DomainModel = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test",
      boundedContexts: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          slug: "separate-a",
          title: "Separate A",
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
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          slug: "separate-b",
          title: "Separate B",
          responsibility: "Separate B",
          subdomainType: "generic",
          status: "stable",
          aggregates: [],
          relationships: [],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ],
      aggregates: [],
      valueObjects: [],
      domainEvents: [],
      glossary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const cml = writer.write(model);

    expect(cml).toContain(
      "SeparateAContext [PL] Separate-Ways SeparateBContext",
    );
  });

  it("should include generation metadata", () => {
    const model: DomainModel = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test",
      boundedContexts: [],
      aggregates: [],
      valueObjects: [],
      domainEvents: [],
      glossary: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    const cml = writer.write(model);

    expect(cml).toContain("// Generated from Katalyst Domain Model: Test");
    expect(cml).toContain("// Generated at:");
  });
});

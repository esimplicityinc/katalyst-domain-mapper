@api @gov-validation @ROAD-046 @CAP-025
Feature: Governance Capabilities CRUD API
  As a Platform Engineer
  I want to manage capability definitions via API
  So that the taxonomy of business capabilities stays current and well-described

  Background:
    # Ensure a governance snapshot exists so CRUD operations are available
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-05T10:00:00Z",
        "project": "katalyst-domain-mapper",
        "capabilities": {
          "CAP-001": {"id": "CAP-001", "title": "Online Bill Payment", "status": "stable"}
        },
        "personas": {},
        "roadItems": {},
        "stats": {"capabilities": 1, "personas": 0, "userStories": 0, "roadItems": 0, "integrityStatus": "pass", "integrityErrors": 0}
      }
      """
    Then the response status should be 200

  @smoke @capabilities-list
  Scenario: List all capabilities returns an array
    When I GET "/api/v1/governance/capabilities"
    Then the response status should be 200
    And the response should be a JSON array

  @capabilities-get
  Scenario: Retrieve a capability by known ID
    # Create the capability to retrieve
    When I POST "/api/v1/governance/capabilities" with JSON body:
      """
      {
        "id": "CAP-BDD-RETRIEVE",
        "title": "BDD Retrieve Test Capability",
        "status": "stable",
        "description": "Created for GET by ID test",
        "category": "testing",
        "parentCapability": null,
        "dependsOn": [],
        "taxonomyNode": null
      }
      """
    Then the response status should be 201
    Given I register cleanup DELETE "/api/v1/governance/capabilities/CAP-BDD-RETRIEVE"

    When I GET "/api/v1/governance/capabilities/CAP-BDD-RETRIEVE"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "id" should equal "CAP-BDD-RETRIEVE"
    And the value at "title" should equal "BDD Retrieve Test Capability"

  @capabilities-crud
  Scenario: Create a new capability
    When I POST "/api/v1/governance/capabilities" with JSON body:
      """
      {
        "id": "CAP-BDD-001",
        "title": "BDD Test Capability",
        "status": "planned",
        "description": "Created by BDD test",
        "category": "testing",
        "parentCapability": null,
        "dependsOn": [],
        "taxonomyNode": null
      }
      """
    Then the response status should be 201
    And the response should be a JSON object
    And the value at "id" should equal "CAP-BDD-001"
    And the value at "title" should equal "BDD Test Capability"
    And the value at "status" should equal "planned"
    Given I register cleanup DELETE "/api/v1/governance/capabilities/CAP-BDD-001"

  @capabilities-crud
  Scenario: Update an existing capability
    When I POST "/api/v1/governance/capabilities" with JSON body:
      """
      {
        "id": "CAP-BDD-002",
        "title": "Capability to Update",
        "status": "planned",
        "description": null,
        "category": null,
        "parentCapability": null,
        "dependsOn": [],
        "taxonomyNode": null
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "capId"
    Given I register cleanup DELETE "/api/v1/governance/capabilities/{capId}"

    When I PUT "/api/v1/governance/capabilities/{capId}" with JSON body:
      """
      {
        "title": "Updated Capability Title",
        "status": "stable"
      }
      """
    Then the response status should be 200
    And the value at "title" should equal "Updated Capability Title"
    And the value at "status" should equal "stable"

  @capabilities-crud
  Scenario: Delete a capability
    When I POST "/api/v1/governance/capabilities" with JSON body:
      """
      {
        "id": "CAP-BDD-003",
        "title": "Capability to Delete",
        "status": "planned",
        "description": null,
        "category": null,
        "parentCapability": null,
        "dependsOn": [],
        "taxonomyNode": null
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "capToDeleteId"

    When I DELETE "/api/v1/governance/capabilities/{capToDeleteId}"
    Then the response status should be 200
    And the value at "id" should equal "{capToDeleteId}"

  @capabilities-get
  Scenario: Returns 404 for unknown capability ID
    When I GET "/api/v1/governance/capabilities/CAP-NONEXISTENT"
    Then the response status should be 404

  @capabilities-crud
  Scenario: Reject duplicate capability ID
    When I POST "/api/v1/governance/capabilities" with JSON body:
      """
      {
        "id": "CAP-BDD-DUP",
        "title": "Duplicate Capability",
        "status": "planned",
        "description": null,
        "category": null,
        "parentCapability": null,
        "dependsOn": [],
        "taxonomyNode": null
      }
      """
    Then the response status should be 201
    Given I register cleanup DELETE "/api/v1/governance/capabilities/CAP-BDD-DUP"

    When I POST "/api/v1/governance/capabilities" with JSON body:
      """
      {
        "id": "CAP-BDD-DUP",
        "title": "Duplicate Capability Again",
        "status": "planned",
        "description": null,
        "category": null,
        "parentCapability": null,
        "dependsOn": [],
        "taxonomyNode": null
      }
      """
    Then the response status should be 400

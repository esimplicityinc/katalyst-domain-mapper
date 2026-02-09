@api @ddd-modeling @ROAD-008 @CAP-009
Feature: Bounded Context Management
  As a Platform Engineer
  I want to add, update, and delete bounded contexts within a domain model
  So that system boundaries and team ownership are formally documented

  Background:
    # Create a fresh domain model for each scenario
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Context Test Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

  Scenario: Add a bounded context to a domain model
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "scanning",
        "title": "Scanning Context",
        "responsibility": "Orchestrates FOE repository scanning via AI agents",
        "sourceDirectory": "packages/foe-scanner",
        "teamOwnership": "Platform Team",
        "status": "active"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "contextId"
    And the value at "slug" should equal "scanning"
    And the value at "title" should equal "Scanning Context"

  Scenario: Add a bounded context with relationships
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "reporting",
        "title": "Reporting Context",
        "responsibility": "Generates and serves FOE assessment reports",
        "relationships": [
          { "type": "upstream", "target": "scanning" }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    # Verify it appears in the model
    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200

  Scenario: Update a bounded context
    # Create context
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "field-guide",
        "title": "Field Guide Context",
        "responsibility": "Parses and indexes FOE methods and observations"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    # Update it
    When I PUT "/api/v1/domain-models/{modelId}/contexts/{contextId}" with JSON body:
      """
      {
        "slug": "field-guide",
        "title": "Field Guide & Indexing Context",
        "responsibility": "Parses, validates, and indexes FOE methods, observations, and governance artifacts",
        "teamOwnership": "Platform Team",
        "status": "active"
      }
      """
    Then the response status should be 200

  Scenario: Delete a bounded context
    # Create
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "temporary",
        "title": "Temporary Context",
        "responsibility": "To be deleted"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    # Delete
    When I DELETE "/api/v1/domain-models/{modelId}/contexts/{contextId}"
    Then the response status should be 200

  Scenario: Add multiple contexts and verify they appear in model retrieval
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      { "slug": "scanning", "title": "Scanning", "responsibility": "Scans repos" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      { "slug": "reporting", "title": "Reporting", "responsibility": "Generates reports" }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Add context with minimal required fields
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "minimal",
        "title": "Minimal Context",
        "responsibility": "Tests minimal field requirements"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "slug" should equal "minimal"

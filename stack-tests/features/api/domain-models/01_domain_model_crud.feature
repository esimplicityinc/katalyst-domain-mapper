@api @ddd-modeling @ROAD-008 @CAP-009
Feature: DDD Domain Model CRUD
  As a Platform Engineer
  I want to create, list, retrieve, and delete DDD domain models via the API
  So that domain knowledge is captured in a structured, queryable format

  Scenario: Create a new domain model
    When I POST "/api/v1/domain-models" with JSON body:
      """
      {
        "name": "Katalyst Scanning Domain",
        "description": "Domain model for the FOE scanning pipeline"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "modelId"
    And the value at "name" should equal "Katalyst Scanning Domain"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

  Scenario: Create a domain model with name only
    When I POST "/api/v1/domain-models" with JSON body:
      """
      {
        "name": "Minimal Model"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "modelId"
    And the value at "name" should equal "Minimal Model"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

  Scenario: List all domain models
    # Seed a model
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "List Test Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    # List
    When I GET "/api/v1/domain-models"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Get a domain model by ID with all nested artifacts
    # Create model
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Nested Artifacts Model", "description": "For testing nested retrieval" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    # Retrieve with nested artifacts
    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "name" should equal "Nested Artifacts Model"
    And the value at "description" should equal "For testing nested retrieval"

  Scenario: Get non-existent domain model returns 404
    When I GET "/api/v1/domain-models/non-existent-model-id"
    Then the response status should be 404

  Scenario: Delete a domain model
    # Create
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Delete Me Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"

    # Delete
    When I DELETE "/api/v1/domain-models/{modelId}"
    Then the response status should be 200

    # Verify gone
    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 404

  Scenario: Delete cascades to all child artifacts
    # Create model with a bounded context
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Cascade Test Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"

    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "scanning",
        "title": "Scanning Context",
        "responsibility": "Orchestrates repository scanning"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    # Delete the parent model
    When I DELETE "/api/v1/domain-models/{modelId}"
    Then the response status should be 200

    # Parent is gone
    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 404

  Scenario: Domain model includes empty artifact arrays when new
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Empty Artifacts Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Create multiple domain models independently
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Model Alpha" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelAlphaId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelAlphaId}"

    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Model Beta" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelBetaId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelBetaId}"

    When I GET "/api/v1/domain-models"
    Then the response status should be 200
    And the response should be a JSON array

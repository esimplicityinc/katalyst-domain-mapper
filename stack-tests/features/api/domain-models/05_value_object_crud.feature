@api @ddd-modeling @CAP-009 @US-028
Feature: Value Object CRUD API
  As a Platform Engineer (@UT-002)
  I want to register value objects with properties and validation rules
  So that I can document the building blocks of my domain model

  Background:
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      { "name": "BDD Value Object CRUD Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      { "slug": "identity", "title": "Identity", "responsibility": "User identity and access" }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

  @smoke
  Scenario: Register a value object with properties
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/value-objects" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "email-address",
        "title": "EmailAddress",
        "properties": [
          { "name": "value", "type": "string" }
        ]
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "voId"
    And the value at "title" should equal "EmailAddress"

  Scenario: Value objects appear in nested domain model retrieval
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/value-objects" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "money",
        "title": "Money",
        "properties": [
          { "name": "amount", "type": "number" },
          { "name": "currency", "type": "string" }
        ]
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/taxonomy/domain-models/{modelId}"
    Then the response status should be 200
    And I store the value at "valueObjects[0].title" as "voTitle"

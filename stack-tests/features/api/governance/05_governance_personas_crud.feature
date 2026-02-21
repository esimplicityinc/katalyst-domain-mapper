@api @gov-validation @ROAD-046 @CAP-025
Feature: Governance Personas CRUD API
  As a Domain Architect
  I want to manage persona definitions via API
  So that user archetypes and their capabilities are documented and queryable

  Background:
    # Ensure a governance snapshot exists so CRUD operations are available
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-05T10:00:00Z",
        "project": "katalyst-domain-mapper",
        "capabilities": {},
        "personas": {},
        "roadItems": {},
        "stats": {"capabilities": 0, "personas": 0, "userStories": 0, "roadItems": 0, "integrityStatus": "pass", "integrityErrors": 0}
      }
      """
    Then the response status should be 200

  @smoke @personas-list
  Scenario: List all personas returns an array
    When I GET "/api/v1/governance/personas"
    Then the response status should be 200
    And the response should be a JSON array

  @personas-crud
  Scenario: Create a new persona
    When I POST "/api/v1/governance/personas" with JSON body:
      """
      {
        "id": "PER-BDD-001",
        "name": "BDD Test Persona",
        "type": "human",
        "status": "draft",
        "archetype": "consumer",
        "description": "Created by BDD test",
        "goals": [],
        "painPoints": [],
        "behaviors": [],
        "typicalCapabilities": [],
        "technicalProfile": null,
        "relatedStories": [],
        "relatedPersonas": []
      }
      """
    Then the response status should be 201
    And the response should be a JSON object
    And the value at "id" should equal "PER-BDD-001"
    And the value at "name" should equal "BDD Test Persona"
    And the value at "type" should equal "human"
    Given I register cleanup DELETE "/api/v1/governance/personas/PER-BDD-001"

  @personas-crud
  Scenario: Update an existing persona
    When I POST "/api/v1/governance/personas" with JSON body:
      """
      {
        "id": "PER-BDD-002",
        "name": "Persona to Update",
        "type": "human",
        "status": "draft",
        "archetype": "consumer",
        "description": null,
        "goals": [],
        "painPoints": [],
        "behaviors": [],
        "typicalCapabilities": [],
        "technicalProfile": null,
        "relatedStories": [],
        "relatedPersonas": []
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "personaId"
    Given I register cleanup DELETE "/api/v1/governance/personas/{personaId}"

    When I PUT "/api/v1/governance/personas/{personaId}" with JSON body:
      """
      {
        "name": "Updated Persona Name",
        "status": "approved"
      }
      """
    Then the response status should be 200
    And the value at "name" should equal "Updated Persona Name"
    And the value at "status" should equal "approved"

  @personas-crud
  Scenario: Delete a persona
    When I POST "/api/v1/governance/personas" with JSON body:
      """
      {
        "id": "PER-BDD-003",
        "name": "Persona to Delete",
        "type": "human",
        "status": "draft",
        "archetype": "consumer",
        "description": null,
        "goals": [],
        "painPoints": [],
        "behaviors": [],
        "typicalCapabilities": [],
        "technicalProfile": null,
        "relatedStories": [],
        "relatedPersonas": []
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "personaToDeleteId"

    When I DELETE "/api/v1/governance/personas/{personaToDeleteId}"
    Then the response status should be 200
    And the value at "id" should equal "{personaToDeleteId}"

  @personas-get
  Scenario: Retrieve a persona by ID
    When I POST "/api/v1/governance/personas" with JSON body:
      """
      {
        "id": "PER-BDD-GET",
        "name": "Persona for GET test",
        "type": "system",
        "status": "draft",
        "archetype": "operator",
        "description": "A system persona",
        "goals": [],
        "painPoints": [],
        "behaviors": [],
        "typicalCapabilities": [],
        "technicalProfile": null,
        "relatedStories": [],
        "relatedPersonas": []
      }
      """
    Then the response status should be 201
    Given I register cleanup DELETE "/api/v1/governance/personas/PER-BDD-GET"

    When I GET "/api/v1/governance/personas/PER-BDD-GET"
    Then the response status should be 200
    And the value at "id" should equal "PER-BDD-GET"
    And the value at "name" should equal "Persona for GET test"

  @personas-get
  Scenario: Returns 404 for unknown persona ID
    When I GET "/api/v1/governance/personas/PER-NONEXISTENT"
    Then the response status should be 404

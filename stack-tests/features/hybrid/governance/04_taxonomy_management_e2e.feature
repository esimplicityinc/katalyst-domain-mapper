@hybrid @taxonomy-mgmt @ROAD-046 @CAP-025
Feature: Taxonomy & Persona Management UI E2E
  As a Platform Engineer
  I want to manage capabilities and personas through the UI
  So that the taxonomy stays current and personas are accurately documented

  Background:
    # Bypass the API key gate so the app loads without the welcome modal
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200
    # Ingest a governance snapshot so the governance endpoints are available
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-05T10:00:00Z",
        "project": "katalyst-domain-mapper",
        "capabilities": {
          "CAP-001": {"id": "CAP-001", "title": "FOE Report Generation", "status": "stable"}
        },
        "personas": {},
        "roadItems": {},
        "stats": {"capabilities": 1, "personas": 0, "userStories": 0, "roadItems": 0, "integrityStatus": "pass", "integrityErrors": 0}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/governance/{snapshotId}"

  # ── Capability Tree ───────────────────────────────────────────────────────

  @smoke @capability-tree
  Scenario: Capability tree page loads with heading
    Given I navigate to "/design/architecture/capabilities"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then the capability tree should be visible

  @capability-tree
  Scenario: Add Root button is present in the capability tree view
    Given I navigate to "/design/architecture/capabilities"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then the capability tree should be visible
    And the add root capability button should be visible

  # ── Persona List ─────────────────────────────────────────────────────────

  @smoke @persona-list
  Scenario: Personas page loads with Personas & Stories heading
    Given I navigate to "/design/personas/list"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then the persona list should be visible

  @persona-list
  Scenario: Creating a persona via API and navigating to list shows the persona
    # Create persona via API
    When I POST "/api/v1/governance/personas" with JSON body:
      """
      {
        "id": "PER-BDD-UI-001",
        "name": "BDD UI Test Persona",
        "type": "human",
        "status": "draft",
        "archetype": "consumer",
        "description": "Created for hybrid BDD test",
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
    Given I register cleanup DELETE "/api/v1/governance/personas/PER-BDD-UI-001"

    # Navigate to personas list and verify it appears
    Given I navigate to "/design/personas/list"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then the persona list should be visible
    And I should see persona "BDD UI Test Persona" in the list

  # ── User Story Board ─────────────────────────────────────────────────────

  @smoke @story-board
  Scenario: User story board page loads with add story button
    Given I navigate to "/design/personas/stories"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then the user story board should be visible
    And the user story board toolbar should be visible

  @story-board
  Scenario: User story board shows kanban columns when stories exist
    # Create a story via API so columns render
    When I POST "/api/v1/governance/user-stories" with JSON body:
      """
      {
        "id": "US-BDD-BOARD-001",
        "title": "BDD Board Test Story",
        "persona": "",
        "status": "draft",
        "capabilities": ["CAP-BDD"],
        "useCases": [],
        "acceptanceCriteria": [],
        "taxonomyNode": null
      }
      """
    Then the response status should be 201
    Given I register cleanup DELETE "/api/v1/governance/user-stories/US-BDD-BOARD-001"

    # Navigate and verify columns are rendered
    Given I navigate to "/design/personas/stories"
    Then I wait for the page to load
    Then I wait for 3 seconds
    Then the user story board should be visible
    And the user story board should show status columns

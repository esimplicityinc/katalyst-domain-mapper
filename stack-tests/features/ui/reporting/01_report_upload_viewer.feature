@hybrid @report-gen @ROAD-001 @CAP-001
Feature: FOE Report Upload & Viewer
  As an Engineering Team Lead
  I want to upload and view FOE scan reports in the web interface
  So that I can visualize engineering maturity across Understanding, Feedback, and Confidence

  @smoke
  Scenario: Load the report upload page
    Given I navigate to "/"
    Then I wait for the page to load
    Then I should see text "FOE"

  Scenario: Report viewer displays dimension information
    Given I navigate to "/"
    Then I wait for the page to load
    Then I should see text "Upload"

  @dashboard @ROAD-009 @CAP-002
  Scenario: Governance dashboard shows road item Kanban
    # Seed governance data via API
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-09T10:00:00Z",
        "project": "bdd-test-project",
        "capabilities": {
          "CAP-001": {"id": "CAP-001", "title": "Test Capability", "status": "stable"}
        },
        "personas": {
          "PER-001": {"id": "PER-001", "name": "Test Persona", "type": "human"}
        },
        "roadItems": {
          "ROAD-001": {"id": "ROAD-001", "title": "Implementing Item", "status": "implementing", "phase": 1, "priority": "high"},
          "ROAD-002": {"id": "ROAD-002", "title": "Proposed Item", "status": "proposed", "phase": 1, "priority": "medium"}
        },
        "stats": {
          "capabilities": 1,
          "personas": 1,
          "userStories": 2,
          "roadItems": 2,
          "integrityStatus": "pass",
          "integrityErrors": 0
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    And I register cleanup DELETE "/api/v1/governance/{snapshotId}"

    # Navigate to governance dashboard
    Given I navigate to "/governance"
    Then I wait for the page to load
    Then I should see text "Road Items"
    And I should see text "Implementing"
    And I should see text "Proposed"

  @context-map @ROAD-009 @CAP-002
  Scenario: DDD context map displays bounded contexts
    # Create domain model with bounded contexts via API
    Given I POST "/api/v1/domain-models" with JSON body:
      """
      {
        "name": "Context Map Viewer Test",
        "description": "Test domain for context map"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    And I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "test-context",
        "title": "Test Bounded Context",
        "responsibility": "Test responsibility",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200

    # Navigate to context map
    Given I navigate to "/mapper/contexts"
    Then I wait for the page to load
    Then I should see text "Test Bounded Context"

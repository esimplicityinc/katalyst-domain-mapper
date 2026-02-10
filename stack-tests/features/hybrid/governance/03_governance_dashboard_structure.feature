@hybrid @gov-dashboard @ROAD-009 @CAP-002
Feature: Governance Dashboard UI Structure & Interactivity
  As an Engineering Team Lead
  I want the Governance Dashboard to render consistent structural elements
  So that I can rely on the interface for monitoring governance health at a glance

  # These hybrid scenarios seed a representative governance snapshot via API,
  # then verify the dashboard's structural layout, sections, and interactive
  # affordances. They complement 02_governance_dashboard.feature which tests
  # specific data-dependent assertions (counts, names, status values).

  Background:
    # Clear API key gate
    When I DELETE "/api/v1/config/api-key"
    # Seed a representative governance snapshot with all artifact types
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-09T15:00:00Z",
        "project": "bdd-gov-structure",
        "capabilities": {
          "CAP-001": {"id": "CAP-001", "title": "FOE Report Generation", "status": "stable"},
          "CAP-002": {"id": "CAP-002", "title": "Governance Validation", "status": "planned"}
        },
        "personas": {
          "PER-001": {"id": "PER-001", "name": "Engineering Team Lead", "type": "human"},
          "PER-002": {"id": "PER-002", "name": "Platform Engineer", "type": "human"}
        },
        "roadItems": {
          "ROAD-001": {"id": "ROAD-001", "title": "Import Infrastructure", "status": "complete", "phase": 1, "priority": "high"},
          "ROAD-002": {"id": "ROAD-002", "title": "Governance Schemas", "status": "proposed", "phase": 1, "priority": "medium"},
          "ROAD-005": {"id": "ROAD-005", "title": "API Governance Domain", "status": "implementing", "phase": 3, "priority": "high"}
        },
        "byCapability": {
          "CAP-001": {"roads": ["ROAD-001"], "stories": ["US-001"]},
          "CAP-002": {"roads": ["ROAD-005"], "stories": ["US-002"]}
        },
        "stats": {
          "capabilities": 2,
          "personas": 2,
          "userStories": 5,
          "roadItems": 3,
          "integrityStatus": "pass",
          "integrityErrors": 0
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/governance/{snapshotId}"
    # Navigate to governance dashboard and bypass API key gate
    Given I navigate to "/governance"
    Then I wait for the page to load
    When I click the button "Skip for now"
    Then I wait for the page to load

  # -- Page Shell --------------------------------------------------------

  @smoke @dashboard
  Scenario: Dashboard page loads with header and subtitle
    Then I should see text "Governance Dashboard"
    And I should see text "Health, coverage & road item progress"

  # -- Health Summary Card -----------------------------------------------

  @dashboard
  Scenario: Health summary card structure is visible
    Then the element "[data-testid='health-summary-card']" should be visible
    And I should see text "Governance Health"

  @dashboard
  Scenario: Governance score circle is displayed within health summary
    Then the element "[data-testid='health-summary-card']" should be visible
    And the element "[data-testid='governance-score']" should be visible

  # -- Stats Grid --------------------------------------------------------

  @dashboard
  Scenario: Stats grid shows all artifact type labels
    Then I should see text "Road Items"
    And I should see text "Capabilities"
    And I should see text "Personas"
    And I should see text "User Stories"
    And I should see text "Integrity"

  @dashboard
  Scenario: Integrity percentage is displayed in stats grid
    Then the element "[data-testid='integrity-percentage']" should be visible

  # -- Kanban Board ------------------------------------------------------

  @kanban
  Scenario: Kanban board section is present with column headers
    Then the element "[data-testid='kanban-board']" should be visible
    And I should see text "Proposed"
    And I should see text "ADR Validated"
    And I should see text "BDD Pending"
    And I should see text "BDD Complete"
    And I should see text "Implementing"
    And I should see text "NFR Validating"
    And I should see text "Complete"

  # -- Integrity Report --------------------------------------------------

  @integrity
  Scenario: Integrity Report section structure is visible
    Then the element "[data-testid='integrity-report']" should be visible
    And I should see text "Integrity Report"
    And the element "[data-testid='integrity-status-badge']" should be visible

  # -- Coverage Sections -------------------------------------------------

  @coverage
  Scenario: Capability and Persona coverage sections are present
    Then the element "[data-testid='coverage-matrix']" should be visible
    And I should see text "Capability Coverage"
    And I should see text "Persona Coverage"

  # -- Interactive Affordances -------------------------------------------

  @dashboard
  Scenario: Refresh button is present and clickable
    When I click the button "Refresh"
    Then I wait for the page to load
    Then I should see text "Governance Dashboard"

  # -- Full Page Composition ---------------------------------------------

  @dashboard
  Scenario: Dashboard renders all major sections in a single page flow
    Then I should see text "Governance Dashboard"
    And the element "[data-testid='health-summary-card']" should be visible
    And the element "[data-testid='kanban-board']" should be visible
    And the element "[data-testid='coverage-matrix']" should be visible
    And the element "[data-testid='integrity-report']" should be visible

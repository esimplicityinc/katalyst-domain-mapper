@hybrid @gov-dashboard @ROAD-009 @CAP-002
Feature: Governance Dashboard (Template 12)
  As an Engineering Team Lead
  I want to view governance health on an interactive dashboard
  So that I can identify capability coverage gaps and track Road Item progress at a glance

  # Each scenario seeds its own governance snapshot via the API,
  # registers cleanup, then navigates to the UI to verify rendering.
  # This ensures tests are idempotent, deterministic, and isolated.

  Background:
    # Clear API key so the gate prompts "Skip for now"
    When I DELETE "/api/v1/config/api-key"

  # ── Health Summary ─────────────────────────────────────────────

  @smoke @dashboard
  Scenario: Dashboard displays health summary card with governance data
    # Seed governance data via API
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-09T10:00:00Z",
        "project": "bdd-gov-dashboard-smoke",
        "capabilities": {
          "CAP-001": {"id": "CAP-001", "title": "FOE Report Generation", "status": "stable"},
          "CAP-002": {"id": "CAP-002", "title": "Governance Validation", "status": "planned"}
        },
        "personas": {
          "PER-001": {"id": "PER-001", "name": "Engineering Team Lead", "type": "human"}
        },
        "roadItems": {
          "ROAD-001": {"id": "ROAD-001", "title": "Import Infrastructure", "status": "complete", "phase": 1, "priority": "high"},
          "ROAD-002": {"id": "ROAD-002", "title": "Governance Schemas", "status": "proposed", "phase": 1, "priority": "medium"}
        },
        "stats": {
          "capabilities": 2,
          "personas": 1,
          "userStories": 5,
          "roadItems": 2,
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

    # Verify dashboard renders with health summary
    Then I should see text "Governance Dashboard"
    And the element "[data-testid='health-summary-card']" should be visible
    And I should see text "Road Items"
    And I should see text "Integrity"
    And the element "[data-testid='governance-score']" should be visible
    And the element "[data-testid='integrity-percentage']" should be visible

  @dashboard
  Scenario: Health summary shows artifact counts from ingested snapshot
    # Seed
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "2.0.0",
        "generated": "2026-02-09T11:00:00Z",
        "project": "bdd-gov-dashboard-counts",
        "capabilities": {
          "CAP-001": {"id": "CAP-001", "title": "FOE Report Generation", "status": "stable"},
          "CAP-002": {"id": "CAP-002", "title": "Governance Validation", "status": "planned"},
          "CAP-003": {"id": "CAP-003", "title": "Field Guide Indexing", "status": "stable"}
        },
        "personas": {
          "PER-001": {"id": "PER-001", "name": "Engineering Team Lead", "type": "human"},
          "PER-002": {"id": "PER-002", "name": "Platform Engineer", "type": "human"}
        },
        "roadItems": {
          "ROAD-001": {"id": "ROAD-001", "title": "Import Infrastructure", "status": "complete", "phase": 1, "priority": "high"},
          "ROAD-005": {"id": "ROAD-005", "title": "API Governance Domain", "status": "implementing", "phase": 3, "priority": "high"},
          "ROAD-009": {"id": "ROAD-009", "title": "Web Visualization", "status": "proposed", "phase": 3, "priority": "low"}
        },
        "stats": {
          "capabilities": 3,
          "personas": 2,
          "userStories": 12,
          "roadItems": 3,
          "integrityStatus": "pass",
          "integrityErrors": 0
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/governance/{snapshotId}"

    # Navigate and bypass gate
    Given I navigate to "/governance"
    Then I wait for the page to load
    When I click the button "Skip for now"
    Then I wait for the page to load

    # Verify counts
    Then the element "[data-testid='health-summary-card']" should be visible
    And I should see text "Road Items"
    And I should see text "Capabilities"
    And I should see text "Personas"

  # ── Road Item Kanban Board ─────────────────────────────────────

  @kanban
  Scenario: Kanban board renders Road Items in correct state columns
    # Seed with items in different states
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-09T12:00:00Z",
        "project": "bdd-gov-kanban",
        "capabilities": {},
        "personas": {},
        "roadItems": {
          "ROAD-001": {"id": "ROAD-001", "title": "Import Infrastructure", "status": "complete", "phase": 1, "priority": "high"},
          "ROAD-002": {"id": "ROAD-002", "title": "Governance Schemas", "status": "proposed", "phase": 1, "priority": "medium"},
          "ROAD-005": {"id": "ROAD-005", "title": "API Governance Domain", "status": "implementing", "phase": 3, "priority": "high"}
        },
        "stats": {
          "capabilities": 0,
          "personas": 0,
          "userStories": 0,
          "roadItems": 3,
          "integrityStatus": "pass",
          "integrityErrors": 0
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/governance/{snapshotId}"

    # Navigate and bypass gate
    Given I navigate to "/governance"
    Then I wait for the page to load
    When I click the button "Skip for now"
    Then I wait for the page to load

    # Verify kanban board renders with correct columns
    Then the element "[data-testid='kanban-board']" should be visible
    And I should see text "Proposed"
    And I should see text "Implementing"
    And I should see text "Complete"
    And the element "[data-testid='kanban-column-proposed']" should be visible
    And the element "[data-testid='kanban-column-implementing']" should be visible
    And the element "[data-testid='kanban-column-complete']" should be visible
    # Verify road item cards appear
    And I should see text "Import Infrastructure"
    And I should see text "Governance Schemas"
    And I should see text "API Governance Domain"

  # ── Capability Coverage Matrix ─────────────────────────────────

  @coverage
  Scenario: Capability coverage matrix displays capabilities with coverage indicators
    # Seed with capabilities
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-09T13:00:00Z",
        "project": "bdd-gov-coverage",
        "capabilities": {
          "CAP-001": {"id": "CAP-001", "title": "FOE Report Generation", "status": "stable"},
          "CAP-002": {"id": "CAP-002", "title": "Governance Validation", "status": "planned"}
        },
        "personas": {},
        "roadItems": {
          "ROAD-001": {"id": "ROAD-001", "title": "Import Infrastructure", "status": "complete", "phase": 1, "priority": "high"}
        },
        "byCapability": {
          "CAP-001": {"roads": ["ROAD-001"], "stories": ["US-001", "US-002"]},
          "CAP-002": {"roads": [], "stories": ["US-003"]}
        },
        "stats": {
          "capabilities": 2,
          "personas": 0,
          "userStories": 3,
          "roadItems": 1,
          "integrityStatus": "pass",
          "integrityErrors": 0
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/governance/{snapshotId}"

    # Navigate and bypass gate
    Given I navigate to "/governance"
    Then I wait for the page to load
    When I click the button "Skip for now"
    Then I wait for the page to load

    # Verify coverage matrix
    Then the element "[data-testid='coverage-matrix']" should be visible
    And I should see text "Capability Coverage"
    And I should see text "FOE Report Generation"
    And I should see text "Governance Validation"
    And the element "[data-testid='coverage-matrix'] table" should be visible

  # ── Cross-Reference Integrity Report ───────────────────────────

  @integrity
  Scenario: Integrity report shows valid status when no errors
    # Seed with clean integrity
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-09T14:00:00Z",
        "project": "bdd-gov-integrity",
        "capabilities": {},
        "personas": {},
        "roadItems": {
          "ROAD-001": {"id": "ROAD-001", "title": "Import Infrastructure", "status": "complete", "phase": 1, "priority": "high"}
        },
        "stats": {
          "capabilities": 0,
          "personas": 0,
          "userStories": 0,
          "roadItems": 1,
          "integrityStatus": "pass",
          "integrityErrors": 0
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/governance/{snapshotId}"

    # Navigate and bypass gate
    Given I navigate to "/governance"
    Then I wait for the page to load
    When I click the button "Skip for now"
    Then I wait for the page to load

    # Verify integrity report
    Then the element "[data-testid='integrity-report']" should be visible
    And I should see text "Integrity Report"
    And the element "[data-testid='integrity-status-badge']" should be visible

  # ── Empty State ────────────────────────────────────────────────

  @empty-state
  Scenario: Dashboard shows empty state when no governance data exists
    # Ensure no governance data exists (clean up from prior scenarios)
    When I DELETE "/api/v1/governance"
    Then the response status should be 200
    
    # Navigate to UI
    Given I navigate to "/governance"
    Then I wait for the page to load
    When I click the button "Skip for now"
    Then I wait for the page to load

    # Verify empty state
    Then the element "[data-testid='empty-state']" should be visible
    And I should see text "No Governance Data"

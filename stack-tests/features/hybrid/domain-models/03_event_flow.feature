@hybrid @ddd-modeling @ROAD-018 @CAP-010
Feature: Domain Event Flow Visualization
  As an Engineering Team Lead
  I want to view domain events as a flow timeline
  So that I can understand how events propagate across bounded contexts

  # These hybrid scenarios verify the event flow timeline component renders
  # correctly by seeding a model via API and then checking the UI.
  # The Background creates a model with two bounded contexts and two domain
  # events, then each scenario navigates to the Events tab.

  Background:
    # Set a dummy API key so the Welcome gate is bypassed on every page load
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

    # Create our test domain model
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Event Flow E2E", "description": "Model for event flow testing" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    # Create bounded contexts (2 contexts for cross-context events)
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "scanning",
        "title": "Scanning Context",
        "responsibility": "Repository scanning orchestration",
        "teamOwnership": "Platform Team",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "scanContextId"

    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "reporting",
        "title": "Reporting Context",
        "responsibility": "Report generation and visualization",
        "subdomainType": "supporting"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportContextId"

    # Create domain events
    When I POST "/api/v1/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{scanContextId}",
        "slug": "scan-started",
        "title": "ScanStarted",
        "description": "Emitted when a new scan begins",
        "payload": [
          { "field": "scanId", "type": "string" },
          { "field": "repositoryUrl", "type": "string" }
        ],
        "triggers": ["User initiates scan"],
        "sideEffects": ["Lock repository for scanning"]
      }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{scanContextId}",
        "slug": "scan-completed",
        "title": "ScanCompleted",
        "description": "Emitted when scan finishes successfully",
        "payload": [
          { "field": "scanId", "type": "string" },
          { "field": "overallScore", "type": "number" }
        ],
        "consumedBy": ["reporting"],
        "triggers": ["All dimension agents complete"],
        "sideEffects": ["Generate FOE report", "Notify stakeholders"]
      }
      """
    Then the response status should be 200

  # -- Structural Tests (verify event flow component renders) ------------------

  @smoke @events
  Scenario: Events tab is available in navigation
    # Navigate to mapper — gate bypassed (API key set), auto-selects first model
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    # Switch to our test model
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Event Flow E2E')"
    Then I wait for 2 seconds
    # Navigate to the Events tab
    When I click the link "Events"
    Then I wait for 2 seconds
    Then I should see text "Events"

  @events
  Scenario: Event flow shows domain events from active model
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Event Flow E2E')"
    Then I wait for 2 seconds
    When I click the link "Events"
    Then I wait for 2 seconds
    Then I should see text "ScanStarted"
    And I should see text "ScanCompleted"

  @events @detail
  Scenario: Click event card opens detail panel
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Event Flow E2E')"
    Then I wait for 2 seconds
    When I click the link "Events"
    Then I wait for 2 seconds
    # Click the ScanCompleted event card to expand details
    When I click the element "[data-testid='event-card-scan-completed']"
    Then I wait for 1 seconds
    # Assert payload fields are visible
    Then I should see text "scanId"
    And I should see text "overallScore"
    # Assert triggers and side effects
    And I should see text "All dimension agents complete"
    And I should see text "Generate FOE report"

  @events @filters
  Scenario: Filter controls are displayed
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Event Flow E2E')"
    Then I wait for 2 seconds
    When I click the link "Events"
    Then I wait for 2 seconds
    Then I should see text "All"
    And I should see text "Synchronous"
    And I should see text "Asynchronous"

  @events @summary
  Scenario: Event summary grid shows all events as chips
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Event Flow E2E')"
    Then I wait for 2 seconds
    When I click the link "Events"
    Then I wait for 2 seconds
    # Verify summary grid section exists with event chips
    Then the element "[data-testid='event-summary-grid']" should be visible
    And I should see text "ScanStarted"
    And I should see text "ScanCompleted"

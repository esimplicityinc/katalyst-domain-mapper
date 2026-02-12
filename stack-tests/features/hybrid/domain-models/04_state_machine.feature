@hybrid @ddd-modeling @ROAD-019 @CAP-010
Feature: Application Lifecycle State Machine View
  As an Engineering Team Lead
  I want to view domain workflows as interactive state machine diagrams
  So that I can understand lifecycle progressions in my domain

  # These hybrid scenarios verify the state machine visualization component
  # renders correctly by seeding a workflow via API and then checking the UI.
  # The Background creates a domain model with a workflow containing states
  # and transitions, then each scenario navigates to the Workflows tab.

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
      { "name": "State Machine E2E", "description": "Model for workflow testing" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    # Create a workflow with states and transitions
    When I POST "/api/v1/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "governance-lifecycle",
        "title": "Governance Lifecycle",
        "description": "State progression for road items",
        "states": [
          { "id": "proposed", "name": "Proposed", "description": "Awaiting approval", "x": 50, "y": 200, "isTerminal": false, "isError": false },
          { "id": "implementing", "name": "Implementing", "description": "Work in progress", "x": 250, "y": 200, "isTerminal": false, "isError": false },
          { "id": "complete", "name": "Complete", "description": "All gates passed", "x": 450, "y": 200, "isTerminal": true, "isError": false },
          { "id": "blocked", "name": "Blocked", "description": "Issue preventing progress", "x": 250, "y": 350, "isTerminal": false, "isError": true }
        ],
        "transitions": [
          { "from": "proposed", "to": "implementing", "label": "Start Work", "isAsync": false },
          { "from": "implementing", "to": "complete", "label": "Pass Gates", "isAsync": false },
          { "from": "implementing", "to": "blocked", "label": "Issue Found", "isAsync": false },
          { "from": "blocked", "to": "implementing", "label": "Issue Resolved", "isAsync": true }
        ]
      }
      """
    Then the response status should be 200

  # -- Structural Tests (verify state machine component renders) ----------------

  @smoke @workflows
  Scenario: Workflows tab is available in navigation
    # Navigate to mapper — gate bypassed (API key set), auto-selects first model
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    # Switch to our test model
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('State Machine E2E')"
    Then I wait for 2 seconds
    # Navigate to the Workflows tab
    When I click the link "Workflows"
    Then I wait for 2 seconds
    Then I should see text "Workflows"

  @workflows
  Scenario: State machine shows states from active workflow
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('State Machine E2E')"
    Then I wait for 2 seconds
    When I click the link "Workflows"
    Then I wait for 2 seconds
    Then I should see text "Proposed"
    And I should see text "Implementing"
    And I should see text "Complete"
    And I should see text "Blocked"

  @workflows @detail
  Scenario: Click a state node opens detail panel
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('State Machine E2E')"
    Then I wait for 2 seconds
    When I click the link "Workflows"
    Then I wait for 2 seconds
    # Click the Implementing state node to expand details
    When I click the element "[data-testid='state-node-implementing']"
    Then I wait for 1 seconds
    # Assert state description is visible
    Then I should see text "Work in progress"
    # Assert connected transition labels are visible
    And I should see text "Start Work"
    And I should see text "Pass Gates"
    And I should see text "Issue Found"

  @workflows @badges
  Scenario: Terminal and error states show visual badges
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('State Machine E2E')"
    Then I wait for 2 seconds
    When I click the link "Workflows"
    Then I wait for 2 seconds
    # Assert terminal badge is visible near the Complete state
    Then I should see text "Terminal"
    # Assert error badge is visible near the Blocked state
    And I should see text "Error"

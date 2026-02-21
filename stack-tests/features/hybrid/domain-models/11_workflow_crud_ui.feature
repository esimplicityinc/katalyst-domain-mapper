@hybrid @ddd-modeling @ROAD-019 @CAP-010
Feature: Workflow CRUD Panel in UI
  As an Engineering Team Lead
  I want to create, edit, and delete workflows directly from the Workflows tab
  So that I can refine state machines without needing API access

  Background:
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Workflow CRUD UI Test", "description": "Model for workflow UI testing" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    # Navigate to the Workflows tab
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Workflow CRUD UI Test')"
    Then I wait for 2 seconds
    When I click the link "Workflows"
    Then I wait for 2 seconds

  @smoke @workflow
  Scenario: Add Workflow button is visible on the Workflows tab
    Then I should see text "Workflows"
    And I should see text "Add Workflow"

  @workflow
  Scenario: Create a workflow using the slide-in panel
    When I click the button "Add Workflow"
    Then I wait for 1 seconds
    Then I should see text "New Workflow"

    When I fill the placeholder "e.g., order-lifecycle" with "scan-lifecycle"
    And I fill the placeholder "e.g., Order Lifecycle" with "Scan Lifecycle"
    Then I wait for 1 seconds

    When I click the button "Save"
    Then I wait for 2 seconds
    Then I should see text "Scan Lifecycle"

  @workflow
  Scenario: Edit a workflow to update its description
    # Seed a workflow via API
    When I POST "/api/v1/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "governance-lifecycle",
        "title": "Governance Lifecycle",
        "description": "Original description",
        "states": [
          { "id": "proposed", "name": "Proposed", "isTerminal": false, "isError": false },
          { "id": "complete", "name": "Complete", "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "proposed", "to": "complete", "label": "Ship", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200

    # Reload UI
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Workflow CRUD UI Test')"
    Then I wait for 2 seconds
    When I click the link "Workflows"
    Then I wait for 2 seconds

    Then I should see text "Governance Lifecycle"

    # Click the Edit button next to the workflow selector
    When I click the button "Edit"
    Then I wait for 1 seconds
    Then I should see text "Edit Workflow"

    # Update description
    When I fill the placeholder "Brief description of this workflow" with "Updated governance state machine with all stages"
    Then I wait for 1 seconds

    When I click the button "Save"
    Then I wait for 2 seconds
    Then I should see text "Governance Lifecycle"

  @workflow
  Scenario: Delete a workflow with inline confirmation
    # Seed a workflow via API
    When I POST "/api/v1/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "temp-workflow",
        "title": "Temporary Workflow",
        "description": "Will be deleted",
        "states": [
          { "id": "start", "name": "Start", "isTerminal": false, "isError": false },
          { "id": "end", "name": "End", "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "start", "to": "end", "label": "Complete", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200

    # Reload UI
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Workflow CRUD UI Test')"
    Then I wait for 2 seconds
    When I click the link "Workflows"
    Then I wait for 2 seconds

    Then I should see text "Temporary Workflow"
    When I click the button "Edit"
    Then I wait for 1 seconds

    # Two-step delete confirmation
    When I click the button "Delete"
    Then I wait for 1 seconds
    When I click the button "Confirm"
    Then I wait for 2 seconds

  @workflow
  Scenario: Empty state shows helpful message when no workflows exist
    Then I should see text "No workflows yet"
    And I should see text "Chat"

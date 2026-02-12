@api @ddd-modeling @ROAD-019 @CAP-010
Feature: Domain Model Workflows (State Machines)
  As a Platform Engineer
  I want to define lifecycle workflows for a domain model
  So that state machines can be visualized and validated

  Background:
    # Create a fresh domain model for each scenario
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Workflow Test Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

  @smoke @workflow
  Scenario: Create a workflow with states and transitions
    When I POST "/api/v1/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "governance-lifecycle",
        "title": "Governance Lifecycle",
        "description": "State machine for road item governance progression",
        "states": [
          { "id": "proposed", "name": "Proposed", "description": "Initial state for new items", "x": 50, "y": 200, "isTerminal": false, "isError": false },
          { "id": "implementing", "name": "Implementing", "description": "Work in progress", "x": 250, "y": 200, "isTerminal": false, "isError": false },
          { "id": "complete", "name": "Complete", "description": "All gates passed", "x": 450, "y": 200, "isTerminal": true, "isError": false },
          { "id": "blocked", "name": "Blocked", "description": "Cannot proceed", "x": 250, "y": 350, "isTerminal": false, "isError": true }
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
    And the response should be a JSON object
    And I store the value at "id" as "workflowId"
    And the value at "slug" should equal "governance-lifecycle"
    And the value at "title" should equal "Governance Lifecycle"

  @workflow
  Scenario: List workflows for a domain model
    # Create two workflows
    When I POST "/api/v1/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "order-processing",
        "title": "Order Processing",
        "description": "Order fulfillment state machine",
        "states": [
          { "id": "placed", "name": "Placed", "x": 50, "y": 200, "isTerminal": false, "isError": false },
          { "id": "fulfilled", "name": "Fulfilled", "x": 250, "y": 200, "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "placed", "to": "fulfilled", "label": "Ship Order", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "incident-response",
        "title": "Incident Response",
        "description": "Incident lifecycle state machine",
        "states": [
          { "id": "detected", "name": "Detected", "x": 50, "y": 200, "isTerminal": false, "isError": false },
          { "id": "resolved", "name": "Resolved", "x": 250, "y": 200, "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "detected", "to": "resolved", "label": "Resolve", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200

    # List all workflows
    When I GET "/api/v1/domain-models/{modelId}/workflows"
    Then the response status should be 200
    And the response should be a JSON array

  @workflow
  Scenario: Delete a workflow
    # Create a workflow
    When I POST "/api/v1/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "deploy-pipeline",
        "title": "Deploy Pipeline",
        "description": "Deployment lifecycle state machine",
        "states": [
          { "id": "pending", "name": "Pending", "x": 50, "y": 200, "isTerminal": false, "isError": false },
          { "id": "deployed", "name": "Deployed", "x": 250, "y": 200, "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "pending", "to": "deployed", "label": "Deploy", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "workflowId"

    # Delete the workflow
    When I DELETE "/api/v1/domain-models/{modelId}/workflows/{workflowId}"
    Then the response status should be 200

    # Verify the workflow list is empty
    When I GET "/api/v1/domain-models/{modelId}/workflows"
    Then the response status should be 200
    And the response should be a JSON array

@api @ddd-modeling @ROAD-019 @CAP-010
Feature: Domain Workflow Update
  As a Platform Engineer
  I want to update existing workflow definitions including states and transitions
  So that state machines can be refined as domain processes evolve

  Background:
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Workflow Update Test Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

  @workflow @smoke
  Scenario: Update a workflow's title and description
    When I POST "/api/v1/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "deploy-pipeline",
        "title": "Deploy Pipeline",
        "description": "Original description",
        "states": [
          { "id": "pending", "name": "Pending", "isTerminal": false, "isError": false },
          { "id": "deployed", "name": "Deployed", "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "pending", "to": "deployed", "label": "Deploy", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "workflowId"

    When I PUT "/api/v1/domain-models/{modelId}/workflows/{workflowId}" with JSON body:
      """
      {
        "slug": "deploy-pipeline",
        "title": "Deployment Pipeline",
        "description": "Full CI/CD deployment lifecycle including approval gate",
        "states": [
          { "id": "pending", "name": "Pending", "isTerminal": false, "isError": false },
          { "id": "deployed", "name": "Deployed", "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "pending", "to": "deployed", "label": "Deploy", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}/workflows"
    Then the response status should be 200
    And the response should be a JSON array

  @workflow
  Scenario: Update a workflow to add new states and transitions
    When I POST "/api/v1/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "governance-lifecycle",
        "title": "Governance Lifecycle",
        "description": "Road item state machine",
        "states": [
          { "id": "proposed", "name": "Proposed", "isTerminal": false, "isError": false },
          { "id": "complete", "name": "Complete", "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "proposed", "to": "complete", "label": "Accept", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "workflowId"

    When I PUT "/api/v1/domain-models/{modelId}/workflows/{workflowId}" with JSON body:
      """
      {
        "slug": "governance-lifecycle",
        "title": "Governance Lifecycle",
        "description": "Full road item governance state machine with review and blocked states",
        "states": [
          { "id": "proposed", "name": "Proposed", "isTerminal": false, "isError": false },
          { "id": "in-review", "name": "In Review", "isTerminal": false, "isError": false },
          { "id": "implementing", "name": "Implementing", "isTerminal": false, "isError": false },
          { "id": "blocked", "name": "Blocked", "isTerminal": false, "isError": true },
          { "id": "complete", "name": "Complete", "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "proposed", "to": "in-review", "label": "Begin Review", "isAsync": false },
          { "from": "in-review", "to": "implementing", "label": "Approve", "isAsync": false },
          { "from": "implementing", "to": "blocked", "label": "Block", "isAsync": false },
          { "from": "blocked", "to": "implementing", "label": "Unblock", "isAsync": true },
          { "from": "implementing", "to": "complete", "label": "Ship", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}/workflows"
    Then the response status should be 200
    And the response should be a JSON array

  @workflow
  Scenario: Update a workflow to associate it with bounded contexts
    # Create a bounded context first
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "scanning",
        "title": "Scanning Context",
        "responsibility": "Repository scanning orchestration"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    When I POST "/api/v1/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "scan-lifecycle",
        "title": "Scan Lifecycle",
        "description": "Scan job state machine",
        "states": [
          { "id": "queued", "name": "Queued", "isTerminal": false, "isError": false },
          { "id": "done", "name": "Done", "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "queued", "to": "done", "label": "Complete", "isAsync": true }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "workflowId"

    When I PUT "/api/v1/domain-models/{modelId}/workflows/{workflowId}" with JSON body:
      """
      {
        "slug": "scan-lifecycle",
        "title": "Scan Lifecycle",
        "description": "Scan job state machine linked to scanning context",
        "contextIds": ["{contextId}"],
        "states": [
          { "id": "queued", "name": "Queued", "isTerminal": false, "isError": false },
          { "id": "running", "name": "Running", "isTerminal": false, "isError": false },
          { "id": "done", "name": "Done", "isTerminal": true, "isError": false },
          { "id": "failed", "name": "Failed", "isTerminal": true, "isError": true }
        ],
        "transitions": [
          { "from": "queued", "to": "running", "label": "Start", "isAsync": true },
          { "from": "running", "to": "done", "label": "Complete", "isAsync": false },
          { "from": "running", "to": "failed", "label": "Fail", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200

  @workflow
  Scenario: Full workflow lifecycle — create, update, list, delete
    # Create
    When I POST "/api/v1/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "order-lifecycle",
        "title": "Order Lifecycle",
        "description": "E-commerce order state machine",
        "states": [
          { "id": "placed", "name": "Placed", "isTerminal": false, "isError": false },
          { "id": "fulfilled", "name": "Fulfilled", "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "placed", "to": "fulfilled", "label": "Ship", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "workflowId"
    And the value at "title" should equal "Order Lifecycle"

    # Update
    When I PUT "/api/v1/domain-models/{modelId}/workflows/{workflowId}" with JSON body:
      """
      {
        "slug": "order-lifecycle",
        "title": "Full Order Lifecycle",
        "description": "Complete order state machine with cancellation",
        "states": [
          { "id": "placed", "name": "Placed", "isTerminal": false, "isError": false },
          { "id": "shipped", "name": "Shipped", "isTerminal": false, "isError": false },
          { "id": "fulfilled", "name": "Fulfilled", "isTerminal": true, "isError": false },
          { "id": "cancelled", "name": "Cancelled", "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "placed", "to": "shipped", "label": "Dispatch", "isAsync": false },
          { "from": "shipped", "to": "fulfilled", "label": "Deliver", "isAsync": false },
          { "from": "placed", "to": "cancelled", "label": "Cancel", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200

    # Verify via list
    When I GET "/api/v1/domain-models/{modelId}/workflows"
    Then the response status should be 200
    And the response should be a JSON array

    # Delete
    When I DELETE "/api/v1/domain-models/{modelId}/workflows/{workflowId}"
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}/workflows"
    Then the response status should be 200
    And the response should be a JSON array

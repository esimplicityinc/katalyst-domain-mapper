@hybrid @ddd-modeling @CAP-010 @CAP-009 @US-035
Feature: Workflow State Machine View
  As a Domain Architect (@UT-007)
  I want to view application lifecycle state machines as interactive diagrams
  So that I can understand state transitions and identify synchronous vs asynchronous flows

  Background:
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "Workflow View Test Domain",
        "description": "Domain model for workflow state machine BDD tests"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    And I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/workflows" with JSON body:
      """
      {
        "slug": "order-lifecycle",
        "title": "Order Lifecycle",
        "description": "Order state machine from creation to completion",
        "states": [
          { "id": "created", "name": "Created", "isTerminal": false, "isError": false },
          { "id": "paid", "name": "Paid", "isTerminal": false, "isError": false },
          { "id": "shipped", "name": "Shipped", "isTerminal": false, "isError": false },
          { "id": "delivered", "name": "Delivered", "isTerminal": true, "isError": false },
          { "id": "cancelled", "name": "Cancelled", "isTerminal": true, "isError": true }
        ],
        "transitions": [
          { "from": "created", "to": "paid", "label": "Payment Received", "isAsync": false },
          { "from": "paid", "to": "shipped", "label": "Dispatch", "isAsync": false },
          { "from": "shipped", "to": "delivered", "label": "Delivery Confirmed", "isAsync": true },
          { "from": "created", "to": "cancelled", "label": "Cancel", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "workflowId"

    When I navigate to "/design/business-domain/workflows"
    Then I wait for the page to load

  @smoke
  Scenario: Workflow page renders with state machine
    Then I should see text "Order Lifecycle"
    And I should see text "Created"
    And I should see text "Delivered"

  Scenario: Terminal states are visually identified
    Then I should see text "Delivered"
    And I should see text "Cancelled"

  Scenario: Transitions are displayed with labels
    Then I should see text "Payment Received"
    And I should see text "Dispatch"

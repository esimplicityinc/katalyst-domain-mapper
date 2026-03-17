@hybrid @ddd-modeling @CAP-010 @CAP-009 @US-034
Feature: Aggregate Tree View
  As a Domain Architect (@UT-007)
  I want to explore aggregates as a collapsible tree with type-coded badges
  So that I can understand aggregate structure, entities, and value objects at a glance

  Background:
    # Create domain model with bounded context and aggregate via API
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "Aggregate Tree Test Domain",
        "description": "Domain model for aggregate tree view BDD tests"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    And I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "ordering",
        "title": "Ordering",
        "responsibility": "Manages customer orders",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "order",
        "title": "Order",
        "rootEntity": "Order",
        "invariants": ["Total must be positive", "Cannot modify shipped orders"],
        "commands": ["PlaceOrder", "CancelOrder"],
        "events": ["OrderPlaced", "OrderCancelled"]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "aggregateId"

    # Navigate to the aggregates page
    When I navigate to "/design/business-domain/aggregates"
    Then I wait for the page to load

  @smoke
  Scenario: Aggregate tree view renders with aggregate root
    Then I should see text "Order"
    And I should see text "Aggregates"

  Scenario: Aggregate tree shows commands and events
    Then I should see text "PlaceOrder"
    And I should see text "OrderPlaced"

  Scenario: Aggregate tree shows invariants
    Then I should see text "Total must be positive"

  Scenario: Expand All and Collapse All controls are available
    Then I should see text "Expand All"
    And I should see text "Collapse All"

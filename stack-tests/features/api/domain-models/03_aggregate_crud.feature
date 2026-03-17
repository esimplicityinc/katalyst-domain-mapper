@api @ddd-modeling @CAP-009 @US-028
Feature: Aggregate CRUD API
  As a Platform Engineer (@UT-002)
  I want to register and manage aggregates within a domain model
  So that I can document aggregate roots, invariants, commands, and published events

  Background:
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      { "name": "BDD Aggregate CRUD Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      { "slug": "orders", "title": "Order Management", "responsibility": "Order processing" }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

  # ── Create ─────────────────────────────────────────────────────────────────

  @smoke
  Scenario: Register an aggregate with full metadata
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "order",
        "title": "Order",
        "rootEntity": "Order",
        "invariants": ["Order total must be positive", "Cannot modify shipped orders"],
        "commands": ["PlaceOrder", "CancelOrder", "ShipOrder"],
        "events": ["OrderPlaced", "OrderCancelled", "OrderShipped"]
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "aggregateId"
    And the value at "title" should equal "Order"

  Scenario: Register a minimal aggregate
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "customer",
        "title": "Customer",
        "rootEntity": "Customer"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "aggregateId"
    And the value at "title" should equal "Customer"

  Scenario: Aggregates appear in nested domain model retrieval
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "product",
        "title": "Product Catalog",
        "rootEntity": "Product"
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/taxonomy/domain-models/{modelId}"
    Then the response status should be 200
    And I store the value at "aggregates[0].title" as "aggTitle"

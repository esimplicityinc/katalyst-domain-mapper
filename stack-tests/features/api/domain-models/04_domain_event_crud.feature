@api @ddd-modeling @CAP-009 @US-028
Feature: Domain Event CRUD API
  As a Platform Engineer (@UT-002)
  I want to register domain events with payload schemas and consumer contexts
  So that I can document event-driven communication between bounded contexts

  Background:
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      { "name": "BDD Event CRUD Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      { "slug": "shipping", "title": "Shipping", "responsibility": "Fulfillment and delivery" }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

  # ── Create ─────────────────────────────────────────────────────────────────

  @smoke
  Scenario: Register a domain event with full metadata
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "order-shipped",
        "title": "OrderShipped",
        "description": "Emitted when an order is dispatched to carrier"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "eventId"
    And the value at "title" should equal "OrderShipped"

  Scenario: Register multiple domain events in one context
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "shipment-created",
        "title": "ShipmentCreated",
        "description": "A shipment record was created"
      }
      """
    Then the response status should be 200

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "shipment-delivered",
        "title": "ShipmentDelivered",
        "description": "Carrier confirmed delivery"
      }
      """
    Then the response status should be 200

    # Verify events appear in nested retrieval
    When I GET "/api/v1/taxonomy/domain-models/{modelId}"
    Then the response status should be 200
    And I store the value at "domainEvents[0].title" as "firstEvent"

  Scenario: Domain events appear in nested domain model retrieval
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "package-returned",
        "title": "PackageReturned",
        "description": "Package was returned to sender"
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/taxonomy/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

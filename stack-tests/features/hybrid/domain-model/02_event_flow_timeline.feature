@hybrid @ddd-modeling @CAP-010 @CAP-009 @US-036 @US-067
Feature: Event Flow Timeline
  As a Domain Architect (@UT-007)
  I want to browse domain events as a flow timeline with step groups
  So that I can understand event-driven communication between bounded contexts

  Background:
    # Create domain model with context and domain events
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "Event Flow Test Domain",
        "description": "Domain model for event flow timeline BDD tests"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    And I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "order-processing",
        "title": "Order Processing",
        "responsibility": "Handles order lifecycle",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "order-placed",
        "title": "OrderPlaced",
        "description": "Customer submitted a new order"
      }
      """
    Then the response status should be 200

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "payment-received",
        "title": "PaymentReceived",
        "description": "Payment was confirmed by the gateway"
      }
      """
    Then the response status should be 200

    # Navigate to the events page
    When I navigate to "/design/business-domain/events"
    Then I wait for the page to load

  @smoke
  Scenario: Event flow page renders with domain events
    Then I should see text "OrderPlaced"
    And I should see text "PaymentReceived"

  Scenario: Events page shows context grouping
    Then I should see text "Order Processing"

  Scenario: Event detail is accessible by clicking an event
    When I click the element "[data-testid='event-card-order-placed']"
    Then I should see text "Customer submitted a new order"

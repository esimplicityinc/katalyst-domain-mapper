@hybrid @ddd-modeling @ROAD-016
Feature: Interactive Context Map Diagram
  As a Domain Architect (@PER-007)
  I want to see bounded contexts as an interactive SVG diagram
  So that I can visualize system topology and relationships at a glance

  Background:
    # Create test domain model via API
    Given I POST "/api/v1/domain-models" with JSON body:
      """
      {
        "name": "Context Map Test Domain",
        "description": "Test domain for context map diagram"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    And I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    # Create bounded contexts with different subdomain types
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "order-management",
        "title": "Order Management",
        "responsibility": "Manages customer orders and fulfillment",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "inventory",
        "title": "Inventory",
        "responsibility": "Tracks product inventory levels",
        "subdomainType": "supporting"
      }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "notifications",
        "title": "Notifications",
        "responsibility": "Sends email and SMS notifications",
        "subdomainType": "generic"
      }
      """
    Then the response status should be 200

    # Navigate to the context map page
    When I navigate to "/mapper/contexts"
    Then I wait for the page to load

  @smoke
  Scenario: SVG context map diagram renders on the page
    Then I should see text "Context Map"
    And I should see text "Order Management"
    And I should see text "Inventory"
    And I should see text "Notifications"

  Scenario: Context map has view toggle between list and diagram
    Then I should see text "Diagram"
    And I should see text "List"

  Scenario: Bounded contexts are color-coded by subdomain type
    Then I should see text "Core"
    And I should see text "Supporting"
    And I should see text "Generic"

  Scenario: Legend shows subdomain type colors
    Then I should see text "Legend"
    And the element "[data-testid='context-map-legend']" should be visible

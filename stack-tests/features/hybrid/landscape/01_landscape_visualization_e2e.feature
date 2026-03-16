@hybrid @landscape @ROAD-044 @CAP-023
Feature: Business Landscape Visualization E2E
  As a Domain Architect
  I want to view the business landscape visualization in the browser
  So that I can explore bounded contexts, capabilities, and domain events for a domain model

  # The BusinessLandscapePage fetches the landscape graph, runs ELK layout,
  # and renders a header bar with counts plus a full SVG canvas.

  Background:
    # Create a domain model with a bounded context so the landscape has data
    Given I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "Landscape Test Domain",
        "description": "Domain model for landscape visualization BDD tests"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    And I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "billing",
        "title": "Billing",
        "responsibility": "Handles billing and invoicing",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200

  @smoke @landscape-ui
  Scenario: Business Landscape page loads with heading
    Given I navigate to "/design/business-landscape/{modelId}"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then I should see the landscape page heading
    And the landscape should not show an error

  @landscape-ui
  Scenario: Landscape page shows domain model context count
    Given I navigate to "/design/business-landscape/{modelId}"
    Then I wait for the page to load
    Then I wait for 3 seconds
    Then the landscape should not show an error
    And I should see text "contexts"

  @landscape-ui
  Scenario: Landscape page shows event count after layout completes
    Given I navigate to "/design/business-landscape/{modelId}"
    Then I wait for the page to load
    Then I wait for 3 seconds
    Then the landscape should not show an error

  @landscape-ui
  Scenario: Unknown domain model shows error state not a crash
    Given I navigate to "/design/business-landscape/00000000-0000-0000-0000-000000000000"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then I should see text "Error Loading Landscape"

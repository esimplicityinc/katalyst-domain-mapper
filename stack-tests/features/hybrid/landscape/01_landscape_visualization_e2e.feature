@hybrid @landscape @ROAD-044 @CAP-023
Feature: Business Landscape Visualization E2E
  As a Domain Architect
  I want to view the business landscape visualization in the browser
  So that I can explore bounded contexts, capabilities, and domain events for a domain model

  # Uses the Durham Water Management domain model (seeded in DB)
  # domainModelId: 979b271f-b189-4f87-b078-7cd1d598c5af
  #
  # The BusinessLandscapePage fetches the landscape graph, runs ELK layout,
  # and renders a header bar with counts plus a full SVG canvas.
  # There is no interactive layout-engine selector on this standalone page.

  Background:
    # Bypass the API key gate so the app loads without the welcome modal
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

  @smoke @landscape-ui
  Scenario: Business Landscape page loads with heading
    Given I navigate to "/design/business-landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then I should see the landscape page heading
    And the landscape should not show an error

  @landscape-ui
  Scenario: Landscape page shows domain model context count
    Given I navigate to "/design/business-landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then I wait for the page to load
    Then I wait for 3 seconds
    Then the landscape should not show an error
    And I should see text "contexts"

  @landscape-ui
  Scenario: Landscape page shows system count
    Given I navigate to "/design/business-landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then I wait for the page to load
    Then I wait for 3 seconds
    Then the landscape should not show an error
    And I should see text "systems"

  @landscape-ui
  Scenario: Landscape page shows event count after layout completes
    Given I navigate to "/design/business-landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then I wait for the page to load
    Then I wait for 3 seconds
    Then the landscape should not show an error
    And I should see text "events"

  @landscape-ui
  Scenario: Landscape page shows capability count after layout completes
    Given I navigate to "/design/business-landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then I wait for the page to load
    Then I wait for 3 seconds
    Then the landscape should not show an error
    And I should see text "capabilities"

  @landscape-ui
  Scenario: Unknown domain model shows error state not a crash
    Given I navigate to "/design/business-landscape/00000000-0000-0000-0000-000000000000"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then I should see text "Error Loading Landscape"

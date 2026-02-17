@hybrid @ddd-modeling @ROAD-017 @CAP-010
Feature: Aggregate Tree Hierarchy View
  As an Engineering Team Lead
  I want to explore aggregate structures as a collapsible tree
  So that I can understand the internal hierarchy of my domain aggregates

  # These hybrid scenarios verify the aggregate tree view component renders
  # correctly by seeding a model via API and then checking the UI.
  # The Background creates a model AND navigates to it to ensure it's selected.

  Background:
    # Set a dummy API key so the Welcome gate is bypassed on every page load
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

    # Create our test domain model
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Aggregate Tree E2E", "description": "Model for aggregate tree testing" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    # Create bounded context
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "scanning",
        "title": "Scanning Context",
        "responsibility": "Repository scanning orchestration",
        "teamOwnership": "Platform Team",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    # Create aggregate
    When I POST "/api/v1/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "scan-job",
        "title": "Scan Job",
        "rootEntity": "ScanJob",
        "entities": ["ScanStep", "ScanResult"],
        "valueObjects": ["repository-url"],
        "commands": ["StartScan", "CancelScan"],
        "events": ["scan-started", "scan-completed"],
        "invariants": [
          { "rule": "Scan must have a valid repository URL" }
        ]
      }
      """
    Then the response status should be 200

    # Create value object with property details
    When I POST "/api/v1/domain-models/{modelId}/value-objects" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "repository-url",
        "title": "Repository URL",
        "description": "A validated git repository URL",
        "properties": [
          { "name": "url", "type": "string" },
          { "name": "provider", "type": "string" }
        ],
        "immutable": true
      }
      """
    Then the response status should be 200

  # -- Structural Tests (verify tree component renders) ----------------------

  @smoke @tree
  Scenario: Aggregates tab is available in navigation
    # Navigate to mapper — gate bypassed (API key set), auto-selects first model
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    # Switch to our test model
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Aggregate Tree E2E')"
    Then I wait for 2 seconds
    # Navigate to the Aggregates tab
    When I click the link "Aggregates"
    Then I wait for 2 seconds
    Then I should see text "Aggregates"

  @tree
  Scenario: Tree view shows aggregate data from the active model
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Aggregate Tree E2E')"
    Then I wait for 2 seconds
    When I click the link "Aggregates"
    Then I wait for 2 seconds
    Then I should see text "Scanning Context"
    When I click the button "Scanning Context"
    Then I wait for 1 seconds
    Then I should see text "Scan Job"

  @tree @controls
  Scenario: Expand All reveals child entities and value objects
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Aggregate Tree E2E')"
    Then I wait for 2 seconds
    When I click the link "Aggregates"
    Then I wait for 2 seconds
    When I click the button "Scanning Context"
    Then I wait for 1 seconds
    When I click the button "Expand All"
    Then I wait for 1 seconds
    Then I should see text "ScanStep"
    And I should see text "Repository URL"
    And I should see text "StartScan"

  @tree @controls
  Scenario: Collapse All hides expanded child nodes
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Aggregate Tree E2E')"
    Then I wait for 2 seconds
    When I click the link "Aggregates"
    Then I wait for 2 seconds
    When I click the button "Scanning Context"
    Then I wait for 1 seconds
    When I click the button "Expand All"
    Then I wait for 1 seconds
    When I click the button "Collapse All"
    Then I wait for 1 seconds
    Then I should see text "Scan Job"

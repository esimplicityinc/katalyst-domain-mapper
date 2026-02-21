@hybrid @ddd-modeling @ROAD-017 @CAP-010
Feature: Value Objects Tab and CRUD Panel in UI
  As an Engineering Team Lead
  I want to see a dedicated Value Objects tab and create, edit, delete value objects from the UI
  So that I can manage value types without needing API access

  Background:
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Value Object UI Test", "description": "Model for value object UI testing" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "scanning",
        "title": "Scanning Context",
        "responsibility": "Repository scanning orchestration",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    # Navigate to the mapper
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Value Object UI Test')"
    Then I wait for 2 seconds

  @smoke @value-object
  Scenario: Value Objects tab exists in the navigation
    Then I should see text "Value Objects"

  @value-object
  Scenario: Value Objects tab displays the dedicated view
    When I click the link "Value Objects"
    Then I wait for 2 seconds
    Then I should see text "Add Value Object"

  @value-object
  Scenario: Create a value object using the slide-in panel
    When I click the link "Value Objects"
    Then I wait for 2 seconds
    When I click the button "Add Value Object"
    Then I wait for 1 seconds
    Then I should see text "New Value Object"

    When I fill the placeholder "e.g., dimension-score" with "money"
    And I fill the placeholder "e.g., DimensionScore" with "Money"
    Then I wait for 1 seconds

    When I click the button "Save"
    Then I wait for 2 seconds
    Then I should see text "Money"

  @value-object
  Scenario: Value object is grouped under its bounded context
    # Seed a value object via API
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

    # Reload and navigate to Value Objects tab
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Value Object UI Test')"
    Then I wait for 2 seconds
    When I click the link "Value Objects"
    Then I wait for 2 seconds

    Then I should see text "Scanning Context"
    And I should see text "Repository URL"
    And I should see text "IMMUTABLE"

  @value-object
  Scenario: Edit a value object from the list
    # Seed a value object via API
    When I POST "/api/v1/domain-models/{modelId}/value-objects" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "money",
        "title": "Money",
        "description": "Currency amount",
        "immutable": true
      }
      """
    Then the response status should be 200

    # Reload and navigate to Value Objects tab
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Value Object UI Test')"
    Then I wait for 2 seconds
    When I click the link "Value Objects"
    Then I wait for 2 seconds

    Then I should see text "Money"
    When I click the element "button[aria-label*='Edit Money'], button[title*='Edit Money']"
    Then I wait for 1 seconds
    Then I should see text "Edit Value Object"

    When I fill the placeholder "Brief description of this value object" with "A monetary amount with currency code"
    Then I wait for 1 seconds

    When I click the button "Save"
    Then I wait for 2 seconds
    Then I should see text "Money"

  @value-object
  Scenario: Empty state shows helpful message when no value objects exist
    When I click the link "Value Objects"
    Then I wait for 2 seconds
    Then I should see text "No value objects yet"
    And I should see text "Chat"

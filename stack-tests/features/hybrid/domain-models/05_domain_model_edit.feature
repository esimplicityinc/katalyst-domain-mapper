@hybrid @ddd-modeling @ROAD-008 @CAP-009
Feature: Domain Model Edit in UI
  As an Engineering Team Lead
  I want to edit a domain model's name and description from the UI
  So that domain model metadata can be corrected without using the API directly

  Background:
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Original Model Name", "description": "Original description text" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

  @smoke @e2e
  Scenario: Domain model edit button is visible on the model list
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then I should see text "Original Model Name"
    And the element "[data-testid='edit-model-{modelId}'], button[aria-label*='Edit']" should be visible

  @e2e
  Scenario: Edit domain model name and verify update persists
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then I should see text "Original Model Name"

    # Open the edit form (pencil icon on the model card)
    When I click the element "button[aria-label*='Edit Original Model Name'], [data-testid*='edit']"
    Then I wait for 1 seconds

    # Fill in the new name
    When I fill the placeholder "Model name" with "Renamed Domain Model"
    Then I wait for 1 seconds

    # Save
    When I click the button "Save"
    Then I wait for 2 seconds
    Then I should see text "Renamed Domain Model"

  @e2e
  Scenario: Cancel model edit discards changes
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    Then I should see text "Original Model Name"

    When I click the element "button[aria-label*='Edit Original Model Name'], [data-testid*='edit']"
    Then I wait for 1 seconds

    When I fill the placeholder "Model name" with "Discarded Name Change"
    Then I wait for 1 seconds

    When I click the button "Cancel"
    Then I wait for 1 seconds
    Then I should see text "Original Model Name"

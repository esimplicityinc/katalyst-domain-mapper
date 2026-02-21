@hybrid @ddd-modeling @ROAD-008 @CAP-009
Feature: Glossary Edit and Delete in UI
  As an Engineering Team Lead
  I want to edit and delete glossary terms directly from the Glossary tab
  So that I can maintain ubiquitous language accuracy without API access

  Background:
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Glossary UI Test", "description": "Model for glossary UI testing" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "scanning",
        "title": "Scanning Context",
        "responsibility": "Repository scanning orchestration"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    # Seed a glossary term
    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "term": "Cognitive Triangle",
        "definition": "Original definition to be updated"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "termId"

    # Navigate to the Glossary tab
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Glossary UI Test')"
    Then I wait for 2 seconds
    When I click the link "Glossary"
    Then I wait for 2 seconds

  @smoke @glossary
  Scenario: Glossary table shows edit and delete actions per row
    Then I should see text "Cognitive Triangle"
    And I should see text "Actions"

  @glossary
  Scenario: Edit a glossary term definition
    Then I should see text "Cognitive Triangle"

    # Click the edit (pencil) button for this term
    When I click the element "button[aria-label*='Edit Cognitive Triangle'], button[title*='Edit Cognitive Triangle']"
    Then I wait for 1 seconds

    # Update the definition
    When I fill the placeholder "Definition" with "A diagnostic visualization showing the balance between Understanding, Feedback, and Confidence"
    Then I wait for 1 seconds

    When I click the button "Save"
    Then I wait for 2 seconds
    Then I should see text "Cognitive Triangle"

  @glossary
  Scenario: Cancel glossary term edit discards changes
    Then I should see text "Cognitive Triangle"

    When I click the element "button[aria-label*='Edit Cognitive Triangle'], button[title*='Edit Cognitive Triangle']"
    Then I wait for 1 seconds

    When I fill the placeholder "Definition" with "A discarded change"
    Then I wait for 1 seconds

    When I click the button "Cancel"
    Then I wait for 1 seconds
    Then I should see text "Cognitive Triangle"

  @glossary
  Scenario: Delete a glossary term with inline confirmation
    # Seed a term specifically for deletion
    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      { "term": "Term To Delete", "definition": "This will be removed" }
      """
    Then the response status should be 200

    # Reload the glossary
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Glossary UI Test')"
    Then I wait for 2 seconds
    When I click the link "Glossary"
    Then I wait for 2 seconds
    Then I should see text "Term To Delete"

    # Click the delete (trash) button
    When I click the element "button[aria-label*='Delete Term To Delete'], button[title*='Delete Term To Delete']"
    Then I wait for 1 seconds

    # Confirm via inline two-step
    When I click the button "Confirm"
    Then I wait for 2 seconds

  @glossary
  Scenario: Add Term form is still accessible alongside edit/delete actions
    When I click the button "Add Term"
    Then I wait for 1 seconds
    Then I should see text "Term"
    And I should see text "Definition"

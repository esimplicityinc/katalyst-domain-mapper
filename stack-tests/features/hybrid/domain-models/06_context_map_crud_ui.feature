@hybrid @ddd-modeling @ROAD-008 @CAP-009
Feature: Context Map CRUD in UI
  As an Engineering Team Lead
  I want to create, edit, and delete bounded contexts from the context map UI
  So that I can manage system boundaries without needing API access directly

  Background:
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Context CRUD UI Test", "description": "Model for context map CRUD testing" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    # Navigate to the model's context map
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Context CRUD UI Test')"
    Then I wait for 2 seconds
    When I click the link "Context Map"
    Then I wait for 2 seconds

  @smoke @context-map
  Scenario: Add Context button is visible on context map page
    Then I should see text "Context Map"
    And I should see text "Add Context"

  @context-map
  Scenario: Create a bounded context via the inline form
    When I click the button "Add Context"
    Then I wait for 1 seconds

    When I fill the placeholder "Slug (e.g., order-management)" with "payments"
    And I fill the placeholder "Title (e.g., Order Management)" with "Payments Context"
    And I fill the placeholder "Responsibility" with "Handles payment processing and reconciliation"
    Then I wait for 1 seconds

    When I click the button "Create"
    Then I wait for 2 seconds
    Then I should see text "Payments Context"

  @context-map
  Scenario: Edit a bounded context from the list view
    # Seed a context via API
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "notifications",
        "title": "Notifications Context",
        "responsibility": "Sends email and SMS",
        "subdomainType": "generic"
      }
      """
    Then the response status should be 200

    # Reload UI
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Context CRUD UI Test')"
    Then I wait for 2 seconds
    When I click the link "Context Map"
    Then I wait for 2 seconds

    # Switch to list view
    When I click the button "List"
    Then I wait for 1 seconds
    Then I should see text "Notifications Context"

    # Click edit button
    When I click the element "button[aria-label*='Edit Notifications']"
    Then I wait for 1 seconds

    # Update the responsibility
    When I fill the placeholder "Responsibility" with "Sends email, SMS, and push notifications"
    Then I wait for 1 seconds

    When I click the button "Save"
    Then I wait for 2 seconds
    Then I should see text "Notifications Context"

  @context-map
  Scenario: Delete a bounded context from the list view
    # Seed a context via API
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "temp-context",
        "title": "Temporary Context",
        "responsibility": "Will be deleted"
      }
      """
    Then the response status should be 200

    # Reload UI
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Context CRUD UI Test')"
    Then I wait for 2 seconds
    When I click the link "Context Map"
    Then I wait for 2 seconds

    # Switch to list view and delete
    When I click the button "List"
    Then I wait for 1 seconds
    Then I should see text "Temporary Context"

    When I click the element "button[aria-label*='Delete Temporary Context'], button[title*='Delete']"
    Then I wait for 1 seconds

    # Confirm deletion (inline two-step)
    When I click the button "Yes"
    Then I wait for 2 seconds

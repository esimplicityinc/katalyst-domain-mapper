@hybrid @ddd-modeling @ROAD-017 @CAP-010
Feature: Aggregate CRUD Panel in UI
  As an Engineering Team Lead
  I want to create, edit, and delete aggregates directly from the Aggregates tab
  So that I can refine the domain model without switching to the API

  Background:
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Aggregate CRUD UI Test", "description": "Model for aggregate UI testing" }
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

    # Navigate to the Aggregates tab
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Aggregate CRUD UI Test')"
    Then I wait for 2 seconds
    When I click the link "Aggregates"
    Then I wait for 2 seconds

  @smoke @aggregate
  Scenario: Add Aggregate button is visible on the Aggregates tab
    Then I should see text "Aggregates"
    And I should see text "Add Aggregate"

  @aggregate
  Scenario: Create an aggregate using the slide-in panel
    When I click the button "Add Aggregate"
    Then I wait for 1 seconds
    Then I should see text "New Aggregate"

    When I fill the placeholder "e.g., scan-job" with "payment-order"
    And I fill the placeholder "e.g., ScanJob Aggregate" with "Payment Order"
    And I fill the placeholder "e.g., ScanJob" with "PaymentOrder"
    Then I wait for 1 seconds

    When I click the button "Save"
    Then I wait for 2 seconds
    Then I should see text "Payment Order"

  @aggregate
  Scenario: Edit an aggregate from the tree view
    # Seed an aggregate via API
    When I POST "/api/v1/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "scan-job",
        "title": "Scan Job",
        "rootEntity": "ScanJob",
        "status": "draft"
      }
      """
    Then the response status should be 200

    # Reload UI
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Aggregate CRUD UI Test')"
    Then I wait for 2 seconds
    When I click the link "Aggregates"
    Then I wait for 2 seconds

    # Open the context section and click edit on the aggregate
    When I click the button "Scanning Context"
    Then I wait for 1 seconds
    Then I should see text "Scan Job"

    When I click the element "button[aria-label*='Edit Scan Job'], button[title*='Edit Scan Job']"
    Then I wait for 1 seconds
    Then I should see text "Edit Aggregate"

    # Update the status
    When I select "stable" from dropdown "Status"
    Then I wait for 1 seconds

    When I click the button "Save"
    Then I wait for 2 seconds
    Then I should see text "Scan Job"

  @aggregate
  Scenario: Empty state shows helpful message when no aggregates exist
    Then I should see text "No aggregates yet"
    And I should see text "Chat"

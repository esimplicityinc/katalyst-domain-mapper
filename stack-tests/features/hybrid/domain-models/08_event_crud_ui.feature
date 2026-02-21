@hybrid @ddd-modeling @ROAD-017 @CAP-010
Feature: Domain Event CRUD Panel in UI
  As an Engineering Team Lead
  I want to create, edit, and delete domain events directly from the Events tab
  So that I can refine the event flow without needing API access

  Background:
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Event CRUD UI Test", "description": "Model for event flow UI testing" }
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

    # Navigate to the Events tab
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Event CRUD UI Test')"
    Then I wait for 2 seconds
    When I click the link "Events"
    Then I wait for 2 seconds

  @smoke @domain-event
  Scenario: Add Event button is visible on the Events tab
    Then I should see text "Add Event"

  @domain-event
  Scenario: Create a domain event using the slide-in panel
    When I click the button "Add Event"
    Then I wait for 1 seconds
    Then I should see text "New Domain Event"

    When I fill the placeholder "e.g., scan-completed" with "scan-started"
    And I fill the placeholder "e.g., ScanCompleted" with "ScanStarted"
    Then I wait for 1 seconds

    When I click the button "Save"
    Then I wait for 2 seconds
    Then I should see text "ScanStarted"

  @domain-event
  Scenario: Edit a domain event from the event timeline
    # Seed an event via API
    When I POST "/api/v1/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "scan-completed",
        "title": "ScanCompleted",
        "description": "Original description"
      }
      """
    Then the response status should be 200

    # Reload UI
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Event CRUD UI Test')"
    Then I wait for 2 seconds
    When I click the link "Events"
    Then I wait for 2 seconds

    # Click the event card to open edit panel
    When I click the element "div:has-text('ScanCompleted'):first-of-type, [data-event-slug='scan-completed']"
    Then I wait for 1 seconds
    Then I should see text "Edit Domain Event"

    When I fill the placeholder "What does this event represent?" with "Emitted when a FOE scan finishes successfully"
    Then I wait for 1 seconds

    When I click the button "Save"
    Then I wait for 2 seconds
    Then I should see text "ScanCompleted"

  @domain-event
  Scenario: Empty state shows helpful message when no events exist
    Then I should see text "No domain events yet"
    And I should see text "Chat"

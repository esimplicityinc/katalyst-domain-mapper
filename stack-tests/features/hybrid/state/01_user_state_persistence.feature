@hybrid @user-state @CAP-022 @US-066
Feature: User State Persistence
  As an Engineering Team Lead (@UT-001)
  I want my domain model selection and tab state to persist across page refreshes
  So that I don't lose my working context when navigating or reloading

  Background:
    # Create a domain model so we have something to select
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "Persistence Test Domain",
        "description": "Tests localStorage persistence"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    And I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

  @smoke
  Scenario: Domain model page loads successfully
    When I navigate to "/design/business-domain/contexts"
    Then I wait for the page to load
    Then I should see text "Persistence Test Domain"

  Scenario: Navigation state survives page reload
    When I navigate to "/design/business-domain/aggregates"
    Then I wait for the page to load
    When I reload the page
    Then I wait for the page to load
    Then the URL should contain "/aggregates"

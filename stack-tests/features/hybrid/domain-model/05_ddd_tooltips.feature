@hybrid @ddd-tooltips @CAP-021 @CAP-010 @US-065
Feature: DDD Onboarding Tooltips
  As a Non-Technical Stakeholder (@UT-006)
  I want contextual tooltips that explain DDD terminology in plain English
  So that I can understand domain modeling concepts without prior DDD knowledge

  Background:
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "Tooltip Test Domain",
        "description": "Domain model for DDD tooltip BDD tests"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    And I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "core-context",
        "title": "Core Context",
        "responsibility": "Main business logic",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200

  @smoke
  Scenario: Context Map page renders DDD terminology
    When I navigate to "/design/business-domain/contexts"
    Then I wait for the page to load
    Then I should see text "Context Map"
    And I should see text "Core Context"

  Scenario: Aggregates view is accessible with tooltip-relevant content
    When I navigate to "/design/business-domain/aggregates"
    Then I wait for the page to load
    Then I should see text "Aggregates"

  Scenario: Glossary view shows DDD terminology
    When I navigate to "/design/business-domain/glossary"
    Then I wait for the page to load
    Then I should see text "Glossary"

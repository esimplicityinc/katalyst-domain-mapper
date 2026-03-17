@hybrid @ddd-modeling @CAP-010 @CAP-009 @US-046
Feature: Glossary View with Tag Filtering
  As a Domain Architect (@UT-007)
  I want to filter glossary terms by clickable alias tags
  So that I can quickly find related domain terminology

  Background:
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "Glossary Filter Test Domain",
        "description": "Domain model for glossary tag filtering BDD tests"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    And I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "term": "Bounded Context",
        "definition": "A linguistic boundary within which a domain model is consistent",
        "aliases": ["BC", "Context Boundary"]
      }
      """
    Then the response status should be 200

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "term": "Aggregate Root",
        "definition": "The entry point entity that ensures consistency within an aggregate",
        "aliases": ["AR", "Root Entity"]
      }
      """
    Then the response status should be 200

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "term": "Domain Event",
        "definition": "Something that happened in the domain that experts care about",
        "aliases": ["Event"]
      }
      """
    Then the response status should be 200

    When I navigate to "/design/business-domain/glossary"
    Then I wait for the page to load

  @smoke
  Scenario: Glossary page renders with all terms
    Then I should see text "Bounded Context"
    And I should see text "Aggregate Root"
    And I should see text "Domain Event"

  Scenario: Glossary terms show their definitions
    Then I should see text "A linguistic boundary within which a domain model is consistent"

  Scenario: Glossary terms display alias tags
    Then I should see text "BC"
    And I should see text "AR"
    And I should see text "Event"

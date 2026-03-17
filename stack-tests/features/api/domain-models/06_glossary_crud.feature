@api @ddd-modeling @CAP-009 @US-028
Feature: Glossary Term CRUD API
  As a Documentation Author (@UT-004)
  I want to manage glossary terms for ubiquitous language tracking
  So that the team shares a consistent vocabulary across bounded contexts

  Background:
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      { "name": "BDD Glossary CRUD Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

  # ── Create ─────────────────────────────────────────────────────────────────

  @smoke
  Scenario: Add a glossary term with definition and aliases
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "term": "Bounded Context",
        "definition": "A linguistic boundary within which a domain model has consistent meaning",
        "aliases": ["BC", "Context"]
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "termId"
    And the value at "term" should equal "Bounded Context"

  Scenario: Add multiple glossary terms
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "term": "Aggregate",
        "definition": "A cluster of domain objects treated as a single unit for data changes",
        "aliases": ["Aggregate Root"]
      }
      """
    Then the response status should be 200

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "term": "Value Object",
        "definition": "An immutable object defined by its attributes rather than identity",
        "aliases": ["VO"]
      }
      """
    Then the response status should be 200

  # ── List ───────────────────────────────────────────────────────────────────

  Scenario: List glossary terms for a domain model
    # Add a term first
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "term": "Domain Event",
        "definition": "Something that happened in the domain that domain experts care about"
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/taxonomy/domain-models/{modelId}/glossary"
    Then the response status should be 200
    And the response should be a JSON array

  # ── Nested retrieval ───────────────────────────────────────────────────────

  Scenario: Glossary terms appear in nested domain model retrieval
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "term": "Ubiquitous Language",
        "definition": "A shared language between developers and domain experts"
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/taxonomy/domain-models/{modelId}"
    Then the response status should be 200
    And I store the value at "glossaryTerms[0].term" as "firstTerm"

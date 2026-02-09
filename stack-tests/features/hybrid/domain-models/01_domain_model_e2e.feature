@hybrid @ddd-modeling @ROAD-008 @ROAD-009 @CAP-009 @wip
Feature: DDD Domain Model End-to-End
  As an Engineering Team Lead
  I want to create a domain model via API and see it in the context map UI
  So that the full domain modeling workflow is validated across layers

  @e2e @context-map
  Scenario: Create domain model via API and verify in context map UI
    # API: Create a model with bounded contexts
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "E2E Domain Model", "description": "Created for end-to-end validation" }
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
        "teamOwnership": "Platform Team"
      }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "reporting",
        "title": "Reporting Context",
        "responsibility": "FOE report generation and visualization",
        "relationships": [{ "type": "upstream", "target": "scanning" }]
      }
      """
    Then the response status should be 200

    # UI: Verify context map displays the contexts
    Given I navigate to "/context-map"
    Then I should see text "Scanning Context"
    And I should see text "Reporting Context"

  @e2e @glossary
  Scenario: Build ubiquitous language glossary and verify in UI
    # API: Create model and glossary terms
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Glossary E2E Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      { "term": "Cognitive Triangle", "definition": "Balance visualization of Understanding, Feedback, and Confidence" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      { "term": "Maturity Level", "definition": "Classification of FOE practice adoption: Hypothesized, Emerging, Practicing, Optimized" }
      """
    Then the response status should be 200

    # UI: Verify glossary is visible
    Given I navigate to "/context-map"
    Then I should see text "Cognitive Triangle"

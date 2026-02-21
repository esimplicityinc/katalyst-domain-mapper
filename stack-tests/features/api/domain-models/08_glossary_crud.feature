@api @ddd-modeling @ROAD-008 @CAP-009
Feature: Glossary Term CRUD
  As a Platform Engineer
  I want to create, update, and delete glossary terms in a domain model
  So that the ubiquitous language remains accurate and up-to-date

  Background:
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Glossary CRUD Test Model" }
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

  @glossary @smoke
  Scenario: Update a glossary term's definition
    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "term": "Cognitive Triangle",
        "definition": "Original definition"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "termId"

    When I PUT "/api/v1/domain-models/{modelId}/glossary/{termId}" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "term": "Cognitive Triangle",
        "definition": "A diagnostic visualization showing the balance between Understanding, Feedback, and Confidence dimensions with minimum score thresholds"
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}/glossary"
    Then the response status should be 200
    And the response should be a JSON array

  @glossary
  Scenario: Update a glossary term with aliases and examples
    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "term": "Finding",
        "definition": "An observation from a scan"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "termId"

    When I PUT "/api/v1/domain-models/{modelId}/glossary/{termId}" with JSON body:
      """
      {
        "term": "Finding",
        "definition": "An evidence-based observation surfaced during a FOE scan, categorised by severity",
        "aliases": ["Observation", "Issue"],
        "examples": ["A Finding of type gap indicates a missing practice", "Critical findings require immediate attention"],
        "relatedTerms": ["Gap", "Strength", "Recommendation"],
        "source": "FOE Field Guide v2"
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}/glossary"
    Then the response status should be 200
    And the response should be a JSON array

  @glossary
  Scenario: Update a glossary term to assign it to a context
    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "term": "Maturity Level",
        "definition": "A label mapping an overall FOE score to a maturity stage"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "termId"

    When I PUT "/api/v1/domain-models/{modelId}/glossary/{termId}" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "term": "Maturity Level",
        "definition": "A label mapping an overall FOE score to a maturity stage: Hypothesized, Emerging, Practicing, or Optimized"
      }
      """
    Then the response status should be 200

  @glossary
  Scenario: Delete a glossary term
    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      { "term": "To Be Deleted", "definition": "This term will be removed" }
      """
    Then the response status should be 200
    And I store the value at "id" as "termId"

    When I DELETE "/api/v1/domain-models/{modelId}/glossary/{termId}"
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}/glossary"
    Then the response status should be 200
    And the response should be a JSON array

  @glossary
  Scenario: Delete one term does not affect other terms
    # Create two terms
    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      { "term": "Term Alpha", "definition": "First term to keep" }
      """
    Then the response status should be 200
    And I store the value at "id" as "alphaTermId"

    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      { "term": "Term Beta", "definition": "Second term to delete" }
      """
    Then the response status should be 200
    And I store the value at "id" as "betaTermId"

    # Delete only beta
    When I DELETE "/api/v1/domain-models/{modelId}/glossary/{betaTermId}"
    Then the response status should be 200

    # Alpha should still be there
    When I GET "/api/v1/domain-models/{modelId}/glossary"
    Then the response status should be 200
    And the response should be a JSON array

  @glossary
  Scenario: Full glossary lifecycle — create, update, verify, delete
    # Create
    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "term": "Dimension",
        "definition": "One of three measurement axes in the FOE model"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "termId"
    And the value at "term" should equal "Dimension"

    # Update
    When I PUT "/api/v1/domain-models/{modelId}/glossary/{termId}" with JSON body:
      """
      {
        "term": "Dimension",
        "definition": "One of the three primary measurement axes: Understanding (35%), Feedback (35%), and Confidence (30%)",
        "aliases": ["FOE Dimension", "Assessment Axis"],
        "relatedTerms": ["Understanding", "Feedback", "Confidence"]
      }
      """
    Then the response status should be 200

    # Verify via list
    When I GET "/api/v1/domain-models/{modelId}/glossary"
    Then the response status should be 200
    And the response should be a JSON array

    # Delete
    When I DELETE "/api/v1/domain-models/{modelId}/glossary/{termId}"
    Then the response status should be 200

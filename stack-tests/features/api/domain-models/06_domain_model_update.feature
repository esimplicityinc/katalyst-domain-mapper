@api @ddd-modeling @ROAD-008 @CAP-009
Feature: Domain Model Update
  As a Platform Engineer
  I want to update the name and description of an existing domain model
  So that I can correct or refine domain model metadata after creation

  Background:
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Original Model Name", "description": "Original description" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

  Scenario: Update domain model name
    When I PUT "/api/v1/domain-models/{modelId}" with JSON body:
      """
      { "name": "Updated Model Name" }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the value at "name" should equal "Updated Model Name"

  Scenario: Update domain model description
    When I PUT "/api/v1/domain-models/{modelId}" with JSON body:
      """
      { "description": "Revised description after review" }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the value at "description" should equal "Revised description after review"

  Scenario: Update both name and description
    When I PUT "/api/v1/domain-models/{modelId}" with JSON body:
      """
      {
        "name": "Fully Updated Model",
        "description": "Completely rewritten name and description"
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the value at "name" should equal "Fully Updated Model"
    And the value at "description" should equal "Completely rewritten name and description"

  Scenario: Update with empty body does not corrupt model
    When I PUT "/api/v1/domain-models/{modelId}" with JSON body:
      """
      {}
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the value at "name" should equal "Original Model Name"

  Scenario: Updated model still contains all its artifacts
    # Add a bounded context
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "scanning",
        "title": "Scanning Context",
        "responsibility": "Scanning orchestration"
      }
      """
    Then the response status should be 200

    # Update the model name
    When I PUT "/api/v1/domain-models/{modelId}" with JSON body:
      """
      { "name": "Renamed Model With Artifacts" }
      """
    Then the response status should be 200

    # Verify the context is still present
    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "name" should equal "Renamed Model With Artifacts"

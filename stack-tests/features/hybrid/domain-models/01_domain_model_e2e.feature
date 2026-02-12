@hybrid @ddd-modeling @ROAD-008 @ROAD-009 @CAP-009
Feature: DDD Domain Model End-to-End
  As an Engineering Team Lead
  I want to create a domain model via API and see it in the context map UI
  So that the full domain modeling workflow is validated across layers

  @e2e @context-map
  Scenario: Create domain model via API and verify in context map UI
    # Set a dummy API key so the Welcome gate is bypassed on page load
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

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
        "teamOwnership": "Platform Team",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "scanningContextId"

    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "reporting",
        "title": "Reporting Context",
        "responsibility": "FOE report generation and visualization",
        "subdomainType": "supporting",
        "relationships": [{ "type": "upstream", "targetContext": "{scanningContextId}" }]
      }
      """
    Then the response status should be 200

    # UI: Navigate to mapper, select our model, then verify context map
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('E2E Domain Model')"
    Then I wait for 2 seconds
    When I click the link "Context Map"
    Then I wait for 2 seconds
    Then I should see text "Scanning Context"
    And I should see text "Reporting Context"

  @e2e @glossary
  Scenario: Build ubiquitous language glossary and verify in UI
    # Set a dummy API key so the Welcome gate is bypassed on page load
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-dummy-key-for-bdd-testing" }
      """
    Then the response status should be 200

    # API: Create model and glossary terms
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Glossary E2E Model", "description": "Test model for glossary" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    # Create a bounded context first
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "test-context",
        "title": "Test Context",
        "responsibility": "Test responsibility",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      { 
        "contextId": "{contextId}",
        "term": "Cognitive Triangle", 
        "definition": "Balance visualization of Understanding, Feedback, and Confidence" 
      }
      """
    Then the response status should be 200

    # UI: Navigate to mapper, select our model, then verify glossary
    Given I navigate to "/mapper"
    Then I wait for the page to load
    Then I wait for 2 seconds
    When I click the button "Switch Model"
    Then I wait for 1 seconds
    When I click the element "button:has-text('Glossary E2E Model')"
    Then I wait for 2 seconds
    When I click the link "Glossary"
    Then I wait for 2 seconds
    Then I should see text "Cognitive Triangle"

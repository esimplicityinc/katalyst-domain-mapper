@api
Feature: FOE API Configuration
  As a platform operator
  I want to check and manage API configuration
  So that the scanner can function properly

  Scenario: Check configuration status
    When I GET "/api/v1/config/status"
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Configuration status reports scanner availability
    When I GET "/api/v1/config/status"
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Set API key via PUT endpoint
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "sk-ant-test-key-for-bdd-validation" }
      """
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Reject empty API key
    When I PUT "/api/v1/config/api-key" with JSON body:
      """
      { "apiKey": "" }
      """
    Then the response status should be 400

@api
Feature: FOE API Configuration
  As a platform operator
  I want to check and manage API configuration
  So that the scanner can function properly

  Scenario: Check configuration status
    When I GET "/api/v1/config/status"
    Then the response status should be 200
    And the response should be a JSON object

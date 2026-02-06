@api
Feature: FOE Repository Tracking
  As a platform engineer
  I want to list and inspect tracked repositories
  So that I can understand which repos have been scanned

  Scenario: List all repositories
    When I GET "/api/v1/repositories"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Get non-existent repository returns 404
    When I GET "/api/v1/repositories/non-existent-repo-id"
    Then the response status should be 404

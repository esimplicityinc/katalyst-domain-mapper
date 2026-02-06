@api
Feature: FOE Scan Jobs
  As a development team lead
  I want to manage FOE scan jobs
  So that I can trigger and monitor repository assessments

  Scenario: List scan jobs
    When I GET "/api/v1/scans"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Filter scan jobs by status
    When I GET "/api/v1/scans?status=completed"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Get non-existent scan returns 404
    When I GET "/api/v1/scans/non-existent-scan-id"
    Then the response status should be 404

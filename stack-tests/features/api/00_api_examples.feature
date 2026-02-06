@api
Feature: FOE API Health & Readiness
  As a platform operator
  I want to verify the FOE API is healthy
  So that I can trust it is ready to accept requests

  Scenario: Health check returns OK
    When I GET "/api/v1/health"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "status" should equal "ok"

  Scenario: Readiness check confirms database
    When I GET "/api/v1/ready"
    Then the response status should be 200
    And the value at "status" should equal "ready"
    And the value at "database" should equal "true"

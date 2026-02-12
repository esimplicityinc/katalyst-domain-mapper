@api @gov-validation @ROAD-005 @CAP-002
Feature: Governance Coverage & Trend Tracking
  As an Engineering Team Lead
  I want to query governance coverage and health trends
  So that I can track improvement over time and identify capability gaps

  @coverage
  Scenario: Get capability coverage report
    When I GET "/api/v1/governance/coverage/capabilities"
    Then the response status should be 200
    And the response should be a JSON array

  @coverage
  Scenario: Get persona coverage report
    When I GET "/api/v1/governance/coverage/personas"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Query road items by governance status
    When I GET "/api/v1/governance/roads"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Filter road items by status
    When I GET "/api/v1/governance/roads?status=implementing"
    Then the response status should be 200
    And the response should be a JSON array

  @integrity
  Scenario: Get cross-reference integrity report
    When I GET "/api/v1/governance/integrity"
    Then the response status should be 200
    And the response should be a JSON object

  @trend
  Scenario: Get governance health trend over time
    When I GET "/api/v1/governance/trends"
    Then the response status should be 200
    And the response should be a JSON array

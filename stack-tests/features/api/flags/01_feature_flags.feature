@api @feature-flags @CAP-028 @US-081 @US-082
Feature: Feature Flag API
  As a Platform Engineer
  I want to query and control feature flags via the API
  So that I can manage feature rollout without redeployment

  @smoke
  Scenario: Flags endpoint returns all flags
    When I GET "/api/v1/flags"
    Then the response status should be 200
    And the response should be a JSON object

  @detail
  Scenario: Flags include scanner-enabled boolean
    When I GET "/api/v1/flags"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "scanner-enabled" should be a boolean

  @detail
  Scenario: Flags include scan.runtime string
    When I GET "/api/v1/flags"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "scan.runtime" should be a string

  @detail
  Scenario: Flags include max-concurrent-scans number
    When I GET "/api/v1/flags"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "max-concurrent-scans" should be a number

  @detail
  Scenario: Flags include all 9 registered flag keys
    When I GET "/api/v1/flags"
    Then the response status should be 200
    And the response should be a JSON object
    And the response should have key "scanner-enabled"
    And the response should have key "domain-model-v2"
    And the response should have key "landscape-lint-strict"
    And the response should have key "ai-insights-enabled"
    And the response should have key "governance-v2"
    And the response should have key "max-concurrent-scans"
    And the response should have key "scan.runtime"
    And the response should have key "chat.runtime"
    And the response should have key "landscape-layout-v2"

  @error
  Scenario: Flags endpoint rejects POST method
    When I POST "/api/v1/flags" with JSON body:
      """
      { "scanner-enabled": false }
      """
    Then the response status should be 404

@api @github-integration @ROAD-012 @CAP-007 @wip
Feature: GitHub Feedback Dimension Integration
  As an Engineering Team Lead
  I want to import GitHub Actions/CI metrics into the scanner
  So that the Feedback dimension score reflects real CI/CD performance data

  Background:
    Given I am authenticated as an admin via API

  @smoke @actions
  Scenario: Import GitHub Actions workflow runs
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "feedback",
        "dataTypes": ["workflow-runs"],
        "auth": {"type": "pat"},
        "lookbackDays": 30
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "metrics.workflowRuns" should not be empty
    And the value at "metrics.buildTimeP50" should not be empty
    And the value at "metrics.buildTimeP90" should not be empty

  @deployments
  Scenario: Import deployment frequency from GitHub Releases
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "feedback",
        "dataTypes": ["releases", "deployments"],
        "auth": {"type": "pat"},
        "lookbackDays": 90
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "metrics.deploymentFrequency" should not be empty
    And the value at "metrics.doraClassification" should not be empty

  @failure-rate
  Scenario: Calculate build failure rate
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "feedback",
        "dataTypes": ["workflow-runs"],
        "auth": {"type": "pat"},
        "lookbackDays": 30
      }
      """
    Then the response status should be 200
    And the value at "metrics.failureRate" should not be empty
    And the value at "metrics.meanTimeToRecovery" should not be empty

  @test-artifacts
  Scenario: Import test result artifacts from workflow runs
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "feedback",
        "dataTypes": ["test-artifacts"],
        "auth": {"type": "pat"},
        "workflowName": "CI"
      }
      """
    Then the response status should be 200
    And the value at "metrics.testResults" should not be empty

  @validation
  Scenario: Reject invalid GitHub import request
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "dimension": "feedback"
      }
      """
    Then the response status should be 400

  @config
  Scenario: Use github-config.json for default settings
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "dimension": "feedback",
        "useConfig": true
      }
      """
    Then the response status should be 200

  @graceful-degradation
  Scenario: Graceful degradation when GitHub is inaccessible
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "nonexistent-org",
        "repo": "nonexistent-repo",
        "dimension": "feedback",
        "dataTypes": ["workflow-runs"],
        "auth": {"type": "pat"}
      }
      """
    Then the response status should be 200
    And the value at "metrics.feedbackScore" should equal 0
    And the value at "metrics.explanation" should not be empty

@api @github-integration @ROAD-014 @CAP-007 @wip
Feature: GitHub Confidence Dimension Integration
  As an Engineering Team Lead
  I want to import GitHub quality signals into the scanner
  So that the Confidence dimension score reflects real code review practices and security posture

  Background:
    Given I am authenticated as an admin via API

  @smoke @reviews
  Scenario: Import PR review quality data
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "confidence",
        "dataTypes": ["pr-reviews"],
        "auth": {"type": "pat"},
        "lookbackDays": 30
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "metrics.approvalRate" should not be empty
    And the value at "metrics.reviewTurnaroundTime" should not be empty
    And the value at "metrics.codeReviewCoverage" should not be empty

  @branch-protection
  Scenario: Assess branch protection rules
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "confidence",
        "dataTypes": ["branch-protection"],
        "auth": {"type": "pat"},
        "branch": "main"
      }
      """
    Then the response status should be 200
    And the value at "metrics.requiredReviews" should not be empty
    And the value at "metrics.requiredStatusChecks" should not be empty
    And the value at "metrics.signedCommitsRequired" should not be empty

  @security @dependabot
  Scenario: Import Dependabot security alerts
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "confidence",
        "dataTypes": ["dependabot-alerts"],
        "auth": {"type": "pat"}
      }
      """
    Then the response status should be 200
    And the value at "metrics.openAlerts" should not be empty
    And the value at "metrics.resolutionRate" should not be empty
    And the value at "metrics.meanTimeToRemediate" should not be empty

  @security @codeql
  Scenario: Import CodeQL scanning alerts
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "confidence",
        "dataTypes": ["code-scanning"],
        "auth": {"type": "pat"}
      }
      """
    Then the response status should be 200
    And the value at "metrics.codeScanningAlerts" should not be empty

  @merge-policy
  Scenario: Assess merge policies
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "confidence",
        "dataTypes": ["merge-policies"],
        "auth": {"type": "pat"}
      }
      """
    Then the response status should be 200
    And the value at "metrics.mergeStrategy" should not be empty
    And the value at "metrics.linearHistoryRequired" should not be empty

  @validation
  Scenario: Reject invalid confidence import
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "dimension": "confidence"
      }
      """
    Then the response status should be 400

  @graceful-degradation
  Scenario: Graceful degradation when no security features enabled
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "simple-repo-no-security",
        "dimension": "confidence",
        "dataTypes": ["dependabot-alerts", "code-scanning", "branch-protection"],
        "auth": {"type": "pat"}
      }
      """
    Then the response status should be 200
    And the value at "metrics.confidenceScore" should equal 0
    And the value at "metrics.gaps" should not be empty

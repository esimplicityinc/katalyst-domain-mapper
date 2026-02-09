@hybrid @github-integration @ROAD-014 @CAP-007 @CAP-004 @wip
Feature: GitHub Confidence Integration End-to-End
  As an Engineering Team Lead
  I want GitHub quality signals to enrich the scanner's Confidence dimension
  So that FOE assessments reflect real code review practices and security posture

  @e2e @reviews
  Scenario: Import GitHub quality data and verify enriched Confidence score
    # API: Import GitHub confidence data
    Given I am authenticated as an admin via API
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "confidence",
        "dataTypes": ["pr-reviews", "branch-protection", "dependabot-alerts", "code-scanning"],
        "auth": {"type": "pat"},
        "lookbackDays": 30
      }
      """
    Then the response status should be 200
    And I store the value at "importId" as "githubConfidenceImportId"

    # API: Trigger a scan that uses GitHub Confidence data
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/esimplicity/katalyst-domain-mapper",
        "enrichment": {
          "github": {
            "confidence": {"importId": "{githubConfidenceImportId}"}
          }
        }
      }
      """
    Then the response status should be 202
    And I store the value at "scanId" as "scanId"

    # UI: Verify the enriched report shows GitHub quality data
    Given I navigate to "/reports/{scanId}"
    Then I should see text "Confidence"
    And I should see text "Code Review"
    And I should see text "Branch Protection"
    And I should see text "Security Alerts"

  @e2e @security
  Scenario: Verify security posture assessment from GitHub
    # API: Import security-focused data
    Given I am authenticated as an admin via API
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "confidence",
        "dataTypes": ["dependabot-alerts", "code-scanning"],
        "auth": {"type": "pat"}
      }
      """
    Then the response status should be 200
    And I store the value at "importId" as "securityImportId"

    # UI: Verify security posture in the report
    Given I navigate to "/integrations/github/confidence/{securityImportId}"
    Then I should see text "Dependabot"
    And I should see text "Resolution Rate"

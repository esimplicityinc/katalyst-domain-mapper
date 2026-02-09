@hybrid @github-integration @ROAD-012 @CAP-007 @CAP-004 @wip
Feature: GitHub Feedback Integration End-to-End
  As an Engineering Team Lead
  I want GitHub Actions data to enrich the scanner's Feedback dimension
  So that FOE assessments reflect real CI/CD performance from GitHub

  @e2e @actions
  Scenario: Import GitHub Actions metrics and verify enriched Feedback score
    # API: Import GitHub Actions data
    Given I am authenticated as an admin via API
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "feedback",
        "dataTypes": ["workflow-runs", "releases", "deployments"],
        "auth": {"type": "pat"},
        "lookbackDays": 30
      }
      """
    Then the response status should be 200
    And I store the value at "importId" as "githubFeedbackImportId"

    # API: Trigger a scan that uses GitHub Feedback data
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/esimplicity/katalyst-domain-mapper",
        "enrichment": {
          "github": {
            "feedback": {"importId": "{githubFeedbackImportId}"}
          }
        }
      }
      """
    Then the response status should be 202
    And I store the value at "scanId" as "scanId"

    # UI: Verify the enriched report shows GitHub CI data
    Given I navigate to "/reports/{scanId}"
    Then I should see text "Feedback"
    And I should see text "GitHub Actions"
    And I should see text "Build Time"
    And I should see text "Deployment Frequency"

  @e2e @deployment
  Scenario: Verify DORA deployment frequency from GitHub Releases
    # API: Import deployment frequency data
    Given I am authenticated as an admin via API
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
    And I store the value at "importId" as "deployImportId"

    # UI: Verify DORA classification appears in report
    Given I navigate to "/integrations/github/feedback/{deployImportId}"
    Then I should see text "DORA"
    And I should see text "Deployment Frequency"

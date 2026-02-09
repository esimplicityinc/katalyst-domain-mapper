@hybrid @github-integration @ROAD-013 @CAP-007 @CAP-004 @wip
Feature: GitHub Understanding Integration End-to-End
  As an Engineering Team Lead
  I want GitHub documentation signals to enrich the scanner's Understanding dimension
  So that FOE assessments reflect real documentation quality from GitHub

  @e2e @docs
  Scenario: Import GitHub docs and verify enriched Understanding score
    # API: Import GitHub documentation data
    Given I am authenticated as an admin via API
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "understanding",
        "dataTypes": ["pr-descriptions", "commit-messages", "documentation-presence", "wiki"],
        "auth": {"type": "pat"},
        "lookbackDays": 30
      }
      """
    Then the response status should be 200
    And I store the value at "importId" as "githubUnderstandingImportId"

    # API: Trigger a scan that uses GitHub Understanding data
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/esimplicity/katalyst-domain-mapper",
        "enrichment": {
          "github": {
            "understanding": {"importId": "{githubUnderstandingImportId}"}
          }
        }
      }
      """
    Then the response status should be 202
    And I store the value at "scanId" as "scanId"

    # UI: Verify the enriched report shows GitHub docs data
    Given I navigate to "/reports/{scanId}"
    Then I should see text "Understanding"
    And I should see text "PR Quality"
    And I should see text "Documentation Presence"

  @e2e @publish
  Scenario: Publish governance report to GitHub and verify
    # API: Publish governance to GitHub Pages
    Given I am authenticated as an admin via API
    When I POST "/api/v1/integrations/github/sync" with JSON body:
      """
      {
        "direction": "export",
        "contentType": "governance-report",
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "target": "github-pages",
        "auth": {"type": "pat"},
        "dryRun": false
      }
      """
    Then the response status should be 200
    And I store the value at "syncResults[0].url" as "pagesUrl"

    # UI: Verify the sync status in the dashboard
    Given I navigate to "/integrations/github/sync-status"
    Then I should see text "GitHub Pages"
    And I should see text "Published"

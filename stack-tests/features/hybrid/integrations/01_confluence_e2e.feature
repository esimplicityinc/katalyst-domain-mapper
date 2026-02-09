@hybrid @confluence-integration @ROAD-011 @CAP-006 @CAP-004 @wip
Feature: Confluence Integration End-to-End
  As an Engineering Team Lead
  I want Confluence content to enrich the scanner's Understanding dimension
  So that FOE assessments reflect real documentation quality from our wiki

  @e2e @import
  Scenario: Import Confluence content and verify enriched Understanding score
    # API: Import Confluence documentation
    Given I am authenticated as an admin via API
    When I POST "/api/v1/integrations/confluence/import" with JSON body:
      """
      {
        "spaceKey": "KDM",
        "contentTypes": ["adr", "runbook", "design-doc"],
        "assessFreshness": true,
        "assessCoverage": true
      }
      """
    Then the response status should be 200
    And I store the value at "importId" as "confluenceImportId"

    # API: Trigger a scan that uses Confluence data
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/example/repo",
        "enrichment": {
          "confluence": {
            "importId": "{confluenceImportId}"
          }
        }
      }
      """
    Then the response status should be 202
    And I store the value at "scanId" as "scanId"

    # UI: Verify the enriched report shows Confluence data
    Given I navigate to "/reports/{scanId}"
    Then I should see text "Understanding"
    And I should see text "Confluence Documentation"
    And I should see text "Documentation Freshness"
    And I should see text "Documentation Coverage"

  @e2e @publish
  Scenario: Publish governance report to Confluence and verify in UI
    # API: Publish governance report to Confluence
    Given I am authenticated as an admin via API
    When I POST "/api/v1/integrations/confluence/sync" with JSON body:
      """
      {
        "direction": "export",
        "contentType": "governance-report",
        "spaceKey": "KDM",
        "parentPageId": "12345",
        "dryRun": false
      }
      """
    Then the response status should be 200
    And I store the value at "syncResults[0].pageId" as "pageId"
    And I store the value at "syncResults[0].pageUrl" as "pageUrl"
    Given I register cleanup DELETE "/api/v1/integrations/confluence/pages/{pageId}"

    # UI: Verify the integration status shows in the governance dashboard
    Given I navigate to "/governance/integrations"
    Then I should see text "Confluence"
    And I should see text "Last published"
    And I should see text "KDM"

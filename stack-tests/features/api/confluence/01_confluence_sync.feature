@api @confluence-integration @ROAD-011 @CAP-006 @wip
Feature: Confluence Bidirectional Sync
  As a Platform Engineer
  I want to sync governance documentation with Confluence bidirectionally
  So that teams have visibility into governance health in their existing documentation platform

  Background:
    Given I am authenticated as an admin via API

  @smoke @export
  Scenario: Publish governance report to Confluence
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
    And the response should be a JSON object
    And I store the value at "syncResults[0].pageId" as "pageId"
    And the value at "syncResults[0].status" should equal "created"
    And the value at "syncResults[0].title" should not be empty
    Given I register cleanup DELETE "/api/v1/integrations/confluence/pages/{pageId}"

  @export @roadmap
  Scenario: Publish roadmap to Confluence
    When I POST "/api/v1/integrations/confluence/sync" with JSON body:
      """
      {
        "direction": "export",
        "contentType": "roadmap",
        "spaceKey": "KDM",
        "parentPageId": "12345",
        "dryRun": false
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "syncResults[0].pageId" as "roadmapPageId"
    And the value at "syncResults[0].status" should equal "created"
    Given I register cleanup DELETE "/api/v1/integrations/confluence/pages/{roadmapPageId}"

  @export @ddd
  Scenario: Publish DDD context map to Confluence
    When I POST "/api/v1/integrations/confluence/sync" with JSON body:
      """
      {
        "direction": "export",
        "contentType": "ddd-context-map",
        "spaceKey": "KDM",
        "parentPageId": "12345",
        "dryRun": false
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "syncResults[0].pageId" as "dddPageId"
    Given I register cleanup DELETE "/api/v1/integrations/confluence/pages/{dddPageId}"

  @import @adrs
  Scenario: Import Confluence pages tagged as ADRs
    When I POST "/api/v1/integrations/confluence/import" with JSON body:
      """
      {
        "spaceKey": "KDM",
        "contentTypes": ["adr"],
        "labelFilter": "adr",
        "mapTo": "governance-adrs"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "imported" should not be empty
    And the value at "metrics.pageCount" should not be empty

  @import @docs
  Scenario: Import Confluence documentation for Understanding dimension
    When I POST "/api/v1/integrations/confluence/import" with JSON body:
      """
      {
        "spaceKey": "KDM",
        "contentTypes": ["runbook", "design-doc", "onboarding"],
        "assessFreshness": true,
        "assessCoverage": true
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "metrics.documentationFreshness" should not be empty
    And the value at "metrics.documentationCoverage" should not be empty
    And the value at "metrics.totalPages" should not be empty

  @sync @idempotent
  Scenario: Sync is idempotent — re-publishing updates existing pages
    # First publish
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
    And I store the value at "syncResults[0].version" as "v1"
    And the value at "syncResults[0].status" should equal "created"
    Given I register cleanup DELETE "/api/v1/integrations/confluence/pages/{pageId}"

    # Re-publish — should update with new version
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
    And the value at "syncResults[0].pageId" should equal "{pageId}"
    And the value at "syncResults[0].status" should equal "updated"

  @config @validation
  Scenario: Reject sync request with missing space key
    When I POST "/api/v1/integrations/confluence/sync" with JSON body:
      """
      {
        "direction": "export",
        "contentType": "governance-report"
      }
      """
    Then the response status should be 400

  @config
  Scenario: Configure Confluence connection settings
    When I PUT "/api/v1/integrations/confluence/config" with JSON body:
      """
      {
        "baseUrl": "https://myteam.atlassian.net/wiki",
        "spaceKey": "KDM",
        "authType": "api-token",
        "pageHierarchy": {
          "governance-report": "Governance/Reports",
          "roadmap": "Governance/Roadmap",
          "ddd-context-map": "Architecture/DDD"
        }
      }
      """
    Then the response status should be 200
    And the value at "status" should equal "configured"

    When I GET "/api/v1/integrations/confluence/config"
    Then the response status should be 200
    And the value at "baseUrl" should equal "https://myteam.atlassian.net/wiki"
    And the value at "spaceKey" should equal "KDM"

  @dryrun
  Scenario: Dry run shows what would be published without making changes
    When I POST "/api/v1/integrations/confluence/sync" with JSON body:
      """
      {
        "direction": "export",
        "contentType": "governance-report",
        "spaceKey": "KDM",
        "parentPageId": "12345",
        "dryRun": true
      }
      """
    Then the response status should be 200
    And the value at "dryRun" should equal "true"
    And the value at "syncResults" should not be empty

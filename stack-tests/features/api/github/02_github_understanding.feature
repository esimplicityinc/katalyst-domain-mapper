@api @github-integration @ROAD-013 @CAP-007 @wip
Feature: GitHub Understanding Dimension Integration
  As an Engineering Team Lead
  I want to import GitHub documentation signals into the scanner
  So that the Understanding dimension score reflects real documentation quality and communication practices

  Background:
    Given I am authenticated as an admin via API

  @smoke @pr-quality
  Scenario: Import PR description quality data
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "understanding",
        "dataTypes": ["pr-descriptions"],
        "auth": {"type": "pat"},
        "lookbackDays": 30
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "metrics.prDescriptionQuality" should not be empty
    And the value at "metrics.averagePrDescriptionLength" should not be empty
    And the value at "metrics.linkedIssueRate" should not be empty

  @commit-quality
  Scenario: Assess commit message quality
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "understanding",
        "dataTypes": ["commit-messages"],
        "auth": {"type": "pat"},
        "lookbackDays": 30
      }
      """
    Then the response status should be 200
    And the value at "metrics.conventionalCommitsRate" should not be empty
    And the value at "metrics.commitMessageClarity" should not be empty

  @docs-presence
  Scenario: Check documentation presence
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "understanding",
        "dataTypes": ["documentation-presence"],
        "auth": {"type": "pat"}
      }
      """
    Then the response status should be 200
    And the value at "metrics.hasReadme" should not be empty
    And the value at "metrics.hasContributing" should not be empty
    And the value at "metrics.hasChangelog" should not be empty
    And the value at "metrics.adrCount" should not be empty

  @wiki
  Scenario: Import wiki pages for documentation coverage
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "dimension": "understanding",
        "dataTypes": ["wiki"],
        "auth": {"type": "pat"}
      }
      """
    Then the response status should be 200
    And the value at "metrics.wikiPageCount" should not be empty
    And the value at "metrics.wikiFreshness" should not be empty

  @export @pages
  Scenario: Publish governance report to GitHub Pages
    When I POST "/api/v1/integrations/github/sync" with JSON body:
      """
      {
        "direction": "export",
        "contentType": "governance-report",
        "owner": "esimplicity",
        "repo": "katalyst-domain-mapper",
        "target": "github-pages",
        "auth": {"type": "pat"},
        "dryRun": true
      }
      """
    Then the response status should be 200
    And the value at "syncResults[0].status" should not be empty

  @export @badge
  Scenario: Generate governance badge SVG
    When I GET "/api/v1/integrations/github/badge?owner=esimplicity&repo=katalyst-domain-mapper"
    Then the response status should be 200

  @validation
  Scenario: Reject invalid understanding import
    When I POST "/api/v1/integrations/github/import" with JSON body:
      """
      {
        "dimension": "understanding"
      }
      """
    Then the response status should be 400

@hybrid @jira-integration @ROAD-010 @CAP-005 @CAP-004 @wip
Feature: Jira Integration End-to-End
  As an Engineering Team Lead
  I want Jira metrics to enrich the scanner's Feedback dimension
  So that FOE assessments reflect real delivery data from our project management tool

  @e2e @metrics
  Scenario: Import Jira metrics and verify enriched Feedback score
    # API: Import Jira sprint metrics
    Given I am authenticated as an admin via API
    When I POST "/api/v1/integrations/jira/import" with JSON body:
      """
      {
        "jiraProject": "KDM",
        "dataTypes": ["sprints", "velocity", "cycle-time"],
        "sprintCount": 5
      }
      """
    Then the response status should be 200
    And I store the value at "importId" as "jiraImportId"

    # API: Trigger a scan that uses Jira data
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/example/repo",
        "enrichment": {
          "jira": {
            "importId": "{jiraImportId}"
          }
        }
      }
      """
    Then the response status should be 202
    And I store the value at "scanId" as "scanId"

    # UI: Verify the enriched report shows Jira data
    Given I navigate to "/reports/{scanId}"
    Then I should see text "Feedback"
    And I should see text "Jira Metrics"
    And I should see text "Cycle Time"
    And I should see text "Sprint Velocity"

  @e2e @sync
  Scenario: Export ROAD item to Jira and verify sync status in UI
    # API: Export a ROAD item to Jira
    Given I am authenticated as an admin via API
    When I POST "/api/v1/integrations/jira/sync" with JSON body:
      """
      {
        "direction": "export",
        "artifactType": "road-item",
        "artifactIds": ["ROAD-001"],
        "jiraProject": "KDM",
        "dryRun": false
      }
      """
    Then the response status should be 200
    And I store the value at "syncResults[0].jiraKey" as "jiraKey"
    Given I register cleanup DELETE "/api/v1/integrations/jira/issues/{jiraKey}"

    # UI: Verify the ROAD item shows Jira link in the governance dashboard
    Given I navigate to "/governance/roadmap"
    Then I should see text "ROAD-001"
    And I should see text "{jiraKey}"

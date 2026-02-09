@api @jira-integration @ROAD-010 @CAP-005 @wip
Feature: Jira Bidirectional Sync
  As a Platform Engineer
  I want to sync governance artifacts with Jira bidirectionally
  So that teams can manage governance work in their existing Jira workflow

  Background:
    Given I am authenticated as an admin via API

  @smoke @export
  Scenario: Export a ROAD item to Jira
    Given I generate a UUID and store as "uuid"
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
    And the response should be a JSON object
    And I store the value at "syncResults[0].jiraKey" as "jiraKey"
    And the value at "syncResults[0].status" should equal "created"
    And the value at "syncResults[0].artifactId" should equal "ROAD-001"
    Given I register cleanup DELETE "/api/v1/integrations/jira/issues/{jiraKey}"

  @import @metrics
  Scenario: Import Jira sprint metrics
    When I POST "/api/v1/integrations/jira/import" with JSON body:
      """
      {
        "jiraProject": "KDM",
        "dataTypes": ["sprints", "velocity", "cycle-time"],
        "sprintCount": 5
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "metrics.sprintCount" should not be empty
    And the value at "metrics.averageVelocity" should not be empty
    And the value at "metrics.averageCycleTime" should not be empty

  @import @issues
  Scenario: Import Jira issues as governance artifacts
    When I POST "/api/v1/integrations/jira/import" with JSON body:
      """
      {
        "jiraProject": "KDM",
        "dataTypes": ["issues"],
        "jqlFilter": "type = Epic AND status != Done",
        "mapTo": "capabilities"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "imported" should not be empty

  @sync @idempotent
  Scenario: Sync is idempotent — re-running does not create duplicates
    # First sync
    When I POST "/api/v1/integrations/jira/sync" with JSON body:
      """
      {
        "direction": "export",
        "artifactType": "road-item",
        "artifactIds": ["ROAD-002"],
        "jiraProject": "KDM",
        "dryRun": false
      }
      """
    Then the response status should be 200
    And I store the value at "syncResults[0].jiraKey" as "jiraKey"
    And the value at "syncResults[0].status" should equal "created"
    Given I register cleanup DELETE "/api/v1/integrations/jira/issues/{jiraKey}"

    # Second sync — should update, not create
    When I POST "/api/v1/integrations/jira/sync" with JSON body:
      """
      {
        "direction": "export",
        "artifactType": "road-item",
        "artifactIds": ["ROAD-002"],
        "jiraProject": "KDM",
        "dryRun": false
      }
      """
    Then the response status should be 200
    And the value at "syncResults[0].jiraKey" should equal "{jiraKey}"
    And the value at "syncResults[0].status" should equal "updated"

  @config @validation
  Scenario: Reject sync request with missing Jira project
    When I POST "/api/v1/integrations/jira/sync" with JSON body:
      """
      {
        "direction": "export",
        "artifactType": "road-item",
        "artifactIds": ["ROAD-001"]
      }
      """
    Then the response status should be 400

  @config
  Scenario: Configure Jira connection settings
    When I PUT "/api/v1/integrations/jira/config" with JSON body:
      """
      {
        "baseUrl": "https://myteam.atlassian.net",
        "projectKey": "KDM",
        "authType": "api-token",
        "fieldMappings": {
          "road-item.status": "customfield_10001",
          "road-item.phase": "customfield_10002",
          "road-item.priority": "priority"
        }
      }
      """
    Then the response status should be 200
    And the value at "status" should equal "configured"

    When I GET "/api/v1/integrations/jira/config"
    Then the response status should be 200
    And the value at "baseUrl" should equal "https://myteam.atlassian.net"
    And the value at "projectKey" should equal "KDM"

  @dryrun
  Scenario: Dry run shows what would be synced without making changes
    When I POST "/api/v1/integrations/jira/sync" with JSON body:
      """
      {
        "direction": "export",
        "artifactType": "road-item",
        "artifactIds": ["ROAD-001", "ROAD-002", "ROAD-003"],
        "jiraProject": "KDM",
        "dryRun": true
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "dryRun" should equal "true"
    And the value at "syncResults" should not be empty

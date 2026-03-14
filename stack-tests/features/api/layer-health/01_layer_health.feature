@api @layer-health @CAP-031 @wip
Feature: Layer Health API
  As an Engineering Team Lead
  I want to ingest and query layer health measurements via the API
  So that I can track quality standards across the system architecture

  # Note: Layer Health is currently schema-only (CAP-031 status: planned).
  # These scenarios are tagged @wip and will be activated when the API
  # endpoints are implemented.

  @smoke
  Scenario: Health endpoint is available
    When I GET "/api/v1/config/health"
    Then the response status should be 200

  @detail
  Scenario: Taxonomy snapshot schema supports layerHealths collection
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "health-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

  @detail
  Scenario: Ingest snapshot with layer health data
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "health-test",
        "version": "1.0.0",
        "documents": [
          {
            "name": "api-layer",
            "nodeType": "layer",
            "displayName": "API Layer",
            "description": "HTTP API boundary",
            "tags": ["infrastructure"]
          }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

  @detail
  Scenario: Query taxonomy includes layer nodes
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "health-test",
        "version": "1.0.0",
        "documents": [
          {
            "name": "domain-layer",
            "nodeType": "layer",
            "displayName": "Domain Layer",
            "description": "Core domain logic",
            "tags": ["core"]
          }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

  @error
  Scenario: Reject layer health with invalid score range
    # Placeholder for when the layer health validation endpoint is implemented
    When I GET "/api/v1/config/health"
    Then the response status should be 200

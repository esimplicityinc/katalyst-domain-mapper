@api @landscape @ROAD-044 @CAP-023
Feature: Business Landscape Graph API
  As a Domain Architect
  I want to retrieve a complete business landscape graph for a domain model
  So that I can visualize bounded contexts, capabilities, user types, and domain events in a unified view

  Background:
    # Create a domain model with representative artifacts for each scenario
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "BDD Landscape Test Model",
        "description": "Domain model created by BDD tests for landscape graph validation"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "domainModelId"
    Given I register cleanup DELETE "/api/v1/taxonomy/domain-models/{domainModelId}"

    # Add a bounded context
    When I POST "/api/v1/taxonomy/domain-models/{domainModelId}/contexts" with JSON body:
      """
      {
        "slug": "scanning",
        "title": "Scanning Context",
        "responsibility": "Orchestrates repository scanning"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    # Add a domain event
    When I POST "/api/v1/taxonomy/domain-models/{domainModelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "scan-completed",
        "title": "ScanCompleted",
        "description": "Emitted when a scan finishes successfully"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "eventId"

    # Add a workflow
    When I POST "/api/v1/taxonomy/domain-models/{domainModelId}/workflows" with JSON body:
      """
      {
        "slug": "scan-lifecycle",
        "title": "Scan Lifecycle",
        "description": "Scan job state machine",
        "states": [
          { "id": "queued", "name": "Queued", "isTerminal": false, "isError": false },
          { "id": "done", "name": "Done", "isTerminal": true, "isError": false }
        ],
        "transitions": [
          { "from": "queued", "to": "done", "label": "Complete", "isAsync": false }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "workflowId"

    # Ingest a governance snapshot with a capability so capabilities[] is non-empty
    When I POST "/api/v1/taxonomy/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-01-01T00:00:00Z",
        "project": "bdd-landscape-test",
        "capabilities": {
          "CAP-BDD-LG-001": { "id": "CAP-BDD-LG-001", "title": "BDD Landscape Graph Capability", "status": "stable" }
        },
        "userTypes": {},
        "roadItems": {},
        "stats": { "capabilities": 1, "userTypes": 0, "userStories": 0, "roadItems": 0, "integrityStatus": "pass", "integrityErrors": 0 }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "govSnapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/governance/{govSnapshotId}"

  @smoke @landscape-graph
  Scenario: Retrieve landscape graph for a known domain model
    When I GET "/api/v1/landscape/{domainModelId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "domainModelId" should equal "{domainModelId}"

  @landscape-graph
  Scenario: Landscape graph includes bounded contexts
    When I GET "/api/v1/landscape/{domainModelId}"
    Then the response status should be 200
    And I store the value at "contexts[0].id" as "firstContextId"
    And the value at "contexts[0].id" should equal "{firstContextId}"

  @landscape-graph
  Scenario: Landscape graph includes domain events
    When I GET "/api/v1/landscape/{domainModelId}"
    Then the response status should be 200
    And I store the value at "events[0].id" as "firstEventId"
    And the value at "events[0].id" should equal "{firstEventId}"

  @landscape-graph
  Scenario: Landscape graph includes capabilities
    When I GET "/api/v1/landscape/{domainModelId}"
    Then the response status should be 200
    And I store the value at "capabilities[0].id" as "firstCapId"
    And the value at "capabilities[0].id" should equal "{firstCapId}"

  @landscape-graph
  Scenario: Landscape graph includes metadata timestamps
    When I GET "/api/v1/landscape/{domainModelId}"
    Then the response status should be 200
    And I store the value at "generatedAt" as "generatedAt"
    And the value at "domainModelId" should equal "{domainModelId}"

  @landscape-graph
  Scenario: Landscape graph includes workflow data
    When I GET "/api/v1/landscape/{domainModelId}"
    Then the response status should be 200
    And I store the value at "workflows[0].id" as "firstWorkflowId"
    And the value at "workflows[0].id" should equal "{firstWorkflowId}"

  @landscape-graph
  Scenario: Returns 404 for unknown domain model ID
    When I GET "/api/v1/landscape/00000000-0000-0000-0000-000000000000"
    Then the response status should be 404

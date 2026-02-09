@api @ddd-modeling @ROAD-008 @CAP-009
Feature: Domain Model Artifacts (Aggregates, Events, Value Objects, Glossary)
  As a Platform Engineer
  I want to add aggregates, domain events, value objects, and glossary terms to a domain model
  So that the full DDD artifact hierarchy is captured and queryable

  Background:
    # Create a model with a bounded context for each scenario
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Artifacts Test Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "scanning",
        "title": "Scanning Context",
        "responsibility": "Repository scanning orchestration"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

  @aggregate
  Scenario: Add an aggregate to a domain model
    When I POST "/api/v1/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "scan-job",
        "title": "ScanJob Aggregate",
        "rootEntity": "ScanJob",
        "entities": ["ScanResult"],
        "valueObjects": ["RepositoryPath", "ScanStatus"],
        "events": ["ScanStarted", "ScanCompleted", "ScanFailed"],
        "commands": ["StartScan", "CancelScan"],
        "invariants": [{ "rule": "Only one scan per repository at a time" }],
        "sourceFile": "packages/foe-api/src/domain/ScanJob.ts",
        "status": "active"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "aggregateId"
    And the value at "slug" should equal "scan-job"
    And the value at "title" should equal "ScanJob Aggregate"

  @aggregate
  Scenario: Add an aggregate with minimal fields
    When I POST "/api/v1/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "report",
        "title": "Report Aggregate",
        "rootEntity": "FOEReport"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "slug" should equal "report"

  @domain-event
  Scenario: Add a domain event to a domain model
    When I POST "/api/v1/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "scan-completed",
        "title": "ScanCompleted",
        "description": "Emitted when a FOE scan finishes successfully",
        "payload": [
          { "field": "scanId", "type": "string" },
          { "field": "repositoryName", "type": "string" },
          { "field": "overallScore", "type": "number" }
        ],
        "consumedBy": ["reporting-context"],
        "triggers": ["StartScan command completion"],
        "sideEffects": ["Ingest report into database", "Notify team lead"]
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "eventId"
    And the value at "slug" should equal "scan-completed"
    And the value at "title" should equal "ScanCompleted"

  @domain-event
  Scenario: Add a domain event with minimal fields
    When I POST "/api/v1/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "scan-started",
        "title": "ScanStarted"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "slug" should equal "scan-started"

  @value-object
  Scenario: Add a value object to a domain model
    When I POST "/api/v1/domain-models/{modelId}/value-objects" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "dimension-score",
        "title": "DimensionScore",
        "description": "Represents a scored FOE dimension (0-100)",
        "properties": [
          { "name": "dimension", "type": "string" },
          { "name": "score", "type": "number" },
          { "name": "max", "type": "number" }
        ],
        "validationRules": ["score >= 0", "score <= max"],
        "immutable": true
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "voId"
    And the value at "slug" should equal "dimension-score"
    And the value at "title" should equal "DimensionScore"

  @glossary
  Scenario: Add a glossary term for ubiquitous language
    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "term": "Cognitive Triangle",
        "definition": "A diagnostic visualization showing the balance between Understanding, Feedback, and Confidence dimensions with minimum thresholds",
        "aliases": ["Triangle Diagnosis", "FOE Triangle"],
        "examples": ["A healthy cognitive triangle has all three dimensions above their minimum thresholds"],
        "relatedTerms": ["Dimension", "Maturity Level", "Finding"],
        "source": "FOE Field Guide"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "termId"
    And the value at "term" should equal "Cognitive Triangle"

  @glossary
  Scenario: List glossary terms for a domain model
    # Add two terms
    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      { "term": "Finding", "definition": "An evidence-based observation from a scan" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      { "term": "Gap", "definition": "An improvement opportunity identified during assessment" }
      """
    Then the response status should be 200

    # List
    When I GET "/api/v1/domain-models/{modelId}/glossary"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Full domain model retrieval includes all artifact types
    # Add one of each artifact type
    When I POST "/api/v1/domain-models/{modelId}/aggregates" with JSON body:
      """
      { "contextId": "{contextId}", "slug": "test-agg", "title": "TestAggregate", "rootEntity": "TestRoot" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models/{modelId}/events" with JSON body:
      """
      { "contextId": "{contextId}", "slug": "test-event", "title": "TestEvent" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models/{modelId}/value-objects" with JSON body:
      """
      { "contextId": "{contextId}", "slug": "test-vo", "title": "TestValueObject" }
      """
    Then the response status should be 200

    When I POST "/api/v1/domain-models/{modelId}/glossary" with JSON body:
      """
      { "term": "TestTerm", "definition": "A test glossary entry" }
      """
    Then the response status should be 200

    # Retrieve full model
    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

@api @ddd-modeling @ROAD-008 @CAP-009
Feature: Domain Artifact Updates and Deletes (Aggregates, Events, Value Objects)
  As a Platform Engineer
  I want to update and delete aggregates, domain events, and value objects
  So that the domain model stays accurate as the codebase evolves

  Background:
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Artifact Update Test Model" }
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

  # ── Aggregate Update & Delete ─────────────────────────────────────────────

  @aggregate
  Scenario: Update an aggregate's title and root entity
    When I POST "/api/v1/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "scan-job",
        "title": "ScanJob",
        "rootEntity": "ScanJob",
        "status": "draft"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "aggregateId"

    When I PUT "/api/v1/domain-models/{modelId}/aggregates/{aggregateId}" with JSON body:
      """
      {
        "slug": "scan-job",
        "title": "ScanJob Aggregate",
        "rootEntity": "ScanJob",
        "entities": ["ScanStep", "ScanResult"],
        "commands": ["StartScan", "CancelScan"],
        "status": "stable"
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the value at "aggregates[0].title" should equal "ScanJob Aggregate"
    And the value at "aggregates[0].status" should equal "stable"

  @aggregate
  Scenario: Update aggregate invariants
    When I POST "/api/v1/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "report",
        "title": "Report",
        "rootEntity": "FOEReport"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "aggregateId"

    When I PUT "/api/v1/domain-models/{modelId}/aggregates/{aggregateId}" with JSON body:
      """
      {
        "slug": "report",
        "title": "Report",
        "rootEntity": "FOEReport",
        "invariants": [
          { "rule": "Score must be between 0 and 100", "description": "FOE scores are always normalised" },
          { "rule": "Scan date cannot be in the future" }
        ]
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

  @aggregate
  Scenario: Delete an aggregate
    When I POST "/api/v1/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "temp-agg",
        "title": "Temporary Aggregate",
        "rootEntity": "TempRoot"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "aggregateId"

    When I DELETE "/api/v1/domain-models/{modelId}/aggregates/{aggregateId}"
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

  @aggregate
  Scenario: Update aggregate value object references
    When I POST "/api/v1/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "order",
        "title": "Order",
        "rootEntity": "Order"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "aggregateId"

    When I PUT "/api/v1/domain-models/{modelId}/aggregates/{aggregateId}" with JSON body:
      """
      {
        "slug": "order",
        "title": "Order",
        "rootEntity": "Order",
        "valueObjects": ["money", "address", "order-line"],
        "events": ["OrderPlaced", "OrderShipped", "OrderCancelled"]
      }
      """
    Then the response status should be 200

  # ── Domain Event Update & Delete ──────────────────────────────────────────

  @domain-event
  Scenario: Update a domain event's description and payload
    When I POST "/api/v1/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "scan-completed",
        "title": "ScanCompleted",
        "description": "Initial description"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "eventId"

    When I PUT "/api/v1/domain-models/{modelId}/events/{eventId}" with JSON body:
      """
      {
        "slug": "scan-completed",
        "title": "ScanCompleted",
        "description": "Emitted when a FOE scan finishes successfully with all scores calculated",
        "payload": [
          { "name": "scanId", "type": "string", "description": "Unique scan identifier" },
          { "name": "overallScore", "type": "number", "description": "Composite FOE score 0-100" },
          { "name": "maturityLevel", "type": "string", "description": "Mapped maturity label" }
        ],
        "consumedBy": ["reporting-context", "notification-context"],
        "triggers": ["StartScan command completion"],
        "sideEffects": ["Ingest report into database"]
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the value at "domainEvents[0].title" should equal "ScanCompleted"

  @domain-event
  Scenario: Update domain event triggers and side effects
    When I POST "/api/v1/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "scan-started",
        "title": "ScanStarted"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "eventId"

    When I PUT "/api/v1/domain-models/{modelId}/events/{eventId}" with JSON body:
      """
      {
        "slug": "scan-started",
        "title": "ScanStarted",
        "triggers": ["StartScan command", "Scheduled pipeline trigger"],
        "sideEffects": ["Lock repository for concurrent scan prevention", "Emit job ID to caller"]
      }
      """
    Then the response status should be 200

  @domain-event
  Scenario: Delete a domain event
    When I POST "/api/v1/domain-models/{modelId}/events" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "temp-event",
        "title": "TemporaryEvent"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "eventId"

    When I DELETE "/api/v1/domain-models/{modelId}/events/{eventId}"
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

  # ── Value Object Update & Delete ──────────────────────────────────────────

  @value-object
  Scenario: Update a value object's properties and validation rules
    When I POST "/api/v1/domain-models/{modelId}/value-objects" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "dimension-score",
        "title": "DimensionScore",
        "immutable": true
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "voId"

    When I PUT "/api/v1/domain-models/{modelId}/value-objects/{voId}" with JSON body:
      """
      {
        "slug": "dimension-score",
        "title": "DimensionScore",
        "description": "Represents a scored FOE dimension normalised to 0-100",
        "properties": [
          { "name": "dimension", "type": "string", "description": "Feedback, Understanding, or Confidence" },
          { "name": "score", "type": "number", "description": "Raw score 0-100" },
          { "name": "confidence", "type": "string", "description": "high, medium, or low" }
        ],
        "validationRules": ["score >= 0", "score <= 100", "dimension in [Feedback, Understanding, Confidence]"],
        "immutable": true
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the value at "valueObjects[0].title" should equal "DimensionScore"

  @value-object
  Scenario: Update a value object to mark it as mutable
    When I POST "/api/v1/domain-models/{modelId}/value-objects" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "address",
        "title": "Address",
        "immutable": true
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "voId"

    When I PUT "/api/v1/domain-models/{modelId}/value-objects/{voId}" with JSON body:
      """
      {
        "slug": "address",
        "title": "Address",
        "description": "A mailing address that can be updated",
        "properties": [
          { "name": "street", "type": "string" },
          { "name": "city", "type": "string" },
          { "name": "postcode", "type": "string" }
        ],
        "immutable": false
      }
      """
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

  @value-object
  Scenario: Delete a value object
    When I POST "/api/v1/domain-models/{modelId}/value-objects" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "temp-vo",
        "title": "TemporaryVO"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "voId"

    When I DELETE "/api/v1/domain-models/{modelId}/value-objects/{voId}"
    Then the response status should be 200

    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

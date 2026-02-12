@api @gov-validation @ROAD-005 @CAP-002
Feature: Governance Index Ingestion
  As a Platform Engineer
  I want to ingest governance index snapshots via the API
  So that governance state is persisted for trend tracking and dashboard visualization

  @smoke @ingest
  Scenario: Ingest a valid governance index snapshot
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-05T10:00:00Z",
        "project": "katalyst-domain-mapper",
        "capabilities": {
          "CAP-001": {"id": "CAP-001", "title": "FOE Report Generation", "status": "stable"},
          "CAP-002": {"id": "CAP-002", "title": "Governance Validation", "status": "planned"},
          "CAP-003": {"id": "CAP-003", "title": "Field Guide Indexing", "status": "stable"},
          "CAP-004": {"id": "CAP-004", "title": "Repository Scanning", "status": "stable"}
        },
        "personas": {
          "PER-001": {"id": "PER-001", "name": "Engineering Team Lead", "type": "human"},
          "PER-002": {"id": "PER-002", "name": "Platform Engineer", "type": "human"}
        },
        "roadItems": {
          "ROAD-001": {"id": "ROAD-001", "title": "Import Infrastructure", "status": "implementing"},
          "ROAD-002": {"id": "ROAD-002", "title": "Governance Schemas", "status": "proposed"}
        },
        "stats": {
          "capabilities": 4,
          "personas": 5,
          "userStories": 15,
          "roadItems": 9,
          "integrityStatus": "pass",
          "integrityErrors": 0
        }
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "snapshotId"
    And the value at "project" should equal "katalyst-domain-mapper"
    Given I register cleanup DELETE "/api/v1/governance/{snapshotId}"

  @snapshot
  Scenario: Retrieve the latest governance snapshot
    # First ingest a snapshot
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-05T14:00:00Z",
        "project": "katalyst-domain-mapper",
        "capabilities": {},
        "personas": {},
        "roadItems": {},
        "stats": {"capabilities": 4, "personas": 5, "userStories": 15, "roadItems": 9, "integrityStatus": "pass", "integrityErrors": 0}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/governance/{snapshotId}"

    # Retrieve latest
    When I GET "/api/v1/governance/latest"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "project" should equal "katalyst-domain-mapper"

  @snapshot @trend
  Scenario: List governance snapshots for trend tracking
    When I GET "/api/v1/governance/snapshots"
    Then the response status should be 200
    And the response should be a JSON array

  @validation
  Scenario: Reject invalid governance payload
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "not_a_valid_index": true
      }
      """
    Then the response status should be 400

@api @taxonomy-crud @CAP-019 @US-064
Feature: Taxonomy CRUD API
  As a Platform Engineer (@UT-002)
  I want to create, read, update, and delete taxonomy entities via the API
  So that I can manage the organizational taxonomy for domain mapping

  # ── Nodes ──────────────────────────────────────────────────────────────────

  @smoke
  Scenario: Ingest a taxonomy snapshot with system hierarchy
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "bdd-taxonomy-crud-test",
        "version": "1.0.0",
        "documents": [
          {
            "slug": "root-system",
            "title": "Root System",
            "type": "system",
            "children": [
              {
                "slug": "api-gateway",
                "title": "API Gateway",
                "type": "service"
              }
            ]
          }
        ],
        "teams": [],
        "persons": []
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

  Scenario: List taxonomy snapshots
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "bdd-list-test",
        "version": "1.0.0",
        "documents": [],
        "teams": [],
        "persons": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    When I GET "/api/v1/taxonomy/snapshots"
    Then the response status should be 200
    And the response should be a JSON array

  # ── Governance snapshots ───────────────────────────────────────────────────

  Scenario: Ingest a governance snapshot
    When I POST "/api/v1/taxonomy/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-01-01T00:00:00Z",
        "project": "bdd-governance-test",
        "capabilities": {
          "CAP-BDD-001": { "id": "CAP-BDD-001", "title": "Test Capability", "status": "stable" }
        },
        "userTypes": {},
        "roadItems": {},
        "stats": { "capabilities": 1, "userTypes": 0, "userStories": 0, "roadItems": 0, "integrityStatus": "pass", "integrityErrors": 0 }
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "govSnapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/governance/{govSnapshotId}"

  Scenario: List governance snapshots
    When I GET "/api/v1/taxonomy/governance/snapshots"
    Then the response status should be 200
    And the response should be a JSON array

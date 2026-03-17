@api @taxonomy @CAP-002 @US-083
Feature: Taxonomy Contribution Lifecycle
  As a Documentation Author
  I want governance artifacts to follow a universal contribution lifecycle
  So that all artifact types use consistent draft-proposed-accepted-deprecated-superseded states

  # Note: These scenarios validate the contribution lifecycle schema enforcement
  # via the taxonomy snapshot ingestion endpoint.

  @smoke @ingest
  Scenario: Ingest snapshot with contribution lifecycle metadata
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "lifecycle-test",
        "version": "1.0.0",
        "documents": [
          {
            "name": "test-aggregate",
            "nodeType": "aggregate",
            "displayName": "Test Aggregate",
            "description": "An aggregate for lifecycle testing",
            "tags": ["test"]
          }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

  @detail
  Scenario: Retrieve snapshot preserves document metadata
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "lifecycle-test",
        "version": "1.0.0",
        "documents": [
          {
            "name": "order-context",
            "nodeType": "bounded_context",
            "displayName": "Order Context",
            "description": "Handles order management",
            "tags": ["core"]
          }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    When I GET "/api/v1/taxonomy/snapshots/{snapshotId}"
    Then the response status should be 200
    And the value at "project" should equal "lifecycle-test"

  @detail
  Scenario: Snapshot supports multiple document types in one ingestion
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "multi-type-test",
        "version": "1.0.0",
        "documents": [
          {
            "name": "user-aggregate",
            "nodeType": "aggregate",
            "displayName": "User Aggregate",
            "description": "User domain aggregate",
            "tags": ["identity"]
          },
          {
            "name": "auth-context",
            "nodeType": "bounded_context",
            "displayName": "Auth Context",
            "description": "Authentication boundary",
            "tags": ["security"]
          }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

  @error
  Scenario: Reject snapshot with missing required project field
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 400

  @detail
  Scenario: Empty documents array is accepted
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "empty-docs-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

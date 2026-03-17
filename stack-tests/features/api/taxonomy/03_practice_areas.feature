@api @practice-areas @CAP-032 @ROAD-048 @US-093
Feature: Practice Areas CRUD API
  As a Platform Engineer
  I want to manage practice areas within a taxonomy snapshot
  So that organizational capabilities are structured and queryable for domain mapping

  @smoke @crud
  Scenario: Create a practice area
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "practice-area-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Create a practice area
    When I POST "/api/v1/taxonomy/practice-areas?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "testing",
        "title": "Testing",
        "canonical": true
      }
      """
    Then the response status should be 201
    And the response should be a JSON object
    And I store the value at "id" as "paId"
    And the value at "name" should equal "testing"
    And the value at "title" should equal "Testing"
    And the value at "canonical" should equal "true"

  @list
  Scenario: List practice areas for a snapshot
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "practice-area-list-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Create a practice area
    When I POST "/api/v1/taxonomy/practice-areas?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "devops",
        "title": "DevOps",
        "canonical": true
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "paId"

    # List all practice areas
    When I GET "/api/v1/taxonomy/practice-areas?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON array

  @detail
  Scenario: Get practice area by ID
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "practice-area-detail-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Create a practice area
    When I POST "/api/v1/taxonomy/practice-areas?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "architecture",
        "title": "Architecture",
        "canonical": true
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "paId"

    # Get practice area by ID
    When I GET "/api/v1/taxonomy/practice-areas/{paId}?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "id" should equal "{paId}"
    And the value at "name" should equal "architecture"
    And the value at "title" should equal "Architecture"
    And the value at "canonical" should equal "true"

  @crud
  Scenario: Update a practice area
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "practice-area-update-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Create a practice area
    When I POST "/api/v1/taxonomy/practice-areas?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "security",
        "title": "Security",
        "canonical": false
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "paId"

    # Update the practice area title
    When I PUT "/api/v1/taxonomy/practice-areas/{paId}?snapshotId={snapshotId}" with JSON body:
      """
      {
        "title": "Security Engineering"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "title" should equal "Security Engineering"

  @crud
  Scenario: Delete a practice area
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "practice-area-delete-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Create a practice area
    When I POST "/api/v1/taxonomy/practice-areas?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "observability",
        "title": "Observability",
        "canonical": true
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "paId"

    # Delete the practice area
    When I DELETE "/api/v1/taxonomy/practice-areas/{paId}?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "message" should contain "deleted"

  @error
  Scenario: Get non-existent practice area returns 404
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "practice-area-404-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Attempt to get a non-existent practice area
    When I GET "/api/v1/taxonomy/practice-areas/PA-NONEXISTENT?snapshotId={snapshotId}"
    Then the response status should be 404

  @error
  Scenario: Create practice area with missing required fields returns 400
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "practice-area-400-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Attempt to create a practice area without required name field
    When I POST "/api/v1/taxonomy/practice-areas?snapshotId={snapshotId}" with JSON body:
      """
      {
        "canonical": true
      }
      """
    Then the response status should be 400

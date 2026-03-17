@api @competencies @CAP-032 @ROAD-048
Feature: Competencies CRUD API
  As a Platform Engineer
  I want to manage competencies within practice areas
  So that skill requirements are structured and trackable across the taxonomy

  @smoke @crud
  Scenario: Create a competency with level definitions
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "competency-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Create a practice area first (competencies belong to a practice area)
    When I POST "/api/v1/taxonomy/practice-areas?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "testing",
        "title": "Testing",
        "canonical": true
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "paId"

    # Create a competency
    When I POST "/api/v1/taxonomy/competencies?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "unit-testing",
        "title": "Unit Testing",
        "practiceAreaId": "{paId}",
        "competencyType": "practice",
        "levelDefinitions": [
          {
            "level": "basic",
            "description": "Writes simple unit tests for individual functions",
            "skillCount": 0
          },
          {
            "level": "intermediate",
            "description": "Uses mocking and test doubles effectively",
            "skillCount": 0
          },
          {
            "level": "advanced",
            "description": "Designs testable architectures and mentors others",
            "skillCount": 0
          }
        ]
      }
      """
    Then the response status should be 201
    And the response should be a JSON object
    And I store the value at "id" as "compId"
    And the value at "name" should equal "unit-testing"
    And the value at "title" should equal "Unit Testing"
    And the value at "competencyType" should equal "practice"

  @list
  Scenario: List competencies for a snapshot
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "competency-list-test",
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

    # Create a competency
    When I POST "/api/v1/taxonomy/competencies?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "ci-cd",
        "title": "CI/CD",
        "practiceAreaId": "{paId}",
        "competencyType": "practice",
        "levelDefinitions": [
          {
            "level": "basic",
            "description": "Understands basic pipeline concepts",
            "skillCount": 0
          },
          {
            "level": "intermediate",
            "description": "Configures multi-stage pipelines",
            "skillCount": 0
          },
          {
            "level": "advanced",
            "description": "Designs deployment strategies and rollback mechanisms",
            "skillCount": 0
          }
        ]
      }
      """
    Then the response status should be 201

    # List all competencies
    When I GET "/api/v1/taxonomy/competencies?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON array

  @detail
  Scenario: Get competency by ID
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "competency-detail-test",
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

    # Create a competency
    When I POST "/api/v1/taxonomy/competencies?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "domain-modeling",
        "title": "Domain Modeling",
        "practiceAreaId": "{paId}",
        "competencyType": "practice",
        "levelDefinitions": [
          {
            "level": "basic",
            "description": "Identifies entities and value objects",
            "skillCount": 0
          },
          {
            "level": "intermediate",
            "description": "Defines aggregate boundaries and bounded contexts",
            "skillCount": 0
          },
          {
            "level": "advanced",
            "description": "Designs event-driven domain models with CQRS",
            "skillCount": 0
          }
        ]
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "compId"

    # Get competency by ID
    When I GET "/api/v1/taxonomy/competencies/{compId}?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "id" should equal "{compId}"
    And the value at "name" should equal "domain-modeling"
    And the value at "title" should equal "Domain Modeling"
    And the value at "competencyType" should equal "practice"

  @crud
  Scenario: Update a competency
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "competency-update-test",
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
    And I store the value at "id" as "paId"

    # Create a competency
    When I POST "/api/v1/taxonomy/competencies?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "integration-testing",
        "title": "Integration Testing",
        "practiceAreaId": "{paId}",
        "competencyType": "practice",
        "levelDefinitions": [
          {
            "level": "basic",
            "description": "Writes basic integration tests",
            "skillCount": 0
          },
          {
            "level": "intermediate",
            "description": "Tests service boundaries and contracts",
            "skillCount": 0
          },
          {
            "level": "advanced",
            "description": "Designs comprehensive integration test strategies",
            "skillCount": 0
          }
        ]
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "compId"

    # Update the competency title
    When I PUT "/api/v1/taxonomy/competencies/{compId}?snapshotId={snapshotId}" with JSON body:
      """
      {
        "title": "Integration & Contract Testing"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "title" should equal "Integration & Contract Testing"

  @crud
  Scenario: Delete a competency
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "competency-delete-test",
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
        "canonical": true
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "paId"

    # Create a competency
    When I POST "/api/v1/taxonomy/competencies?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "threat-modeling",
        "title": "Threat Modeling",
        "practiceAreaId": "{paId}",
        "competencyType": "practice",
        "levelDefinitions": [
          {
            "level": "basic",
            "description": "Identifies common threat vectors",
            "skillCount": 0
          },
          {
            "level": "intermediate",
            "description": "Conducts STRIDE analysis",
            "skillCount": 0
          },
          {
            "level": "advanced",
            "description": "Designs security architectures with defense in depth",
            "skillCount": 0
          }
        ]
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "compId"

    # Delete the competency
    When I DELETE "/api/v1/taxonomy/competencies/{compId}?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "message" should contain "deleted"

  @error
  Scenario: Get non-existent competency returns 404
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "competency-404-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Attempt to get a non-existent competency
    When I GET "/api/v1/taxonomy/competencies/COMP-NONEXISTENT?snapshotId={snapshotId}"
    Then the response status should be 404

  @list @filter
  Scenario: Filter competencies by practice area ID
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "competency-filter-test",
        "version": "1.0.0",
        "documents": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Create two practice areas
    When I POST "/api/v1/taxonomy/practice-areas?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "testing",
        "title": "Testing",
        "canonical": true
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "paTestingId"

    When I POST "/api/v1/taxonomy/practice-areas?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "devops",
        "title": "DevOps",
        "canonical": true
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "paDevopsId"

    # Create a competency under testing
    When I POST "/api/v1/taxonomy/competencies?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "unit-testing",
        "title": "Unit Testing",
        "practiceAreaId": "{paTestingId}",
        "competencyType": "practice",
        "levelDefinitions": [
          {
            "level": "basic",
            "description": "Writes simple unit tests",
            "skillCount": 0
          },
          {
            "level": "intermediate",
            "description": "Uses mocking effectively",
            "skillCount": 0
          },
          {
            "level": "advanced",
            "description": "Designs testable architectures",
            "skillCount": 0
          }
        ]
      }
      """
    Then the response status should be 201

    # Create a competency under devops
    When I POST "/api/v1/taxonomy/competencies?snapshotId={snapshotId}" with JSON body:
      """
      {
        "name": "container-orchestration",
        "title": "Container Orchestration",
        "practiceAreaId": "{paDevopsId}",
        "competencyType": "practice",
        "levelDefinitions": [
          {
            "level": "basic",
            "description": "Runs containers locally",
            "skillCount": 0
          },
          {
            "level": "intermediate",
            "description": "Manages Kubernetes deployments",
            "skillCount": 0
          },
          {
            "level": "advanced",
            "description": "Designs multi-cluster strategies",
            "skillCount": 0
          }
        ]
      }
      """
    Then the response status should be 201

    # Filter competencies by the testing practice area
    When I GET "/api/v1/taxonomy/competencies?snapshotId={snapshotId}&practiceAreaId={paTestingId}"
    Then the response status should be 200
    And the response should be a JSON array
    And the value at "[0].name" should equal "unit-testing"

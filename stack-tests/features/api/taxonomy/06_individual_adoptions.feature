@api @individual-adoptions @CAP-032 @ROAD-048 @US-096
Feature: Individual Adoptions CRUD API
  As a Platform Engineer
  I want to track which practice areas individuals have adopted and their roles
  So that personal capability growth and expertise are measurable across the organization

  @smoke @crud
  Scenario: Create an individual adoption
    # Seed a taxonomy snapshot with a person
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "individual-adoption-test",
        "version": "1.0.0",
        "documents": [],
        "persons": [
          {
            "name": "jane-doe",
            "displayName": "Jane Doe",
            "email": "jane@example.com",
            "role": "Senior Engineer"
          }
        ]
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

    # Create an individual adoption
    When I POST "/api/v1/taxonomy/persons/jane-doe/adoptions?snapshotId={snapshotId}" with JSON body:
      """
      {
        "personName": "jane-doe",
        "practiceAreaId": "{paId}",
        "role": "member"
      }
      """
    Then the response status should be 201
    And the response should be a JSON object
    And I store the value at "id" as "adoptionId"
    And the value at "personName" should equal "jane-doe"
    And the value at "practiceAreaId" should equal "{paId}"
    And the value at "role" should equal "member"

  @list
  Scenario: List individual adoptions for a person
    # Seed a taxonomy snapshot with a person
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "individual-adoption-list-test",
        "version": "1.0.0",
        "documents": [],
        "persons": [
          {
            "name": "john-smith",
            "displayName": "John Smith",
            "email": "john@example.com",
            "role": "Developer"
          }
        ]
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

    # Create an individual adoption
    When I POST "/api/v1/taxonomy/persons/john-smith/adoptions?snapshotId={snapshotId}" with JSON body:
      """
      {
        "personName": "john-smith",
        "practiceAreaId": "{paId}",
        "role": "advocate"
      }
      """
    Then the response status should be 201

    # List adoptions for the person
    When I GET "/api/v1/taxonomy/persons/john-smith/adoptions?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON array

  @detail
  Scenario: Get specific individual adoption by person and practice area
    # Seed a taxonomy snapshot with a person
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "individual-adoption-detail-test",
        "version": "1.0.0",
        "documents": [],
        "persons": [
          {
            "name": "jane-doe",
            "displayName": "Jane Doe",
            "email": "jane@example.com",
            "role": "Senior Engineer"
          }
        ]
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

    # Create an individual adoption
    When I POST "/api/v1/taxonomy/persons/jane-doe/adoptions?snapshotId={snapshotId}" with JSON body:
      """
      {
        "personName": "jane-doe",
        "practiceAreaId": "{paId}",
        "role": "sme"
      }
      """
    Then the response status should be 201

    # Get specific adoption by person and practice area
    When I GET "/api/v1/taxonomy/persons/jane-doe/adoptions/{paId}?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "personName" should equal "jane-doe"
    And the value at "practiceAreaId" should equal "{paId}"
    And the value at "role" should equal "sme"

  @crud
  Scenario: Update individual adoption role
    # Seed a taxonomy snapshot with a person
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "individual-adoption-update-test",
        "version": "1.0.0",
        "documents": [],
        "persons": [
          {
            "name": "alex-kumar",
            "displayName": "Alex Kumar",
            "email": "alex@example.com",
            "role": "Developer"
          }
        ]
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

    # Create an individual adoption with "member" role
    When I POST "/api/v1/taxonomy/persons/alex-kumar/adoptions?snapshotId={snapshotId}" with JSON body:
      """
      {
        "personName": "alex-kumar",
        "practiceAreaId": "{paId}",
        "role": "member"
      }
      """
    Then the response status should be 201

    # Update adoption role to "lead"
    When I PUT "/api/v1/taxonomy/persons/alex-kumar/adoptions/{paId}?snapshotId={snapshotId}" with JSON body:
      """
      {
        "role": "lead"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "role" should equal "lead"

  @crud
  Scenario: Delete an individual adoption
    # Seed a taxonomy snapshot with a person
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "individual-adoption-delete-test",
        "version": "1.0.0",
        "documents": [],
        "persons": [
          {
            "name": "john-smith",
            "displayName": "John Smith",
            "email": "john@example.com",
            "role": "Developer"
          }
        ]
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

    # Create an individual adoption
    When I POST "/api/v1/taxonomy/persons/john-smith/adoptions?snapshotId={snapshotId}" with JSON body:
      """
      {
        "personName": "john-smith",
        "practiceAreaId": "{paId}",
        "role": "advocate"
      }
      """
    Then the response status should be 201

    # Delete the individual adoption
    When I DELETE "/api/v1/taxonomy/persons/john-smith/adoptions/{paId}?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "message" should contain "deleted"

  @error
  Scenario: Get non-existent individual adoption returns 404
    # Seed a taxonomy snapshot with a person
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "individual-adoption-404-test",
        "version": "1.0.0",
        "documents": [],
        "persons": [
          {
            "name": "jane-doe",
            "displayName": "Jane Doe",
            "email": "jane@example.com",
            "role": "Senior Engineer"
          }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Attempt to get a non-existent adoption
    When I GET "/api/v1/taxonomy/persons/jane-doe/adoptions/PA-NONEXISTENT?snapshotId={snapshotId}"
    Then the response status should be 404

@api @team-adoptions @CAP-032 @ROAD-048
Feature: Team Adoptions CRUD API
  As a Platform Engineer
  I want to track which practice areas teams have adopted and at what level
  So that organizational capability adoption is measurable across teams

  @smoke @crud
  Scenario: Create a team adoption
    # Seed a taxonomy snapshot with a team
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "team-adoption-test",
        "version": "1.0.0",
        "documents": [],
        "teams": [
          {
            "name": "platform-team",
            "displayName": "Platform Team",
            "teamType": "platform",
            "description": "Owns shared infrastructure",
            "focusArea": "Developer experience",
            "communicationChannels": ["#platform-eng"],
            "ownedNodes": [],
            "members": []
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

    # Create a team adoption
    When I POST "/api/v1/taxonomy/teams/platform-team/adoptions?snapshotId={snapshotId}" with JSON body:
      """
      {
        "teamName": "platform-team",
        "practiceAreaId": "{paId}",
        "adoptionLevel": "learning"
      }
      """
    Then the response status should be 201
    And the response should be a JSON object
    And I store the value at "id" as "adoptionId"
    And the value at "teamName" should equal "platform-team"
    And the value at "practiceAreaId" should equal "{paId}"
    And the value at "adoptionLevel" should equal "learning"

  @list
  Scenario: List team adoptions for a team
    # Seed a taxonomy snapshot with a team
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "team-adoption-list-test",
        "version": "1.0.0",
        "documents": [],
        "teams": [
          {
            "name": "stream-team",
            "displayName": "Stream-Aligned Team",
            "teamType": "stream-aligned",
            "description": "Delivers customer-facing features",
            "focusArea": "Order management",
            "communicationChannels": ["#stream-orders"],
            "ownedNodes": [],
            "members": []
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

    # Create a team adoption
    When I POST "/api/v1/taxonomy/teams/stream-team/adoptions?snapshotId={snapshotId}" with JSON body:
      """
      {
        "teamName": "stream-team",
        "practiceAreaId": "{paId}",
        "adoptionLevel": "practicing"
      }
      """
    Then the response status should be 201

    # List adoptions for the team
    When I GET "/api/v1/taxonomy/teams/stream-team/adoptions?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON array

  @detail
  Scenario: Get specific team adoption by team and practice area
    # Seed a taxonomy snapshot with a team
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "team-adoption-detail-test",
        "version": "1.0.0",
        "documents": [],
        "teams": [
          {
            "name": "platform-team",
            "displayName": "Platform Team",
            "teamType": "platform",
            "description": "Owns shared infrastructure",
            "focusArea": "Developer experience",
            "communicationChannels": ["#platform-eng"],
            "ownedNodes": [],
            "members": []
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

    # Create a team adoption
    When I POST "/api/v1/taxonomy/teams/platform-team/adoptions?snapshotId={snapshotId}" with JSON body:
      """
      {
        "teamName": "platform-team",
        "practiceAreaId": "{paId}",
        "adoptionLevel": "mastered"
      }
      """
    Then the response status should be 201

    # Get specific adoption by team and practice area
    When I GET "/api/v1/taxonomy/teams/platform-team/adoptions/{paId}?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "teamName" should equal "platform-team"
    And the value at "practiceAreaId" should equal "{paId}"
    And the value at "adoptionLevel" should equal "mastered"

  @crud
  Scenario: Update team adoption level
    # Seed a taxonomy snapshot with a team
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "team-adoption-update-test",
        "version": "1.0.0",
        "documents": [],
        "teams": [
          {
            "name": "platform-team",
            "displayName": "Platform Team",
            "teamType": "platform",
            "description": "Owns shared infrastructure",
            "focusArea": "Developer experience",
            "communicationChannels": ["#platform-eng"],
            "ownedNodes": [],
            "members": []
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

    # Create a team adoption at "aware" level
    When I POST "/api/v1/taxonomy/teams/platform-team/adoptions?snapshotId={snapshotId}" with JSON body:
      """
      {
        "teamName": "platform-team",
        "practiceAreaId": "{paId}",
        "adoptionLevel": "aware"
      }
      """
    Then the response status should be 201

    # Update adoption level to "practicing"
    When I PUT "/api/v1/taxonomy/teams/platform-team/adoptions/{paId}?snapshotId={snapshotId}" with JSON body:
      """
      {
        "adoptionLevel": "practicing"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "adoptionLevel" should equal "practicing"

  @crud
  Scenario: Delete a team adoption
    # Seed a taxonomy snapshot with a team
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "team-adoption-delete-test",
        "version": "1.0.0",
        "documents": [],
        "teams": [
          {
            "name": "platform-team",
            "displayName": "Platform Team",
            "teamType": "platform",
            "description": "Owns shared infrastructure",
            "focusArea": "Developer experience",
            "communicationChannels": ["#platform-eng"],
            "ownedNodes": [],
            "members": []
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

    # Create a team adoption
    When I POST "/api/v1/taxonomy/teams/platform-team/adoptions?snapshotId={snapshotId}" with JSON body:
      """
      {
        "teamName": "platform-team",
        "practiceAreaId": "{paId}",
        "adoptionLevel": "learning"
      }
      """
    Then the response status should be 201

    # Delete the team adoption
    When I DELETE "/api/v1/taxonomy/teams/platform-team/adoptions/{paId}?snapshotId={snapshotId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "message" should contain "deleted"

  @error
  Scenario: Get non-existent team adoption returns 404
    # Seed a taxonomy snapshot with a team
    When I POST "/api/v1/taxonomy/snapshots" with JSON body:
      """
      {
        "project": "team-adoption-404-test",
        "version": "1.0.0",
        "documents": [],
        "teams": [
          {
            "name": "platform-team",
            "displayName": "Platform Team",
            "teamType": "platform",
            "description": "Owns shared infrastructure",
            "focusArea": "Developer experience",
            "communicationChannels": ["#platform-eng"],
            "ownedNodes": [],
            "members": []
          }
        ]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/taxonomy/snapshots/{snapshotId}"

    # Attempt to get a non-existent adoption
    When I GET "/api/v1/taxonomy/teams/platform-team/adoptions/PA-NONEXISTENT?snapshotId={snapshotId}"
    Then the response status should be 404

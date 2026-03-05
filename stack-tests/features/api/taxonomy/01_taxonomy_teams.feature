@api @taxonomy-teams
Feature: Taxonomy Teams and Persons API
  As a Platform Engineer
  I want to ingest taxonomy snapshots and query teams and persons via the API
  So that organizational structure is captured and queryable for domain mapping

  @smoke @ingest
  Scenario: Ingest taxonomy snapshot with teams and persons
    When I POST "/api/v1/taxonomy" with JSON body:
      """
      {
        "project": "test-project",
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
            "ownedNodes": ["api-gateway"],
            "members": [
              { "person": "jane-doe", "role": "Tech Lead" },
              { "person": "john-smith", "role": "Developer" }
            ]
          },
          {
            "name": "stream-team",
            "displayName": "Stream-Aligned Team",
            "teamType": "stream-aligned",
            "description": "Delivers customer-facing features",
            "focusArea": "Order management",
            "communicationChannels": ["#stream-orders"],
            "ownedNodes": ["order-service"],
            "members": [
              { "person": "jane-doe", "role": "Architect" },
              { "person": "alex-kumar", "role": "Developer" }
            ]
          }
        ],
        "persons": [
          {
            "name": "jane-doe",
            "displayName": "Jane Doe",
            "email": "jane@example.com",
            "role": "Senior Engineer"
          },
          {
            "name": "john-smith",
            "displayName": "John Smith",
            "email": "john@example.com",
            "role": "Developer"
          },
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
    And the response should be a JSON object
    And I store the value at "id" as "snapshotId"
    And the value at "project" should equal "test-project"
    Given I register cleanup DELETE "/api/v1/taxonomy/{snapshotId}"

  @list
  Scenario: List all teams from latest snapshot
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy" with JSON body:
      """
      {
        "project": "test-project",
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
            "ownedNodes": ["api-gateway"],
            "members": [
              { "person": "jane-doe", "role": "Tech Lead" }
            ]
          },
          {
            "name": "stream-team",
            "displayName": "Stream-Aligned Team",
            "teamType": "stream-aligned",
            "description": "Delivers customer-facing features",
            "focusArea": "Order management",
            "communicationChannels": ["#stream-orders"],
            "ownedNodes": ["order-service"],
            "members": [
              { "person": "alex-kumar", "role": "Developer" }
            ]
          }
        ],
        "persons": [
          {
            "name": "jane-doe",
            "displayName": "Jane Doe",
            "email": "jane@example.com",
            "role": "Senior Engineer"
          },
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
    Given I register cleanup DELETE "/api/v1/taxonomy/{snapshotId}"

    # List all teams
    When I GET "/api/v1/taxonomy/teams"
    Then the response status should be 200
    And the response should be a JSON array

  @detail
  Scenario: Get team by name with members
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy" with JSON body:
      """
      {
        "project": "test-project",
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
            "ownedNodes": ["api-gateway"],
            "members": [
              { "person": "jane-doe", "role": "Tech Lead" },
              { "person": "john-smith", "role": "Developer" }
            ]
          }
        ],
        "persons": [
          {
            "name": "jane-doe",
            "displayName": "Jane Doe",
            "email": "jane@example.com",
            "role": "Senior Engineer"
          },
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
    Given I register cleanup DELETE "/api/v1/taxonomy/{snapshotId}"

    # Get team by name
    When I GET "/api/v1/taxonomy/teams/platform-team"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "displayName" should equal "Platform Team"
    And the value at "teamType" should equal "platform"
    And the value at "members[0].role" should equal "Tech Lead"
    And the value at "members[1].role" should equal "Developer"

  @error
  Scenario: Get non-existent team returns 404
    When I GET "/api/v1/taxonomy/teams/nonexistent"
    Then the response status should be 404

  @list
  Scenario: List all persons with team memberships
    # Seed a taxonomy snapshot
    When I POST "/api/v1/taxonomy" with JSON body:
      """
      {
        "project": "test-project",
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
            "ownedNodes": ["api-gateway"],
            "members": [
              { "person": "jane-doe", "role": "Tech Lead" }
            ]
          }
        ],
        "persons": [
          {
            "name": "jane-doe",
            "displayName": "Jane Doe",
            "email": "jane@example.com",
            "role": "Senior Engineer"
          },
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
    Given I register cleanup DELETE "/api/v1/taxonomy/{snapshotId}"

    # List all persons
    When I GET "/api/v1/taxonomy/persons"
    Then the response status should be 200
    And the response should be a JSON array

  @detail @multi-team
  Scenario: Person in multiple teams shows all team memberships
    # Seed a taxonomy snapshot where jane-doe is in both teams
    When I POST "/api/v1/taxonomy" with JSON body:
      """
      {
        "project": "test-project",
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
            "ownedNodes": ["api-gateway"],
            "members": [
              { "person": "jane-doe", "role": "Tech Lead" }
            ]
          },
          {
            "name": "stream-team",
            "displayName": "Stream-Aligned Team",
            "teamType": "stream-aligned",
            "description": "Delivers customer-facing features",
            "focusArea": "Order management",
            "communicationChannels": ["#stream-orders"],
            "ownedNodes": ["order-service"],
            "members": [
              { "person": "jane-doe", "role": "Architect" }
            ]
          }
        ],
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
    Given I register cleanup DELETE "/api/v1/taxonomy/{snapshotId}"

    # Verify jane-doe has memberships in both teams
    When I GET "/api/v1/taxonomy/persons"
    Then the response status should be 200
    And the response should be a JSON array
    And the value at "[0].name" should equal "jane-doe"
    And the value at "[0].teams[0].team" should equal "platform-team"
    And the value at "[0].teams[0].role" should equal "Tech Lead"
    And the value at "[0].teams[1].team" should equal "stream-team"
    And the value at "[0].teams[1].role" should equal "Architect"

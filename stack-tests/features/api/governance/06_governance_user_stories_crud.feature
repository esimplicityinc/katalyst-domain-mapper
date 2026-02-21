@api @gov-validation @ROAD-046 @CAP-025
Feature: Governance User Stories CRUD API
  As a Product Owner
  I want to manage user stories via API
  So that acceptance criteria and persona-capability mappings are persisted and queryable

  Background:
    # Ensure a governance snapshot exists so CRUD operations are available
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-05T10:00:00Z",
        "project": "katalyst-domain-mapper",
        "capabilities": {},
        "personas": {},
        "roadItems": {},
        "stats": {"capabilities": 0, "personas": 0, "userStories": 0, "roadItems": 0, "integrityStatus": "pass", "integrityErrors": 0}
      }
      """
    Then the response status should be 200

  @smoke @user-stories-list
  Scenario: List all user stories returns an array
    When I GET "/api/v1/governance/user-stories"
    Then the response status should be 200
    And the response should be a JSON array

  @user-stories-crud
  Scenario: Create a new user story
    When I POST "/api/v1/governance/user-stories" with JSON body:
      """
      {
        "id": "US-BDD-001",
        "title": "BDD Test User Story",
        "persona": "PER-BDD-CREATE",
        "status": "draft",
        "capabilities": ["CAP-001"],
        "useCases": [],
        "acceptanceCriteria": ["Given a test, When executed, Then it passes"],
        "taxonomyNode": null
      }
      """
    Then the response status should be 201
    And the response should be a JSON object
    And the value at "id" should equal "US-BDD-001"
    And the value at "title" should equal "BDD Test User Story"
    And the value at "status" should equal "draft"
    Given I register cleanup DELETE "/api/v1/governance/user-stories/US-BDD-001"

  @user-stories-crud
  Scenario: Update an existing user story
    When I POST "/api/v1/governance/user-stories" with JSON body:
      """
      {
        "id": "US-BDD-002",
        "title": "Story to Update",
        "persona": "PER-BDD-UPDATE",
        "status": "draft",
        "capabilities": [],
        "useCases": [],
        "acceptanceCriteria": [],
        "taxonomyNode": null
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "storyId"
    Given I register cleanup DELETE "/api/v1/governance/user-stories/{storyId}"

    When I PUT "/api/v1/governance/user-stories/{storyId}" with JSON body:
      """
      {
        "title": "Updated Story Title",
        "status": "approved"
      }
      """
    Then the response status should be 200
    And the value at "title" should equal "Updated Story Title"
    And the value at "status" should equal "approved"

  @user-stories-crud
  Scenario: Delete a user story
    When I POST "/api/v1/governance/user-stories" with JSON body:
      """
      {
        "id": "US-BDD-003",
        "title": "Story to Delete",
        "persona": "PER-BDD-DELETE",
        "status": "draft",
        "capabilities": [],
        "useCases": [],
        "acceptanceCriteria": [],
        "taxonomyNode": null
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "storyToDeleteId"

    When I DELETE "/api/v1/governance/user-stories/{storyToDeleteId}"
    Then the response status should be 200
    And the value at "id" should equal "{storyToDeleteId}"

  @user-stories-get
  Scenario: Retrieve a user story by ID
    When I POST "/api/v1/governance/user-stories" with JSON body:
      """
      {
        "id": "US-BDD-GET",
        "title": "Story for GET test",
        "persona": "PER-BDD-GET",
        "status": "draft",
        "capabilities": [],
        "useCases": [],
        "acceptanceCriteria": [],
        "taxonomyNode": null
      }
      """
    Then the response status should be 201
    Given I register cleanup DELETE "/api/v1/governance/user-stories/US-BDD-GET"

    When I GET "/api/v1/governance/user-stories/US-BDD-GET"
    Then the response status should be 200
    And the value at "id" should equal "US-BDD-GET"
    And the value at "title" should equal "Story for GET test"

  @user-stories-list @filter
  Scenario: Filter user stories by status
    When I POST "/api/v1/governance/user-stories" with JSON body:
      """
      {
        "id": "US-BDD-FILTER",
        "title": "Story for Filter test",
        "persona": "PER-BDD-FILTER",
        "status": "approved",
        "capabilities": [],
        "useCases": [],
        "acceptanceCriteria": [],
        "taxonomyNode": null
      }
      """
    Then the response status should be 201
    Given I register cleanup DELETE "/api/v1/governance/user-stories/US-BDD-FILTER"

    When I GET "/api/v1/governance/user-stories?status=approved"
    Then the response status should be 200
    And the response should be a JSON array

  @user-stories-get
  Scenario: Returns 404 for unknown user story ID
    When I GET "/api/v1/governance/user-stories/US-NONEXISTENT"
    Then the response status should be 404

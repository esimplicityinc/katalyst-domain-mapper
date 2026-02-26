@api @landscape-lint @ROAD-044 @CAP-024
Feature: Landscape Domain Linter API
  As a Domain Architect
  I want to lint a domain model's landscape for integrity issues
  So that I can identify broken references, coverage gaps, and semantic inconsistencies

  Background:
    # Create a domain model
    When I POST "/api/v1/domain-models" with JSON body:
      """
      {
        "name": "BDD Landscape Lint Test Model",
        "description": "Domain model created by BDD tests for lint validation"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "domainModelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{domainModelId}"

    # Ingest a governance snapshot with a persona but no user stories.
    # The 'persona-has-stories' coverage rule fires a warning for every
    # persona that is not referenced by at least one user story, guaranteeing
    # at least one lint finding for the scenarios that access findings[0].
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-01-01T00:00:00Z",
        "project": "bdd-lint-test",
        "capabilities": {},
        "personas": {
          "PER-BDD-LINT-001": { "id": "PER-BDD-LINT-001", "name": "BDD Lint Test Persona", "type": "human" }
        },
        "roadItems": {},
        "stats": { "capabilities": 0, "personas": 1, "userStories": 0, "roadItems": 0, "integrityStatus": "pass", "integrityErrors": 0 }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "govSnapshotId"
    Given I register cleanup DELETE "/api/v1/governance/{govSnapshotId}"

  @smoke @lint
  Scenario: Lint a known domain model and receive a structured report
    When I GET "/api/v1/landscape/{domainModelId}/lint"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "domainModelId" should equal "{domainModelId}"

  @lint
  Scenario: Lint report includes findings array
    When I GET "/api/v1/landscape/{domainModelId}/lint"
    Then the response status should be 200
    And I store the value at "findings[0].rule" as "firstFindingRule"
    And the value at "findings[0].rule" should equal "{firstFindingRule}"

  @lint
  Scenario: Lint report references governance and taxonomy snapshots
    When I GET "/api/v1/landscape/{domainModelId}/lint"
    Then the response status should be 200
    And I store the value at "governanceSnapshotId" as "govSnapId"
    And I store the value at "domainModelId" as "lintDomainModelId"
    And the value at "domainModelId" should equal "{domainModelId}"

  @lint @filter
  Scenario: Lint results can be filtered by severity
    When I GET "/api/v1/landscape/{domainModelId}/lint?severity=warning"
    Then the response status should be 200
    And the response should be a JSON object

  @lint @filter
  Scenario: Lint results can be filtered by category
    When I GET "/api/v1/landscape/{domainModelId}/lint?category=orphaned-entity"
    Then the response status should be 200
    And the response should be a JSON object

  @lint
  Scenario: Returns 404 for unknown domain model ID
    When I GET "/api/v1/landscape/00000000-0000-0000-0000-000000000000/lint"
    Then the response status should be 404

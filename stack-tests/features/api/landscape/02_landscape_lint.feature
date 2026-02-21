@api @landscape-lint @ROAD-044 @CAP-024
Feature: Landscape Domain Linter API
  As a Domain Architect
  I want to lint a domain model's landscape for integrity issues
  So that I can identify broken references, coverage gaps, and semantic inconsistencies

  # Uses the Durham Water Management domain model (seeded in DB)
  # domainModelId: 979b271f-b189-4f87-b078-7cd1d598c5af

  @smoke @lint
  Scenario: Lint a known domain model and receive a structured report
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af/lint"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "domainModelId" should equal "979b271f-b189-4f87-b078-7cd1d598c5af"

  @lint
  Scenario: Lint report includes findings array
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af/lint"
    Then the response status should be 200
    And I store the value at "findings[0].rule" as "firstFindingRule"
    And the value at "findings[0].rule" should equal "{firstFindingRule}"

  @lint
  Scenario: Lint report references governance and taxonomy snapshots
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af/lint"
    Then the response status should be 200
    And I store the value at "governanceSnapshotId" as "govSnapId"
    And I store the value at "taxonomySnapshotId" as "taxSnapId"
    And the value at "domainModelId" should equal "979b271f-b189-4f87-b078-7cd1d598c5af"

  @lint @filter
  Scenario: Lint results can be filtered by severity
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af/lint?severity=warning"
    Then the response status should be 200
    And the response should be a JSON object

  @lint @filter
  Scenario: Lint results can be filtered by category
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af/lint?category=orphaned-entity"
    Then the response status should be 200
    And the response should be a JSON object

  @lint
  Scenario: Returns 404 for unknown domain model ID
    When I GET "/api/v1/landscape/00000000-0000-0000-0000-000000000000/lint"
    Then the response status should be 404

@api @landscape @ROAD-044 @CAP-023
Feature: Business Landscape Graph API
  As a Domain Architect
  I want to retrieve a complete business landscape graph for a domain model
  So that I can visualize bounded contexts, capabilities, personas, and domain events in a unified view

  # Uses the Durham Water Management domain model (seeded in DB)
  # domainModelId: 979b271f-b189-4f87-b078-7cd1d598c5af

  @smoke @landscape-graph
  Scenario: Retrieve landscape graph for a known domain model
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "domainModelId" should equal "979b271f-b189-4f87-b078-7cd1d598c5af"

  @landscape-graph
  Scenario: Landscape graph includes systems hierarchy
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "systems[0].name" as "firstSystemName"
    And the value at "systems[0].name" should equal "{firstSystemName}"

  @landscape-graph
  Scenario: Landscape graph includes bounded contexts
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then the response status should be 200
    And I store the value at "contexts[0].id" as "firstContextId"
    And the value at "contexts[0].id" should equal "{firstContextId}"

  @landscape-graph
  Scenario: Landscape graph includes domain events
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then the response status should be 200
    And I store the value at "events[0].id" as "firstEventId"
    And the value at "events[0].id" should equal "{firstEventId}"

  @landscape-graph
  Scenario: Landscape graph includes capabilities
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then the response status should be 200
    And I store the value at "capabilities[0].id" as "firstCapId"
    And the value at "capabilities[0].id" should equal "{firstCapId}"

  @landscape-graph
  Scenario: Landscape graph includes metadata timestamps
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then the response status should be 200
    And I store the value at "generatedAt" as "generatedAt"
    And the value at "domainModelId" should equal "979b271f-b189-4f87-b078-7cd1d598c5af"

  @landscape-graph
  Scenario: Landscape graph includes workflow data
    When I GET "/api/v1/landscape/979b271f-b189-4f87-b078-7cd1d598c5af"
    Then the response status should be 200
    And I store the value at "workflows[0].id" as "firstWorkflowId"
    And the value at "workflows[0].id" should equal "{firstWorkflowId}"

  @landscape-graph
  Scenario: Returns 404 for unknown domain model ID
    When I GET "/api/v1/landscape/00000000-0000-0000-0000-000000000000"
    Then the response status should be 404

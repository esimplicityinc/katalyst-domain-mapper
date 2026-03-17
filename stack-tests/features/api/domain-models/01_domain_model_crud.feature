@api @ddd-modeling @CAP-009 @US-028
Feature: DDD Domain Model CRUD API
  As a Platform Engineer (@UT-002)
  I want to create, retrieve, list, and delete DDD domain models via the API
  So that I can manage domain model workspaces for bounded context mapping

  # ── Create ─────────────────────────────────────────────────────────────────

  @smoke
  Scenario: Create a domain model workspace
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "BDD CRUD Test Model",
        "description": "Domain model created by BDD CRUD tests"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "modelId"
    And the value at "name" should equal "BDD CRUD Test Model"
    Given I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

  Scenario: Create a domain model with name only
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "Minimal Model"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "modelId"
    And the value at "name" should equal "Minimal Model"
    Given I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

  # ── List ───────────────────────────────────────────────────────────────────

  Scenario: List all domain models
    # Setup: create a model so the list is non-empty
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      { "name": "List Test Model", "description": "For list validation" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I GET "/api/v1/taxonomy/domain-models"
    Then the response status should be 200
    And the response should be a JSON array

  # ── Get with nested artifacts ──────────────────────────────────────────────

  Scenario: Retrieve domain model with nested bounded contexts
    # Setup: create model + bounded context
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      { "name": "Nested Retrieval Model", "description": "Tests nested GET" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "orders",
        "title": "Order Management",
        "responsibility": "Handles customer orders"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    # Retrieve and verify nested structure
    When I GET "/api/v1/taxonomy/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "name" should equal "Nested Retrieval Model"
    And I store the value at "boundedContexts[0].title" as "ctxTitle"
    And the value at "boundedContexts[0].title" should equal "Order Management"

  Scenario: Retrieve domain model with nested aggregates
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      { "name": "Aggregate Nested Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      { "slug": "billing", "title": "Billing", "responsibility": "Invoice processing" }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/aggregates" with JSON body:
      """
      {
        "contextId": "{contextId}",
        "slug": "invoice",
        "title": "Invoice",
        "rootEntity": "Invoice",
        "invariants": ["Total must be non-negative"],
        "commands": ["CreateInvoice", "ApproveInvoice"],
        "events": ["InvoiceCreated", "InvoiceApproved"]
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "aggregateId"

    When I GET "/api/v1/taxonomy/domain-models/{modelId}"
    Then the response status should be 200
    And I store the value at "aggregates[0].title" as "aggTitle"
    And the value at "aggregates[0].title" should equal "Invoice"

  # ── Delete with cascade ────────────────────────────────────────────────────

  Scenario: Delete domain model cascades to all child artifacts
    # Create model with a bounded context
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      { "name": "Cascade Delete Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      { "slug": "payments", "title": "Payments", "responsibility": "Handles payments" }
      """
    Then the response status should be 200

    # Delete the model
    When I DELETE "/api/v1/taxonomy/domain-models/{modelId}"
    Then the response status should be 200

    # Verify it's gone
    When I GET "/api/v1/taxonomy/domain-models/{modelId}"
    Then the response status should be 404

  # ── Error cases ────────────────────────────────────────────────────────────

  Scenario: Get non-existent domain model returns 404
    When I GET "/api/v1/taxonomy/domain-models/00000000-0000-0000-0000-000000000000"
    Then the response status should be 404

  Scenario: Delete non-existent domain model returns 404
    When I DELETE "/api/v1/taxonomy/domain-models/00000000-0000-0000-0000-000000000000"
    Then the response status should be 404

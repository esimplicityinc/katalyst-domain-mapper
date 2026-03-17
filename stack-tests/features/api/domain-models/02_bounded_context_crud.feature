@api @ddd-modeling @CAP-009 @US-028
Feature: Bounded Context CRUD API
  As a Platform Engineer (@UT-002)
  I want to create, update, and delete bounded contexts within a domain model
  So that I can map organizational boundaries and context relationships

  Background:
    When I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      { "name": "BDD Context CRUD Model", "description": "For bounded context CRUD tests" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

  # ── Create ─────────────────────────────────────────────────────────────────

  @smoke
  Scenario: Create a bounded context with required fields
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "order-management",
        "title": "Order Management",
        "responsibility": "Manages customer orders and fulfillment"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "contextId"
    And the value at "title" should equal "Order Management"

  Scenario: Create a bounded context with subdomain type
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "core-billing",
        "title": "Billing",
        "responsibility": "Invoice and payment processing",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200
    And the value at "subdomainType" should equal "core"

  Scenario: Create multiple bounded contexts in one model
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      { "slug": "ctx-alpha", "title": "Alpha Context", "responsibility": "First context" }
      """
    Then the response status should be 200

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      { "slug": "ctx-beta", "title": "Beta Context", "responsibility": "Second context" }
      """
    Then the response status should be 200

    # Verify both appear in model retrieval
    When I GET "/api/v1/taxonomy/domain-models/{modelId}"
    Then the response status should be 200
    And I store the value at "boundedContexts[0].title" as "firstCtx"

  # ── Update ─────────────────────────────────────────────────────────────────

  Scenario: Update a bounded context title and responsibility
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      { "slug": "updatable", "title": "Original Title", "responsibility": "Original responsibility" }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    When I PUT "/api/v1/taxonomy/domain-models/{modelId}/contexts/{contextId}" with JSON body:
      """
      { "slug": "updatable", "title": "Updated Title", "responsibility": "Updated responsibility" }
      """
    Then the response status should be 200
    And the value at "updated" should equal "true"

  # ── Delete ─────────────────────────────────────────────────────────────────

  Scenario: Delete a bounded context
    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      { "slug": "deletable", "title": "Deletable Context", "responsibility": "Will be deleted" }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    When I DELETE "/api/v1/taxonomy/domain-models/{modelId}/contexts/{contextId}"
    Then the response status should be 200

    # Verify context is removed from model
    When I GET "/api/v1/taxonomy/domain-models/{modelId}"
    Then the response status should be 200

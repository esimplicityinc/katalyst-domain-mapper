---
name: katalyst-bdd-create-test
description: Test creation wizard for Katalyst BDD. Provides patterns and complete examples for writing API-only, UI-only, TUI, hybrid, and data-driven test scenarios with proper tags, variables, and cleanup.
license: SEE LICENSE IN LICENSE
compatibility: opencode
metadata:
  framework: katalyst-bdd
  audience: developers
---

# Katalyst BDD Test Creation Guide

## Choosing the Right Tag

| Testing... | Tag | Steps Available |
|-----------|-----|-----------------|
| HTTP APIs only | `@api` | API + Shared |
| Browser UI only | `@ui` | UI + Shared |
| Terminal/CLI apps | `@tui` | TUI + Shared |
| API setup + UI verification | `@hybrid` | API + UI + Shared |

Place the tag on the `Feature` line (applies to all scenarios) or on individual `Scenario` lines.

---

## Pattern 1: API-Only Test

Use `@api` for testing HTTP endpoints -- CRUD operations, auth flows, error handling.

```gherkin
@api
Feature: User Management API

  Background:
    Given I am authenticated as an admin via API

  Scenario: Create, read, update, and delete a user
    # Generate unique test data
    Given I generate a UUID and store as "uuid"
    Given I set variable "email" to "test-{uuid}@example.com"

    # CREATE
    When I POST "/admin/users" with JSON body:
      """
      {
        "email": "{email}",
        "name": "Test User",
        "role": "member"
      }
      """
    Then the response status should be 201
    And the response should be a JSON object
    And I store the value at "id" as "userId"
    And the value at "email" should equal "{email}"

    # Register cleanup immediately after creation
    Given I register cleanup DELETE "/admin/users/{userId}"

    # READ
    When I GET "/admin/users/{userId}"
    Then the response status should be 200
    And the value at "name" should equal "Test User"

    # UPDATE
    When I PATCH "/admin/users/{userId}" with JSON body:
      """
      { "name": "Updated Name" }
      """
    Then the response status should be 200
    And the value at "name" should equal "Updated Name"

    # DELETE
    When I DELETE "/admin/users/{userId}"
    Then the response status should be 204

  Scenario: List all users
    When I GET "/admin/users"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Get nonexistent user returns 404
    When I GET "/admin/users/nonexistent-id"
    Then the response status should be 404
```

### Key Points
- Use `Background` for shared auth setup
- Generate unique data with UUID to avoid conflicts between test runs
- Register cleanup immediately after resource creation
- Store IDs with `I store the value at` for later use

---

## Pattern 2: UI-Only Test

Use `@ui` for browser-based testing -- login flows, forms, navigation, assertions.

```gherkin
@ui
Feature: User Login

  Scenario: Successful login
    Given I navigate to "/login"
    When I fill in "Email" with "admin@example.com"
    And I fill in "Password" with "secret123"
    And I click the button "Sign In"
    Then I should see text "Dashboard"
    And the URL should contain "/dashboard"

  Scenario: Login with invalid credentials
    Given I navigate to "/login"
    When I fill in "Email" with "wrong@example.com"
    And I fill in "Password" with "badpassword"
    And I click the button "Sign In"
    Then I should see text "Invalid credentials"
    And the URL should contain "/login"

  Scenario: Form validation
    Given I navigate to "/register"
    When I click the button "Create Account"
    Then I should see text "Email is required"
    And the element "#email-error" should be visible
```

### Key Points
- Use accessible names (labels, button text) for selectors -- not CSS selectors
- Playwright auto-waits for elements -- avoid explicit waits unless necessary
- Use `Then I should see text` for content assertions
- Use `Then the URL should contain` for navigation assertions

---

## Pattern 3: TUI Test

Use `@tui` for testing terminal/CLI applications. Requires tmux.

```gherkin
@tui
Feature: Interactive CLI

  Scenario: Create project via CLI wizard
    When I spawn the terminal with "npx create-my-app"
    Then I should see "Project name:" in terminal
    When I type "my-project" in terminal
    And I press Enter in terminal
    Then I should see "Select framework:" in terminal
    When I press "ArrowDown" in terminal
    And I press Enter in terminal
    Then I should see "Project created successfully" in terminal
    And the terminal process should exit with code 0

  Scenario: Handle Ctrl+C gracefully
    When I spawn the terminal with "npx create-my-app"
    Then I should see "Project name:" in terminal
    When I send Ctrl+C to terminal
    Then the terminal process should exit
```

### Key Points
- `spawn the terminal with` starts the process
- `type` sends text, `press Enter` confirms
- `press` handles special keys: `"ArrowDown"`, `"ArrowUp"`, `"Tab"`, `"Escape"`
- `send Ctrl+C` sends interrupt signal

---

## Pattern 4: Hybrid Test (API + UI)

Use `@hybrid` for cross-layer testing -- create data via API, then verify in the UI.

```gherkin
@hybrid
Feature: User Management End-to-End

  Scenario: Create user via API and verify in UI
    # API: Create the user
    Given I am authenticated as an admin via API
    Given I generate a UUID and store as "uuid"
    Given I set variable "email" to "e2e-{uuid}@example.com"

    When I POST "/admin/users" with JSON body:
      """
      {
        "email": "{email}",
        "name": "E2E Test User"
      }
      """
    Then the response status should be 201
    And I store the value at "id" as "userId"
    Given I register cleanup DELETE "/admin/users/{userId}"

    # UI: Verify the user appears
    Given I navigate to "/admin/users"
    Then I should see text "{email}"
    Then I should see text "E2E Test User"

  Scenario: Delete user via UI and verify via API
    # API: Create test data
    Given I am authenticated as an admin via API
    When I POST "/admin/users" with JSON body:
      """
      { "email": "delete-test@example.com", "name": "Delete Me" }
      """
    Then the response status should be 201
    And I store the value at "id" as "userId"

    # UI: Delete the user
    Given I navigate to "/admin/users/{userId}"
    When I click the button "Delete"
    When I click the button "Confirm"
    Then I should see text "User deleted"

    # API: Verify deletion
    When I GET "/admin/users/{userId}"
    Then the response status should be 404
```

### Key Points
- `@hybrid` enables both API and UI steps in the same scenario
- Use API for fast data setup, UI for user-facing verification
- Variable interpolation (`{email}`, `{userId}`) works across both layers

---

## Pattern 5: Data-Driven Tests

Use `Scenario Outline` with `Examples` tables for parameterized tests.

```gherkin
@api
Feature: Input Validation

  Background:
    Given I am authenticated as an admin via API

  Scenario Outline: Validate user creation with <description>
    When I POST "/admin/users" with JSON body:
      """
      {
        "email": "<email>",
        "name": "<name>"
      }
      """
    Then the response status should be <status>

    Examples:
      | description      | email              | name       | status |
      | valid data       | valid@example.com  | John Doe   | 201    |
      | missing email    |                    | John Doe   | 400    |
      | invalid email    | not-an-email       | John Doe   | 400    |
      | missing name     | test@example.com   |            | 400    |
```

### Key Points
- `<placeholder>` in Scenario Outline is replaced by each Examples row
- Each row runs as a separate test
- Use `description` column for readable test names

---

## Pattern 6: Background and Setup

Use `Background` for steps that run before every scenario in a feature.

```gherkin
@api
Feature: Protected API Endpoints

  Background:
    Given I am authenticated as an admin via API
    Given I generate a UUID and store as "testId"

  Scenario: Create resource
    When I POST "/resources" with JSON body:
      """
      { "name": "resource-{testId}" }
      """
    Then the response status should be 201

  Scenario: List resources
    When I GET "/resources"
    Then the response status should be 200
```

---

## Pattern 7: Using Doc Strings for JSON Bodies

All JSON payloads use triple-quoted doc strings. Variable interpolation works inside them.

```gherkin
When I POST "/api/orders" with JSON body:
  """
  {
    "customerId": "{customerId}",
    "items": [
      { "productId": "{productId}", "quantity": 2 },
      { "productId": "static-id", "quantity": 1 }
    ],
    "shippingAddress": {
      "street": "123 Test St",
      "city": "Testville"
    }
  }
  """
```

---

## Pattern 8: Using Data Tables

Data tables work in custom steps (not built-in). Useful for bulk operations.

```gherkin
When I create users:
  | email              | name      | role   |
  | user1@test.com     | User One  | member |
  | user2@test.com     | User Two  | admin  |
```

---

## Incremental Development with @wip

Tag features or scenarios with `@wip` during development:

```gherkin
@api @wip
Feature: New Feature (Work in Progress)
  Scenario: Not yet implemented
    Given some undefined step
```

Configure Playwright to exclude WIP tests:

```typescript
// playwright.config.ts
projects: [
  {
    name: 'api',
    testMatch: /.*\.spec\.ts/,
    use: { ...devices['Desktop Chrome'] },
    grep: /@api/,
    grepInvert: /@wip/,
  },
]
```

Or use tag filtering in your project config:
```
tags: '@api and not @wip'
```

---

## Generating Step Stubs

When you have undefined steps in feature files:

```bash
npm run gen:stubs
```

This creates `features/steps/generated-stubs.ts`:

```typescript
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures.js';
const { Given, When, Then } = createBdd(test);

// TODO: Implement this step
Given('a user exists with email {string}', async ({ world }, str0: string) => {
  throw new Error('Step not implemented: a user exists with email {string}');
});
```

Then:
1. Add `import './generated-stubs.js';` to steps.ts
2. Implement each stub (replace `throw` with logic)
3. Move implemented steps to domain-specific files
4. Run `npm run gen && npm test`

---

## Best Practices Checklist

- [ ] **Unique test data**: Always use `I generate a UUID` for test data -- never hardcode emails/names that could collide
- [ ] **Register cleanup**: Register cleanup immediately after creating a resource
- [ ] **LIFO cleanup order**: Register child cleanup before parent (reverse order of creation)
- [ ] **Meaningful variable names**: Use `createdUserId` not `id`; `adminAccessToken` not `t`
- [ ] **One assertion per Then**: Keep Then steps focused on a single check
- [ ] **Background for shared setup**: Use Background for auth and common setup
- [ ] **Accessible selectors**: Prefer button names and labels over CSS selectors
- [ ] **Tag correctly**: Ensure the right tag is applied for the steps you need

---
name: katalyst-bdd-quickstart
description: Getting started with Katalyst BDD (@esimplicity/stack-tests). Covers installation, project setup, first test creation, running tests, and understanding the tag system (@api, @ui, @tui, @hybrid).
license: SEE LICENSE IN LICENSE
compatibility: opencode
metadata:
  framework: katalyst-bdd
  audience: developers
---

# Katalyst BDD Quick Start

## What This Skill Covers

- Installing @esimplicity/stack-tests and peer dependencies
- Scaffolding a new test project
- Project structure and configuration
- Writing your first feature file
- Running tests
- Understanding the tag system

## Installation

### Method 1: Scaffold CLI (Recommended)

```bash
# From your project root
npx @esimplicity/create-stack-tests

# With a custom directory name
npx @esimplicity/create-stack-tests --dir e2e-tests

# With agent skills pre-installed
npx @esimplicity/create-stack-tests --with-skills --skills-agents opencode
```

### Method 2: Manual Installation

```bash
# Install the framework
npm install -D @esimplicity/stack-tests

# Install peer dependencies
npm install -D @playwright/test playwright-bdd typescript

# Optional: TUI testing support
npm install -D tui-tester
```

### Peer Dependencies

| Package | Version | Required |
|---------|---------|----------|
| `@playwright/test` | ^1.49.0 | Yes |
| `playwright-bdd` | ^8.3.0 | Yes |
| `typescript` | ^5.6.0 | Yes |
| `tui-tester` | ^1.0.0 | No (TUI only) |

### Workspace/Local Development

```bash
# Using bun workspaces
bun add -d @esimplicity/stack-tests@"file:../packages/stack-tests" @playwright/test playwright-bdd
```

## Project Structure

After scaffolding, your project should look like:

```
your-project/
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── features/
│   ├── api/
│   │   └── *.feature
│   ├── ui/
│   │   └── *.feature
│   └── steps/
│       ├── fixtures.ts
│       └── steps.ts
└── .env (optional)
```

## Setting Up Fixtures

Create `features/steps/fixtures.ts`:

```typescript
import {
  createBddTest,
  PlaywrightApiAdapter,
  PlaywrightUiAdapter,
  UniversalAuthAdapter,
  DefaultCleanupAdapter,
} from '@esimplicity/stack-tests';

export const test = createBddTest({
  createApi: ({ apiRequest }) => new PlaywrightApiAdapter(apiRequest),
  createUi: ({ page }) => new PlaywrightUiAdapter(page),
  createAuth: ({ api, ui }) => new UniversalAuthAdapter({ api, ui }),
  createCleanup: () => new DefaultCleanupAdapter(),
});
```

## Registering Steps

Create `features/steps/steps.ts`:

```typescript
import { test } from './fixtures';
import {
  registerApiSteps,
  registerUiSteps,
  registerSharedSteps,
} from '@esimplicity/stack-tests/steps';

// Register built-in steps
registerApiSteps(test);
registerUiSteps(test);
registerSharedSteps(test);

export { test };
```

## Writing Your First Feature File

Create `features/api/users.feature`:

```gherkin
@api
Feature: User Management API

  Scenario: Create and verify user
    Given I am authenticated as an admin via API
    When I POST "/users" with JSON body:
      """
      { "email": "test@example.com", "name": "Test User" }
      """
    Then the response status should be 201
    And I store the value at "id" as "userId"

    When I GET "/users/{userId}"
    Then the response status should be 200
    And the value at "email" should equal "test@example.com"
```

## Running Tests

```bash
# Generate Playwright tests from feature files
npm run gen

# Run all tests
npm test

# Generate step stubs for undefined steps
npm run gen:stubs
```

## Tag System

Tags control which adapters and steps are available:

| Tag | Available Steps | Use Case |
|-----|----------------|----------|
| `@api` | API steps, Shared steps | HTTP API testing |
| `@ui` | UI steps, Shared steps | Browser UI testing |
| `@tui` | TUI steps, Shared steps | Terminal UI testing |
| `@hybrid` | API + UI steps, Shared steps | Cross-layer tests |

Apply tags at the Feature or Scenario level:

```gherkin
@api
Feature: API Tests
  # All scenarios inherit @api tag

@ui
Feature: UI Tests
  Scenario: Login flow
    Given I navigate to "/login"
    ...
```

Custom tags are also supported for filtering:

```gherkin
@api @smoke
Feature: Smoke Tests
  # Can filter with: tags: '@api and @smoke'
```

## Environment Variables

Key environment variables for test configuration:

| Variable | Description |
|----------|-------------|
| `DEFAULT_ADMIN_USERNAME` | Admin login username |
| `DEFAULT_ADMIN_PASSWORD` | Admin login password |
| `DEFAULT_USER_USERNAME` | Standard user username |
| `DEFAULT_USER_PASSWORD` | Standard user password |
| `API_AUTH_LOGIN_PATH` | Auth endpoint path |
| `CLEANUP_ALLOW_ALL` | Enable heuristic cleanup (`'false'` default) |
| `CLEANUP_RULES` | JSON array of custom cleanup rules |

## NPM Scripts (Scaffolded)

| Script | Description |
|--------|-------------|
| `npm run gen` | Generate Playwright tests from .feature files |
| `npm run gen:stubs` | Generate step stubs for undefined steps |
| `npm test` | Generate and run tests |
| `npm run check-updates` | Check for framework updates |
| `npm run upgrade` | Upgrade to latest version |
| `npm run upgrade:migrate` | Full scaffolding migration |
| `npm run clean` | Remove generated files and node_modules |

## Next Steps

- Use the `katalyst-bdd-step-reference` skill for complete step documentation
- Use the `katalyst-bdd-create-test` skill for test creation patterns
- Use the `katalyst-bdd-architecture` skill for custom adapters/ports
- Full docs: https://esimplicityinc.github.io/katalyst-bdd-test/docs/

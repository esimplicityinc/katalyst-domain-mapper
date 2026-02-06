# Plan 05: Install Katalyst BDD Agent Skills

## Goal

Install 5 OpenCode Agent Skills from the `@esimplicity/stack-tests` (Katalyst BDD) framework into this project's `.opencode/skills/` directory. These skills give AI agents deep framework knowledge for writing BDD tests, troubleshooting issues, and understanding the ports-and-adapters architecture.

## Source Documentation

- Main docs: https://esimplicityinc.github.io/katalyst-bdd-test/docs/
- Agent Skills guide: https://esimplicityinc.github.io/katalyst-bdd-test/docs/guides/agent-skills
- npm package: `@esimplicity/stack-tests` v0.2.0

## Permission Note

The edit permission rules in this project restrict writes to `.opencode/plans/*.md` only. To create the skill files, the permission configuration needs to be updated to also allow writes to `.opencode/skills/**/*.md`, OR the agent must be switched to Build mode where full write access is available.

## Directory Structure to Create

```
.opencode/skills/
├── katalyst-bdd-quickstart/SKILL.md
├── katalyst-bdd-step-reference/SKILL.md
├── katalyst-bdd-create-test/SKILL.md
├── katalyst-bdd-troubleshooting/SKILL.md
└── katalyst-bdd-architecture/SKILL.md
```

Note: The directories were already created during planning. Only the SKILL.md files need to be written.

## OpenCode Skill Format Requirements

Each `SKILL.md` must:
1. Start with YAML frontmatter containing `name` (required) and `description` (required)
2. `name` must be lowercase-alphanumeric-with-hyphens, 1-64 chars, matching the directory name
3. `description` must be 1-1024 chars
4. Optional fields: `license`, `compatibility`, `metadata`
5. Body is markdown loaded on-demand by the agent when `skill({ name: "..." })` is called

## Skill Specifications

### 1. katalyst-bdd-quickstart

**Description:** Getting started with Katalyst BDD (@esimplicity/stack-tests). Covers installation, project setup, first test creation, running tests, and understanding the tag system.

**Content should cover:**
- Installation via `npx @esimplicity/create-stack-tests` (scaffold CLI) and manual `npm install`
- Peer dependencies: `@playwright/test ^1.49.0`, `playwright-bdd ^8.3.0`, `typescript ^5.6.0`, `tui-tester ^1.0.0` (optional)
- Project structure after scaffolding (features/, steps/, playwright.config.ts)
- Setting up fixtures.ts with `createBddTest()` wiring
- Registering steps in steps.ts
- Writing first `.feature` file with `@api` tag
- Running tests: `npm run gen`, `npm test`, `npm run gen:stubs`
- Tag system: `@api`, `@ui`, `@tui`, `@hybrid` and what steps each enables
- Key environment variables: `DEFAULT_ADMIN_USERNAME`, `DEFAULT_ADMIN_PASSWORD`, `API_AUTH_LOGIN_PATH`, etc.
- NPM scripts from scaffold: gen, gen:stubs, test, check-updates, upgrade, clean

### 2. katalyst-bdd-step-reference

**Description:** Complete reference of all built-in Katalyst BDD step definitions for API, UI, TUI, hybrid, and shared steps. Includes step syntax, parameters, examples, variable interpolation, and cleanup patterns.

**Content should cover:**

**API Steps (`@api` or `@hybrid`):**
- Auth: `Given I am authenticated as an admin via API`, `Given I am authenticated as a user via API`, `Given I set bearer token from variable {string}`
- HTTP: `When I GET {string}`, `When I DELETE {string}`, `When I POST|PUT|PATCH {string} with JSON body:`
- Assertions: `Then the response status should be {int}`, `Then the response should be a JSON object|array`, `Then the value at {string} should equal|contain|match {string}`, `And I store the value at {string} as {string}`
- World state updates: lastResponse, lastStatus, lastText, lastJson, lastHeaders, lastContentType
- JSONPath syntax: `prop`, `prop.nested`, `arr[0]`, `arr[0].prop`

**UI Steps (`@ui` or `@hybrid`):**
- Navigation: `Given I navigate to {string}`, `Given I open {string} page`, `When I go back in the browser`, `When I reload the page`
- Clicking: `When I click the button {string}`, `When I click the {string} button`, `When I click the link {string}`, `When I click the element {string}`
- Forms: `When I fill the field {string} with {string}`, `When I fill in {string} with {string}`, `When I fill the placeholder {string} with {string}`, `When I select {string} from dropdown {string}`, `When I fill the form:`
- Assertions: `Then I should see text {string}`, `Then the URL should contain {string}`, element visible/hidden/value/checked assertions
- Waiting: `Then I wait {string} seconds`, `Then I wait for the page to load`
- Debug: `When I pause for debugging`, screenshot, URL/text logging

**TUI Steps (`@tui`):**
- `When I spawn the terminal with {string}`, type/press/Ctrl+C
- `Then I should see {string} in terminal`, regex match, exit assertions
- Requires tmux

**Shared Steps (all tags):**
- Variables: `Given I set variable {string} to {string}`, `Given I generate a UUID and store as {string}`, `Given I set header {string} to {string}`
- Cleanup: `Given I register cleanup DELETE|POST|PATCH|PUT {string}`, `Given I disable cleanup`
- Cleanup behavior: LIFO execution, admin auth, error tolerance, 404 ignored

**Variable Interpolation:**
- `{varName}` syntax in paths, bodies, assertions, headers, cleanup paths
- Chaining: generate UUID then use in email template

### 3. katalyst-bdd-create-test

**Description:** Test creation wizard for Katalyst BDD. Provides patterns and complete examples for writing API-only, UI-only, TUI, hybrid, and data-driven test scenarios with proper tags, variables, and cleanup.

**Content should cover:**
- Choosing the right tag based on what you're testing
- API-only test pattern: auth setup, CRUD operations, response assertions, variable storage, cleanup registration
- UI-only test pattern: navigation, form filling, clicking, text/URL assertions
- TUI test pattern: spawning terminal, typing, asserting output, exit codes
- Hybrid test pattern: API setup (create data) + UI verification
- Data-driven scenarios using Scenario Outline with Examples tables
- Background sections for shared setup (authentication)
- Using `@wip` tag for incremental development
- Doc string bodies for JSON payloads
- Data table steps for bulk operations
- Generating step stubs with `npm run gen:stubs` for undefined steps
- Moving from stubs to implemented steps
- Best practices: unique data (UUID), meaningful variable names, always register cleanup, LIFO ordering for parent-child resources

### 4. katalyst-bdd-troubleshooting

**Description:** Debug and fix common Katalyst BDD issues. Covers element not found errors, authentication failures, timing/synchronization problems, variable interpolation, environment configuration, cleanup behavior, and CI/CD failures.

**Content should cover:**
- "Element not found" / selector failures: use accessible names, check element visibility, add waits
- Authentication failures: env var checklist (DEFAULT_ADMIN_USERNAME, etc.), API_AUTH_LOGIN_PATH, token caching/refresh
- Timing issues: `Then I wait for the page to load`, avoid fixed waits, Playwright auto-wait
- Variable interpolation not working: check `{varName}` syntax, ensure variable was stored before use, check chaining order
- "Cannot find module '@esimplicity/stack-tests'": installation verification
- "tui-tester is not installed": optional dependency, tmux requirement
- TypeScript errors: tsconfig.json settings (module: NodeNext, moduleResolution: NodeNext)
- Cleanup not running: verify registration, LIFO order for parent-child, admin auth for cleanup requests
- CI/CD failures: headless browser config, environment variable secrets, Playwright browser installation
- Step not found: check tag requirements (API steps need `@api` or `@hybrid`), check step registration in steps.ts
- JSON body parse errors: validate doc string JSON, check variable interpolation in bodies
- Environment variable reference table

### 5. katalyst-bdd-architecture

**Description:** Katalyst BDD framework internals. Covers the ports and adapters pattern, creating custom ports, implementing custom adapters, writing custom step definitions, createBddTest dependency injection, and extending the framework.

**Content should cover:**

**Ports and Adapters pattern:**
- Why: separates WHAT (ports/interfaces) from HOW (adapters/implementations)
- Benefits: testability, flexibility, clarity, reusability
- Layer responsibilities: Test (features/steps), Domain (world/variables/lifecycle), Port (interfaces), Adapter (implementations), Infrastructure (Playwright/tmux)

**5 Built-in Ports:**
- `ApiPort`: sendJson(), sendForm() - HTTP interactions
- `UiPort`: goto(), clickButton(), fillLabel(), expectText() - browser interactions
- `TuiPort`: start(), stop(), typeText(), pressKey(), expectText() - terminal interactions
- `AuthPort`: apiLoginAsAdmin(), apiLoginAsUser(), uiLoginAsAdmin(), uiLoginAsUser()
- `CleanupPort`: registerFromVar()

**Built-in Adapters:**
- PlaywrightApiAdapter, PlaywrightUiAdapter, UniversalAuthAdapter, DefaultCleanupAdapter

**createBddTest() DI wiring:**
- Default configuration vs custom overrides
- createApi, createUi, createAuth, createCleanup options

**Creating Custom Adapters:**
- Implement existing port interface
- Register via createBddTest options
- Example: AxiosApiAdapter implementing ApiPort

**Creating Custom Steps:**
- Import createBdd from playwright-bdd
- Use test from fixtures
- Tag-scoped steps with `{ tags: '@api' }`
- Parameterized steps: {string}, {int}, {float}
- Doc string and data table steps
- Using interpolate() and selectPath() utilities
- registerCleanup() helper

**Writing Custom Steps file structure:**
- features/steps/custom/domain.steps.ts pattern
- Import in steps.ts to auto-register
- Unit testing custom steps with mocked ports

## Estimated Size

- ~5 files, each 150-300 lines of markdown
- Total: ~1,000-1,500 lines

## Implementation Steps

1. Switch to Build mode (Tab key in OpenCode TUI)
2. Verify `.opencode/skills/` directories exist (already created)
3. Write each SKILL.md file with content following the specifications above
4. Verify skills load by checking OpenCode's skill tool description includes all 5 skills

## Dependencies

- None - these are static markdown files with no code dependencies
- The framework itself (`@esimplicity/stack-tests`) does NOT need to be installed in this project for the skills to work. Skills are reference documentation loaded by the AI agent.

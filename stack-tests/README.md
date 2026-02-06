# stack-tests

Generated Playwright + BDD test package powered by @esimplicity/stack-tests.

## Install
- Install deps in this folder: (see commands printed by the generator)

## Run
- Generate tests:   `npm run gen`
- Run tests:   `npm test`

## Structure
- `features/api|ui|hybrid|tui`: feature files
- `features/steps/steps.ts`: registers steps from @esimplicity/stack-tests
- `features/steps/fixtures.ts`: creates the Playwright-BDD test with adapters
- `playwright.config.ts`: BDD-aware Playwright config with reporters

## Notes
- Edit `playwright.config.ts` projects/tags to match your repo.
- Keep @playwright/test and playwright-bdd versions aligned with @esimplicity/stack-tests peer ranges.

## TUI Testing (Optional)
To enable terminal user interface testing:

1. Install tmux (required by tui-tester):
   ```bash
   # macOS
   brew install tmux

   # Ubuntu/Debian
   apt-get install tmux
   ```

2. Install tui-tester:
   ```bash
   npm install tui-tester
   ```

3. Uncomment TUI configuration in:
   - `features/steps/fixtures.ts`: Configure TuiTesterAdapter with your CLI command
   - `features/steps/steps.ts`: Uncomment registerTuiSteps(test)
   - `playwright.config.ts`: Uncomment tuiBdd project and add to projects array

4. Write @tui tagged feature files in `features/tui/`

# Katalyst Domain Mapper - Task Runner
# Usage: just <recipe> or just --list

set positional-arguments
set dotenv-load

# List available recipes
[default]
help:
    @just --list --unsorted

# ─── Development ──────────────────────────────────────────────

# Start API + Web UI (the two services needed for BDD tests)
[group('development')]
dev:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Starting API and Web UI dev servers..."
    trap 'kill 0' INT TERM EXIT
    just dev-intelligence-api &
    just dev-intelligence-web &
    wait

# Start all dev servers (API + Web UI + Docs)
[group('development')]
dev-all:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Starting all development servers..."
    just dev-intelligence-api &
    just dev-intelligence-web &
    just dev-docs &
    wait

# Start Intelligence API server (Bun with hot reload) — serves on API_PORT (default 3001)
[group('development')]
[working-directory: 'packages/intelligence']
dev-intelligence-api:
    bun --watch api/main.ts

# Start Intelligence Web UI (Vite) — serves on FRONTEND_PORT (default 3002), proxies /api → API_PORT
[group('development')]
[working-directory: 'packages/intelligence/web']
dev-intelligence-web:
    bunx vite

# Start API server (Elysia with hot reload)
[group('development')]
[working-directory: 'packages/foe-api']
dev-api:
    bun --watch src/main.ts

# Start Web UI dev server (Vite)
[group('development')]
[working-directory: 'packages/foe-web-ui']
dev-ui:
    bunx vite

# Start Docusaurus dev server
[group('development')]
[working-directory: 'packages/delivery-framework']
dev-docs:
    bunx docusaurus start

# ─── Build ────────────────────────────────────────────────────

# Build all packages
[group('build')]
build:
    bun run --filter '*' build

# Build foe-schemas
[group('build')]
[working-directory: 'packages/foe-schemas']
build-schemas:
    bun run build

# Build foe-api
[group('build')]
[working-directory: 'packages/foe-api']
build-api:
    bun run build

# Build foe-web-ui
[group('build')]
[working-directory: 'packages/foe-web-ui']
build-ui:
    bunx tsc && bunx vite build

# Build delivery-framework docs site
[group('build')]
[working-directory: 'packages/delivery-framework']
build-docs:
    bunx docusaurus build

# ─── Test ─────────────────────────────────────────────────────

# Run all unit tests
[group('test')]
test:
    bun test

# Run unit tests in watch mode
[group('test')]
test-watch:
    bun test --watch

# Run tests with coverage
[group('test')]
test-coverage:
    bun test --coverage

# ─── BDD ──────────────────────────────────────────────────────

# Run all BDD tests
[group('bdd')]
[working-directory: 'stack-tests']
bdd-test:
    just dev-ready
    npx bddgen && npx playwright test

# Run API-only BDD tests
[group('bdd')]
[working-directory: 'stack-tests']
bdd-api:
    just dev-ready
    npx bddgen && npx playwright test --grep "@api"

# Run UI-only BDD tests
[group('bdd')]
[working-directory: 'stack-tests']
bdd-ui:
    just dev-ready
    npx bddgen && npx playwright test --grep "@ui"

# Run hybrid/E2E BDD tests
[group('bdd')]
[working-directory: 'stack-tests']
bdd-hybrid:
    just dev-ready
    npx bddgen && npx playwright test --grep "@hybrid"

# Run BDD tests by tag
[group('bdd')]
[working-directory: 'stack-tests']
bdd-tag tag:
    just dev-ready
    npx bddgen && npx playwright test --grep "@{{ tag }}"

# Run BDD tests for a specific ROAD item
[group('bdd')]
[working-directory: 'stack-tests']
bdd-roadmap road_id:
    just dev-ready
    npx bddgen && npx playwright test --grep "@{{ road_id }}"

# Run UI tests with visible browser
[group('bdd')]
[working-directory: 'stack-tests']
bdd-headed:
    just dev-ready
    npx bddgen && npx playwright test --grep "@ui" --headed

# Open BDD HTML report
[group('bdd')]
[working-directory: 'stack-tests']
bdd-report:
    npx playwright show-report

# Install BDD dependencies
[group('bdd')]
[working-directory: 'stack-tests']
bdd-install:
    npm install && npx playwright install

# Validate BDD capability tags
[group('bdd')]
[working-directory: 'packages/delivery-framework']
bdd-validate-cap-tags:
    node scripts/validate-bdd-tags.js

# Validate BDD capability tags (strict mode)
[group('bdd')]
[working-directory: 'packages/delivery-framework']
bdd-validate-cap-tags-strict:
    node scripts/validate-bdd-tags.js --strict

# Generate capability coverage report
[group('bdd')]
[working-directory: 'packages/delivery-framework']
capability-coverage:
    node scripts/capability-coverage-report.js

# Generate capability coverage report (JSON)
[group('bdd')]
[working-directory: 'packages/delivery-framework']
capability-coverage-json:
    node scripts/capability-coverage-report.js --json

# ─── Quality ──────────────────────────────────────────────────

# Run all checks (typecheck + lint + test)
[group('quality')]
check: typecheck lint test

# CI pipeline (check + BDD smoke)
[group('quality')]
ci: check bdd-api

# Run TypeScript type checking across all packages
[group('quality')]
typecheck:
    bunx tsc --noEmit --project packages/foe-schemas/tsconfig.json
    bunx tsc --noEmit --project packages/foe-api/tsconfig.json
    bunx tsc --noEmit --project packages/intelligence/web/tsconfig.json
    bunx tsc --noEmit --project packages/web-report/tsconfig.json

# Watch mode typecheck
[group('quality')]
[working-directory: 'packages/intelligence/web']
typecheck-watch:
    bunx tsc --noEmit --watch

# Run ESLint
[group('quality')]
lint:
    bunx eslint packages/intelligence/web --ext ts,tsx --report-unused-disable-directives --max-warnings 0
    bunx eslint packages/web-report/src --ext ts,tsx --report-unused-disable-directives --max-warnings 0

# Auto-fix lint issues
[group('quality')]
lint-fix:
    bunx eslint packages/intelligence/web --ext ts,tsx --report-unused-disable-directives --fix
    bunx eslint packages/web-report/src --ext ts,tsx --report-unused-disable-directives --fix

# Check formatting
[group('quality')]
format-check:
    bunx prettier --check "packages/*/src/**/*.{ts,tsx}"

# Auto-format code
[group('quality')]
format:
    bunx prettier --write "packages/*/src/**/*.{ts,tsx}"

# ─── Database ─────────────────────────────────────────────────

# Generate Drizzle migrations
[group('database')]
[working-directory: 'packages/foe-api']
db-generate:
    bunx drizzle-kit generate

# Run Drizzle migrations
[group('database')]
[working-directory: 'packages/foe-api']
db-migrate:
    bunx drizzle-kit migrate

# ─── Governance ───────────────────────────────────────────────

# Run governance linter
[group('governance')]
[working-directory: 'packages/delivery-framework']
governance-lint:
    node scripts/governance-linter.js

# Validate documentation
[group('governance')]
[working-directory: 'packages/delivery-framework']
validate-docs:
    node scripts/validate-docs.js

# Validate change entries
[group('governance')]
[working-directory: 'packages/delivery-framework']
validate-changes:
    node scripts/validate-changes.js

# ─── Docker / Dev Environment ─────────────────────────────────

# Show status of docker compose services and local dev servers
[group('docker')]
dev-status:
    #!/usr/bin/env bash
    set -euo pipefail
    API_PORT="${API_PORT:-3001}"
    FRONTEND_PORT="${FRONTEND_PORT:-3002}"
    echo "=== Docker Compose ==="
    docker compose ps 2>/dev/null || echo "(docker compose not available)"
    echo ""
    echo "=== Local Dev Servers ==="
    if curl -sf "http://localhost:${API_PORT}/api/v1/health" >/dev/null 2>&1; then
      echo "  API (port ${API_PORT}):      ✅ up"
    else
      echo "  API (port ${API_PORT}):      ❌ not reachable"
    fi
    if curl -sf "http://localhost:${FRONTEND_PORT}/api/v1/health" >/dev/null 2>&1; then
      echo "  Frontend (port ${FRONTEND_PORT}): ✅ up (proxy working)"
    else
      echo "  Frontend (port ${FRONTEND_PORT}): ❌ not reachable"
    fi

# Ensure dev servers are reachable; exit non-zero with instructions if not
[group('docker')]
dev-ready:
    #!/usr/bin/env bash
    set -euo pipefail
    API_PORT="${API_PORT:-3001}"
    FRONTEND_PORT="${FRONTEND_PORT:-3002}"
    HEALTH_URL="http://localhost:${FRONTEND_PORT}/api/v1/health"
    MAX_WAIT=5
    echo "Checking dev environment (${HEALTH_URL})..."
    for i in $(seq 1 $MAX_WAIT); do
      if curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
        echo "  ✅ Dev environment is up"
        exit 0
      fi
      echo "  Waiting... (${i}/${MAX_WAIT})"
      sleep 1
    done
    echo ""
    echo "  ❌ Dev environment not reachable at ${HEALTH_URL}"
    echo ""
    echo "  Start it with one of:"
    echo "    just dev-docker   — Docker Compose dev mode (hot reload)"
    echo "    just dev          — Local Bun + Vite dev servers"
    echo ""
    exit 1

# Start with docker-compose dev mode (hot reload)
[group('docker')]
dev-docker:
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Start with docker-compose dev mode
[group('docker')]
docker-dev:
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Build scanner Docker image
[group('docker')]
docker-build:
    docker build -t katalyst-scanner -f packages/foe-scanner/Dockerfile .

# ─── Utilities ────────────────────────────────────────────────

# Clean all build artifacts and caches
[group('utilities')]
clean:
    rm -rf packages/foe-schemas/dist
    rm -rf packages/foe-field-guide-tools/dist
    rm -rf packages/foe-api/dist
    rm -rf packages/foe-web-ui/dist
    rm -rf packages/web-report/.next
    rm -rf packages/delivery-framework/.docusaurus packages/delivery-framework/build
    rm -rf stack-tests/.features-gen stack-tests/test-results stack-tests/playwright-report
    rm -rf node_modules/.cache

# Install all dependencies
[group('utilities')]
install:
    bun install

# Katalyst Domain Mapper

Scans a software repository, scores it against the three Flow Optimized Engineering (FOE) dimensions, and maps the domain it finds. The output is a report with evidence, gaps, and ranked recommendations, plus a browsable model of the system: bounded contexts, aggregates, glossary terms, user types, and capabilities.

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| Understanding | 35% | Architecture clarity, domain modeling, documentation |
| Feedback | 35% | CI/CD speed, test coverage, deployment frequency |
| Confidence | 30% | Test automation, static analysis, contract testing, stability |

Scores map to a maturity level: Hypothesized (0 to 39), Emerging (40 to 59), Practicing (60 to 79), Optimized (80 to 100).

## Quick start

Prerequisites: [Bun](https://bun.sh), [just](https://github.com/casey/just), Docker, and one LLM key.

```bash
cp .env.example .env        # set ANTHROPIC_API_KEY (or OPENROUTER_API_KEY / AWS_BEARER_TOKEN_BEDROCK)
bun install
just build-schemas          # other packages import the compiled @foe/schemas types
just dev                    # API on :3001, web UI on :3002
```

Open http://localhost:3002. To run a scan the API needs the scanner image and access to the Docker socket:

```bash
docker compose build scanner   # builds the foe-scanner image the API spawns per scan
```

Single container (web UI, API, and OpenCode chat together, with Neo4j):

```bash
docker compose up -d           # http://localhost:8090
```

Seed sample data with the scripts in `scripts/` (for example `scripts/seed-prima-katalyst.sh`).

## How a scan works

1. `POST /api/v1/scans` records the request. A background poller picks it up.
2. The API spawns a `foe-scanner` container with the target repo mounted read-only.
3. Inside the container an orchestrator agent detects the tech stack and dispatches five specialist agents in parallel: CI, tests, architecture, domain, docs. Their prompts live in `packages/assessment/.opencode/agents/foe-scanner-*.md` and are the single source of truth for both the OpenCode and LangGraph runners.
4. The orchestrator merges the results into one report, validated against the Zod schemas in `@foe/schemas`.
5. The report is stored in SQLite and rendered by the web UI. Domain findings feed the Domain Mapper, Business Landscape, and Architecture pages.

Recommendations reference specific methods from the FOE Field Guide (65 methods across FOE, DORA, DDD, BDD, Team Topologies, TDD, Continuous Delivery, Double Diamond), indexed at build time by `@katalyst/vocabulary`.

## Repository layout

```
packages/
  intelligence/       API (Bun, hexagonal: domain / ports / usecases / adapters) + web UI (React, Vite, Tailwind)
  assessment/         Scanner container: Dockerfile, entrypoint, the six foe-scanner-* agents
  foe-schemas/        Zod schemas for reports, field guide, taxonomy, and the optional Neo4j graph
  vocabulary/         Field Guide parsers and index builders (methods, observations, keywords)
  delivery-framework/ Docusaurus site holding governance artifacts: capabilities, user stories,
                      user types, ADRs, NFRs, DDD models, practice areas, ROAD items
  chat/               Shared chat components and API client for the OpenCode assistant
  feature-flags/      OpenFeature client and server helpers
  foe-api/, web-report/   Earlier API and Next.js report viewer; type-checked but not in the container build
katalyst-bard/        Databricks AppKit app (React + Lakebase); separate install, see its README
stack-tests/          Playwright + playwright-bdd features (@api, @ui, @hybrid) via @esimplicity/stack-tests
foe-historical-scans/ Monthly FOE scans of Prima Control Tower, Jun 2025 to Jan 2026
scripts/              Seed and cleanup scripts
.opencode/, .agent/   Agents, skills, and plans for developing this repo with OpenCode or Claude Code
```

### API

All routes sit under `/api/v1`. Route groups: `scans`, `reports`, `repositories`, `domain-models`, `landscape`, `taxonomy`, `governance` (capabilities, user stories, user types), `contributions`, `competencies`, `practice-areas`, `team-adoptions`, `individual-adoptions`, `flags`, `lint`, `orchestrator`, `config`. Health lives at `/api/v1/health` and `/api/v1/ready`.

Adapters in `packages/intelligence/api/adapters/`: `sqlite` (Drizzle), `docker` (scanner spawn), `opencode` and `langgraph` (agent runners), `openfeature` (flags), `in-memory` (tests).

### Web UI

Pages in `packages/intelligence/web/src/pages/`: FOE Projects, Reports, Domain Mapper, Business Landscape, Architecture, Governance Dashboard, User Types, plus lifecycle, organization, and strategy sections. In dev, Vite proxies `/api` to the API port.

## Configuration

Loaded in `packages/intelligence/api/config/env.ts`. Set one LLM key.

| Variable | Default | Purpose |
|----------|---------|---------|
| `ANTHROPIC_API_KEY` | | Anthropic direct |
| `OPENROUTER_API_KEY` | | OpenRouter (keys start with `sk-or-`) |
| `AWS_BEARER_TOKEN_BEDROCK`, `AWS_REGION` | `us-east-1` | Amazon Bedrock |
| `PORT`, `HOST` | `3001`, `0.0.0.0` | API bind |
| `DATABASE_URL` | `./data/foe.db` | SQLite file |
| `SCANNER_IMAGE` | `foe-scanner` | Image spawned per scan |
| `SCAN_POLL_INTERVAL_MS` | `5000` | Background scan poller |
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |
| `CORS_ORIGINS` | | Allowed browser origins |
| `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` | | Optional knowledge graph (compose wires these) |
| `OPENCODE_INTERNAL_URL` | `http://127.0.0.1:4096` | Chat server the API proxies at `/opencode` |
| `WEB_DIST_DIR` | | Built UI to serve (container only) |

## Development

```bash
just --list          # every recipe, grouped
just check           # typecheck + lint + unit tests
just bdd-api         # API BDD scenarios against whatever environment is up
just bdd-ui          # browser scenarios
just dev-status      # which servers are reachable
just docker-build    # build the scanner image
```

Husky runs `just typecheck`, `just format-check`, and `just test` on commit, and `just check` plus `just bdd-api` on push. BDD recipes call `just dev-ready`, which looks for the dev servers on :3002 first and the container on :8090 second.

Delivery work is tracked as ROAD items in `packages/delivery-framework/roads/` and linked to capabilities (CAP), user stories (US), and user types (UT). BDD features carry the matching tags; `just bdd-validate-cap-tags` checks them.

## Further reading

- `agents.md` describes the scanner agents, scoring rules, and design principles. Some paths in it predate the `packages/intelligence` consolidation.
- `.opencode/README.md` covers the development agents and the superpowers orchestrator workflow.
- `packages/delivery-framework/` is the governance record: ADRs, NFRs, capabilities, and roadmap.

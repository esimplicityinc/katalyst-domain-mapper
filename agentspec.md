# Agent Specification — Katalyst Domain Mapper

Multi-agent system for FOE (Flow Optimized Engineering) assessment. Agents coordinate via BDD-first TDD workflows to build, test, and govern the platform.

## Architecture Overview

```
                        ┌─────────────────────────┐
                        │   main-orchestrator      │
                        │   (top-level router)     │
                        └────────┬────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  superpowers-     │  │  agent-manager   │  │  change-manager  │
│  orchestrator     │  │  (agent CRUD)    │  │  (governance)    │
│  (dev workflow)   │  │                  │  │                  │
└────────┬─────────┘  └────────┬─────────┘  └──────────────────┘
         │                     │
    ┌────┴────┐          ┌─────┴──────┐
    │ RED     │          │ agent-     │
    │ phase   │          │ creator    │
    ▼         │          │ agent-     │
bdd-writer    │          │ editor     │
    │         │          │ agent-     │
    │ GREEN   │          │ analyzer   │
    ▼         │          └────────────┘
code-writer   │
site-keeper   │
    │         │
    │ VERIFY  │
    ▼         │
bdd-runner    │
ci-runner     │
    │         │
    │ REVIEW  │
    ▼         │
architecture- │
  inspector   │
ddd-aligner   │
ux-ui-        │
  inspector   │
    └─────────┘
```

## Agent Registry

| # | Agent | Role | Mode | Autonomy |
|---|-------|------|------|----------|
| 1 | `main-orchestrator` | Top-level coordinator, delegates to subagents | Primary | High |
| 2 | `superpowers-orchestrator` | BDD-first dev workflow automation | Primary | High |
| 3 | `code-writer` | Implements features (DDD/Hexagonal) | Subagent | Medium |
| 4 | `site-keeper` | Dev server management & troubleshooting | Subagent | Medium |
| 5 | `bdd-writer` | Writes Gherkin scenarios & acceptance criteria | Subagent | Low |
| 6 | `bdd-runner` | Executes BDD tests, reports results | Subagent | Medium |
| 7 | `architecture-inspector` | Hexagonal architecture compliance auditor | Subagent | Low |
| 8 | `ddd-aligner` | DDD compliance checker (ubiquitous language, boundaries) | Subagent | Low |
| 9 | `ci-runner` | Runs CI pipeline (lint, typecheck, test) | Subagent | Medium |
| 10 | `ux-ui-inspector` | UI/UX quality & WCAG accessibility reviewer | Subagent | Low |
| 11 | `change-manager` | Creates CHANGE entries, collects signatures | Subagent | Low |
| 12 | `roadmap-addition` | Guides ROAD-XXX item creation | Subagent | Low |
| 13 | `agent-manager` | Top-level orchestrator for agent CRUD | Primary | Medium |
| 14 | `agent-creator` | Questionnaire-driven agent generation | Subagent | Low |
| 15 | `agent-editor` | Edit & improve existing agents | Subagent | Medium |
| 16 | `agent-analyzer` | Analyzes agent session logs for improvements | Subagent | Medium |
| 17 | `ddd-domain-mapper` | Interactive DDD domain discovery & mapping | Primary | Low |

## Skill Registry

| Skill | Purpose | Files |
|-------|---------|-------|
| `clean-ddd-hexagonal` | Clean Architecture + DDD + Hexagonal patterns reference | 8 |
| `katalyst-bdd-quickstart` | Getting started with Katalyst BDD framework | 1 |
| `katalyst-bdd-create-test` | Test creation patterns (API, UI, TUI, hybrid) | 1 |
| `katalyst-bdd-step-reference` | Built-in step definitions reference | 1 |
| `katalyst-bdd-architecture` | BDD framework internals (ports & adapters) | 1 |
| `katalyst-bdd-troubleshooting` | Debug common BDD failures | 1 |
| `superpowers-integration` | Superpowers methodology + domain agents | 1 |
| `test-driven-development` | TDD discipline (RED-GREEN-REFACTOR) | 1 |

## Agent Categories

### Development
- **code-writer** — Implements features following DDD/Hexagonal patterns. Domain layer first, then application, then infrastructure. GREEN phase specialist.
- **site-keeper** — Manages dev servers, resolves port conflicts, clears caches, fixes hot-reload. Uses `just dev-*` recipes.

### Testing
- **bdd-writer** — Creates Gherkin `.feature` files with proper tags (`@api`, `@ui`, `@hybrid`, `@ROAD-XXX`). RED phase specialist. Always asks permission before writing.
- **bdd-runner** — Executes tests via `just bdd-test` and variants. Categorizes failures, supports parallel execution.

### Quality
- **architecture-inspector** — Audits hexagonal compliance. Checks dependency direction, layer boundaries, port/adapter patterns. Reports only, does not modify code.
- **ddd-aligner** — Validates domain model alignment. Checks ubiquitous language, aggregate boundaries, bounded context isolation.
- **ci-runner** — Runs `just check` pipeline. Auto-fixes formatting and minor lint issues.
- **ux-ui-inspector** — Reviews WCAG 2.1 AA compliance, responsive design, visual consistency.

### Orchestration
- **main-orchestrator** — Entry point for user requests. Routes to specialist agents, synthesizes results, makes final decisions.
- **superpowers-orchestrator** — Automates the full RED-GREEN-REFACTOR cycle. Discovers roadmap items, drives BDD-first development.

### Governance
- **change-manager** — Creates CHANGE files with front matter in `docs/changes/`, collects agent signatures, validates compliance.
- **roadmap-addition** — Structured workflow for adding ROAD-XXX items. Validates against existing roadmap, generates sequential IDs.

### Agent Management
- **agent-manager** — Meta-orchestrator for agent CRUD. Three modes: create, edit, analyze.
- **agent-creator** — Questionnaire-driven: collects requirements, suggests architecture, generates agent `.md` files.
- **agent-editor** — Compares agent behavior vs docs, identifies gaps, applies improvements.
- **agent-analyzer** — Reviews OpenCode session logs to find patterns, inefficiencies, and improvement opportunities.

### Domain Discovery
- **ddd-domain-mapper** — Interactive conversational agent for domain mapping sessions. Helps map bounded contexts, aggregates, domain events, value objects, and ubiquitous language.

## Standard Workflow (BDD-First TDD)

```
1. PLAN      superpowers-orchestrator picks ROAD-XXX item
2. RED       bdd-writer creates failing .feature scenarios
3. GREEN     code-writer implements minimal code to pass
4. VERIFY    bdd-runner executes tests (just bdd-test)
5. REVIEW    architecture-inspector + ddd-aligner audit
6. REFACTOR  code-writer cleans up, keeps tests green
7. CI        ci-runner runs full pipeline (just ci)
8. GOVERN    change-manager creates CHANGE entry
```

## Key Commands (Justfile)

Agents reference these `just` recipes:

| Command | Used By | Purpose |
|---------|---------|---------|
| `just dev-all` | site-keeper | Start all dev servers |
| `just build` | ci-runner, code-writer | Build all packages |
| `just test` | ci-runner, bdd-runner | Run unit tests |
| `just bdd-test` | bdd-runner, superpowers | Run all BDD tests |
| `just bdd-tag <tag>` | bdd-runner | Run tests by tag |
| `just bdd-roadmap <id>` | superpowers | Run ROAD-specific tests |
| `just check` | ci-runner | Typecheck + lint + test |
| `just ci` | ci-runner | Full CI pipeline |
| `just db-generate` | code-writer | Generate DB migrations |
| `just db-migrate` | code-writer | Apply DB migrations |
| `just governance-lint` | change-manager | Lint governance docs |
| `just validate-docs` | change-manager | Validate documentation |
| `just capability-coverage` | bdd-writer | Coverage report |

## File Locations

```
.opencode/
├── agents/              # 17 agent definitions (.md)
├── skills/              # 8 skill packages
│   ├── clean-ddd-hexagonal/     (8 files)
│   ├── katalyst-bdd-*/          (5 skills, 1 file each)
│   ├── superpowers-integration/ (1 file)
│   └── test-driven-development/ (1 file)
└── plans/               # Execution plans

packages/
├── foe-schemas/         # Zod schemas (@foe/schemas)
├── foe-field-guide-tools/  # Field Guide parsers
├── foe-api/             # Elysia API server
├── foe-web-ui/          # React/Vite UI
├── web-report/          # Next.js report viewer
├── foe-scanner/         # Docker AI scanner (6 agents)
└── delivery-framework/  # Docusaurus docs + governance scripts

stack-tests/             # BDD test suite (playwright-bdd)
Justfile                 # Task runner (this spec's companion)
```

## Conventions

- **Tags**: BDD scenarios use `@api`, `@ui`, `@tui`, `@hybrid` for type; `@ROAD-XXX` for traceability; `@CAP-XXX` for capabilities.
- **Naming**: Agents are `kebab-case`. Skills are `kebab-case` directories under `.opencode/skills/`.
- **Governance**: All significant changes require a CHANGE entry with agent signatures.
- **Architecture**: Domain layer has zero external dependencies. Infrastructure depends inward via ports.

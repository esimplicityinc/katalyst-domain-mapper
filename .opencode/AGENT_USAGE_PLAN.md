# Agent & Subagent Usage Plan for Claude Code

## Overview

This project has a sophisticated multi-agent system with **3 orchestration layers**, **17 specialized agents**, **6 FOE scanner subagents**, and **8 skills**. This guide shows you how to leverage them effectively.

---

## 🏗️ Architecture: Three-Layer Orchestration

```
LAYER 1: Master Orchestrators (Full Workflow Automation)
├── superpowers-orchestrator   → Complete SDLC automation (roadmap → completion)
└── main-orchestrator          → Multi-agent coordination for complex tasks

LAYER 2: Domain Specialists (Focused Expertise)
├── Development
│   ├── code-writer            → Feature implementation (DDD/Hexagonal)
│   ├── ddd-aligner            → Domain model alignment
│   └── architecture-inspector → Hexagonal architecture compliance
├── Testing & Quality
│   ├── bdd-writer            → BDD scenario creation (ask permission first!)
│   ├── bdd-runner            → BDD test execution
│   └── ci-runner             → Quality gates (lint/type/test/format)
├── Review & Analysis
│   ├── ux-ui-inspector       → UI/UX quality review
│   └── change-manager        → CHANGELOG management
├── Infrastructure
│   └── site-keeper           → Server health & hot-reload
├── Discovery
│   └── ddd-domain-mapper     → Interactive domain discovery
└── Management
    ├── agent-manager         → Agent lifecycle (create/edit/analyze)
    └── roadmap-addition      → Add roadmap items

LAYER 3: Package-Specific Subagents (FOE Scanner)
└── packages/assessment/.opencode/agents/
    ├── foe-scanner-domain     → Domain modeling analysis
    ├── foe-scanner-arch       → Architecture pattern detection
    ├── foe-scanner-tests      → Test coverage analysis
    ├── foe-scanner-ci         → CI/CD maturity assessment
    ├── foe-scanner-docs       → Documentation quality
    └── foe-scanner-container  → Docker container operations
```

---

## 🎯 When to Use Each Agent

### Master Orchestrators (Start Here)

#### `@superpowers-orchestrator` ⭐ **PRIMARY ENTRY POINT**
**Use for:** ANY development work (features, bug fixes, refactoring)

**Workflow:**
1. Discovers roadmap items (ROAD-XXX)
2. Ensures BDD scenarios exist (asks permission)
3. Checks environment health
4. Executes Superpowers TDD cycle
5. Runs quality gates (architecture, DDD, CI, UI)
6. Auto-fixes issues (3 attempts)
7. Implements BDD steps (mandatory)
8. Updates documentation
9. Creates execution log

**Example:**
```
@superpowers-orchestrator start

→ Shows active ROAD items
→ You pick one
→ Asks: "Create BDD scenarios?"
→ Delegates to specialists
→ Runs all quality checks
→ Completes with full documentation
```

**Key Features:**
- **MUST delegate** (never implements directly)
- **Mandatory quality gates** (no bypass allowed)
- **BDD step implementation** (no more "TODO" steps)
- **Execution logging** (`.opencode/logs/`)

#### `@main-orchestrator`
**Use for:** Complex multi-faceted tasks, architectural decisions, or when you need high-level coordination without full SDLC

**Example:**
```
@main-orchestrator
"We need to refactor the governance domain to support multi-tenant access.
This touches aggregates, API routes, and the database schema."

→ Breaks into subtasks
→ Delegates to specialists
→ Synthesizes results
→ Updates documentation
```

---

### Development Agents

#### `@code-writer`
**Use for:** Direct feature implementation when NOT using full orchestration

**Capabilities:**
- Domain layer (aggregates, value objects, events)
- Application layer (services, use cases)
- Infrastructure (adapters, repositories)
- UI components (React/TypeScript)

**Example:**
```
@code-writer implement UserRegistration aggregate
- Follow DDD/Hexagonal patterns
- Create domain layer first
- Then application service
- Finally database adapter
- Request architecture review when done
```

**Sub-delegates to:**
- `@architecture-inspector` (after code changes)
- `@ddd-aligner` (for domain alignment)

#### `@architecture-inspector`
**Use for:** Verifying hexagonal architecture compliance

**Checks:**
- Ports & adapters pattern
- Dependency direction (inward only)
- Domain layer purity (no infrastructure imports)
- Repository interfaces in domain

**Example:**
```
@architecture-inspector verify hexagonal compliance for ROAD-035
```

**Result:** `PASS | CONDITIONAL PASS | FAIL` with detailed violations

#### `@ddd-aligner`
**Use for:** Domain model validation

**Checks:**
- Ubiquitous language consistency
- Aggregate boundaries
- Domain event naming
- Value object usage

**Example:**
```
@ddd-aligner check domain model for advertisement bot feature
```

#### `@ddd-domain-mapper` ⭐ **DISCOVERY TOOL**
**Use for:** Interactive domain discovery sessions, event storming, context mapping

**Capabilities:**
- Conversational domain discovery
- Code repository analysis
- Bounded context identification
- Aggregate extraction
- Domain event discovery
- Ubiquitous language building
- **Persists to API** (creates contexts, aggregates, events, glossary)

**Example:**
```
@ddd-domain-mapper

Let's map the domain for our new feature...

→ Asks targeted questions
→ Analyzes codebase
→ Identifies bounded contexts
→ Creates aggregates
→ Defines domain events
→ Builds glossary
→ SAVES TO API (http://localhost:8090)
```

**Critical:** All artifacts are saved to the governance API as you discover them.

---

### Testing & Quality Agents

#### `@bdd-writer` ⚠️ **ALWAYS ASK PERMISSION**
**Use for:** Creating BDD scenarios (Gherkin)

**Autonomy:** LOW - MUST ask before creating/editing

**Process:**
1. Reads roadmap item (ROAD-XXX)
2. Drafts scenarios
3. **ASKS PERMISSION** → "May I create these scenarios?"
4. Creates only after approval

**Example:**
```
@bdd-writer create BDD scenarios for ROAD-035 Advertisement Bot

→ Reads ROAD-035.md
→ Reads capabilities, personas, use cases
→ Drafts 5 scenarios
→ Shows preview
→ Asks: "May I create these?"
→ (You approve)
→ Creates feature file with tags
```

**Tagging:** All scenarios tagged with `@layer`, `@context`, `@ROAD-XXX`, `@CAP-XXX`

#### `@bdd-runner`
**Use for:** Executing BDD tests

**Example:**
```
@bdd-runner run tests for ROAD-035

→ Executes tests
→ Reports failures
→ Categorizes issues
→ Suggests fixes
```

#### `@ci-runner`
**Use for:** Full CI validation

**Runs:**
- Lint (`bunx eslint`)
- Typecheck (`bunx tsc --noEmit`)
- Tests (`bun test`)
- Format (`bunx prettier --check`)

**Auto-fixes:** Lint/format issues

**Example:**
```
@ci-runner validate before merge
```

---

### Review & Analysis Agents

#### `@ux-ui-inspector`
**Use for:** UI/UX quality review

**Checks:**
- Accessibility (WCAG)
- Responsive design
- Component consistency
- User experience patterns

**Example:**
```
@ux-ui-inspector review governance dashboard
```

#### `@change-manager`
**Use for:** Managing CHANGELOG entries

**Creates:** Individual `docs/changes/CHANGE-XXX.md` files with governance frontmatter

**Example:**
```
@change-manager create entry for ROAD-035 completion
```

---

### Infrastructure

#### `@site-keeper`
**Use for:** Development server management

**Capabilities:**
- Start/stop dev servers
- Fix hot-reload issues
- Diagnose build failures
- Port conflict resolution

**Example:**
```
@site-keeper check if dev servers are running
```

**Auto-starts:** `just dev-all` if needed

---

### Management Agents

#### `@agent-manager`
**Use for:** Agent lifecycle management

**Three modes:**
1. **Create** → Design new agents via questionnaire
2. **Edit** → Improve existing agents
3. **Analyze** → Review session logs for optimization

**Example:**
```
@agent-manager

→ "What would you like to do?"
→ 1. Create New Agent
→ 2. Edit Existing Agent
→ 3. Analyze Agent Sessions
```

**Delegates to:** `@agent-creator`, `@agent-editor`, `@agent-analyzer`

#### `@roadmap-addition`
**Use for:** Adding new roadmap items

**Creates:**
- `docs/roads/ROAD-XXX.md` with governance frontmatter
- Updates `docs/ROADMAP.mdx`

---

## 🔬 FOE Scanner Subagents (Package-Specific)

Located in `packages/assessment/.opencode/agents/`

### `@foe-scanner-domain`
**Analyzes:** Domain modeling practices (DDD patterns, bounded contexts, ubiquitous language)

### `@foe-scanner-arch`
**Analyzes:** Architecture patterns (layering, hexagonal, CQRS, event sourcing)

### `@foe-scanner-tests`
**Analyzes:** Test coverage, TDD practices, BDD maturity

### `@foe-scanner-ci`
**Analyzes:** CI/CD maturity, automation level, quality gates

### `@foe-scanner-docs`
**Analyzes:** Documentation quality, ADRs, API docs, runbooks

### `@foe-scanner-container`
**Analyzes:** Docker container operations for scanner agents

**Note:** These are typically invoked by the main scanner orchestrator, not directly.

---

## 🎓 Skills (Load Before Using)

### Core Methodology

#### `superpowers-integration` ⭐ **LOAD FOR ALL FEATURE WORK**
**Integrates:** Superpowers methodology + Domain agents

**Load when:**
- Starting new feature
- Refactoring
- Complex bug fixes

**Example:**
```
use skill tool to load superpowers-integration

→ Loads TDD/BDD workflow
→ Architecture enforcement rules
→ Quality gate requirements
```

#### `clean-ddd-hexagonal`
**Provides:** DDD & Hexagonal architecture patterns

**References:**
- Strategic DDD
- Tactical DDD
- Hexagonal architecture
- CQRS & Events
- Testing strategies
- Layer organization

**Load when:** Implementing domain features

#### `test-driven-development`
**Provides:** TDD discipline and best practices

**Load when:** Writing tests or test-driven code

---

### BDD Testing Skills

#### `katalyst-bdd-quickstart`
**Quick start guide for BDD testing in this project**

#### `katalyst-bdd-step-reference`
**Reference for available BDD step definitions**

#### `katalyst-bdd-create-test`
**Guide for creating new BDD tests**

#### `katalyst-bdd-troubleshooting`
**Debugging BDD test failures**

#### `katalyst-bdd-architecture`
**BDD testing architecture and patterns**

---

## 🔄 Common Workflows

### Workflow 1: Implement New Feature (Full TDD/BDD)

```
STEP 1: Start orchestration
@superpowers-orchestrator start

STEP 2: Select roadmap item
→ Pick ROAD-XXX from list

STEP 3: BDD scenario creation
→ Orchestrator asks: "Create BDD scenarios?"
→ You approve
→ @bdd-writer creates scenarios

STEP 4: Implementation
→ @code-writer implements domain layer
→ @architecture-inspector verifies (BLOCKING)
→ @code-writer implements application layer
→ @architecture-inspector re-verifies (BLOCKING)
→ @code-writer implements infrastructure
→ @architecture-inspector final check (BLOCKING)

STEP 5: Quality gates
→ @ddd-aligner checks domain model
→ @bdd-runner executes tests
→ @ci-runner validates
→ @ux-ui-inspector (if UI changes)

STEP 6: BDD step implementation
→ @code-writer implements missing step definitions
→ @bdd-runner re-runs to confirm 0 missing steps

STEP 7: Completion
→ Updates ROADMAP.md
→ Creates CHANGELOG entry
→ Creates execution log

RESULT: Feature complete, tested, documented
```

**Execution Log:** `.opencode/logs/YYYY-MM-DD-HHMMSS-ROAD-XXX.md`

---

### Workflow 2: Domain Discovery Session

```
STEP 1: Load DDD skill
use skill tool to load clean-ddd-hexagonal

STEP 2: Start domain mapper
@ddd-domain-mapper

Let's explore the advertising domain for our bot system...

STEP 3: Interactive discovery
→ Answers questions about business domain
→ Identifies bounded contexts
→ Defines aggregates
→ Discovers domain events
→ Builds ubiquitous language

STEP 4: Persistence
→ All artifacts saved to API (http://localhost:8090)
→ Contexts, aggregates, events, glossary

STEP 5: Validation
→ Check governance UI tabs (Contexts, Aggregates, Glossary)

RESULT: Domain model documented and persisted
```

---

### Workflow 3: Quick Bug Fix (Bypass Full Orchestration)

```
STEP 1: Identify issue
@bdd-runner identify failing test

STEP 2: Fix
@code-writer fix authentication token validation
- Locate bug in AuthService
- Fix logic
- Run tests

STEP 3: Validate
@architecture-inspector verify no violations
@ci-runner final check

STEP 4: Document
@change-manager create entry for bug fix

RESULT: Bug fixed, tests pass, documented
```

---

### Workflow 4: Architecture Review

```
STEP 1: Request review
@architecture-inspector verify hexagonal compliance

STEP 2: Review violations
→ Reports any issues
→ Categorizes: FAIL | CONDITIONAL PASS | PASS

STEP 3: Fix violations (if any)
@code-writer fix architecture violations
- Move logic to proper layer
- Create missing ports
- Extract adapters
- Remove infrastructure imports

STEP 4: Re-verify
@architecture-inspector re-verify

RESULT: Architecture compliant
```

---

### Workflow 5: Create New Agent

```
STEP 1: Start agent manager
@agent-manager

STEP 2: Select mode
→ Choose "1. Create New Agent"

STEP 3: Questionnaire
→ Agent name?
→ Purpose?
→ Autonomy level?
→ Tools needed?
→ Mode (primary/subagent)?

STEP 4: Generation
→ Creates `.opencode/agents/{name}.md`
→ Updates `opencode.json`
→ Configures permissions

STEP 5: Test
@{new-agent-name} help

RESULT: New agent ready to use
```

---

## ⚡ Quick Reference

### "I want to..." → "Use this agent/workflow"

| Goal | Command |
|------|---------|
| Implement a new feature | `@superpowers-orchestrator start` |
| Fix a bug quickly | `@code-writer fix [issue]` |
| Review architecture | `@architecture-inspector verify` |
| Check domain alignment | `@ddd-aligner check` |
| Create BDD scenarios | `@bdd-writer create scenarios for ROAD-XXX` |
| Run all tests | `@bdd-runner run tests` |
| Run CI checks | `@ci-runner validate` |
| Review UI/UX | `@ux-ui-inspector review [component]` |
| Map a domain | `@ddd-domain-mapper` |
| Start dev servers | `@site-keeper check servers` |
| Create new agent | `@agent-manager` |
| Add roadmap item | `@roadmap-addition` |
| Update CHANGELOG | `@change-manager create entry` |

### "I'm stuck with..." → "Try this"

| Problem | Solution |
|---------|----------|
| Test failures | `@bdd-runner identify failures` |
| Server won't start | `@site-keeper diagnose` |
| Architecture violations | `@architecture-inspector verify` → `@code-writer fix` |
| Domain model unclear | `@ddd-domain-mapper` (discovery session) |
| Missing BDD steps | `@code-writer implement BDD steps` |
| CI failing | `@ci-runner validate` (auto-fixes some) |
| Agent not working | `@agent-manager` → "3. Analyze Agent Sessions" |
| Complex multi-step task | `@main-orchestrator` (coordinates) |

---

## 🎯 Best Practices

### 1. Default to Orchestration
**Always prefer:** `@superpowers-orchestrator` for any substantial work

**Why:**
- Enforces TDD/BDD
- Runs quality gates
- Documents automatically
- Prevents architecture violations

**Skip orchestration only for:**
- Single-line fixes
- Documentation updates
- Pure research

### 2. Load Skills First
**Before implementing complex features:**
```
use skill tool to load superpowers-integration
use skill tool to load clean-ddd-hexagonal
```

**Why:** Ensures consistent patterns and methodology

### 3. Trust the Quality Gates
**Never bypass architecture checks**

If `@architecture-inspector` fails:
1. **STOP immediately**
2. Fix violations
3. Re-verify
4. Only proceed after PASS

**Why:** Prevents technical debt accumulation

### 4. BDD Always Asks Permission
**`@bdd-writer` autonomy: LOW**

Always presents draft scenarios before creating.

**Why:** BDD scenarios define contracts—user review is critical

### 5. Use Domain Discovery for New Features
**Before implementing new bounded contexts:**
```
@ddd-domain-mapper

→ Explore domain
→ Identify contexts
→ Define aggregates
→ Build glossary
```

**Why:** Prevents premature implementation decisions

### 6. Check Execution Logs
**After orchestration runs:**
```
cat .opencode/logs/YYYY-MM-DD-HHMMSS-ROAD-XXX.md
```

**Contains:**
- All tools used
- All subagents invoked
- Quality gate results
- Issues encountered

**Why:** Audit trail for debugging and learning

### 7. Delegate, Don't DIY
**Master orchestrators MUST delegate**

❌ **Wrong:** Orchestrator implements code directly
✅ **Right:** Orchestrator delegates to `@code-writer`

**Why:** Separation of concerns, agent expertise

---

## 🚫 Anti-Patterns (What NOT to Do)

### 1. Skipping Quality Gates
❌ **"Just skip architecture review this once"**
✅ **Always run quality gates**

**Result:** Technical debt, violations accumulate

### 2. Implementing Without BDD
❌ **Write code first, tests later**
✅ **BDD scenarios → Implementation → Tests pass**

**Result:** Tests don't reflect real requirements

### 3. Bypassing Orchestration for Complex Work
❌ **Direct agent calls for multi-step features**
✅ **Use `@superpowers-orchestrator`**

**Result:** Missing quality checks, incomplete documentation

### 4. Creating BDD Scenarios Without Permission
❌ **`@bdd-writer` creates without asking**
✅ **Always ask permission first**

**Result:** Misaligned scenarios, wasted effort

### 5. Self-Assessment in Quality Gates
❌ **Orchestrator marks architecture as "✅" without inspection**
✅ **Always invoke `@architecture-inspector`**

**Result:** Hidden violations, false sense of quality

### 6. Forgetting Execution Logs
❌ **Orchestration completes without log**
✅ **Always create `.opencode/logs/` entry**

**Result:** Lost audit trail, can't debug later

---

## 📊 Agent Autonomy Levels

| Agent | Autonomy | Asks Permission For |
|-------|----------|---------------------|
| `superpowers-orchestrator` | HIGH | BDD scenario creation only |
| `main-orchestrator` | HIGH | Major architectural changes |
| `code-writer` | MEDIUM | Large refactors (>10 files) |
| `architecture-inspector` | LOW | (Reports only, no changes) |
| `ddd-aligner` | MEDIUM | Domain model updates |
| `bdd-writer` | **LOW** | **ALWAYS asks before creating** |
| `bdd-runner` | HIGH | (Runs tests, reports results) |
| `ci-runner` | HIGH | (Auto-fixes lint/format) |
| `ux-ui-inspector` | LOW | (Reports only, no changes) |
| `site-keeper` | HIGH | Auto-restarts servers |
| `change-manager` | MEDIUM | Creating changelog entries |
| `ddd-domain-mapper` | MEDIUM | Saving to API (asks for design) |
| `agent-manager` | HIGH | (Questionnaire-driven) |

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `opencode.json` | Agent registry & configuration |
| `.opencode/agents/*.md` | Agent prompt files |
| `.opencode/skills/*/SKILL.md` | Skill definitions |
| `.opencode/logs/*.md` | Execution logs |
| `.opencode/plans/*.md` | Project plans |
| `packages/*/‌.opencode/agents/*.md` | Package-specific agents |

---

## 🎬 Getting Started

### Day 1: Familiarization
```bash
# 1. List all agents
ls .opencode/agents/

# 2. Read the main orchestrator
cat .opencode/agents/main-orchestrator.md

# 3. Read the superpowers orchestrator
cat .opencode/agents/superpowers-orchestrator.md

# 4. Try a simple task
@superpowers-orchestrator start
```

### Day 2: First Feature
```bash
# 1. Load methodology
use skill tool to load superpowers-integration

# 2. Start orchestration
@superpowers-orchestrator start

# 3. Follow prompts
# (Select roadmap item, approve BDD, watch delegation)

# 4. Review execution log
cat .opencode/logs/YYYY-MM-DD-*.md
```

### Day 3: Domain Discovery
```bash
# 1. Load DDD skill
use skill tool to load clean-ddd-hexagonal

# 2. Start mapper
@ddd-domain-mapper

# 3. Explore domain interactively
# (Answer questions, identify contexts, define aggregates)

# 4. Check governance UI
# (Verify contexts, aggregates, glossary tabs)
```

---

## 📚 Further Reading

### Agent Documentation
- `main-orchestrator.md` - High-level coordination
- `superpowers-orchestrator.md` - Full SDLC automation
- `agent-manager.md` - Agent lifecycle

### Skills Documentation
- `superpowers-integration/SKILL.md` - Methodology integration
- `clean-ddd-hexagonal/SKILL.md` - Architecture patterns
- `katalyst-bdd-quickstart/SKILL.md` - BDD quick start

### Project Documentation
- `docs/ROADMAP.mdx` - Feature roadmap
- `docs/roads/ROAD-*.md` - Individual roadmap items
- `docs/CHANGELOG.md` - Change history
- `AGENT.md` - Agent instructions
- `COMMANDS.md` - Command reference

---

## 🆘 Troubleshooting

### Agent Not Responding
1. Check `opencode.json` for agent registration
2. Verify `.opencode/agents/{name}.md` exists
3. Confirm correct `@mention` syntax
4. Check agent dependencies

### Superpowers Not Working
1. Verify installation: `ls ~/.config/opencode/superpowers`
2. Check plugin symlink: `ls -l ~/.config/opencode/plugins/`
3. Check skill symlink: `ls -l ~/.config/opencode/skills/`
4. Restart Claude Code

### Quality Gate Failures
1. Don't bypass—fix violations
2. Delegate to specialist agent
3. Re-run inspection
4. Only proceed after PASS

### Architecture Violations
```
@architecture-inspector identify violations
  ↓
🚫 WORKFLOW STOPS
  ↓
@code-writer fix violations
  ↓
@architecture-inspector re-verify
  ↓
✅ PASS → Continue
```

---

## ✅ Success Metrics

You're using agents effectively when:

- [ ] Most feature work uses `@superpowers-orchestrator`
- [ ] BDD scenarios created BEFORE implementation
- [ ] All architecture reviews run and PASS
- [ ] Execution logs exist for all orchestration runs
- [ ] Domain discovery sessions happen for new contexts
- [ ] Quality gates never bypassed
- [ ] Skills loaded before complex implementations
- [ ] Agents delegate rather than DIY
- [ ] BDD steps fully implemented (0 "TODO" steps)
- [ ] Documentation auto-updated

---

## 🎉 Summary

**You have 3 orchestration layers:**
1. **Master** → Full automation (`superpowers-orchestrator`, `main-orchestrator`)
2. **Specialists** → Focused expertise (code, architecture, BDD, CI, UX)
3. **Package-specific** → FOE scanner subagents

**Start with:**
```
@superpowers-orchestrator start
```

**For discovery:**
```
@ddd-domain-mapper
```

**For quick fixes:**
```
@code-writer [task]
@ci-runner validate
```

**Remember:**
- Delegate, don't DIY
- BDD before implementation
- Never bypass quality gates
- Trust the process

---

**Version:** 1.0.0
**Last Updated:** 2026-02-10
**Maintained by:** Agent Manager

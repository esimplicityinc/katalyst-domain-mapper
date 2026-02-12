# .opencode Directory

Welcome to the Katalyst Domain Mapper's multi-agent system powered by Claude Code.

## 📚 Documentation Structure

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[AGENT_USAGE_PLAN.md](./AGENT_USAGE_PLAN.md)** | Comprehensive guide to all agents & workflows | First-time setup, deep dive |
| **[AGENT_QUICK_REFERENCE.md](./AGENT_QUICK_REFERENCE.md)** | Quick lookup table for common tasks | Daily development, quick answers |
| **[AGENT_INTEGRATION_PATTERNS.md](./AGENT_INTEGRATION_PATTERNS.md)** | Visual workflows & integration patterns | Understanding agent collaboration |
| **[README.md](./README.md)** | Overview & getting started (this file) | Start here! |

---

## 🚀 Quick Start (60 seconds)

### Step 1: Load Core Skills
```bash
use skill tool to load superpowers-integration
use skill tool to load clean-ddd-hexagonal
```

### Step 2: Start Your First Feature
```bash
@superpowers-orchestrator start
```

### Step 3: Follow the Prompts
- Select roadmap item (ROAD-XXX)
- Approve BDD scenario creation
- Watch the orchestration
- Review execution log in `.opencode/logs/`

**That's it!** The orchestrator handles:
- BDD scenario creation
- Implementation with quality gates
- Architecture verification
- Test execution
- Documentation updates

---

## 🏗️ System Overview

### Three-Layer Architecture

```
LAYER 1: Master Orchestrators
├── superpowers-orchestrator (⭐ PRIMARY - use for 90% of work)
└── main-orchestrator (complex coordination)

LAYER 2: Domain Specialists (17 agents)
├── Development: code-writer, architecture-inspector, ddd-aligner
├── Testing: bdd-writer, bdd-runner, ci-runner
├── Review: ux-ui-inspector, change-manager
├── Infrastructure: site-keeper
├── Discovery: ddd-domain-mapper
└── Management: agent-manager, roadmap-addition

LAYER 3: Package Subagents (6 FOE scanners)
└── packages/assessment/.opencode/agents/
```

### Skills Library (8 skills)

```
Core Methodology:
├── superpowers-integration ⭐ (Load for ALL feature work)
├── clean-ddd-hexagonal (DDD & Hexagonal patterns)
└── test-driven-development (TDD discipline)

BDD Testing:
├── katalyst-bdd-quickstart
├── katalyst-bdd-step-reference
├── katalyst-bdd-create-test
├── katalyst-bdd-troubleshooting
└── katalyst-bdd-architecture
```

---

## 🎯 Common Scenarios

### "I want to implement a new feature"
```
@superpowers-orchestrator start
```
→ Full TDD/BDD workflow with quality gates

### "I want to fix a bug quickly"
```
@code-writer fix [issue]
@ci-runner validate
```

### "I want to map a new domain"
```
use skill tool to load clean-ddd-hexagonal
@ddd-domain-mapper
```
→ Interactive discovery session

### "I want to check architecture"
```
@architecture-inspector verify hexagonal compliance
```

### "I want to create BDD scenarios"
```
@bdd-writer create scenarios for ROAD-XXX
```
→ Asks permission before creating

### "I want to review UI/UX"
```
@ux-ui-inspector review [component]
```

### "I want to create a new agent"
```
@agent-manager
→ Select: "1. Create New Agent"
```

---

## 📖 Learning Path

### Day 1: Familiarization
1. Read this README
2. Skim [AGENT_QUICK_REFERENCE.md](./AGENT_QUICK_REFERENCE.md)
3. Try: `@superpowers-orchestrator start`

### Day 2: First Feature
1. Read [AGENT_USAGE_PLAN.md](./AGENT_USAGE_PLAN.md) → "Workflow 1"
2. Load skills: `superpowers-integration`, `clean-ddd-hexagonal`
3. Complete a full feature with orchestration
4. Review execution log

### Day 3: Domain Discovery
1. Read [AGENT_INTEGRATION_PATTERNS.md](./AGENT_INTEGRATION_PATTERNS.md) → "Pattern 3"
2. Run domain discovery session: `@ddd-domain-mapper`
3. Check governance UI for persisted artifacts

### Week 1: Mastery
- Use orchestration for all feature work
- Experiment with direct agent calls for quick tasks
- Create a custom agent with `@agent-manager`
- Review execution logs to understand patterns

---

## ⚡ Key Concepts

### 1. Orchestration Over Direct Implementation
**Always prefer:** `@superpowers-orchestrator` for substantial work

**Why?**
- Enforces TDD/BDD
- Runs mandatory quality gates
- Prevents architecture violations
- Documents automatically

### 2. Delegation Hierarchy
**Master orchestrators MUST delegate to specialists**

```
❌ WRONG: Orchestrator implements code
✅ RIGHT: Orchestrator delegates to @code-writer
```

### 3. Quality Gates Are Mandatory
**Architecture inspection CANNOT be bypassed**

```
@architecture-inspector finds violations
  ↓
🚫 WORKFLOW STOPS
  ↓
Fix violations
  ↓
Re-verify and PASS
  ↓
✅ Continue
```

### 4. BDD Before Code
**Always create BDD scenarios first**

```
1. @bdd-writer creates scenarios (asks permission)
2. Scenarios define expected behavior
3. @code-writer implements to make scenarios pass
4. @bdd-runner verifies
```

### 5. Skills Provide Context
**Load skills before complex work**

```
use skill tool to load superpowers-integration
use skill tool to load clean-ddd-hexagonal
```

This ensures agents follow consistent patterns and methodology.

---

## 🚫 Anti-Patterns (What NOT to Do)

| ❌ Anti-Pattern | ✅ Correct Approach |
|----------------|---------------------|
| Skip orchestration for features | Use `@superpowers-orchestrator` |
| Write code before BDD | Create BDD scenarios first |
| Bypass architecture checks | Fix violations, re-verify |
| Orchestrator implements code | Delegate to `@code-writer` |
| Create BDD without permission | `@bdd-writer` always asks |
| Skip execution logs | Always create logs |
| Don't load skills | Load relevant skills first |

---

## 📁 Directory Structure

```
.opencode/
├── README.md                           ← You are here
├── AGENT_USAGE_PLAN.md                 ← Comprehensive guide
├── AGENT_QUICK_REFERENCE.md            ← Quick lookup
├── AGENT_INTEGRATION_PATTERNS.md       ← Visual workflows
│
├── agents/                             ← Agent definitions (17 agents)
│   ├── main-orchestrator.md
│   ├── superpowers-orchestrator.md
│   ├── code-writer.md
│   ├── architecture-inspector.md
│   ├── ddd-aligner.md
│   ├── bdd-writer.md
│   ├── bdd-runner.md
│   ├── ci-runner.md
│   ├── ux-ui-inspector.md
│   ├── site-keeper.md
│   ├── ddd-domain-mapper.md
│   ├── agent-manager.md
│   ├── agent-creator.md
│   ├── agent-editor.md
│   ├── agent-analyzer.md
│   ├── change-manager.md
│   └── roadmap-addition.md
│
├── skills/                             ← Skill definitions (8 skills)
│   ├── superpowers-integration/
│   │   └── SKILL.md
│   ├── clean-ddd-hexagonal/
│   │   ├── SKILL.md
│   │   └── references/                 ← DDD reference docs
│   │       ├── CHEATSHEET.md
│   │       ├── CQRS-EVENTS.md
│   │       ├── DDD-STRATEGIC.md
│   │       ├── DDD-TACTICAL.md
│   │       ├── HEXAGONAL.md
│   │       ├── LAYERS.md
│   │       └── TESTING.md
│   ├── test-driven-development/
│   ├── katalyst-bdd-quickstart/
│   ├── katalyst-bdd-step-reference/
│   ├── katalyst-bdd-create-test/
│   ├── katalyst-bdd-troubleshooting/
│   └── katalyst-bdd-architecture/
│
├── logs/                               ← Execution logs
│   ├── 2026-02-09-120000-ROAD-002-003.md
│   ├── 2026-02-09-130000-ROAD-004.md
│   └── ... (auto-generated)
│
├── plans/                              ← Project plans
│   ├── 00-governance-mapper-overview.md
│   ├── 01-governance-schemas.md
│   ├── 02-ddd-schemas.md
│   └── ... (planning documents)
│
└── package.json                        ← Dependencies (Zod, etc.)
```

### Package-Specific Agents
```
packages/assessment/.opencode/agents/
├── foe-scanner-domain.md               ← Domain modeling analysis
├── foe-scanner-arch.md                 ← Architecture patterns
├── foe-scanner-tests.md                ← Test coverage
├── foe-scanner-ci.md                   ← CI/CD maturity
├── foe-scanner-docs.md                 ← Documentation quality
└── foe-scanner-container.md            ← Docker operations
```

---

## 🎓 Agent Autonomy Levels

| Agent | Autonomy | Key Behavior |
|-------|----------|--------------|
| `superpowers-orchestrator` | **HIGH** | Only asks for BDD creation |
| `main-orchestrator` | **HIGH** | Asks for major changes |
| `code-writer` | **MEDIUM** | Asks for large refactors |
| `bdd-writer` | **LOW** | **ALWAYS asks before creating** |
| `architecture-inspector` | **LOW** | Reports only, no changes |
| `ddd-aligner` | **MEDIUM** | Can update docs |
| `bdd-runner` | **HIGH** | Runs tests automatically |
| `ci-runner` | **HIGH** | Auto-fixes lint/format |
| `site-keeper` | **HIGH** | Auto-restarts servers |

---

## 🔗 Integration Points

### Governance API
- **URL:** `http://localhost:8090`
- **Used by:** `ddd-domain-mapper`
- **Purpose:** Persist bounded contexts, aggregates, events, glossary

### Development Servers
- **Managed by:** `site-keeper`
- **Command:** `just dev-all`
- **Purpose:** Start all development services

### BDD Tests
- **Location:** `stack-tests/features/`
- **Run:** `just bdd-test` or `just bdd-roadmap ROAD-XXX`
- **Managed by:** `bdd-writer`, `bdd-runner`

### CI Pipeline
- **Run:** `just check`
- **Managed by:** `ci-runner`
- **Checks:** Lint, typecheck, test, format

---

## 📊 Success Metrics

You're using the system effectively when:

- [ ] Most feature work uses `@superpowers-orchestrator`
- [ ] BDD scenarios created BEFORE implementation
- [ ] All architecture reviews run and PASS
- [ ] Execution logs exist for all orchestration runs
- [ ] Domain discovery sessions happen for new contexts
- [ ] Quality gates never bypassed
- [ ] Skills loaded before complex implementations
- [ ] Agents delegate rather than implement directly
- [ ] BDD steps fully implemented (0 "TODO" steps)
- [ ] Documentation auto-updated

---

## 🆘 Troubleshooting

### Agent Not Responding
```bash
# Check registration
cat opencode.json | grep "agent-name"

# Verify agent file exists
ls .opencode/agents/agent-name.md

# Check syntax
@agent-name help
```

### Superpowers Not Working
```bash
# Verify installation
ls ~/.config/opencode/superpowers

# Check plugin symlink
ls -l ~/.config/opencode/plugins/

# Restart Claude Code
```

### Quality Gate Failures
```bash
# Don't bypass - fix violations
@architecture-inspector verify
@code-writer fix violations
@architecture-inspector re-verify
```

### Execution Log Missing
```bash
# Check logs directory
ls -la .opencode/logs/

# Verify orchestrator created log
# (Look for latest YYYY-MM-DD-*.md file)
```

---

## 📞 Getting Help

### Quick Answers
→ Read [AGENT_QUICK_REFERENCE.md](./AGENT_QUICK_REFERENCE.md)

### Deep Dive
→ Read [AGENT_USAGE_PLAN.md](./AGENT_USAGE_PLAN.md)

### Visual Workflows
→ Read [AGENT_INTEGRATION_PATTERNS.md](./AGENT_INTEGRATION_PATTERNS.md)

### Agent-Specific Help
→ Read `.opencode/agents/[agent-name].md`

### Skill-Specific Help
→ Read `.opencode/skills/[skill-name]/SKILL.md`

### Analyze Agent Performance
```
@agent-manager
→ Select: "3. Analyze Agent Sessions"
```

---

## 🎉 Getting Started Checklist

### First-Time Setup
- [ ] Read this README
- [ ] Skim AGENT_QUICK_REFERENCE.md
- [ ] Load skills: `superpowers-integration`, `clean-ddd-hexagonal`
- [ ] Try: `@superpowers-orchestrator start`
- [ ] Review execution log after completion

### Daily Workflow
- [ ] Start with: `@superpowers-orchestrator start`
- [ ] For quick fixes: `@code-writer` → `@ci-runner`
- [ ] For discovery: `@ddd-domain-mapper`
- [ ] Always check execution logs

### Quality Checks
- [ ] Architecture verified by `@architecture-inspector`
- [ ] Domain aligned by `@ddd-aligner`
- [ ] Tests passing via `@bdd-runner`
- [ ] CI green via `@ci-runner`

---

## 💡 Pro Tips

1. **Default to orchestration** - Use `@superpowers-orchestrator` unless task is trivial
2. **Load skills first** - Provides consistent context for agents
3. **Trust quality gates** - They prevent technical debt
4. **Check logs** - Learn from past executions
5. **BDD before code** - Always create scenarios first
6. **Delegate everything** - Let specialists do their job
7. **Review patterns** - Study AGENT_INTEGRATION_PATTERNS.md for complex workflows

---

## 🔄 Workflow Summary

### Standard Feature Development
```
1. Load skills (superpowers-integration, clean-ddd-hexagonal)
2. @superpowers-orchestrator start
3. Select ROAD-XXX
4. Approve BDD scenarios
5. Watch delegation (code-writer, architecture-inspector, ddd-aligner)
6. Quality gates run automatically
7. BDD steps implemented
8. Documentation updated
9. Review execution log
```

### Quick Bug Fix
```
1. @bdd-runner identify failure
2. @code-writer fix [issue]
3. @architecture-inspector verify
4. @ci-runner validate
5. @change-manager create entry
```

### Domain Discovery
```
1. use skill tool to load clean-ddd-hexagonal
2. @ddd-domain-mapper
3. Answer questions (conversational)
4. Contexts, aggregates, events, glossary saved to API
5. Check governance UI for results
```

---

## 📚 Additional Resources

### Project Documentation
- `docs/ROADMAP.mdx` - Feature roadmap
- `docs/roads/ROAD-*.md` - Individual roadmap items
- `docs/CHANGELOG.md` - Change history
- `AGENT.md` - Agent instructions
- `COMMANDS.md` - Command reference

### DDD Resources
- `.opencode/skills/clean-ddd-hexagonal/references/` - Full DDD reference library

### Execution History
- `.opencode/logs/` - All orchestration runs

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-10 | Initial documentation suite |

---

## 🎯 TL;DR

**Start 90% of your work with:**
```
@superpowers-orchestrator start
```

**For everything else:**
- Quick bug fix → `@code-writer` + `@ci-runner`
- Domain discovery → `@ddd-domain-mapper`
- Architecture review → `@architecture-inspector`
- Agent management → `@agent-manager`

**Golden Rules:**
1. BDD before code
2. Quality gates are mandatory
3. Orchestrators delegate (never implement)
4. Load skills first
5. Check execution logs

---

**Welcome to the multi-agent future of software development!** 🚀

For questions or issues, refer to the comprehensive guides in this directory.

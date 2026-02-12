# Agent Quick Reference Card

## 🚀 Most Common Commands

### Start Any Development Work
```
@superpowers-orchestrator start
```
→ Full TDD/BDD workflow with quality gates

### Domain Discovery
```
@ddd-domain-mapper
```
→ Interactive domain modeling session

### Quick Bug Fix
```
@code-writer fix [issue]
@ci-runner validate
```

---

## 📋 Agent Cheat Sheet

| Task | Agent | Example |
|------|-------|---------|
| **New Feature** | `@superpowers-orchestrator` | `@superpowers-orchestrator start` |
| **Complex Task** | `@main-orchestrator` | `@main-orchestrator refactor governance` |
| **Implement Code** | `@code-writer` | `@code-writer implement UserAuth aggregate` |
| **Check Architecture** | `@architecture-inspector` | `@architecture-inspector verify compliance` |
| **Check Domain** | `@ddd-aligner` | `@ddd-aligner check domain model` |
| **Create BDD** | `@bdd-writer` | `@bdd-writer create scenarios for ROAD-035` |
| **Run Tests** | `@bdd-runner` | `@bdd-runner run tests` |
| **CI Check** | `@ci-runner` | `@ci-runner validate` |
| **UI Review** | `@ux-ui-inspector` | `@ux-ui-inspector review dashboard` |
| **Server Issues** | `@site-keeper` | `@site-keeper check servers` |
| **Domain Discovery** | `@ddd-domain-mapper` | `@ddd-domain-mapper` |
| **Manage Agents** | `@agent-manager` | `@agent-manager` |
| **Add Roadmap** | `@roadmap-addition` | `@roadmap-addition` |
| **CHANGELOG** | `@change-manager` | `@change-manager create entry` |

---

## 🎓 Skills to Load

### Before Feature Work
```
use skill tool to load superpowers-integration
use skill tool to load clean-ddd-hexagonal
```

### Before Testing
```
use skill tool to load test-driven-development
use skill tool to load katalyst-bdd-quickstart
```

---

## ⚡ Emergency Fixes

### Tests Failing
```
@bdd-runner identify failures
@code-writer fix [specific issue]
@bdd-runner re-run
```

### Server Down
```
@site-keeper diagnose
→ Auto-fixes or reports issue
```

### Architecture Violations
```
@architecture-inspector verify
@code-writer fix violations
@architecture-inspector re-verify
```

### CI Failing
```
@ci-runner validate
→ Auto-fixes lint/format
→ Reports other issues
```

---

## 🎯 Decision Tree

```
Need to do something?
├─ Is it a feature? → @superpowers-orchestrator start
├─ Is it complex/multi-part? → @main-orchestrator
├─ Is it domain discovery? → @ddd-domain-mapper
├─ Is it a quick fix? → @code-writer + @ci-runner
├─ Is it architecture review? → @architecture-inspector
├─ Is it domain check? → @ddd-aligner
├─ Is it BDD scenarios? → @bdd-writer (asks permission!)
├─ Is it test execution? → @bdd-runner
├─ Is it UI review? → @ux-ui-inspector
├─ Is it server issues? → @site-keeper
└─ Is it agent management? → @agent-manager
```

---

## 🚫 Critical Rules

### ⚠️ NEVER
- ❌ Skip architecture inspection
- ❌ Bypass quality gates
- ❌ Create BDD without permission
- ❌ Let orchestrator implement directly
- ❌ Skip execution logs

### ✅ ALWAYS
- ✅ Use `@superpowers-orchestrator` for features
- ✅ Run architecture inspection after code
- ✅ Ask permission before BDD creation
- ✅ Delegate from orchestrators
- ✅ Create execution logs

---

## 📊 Autonomy Levels

| Agent | Permission Required? |
|-------|---------------------|
| `superpowers-orchestrator` | Only for BDD creation |
| `main-orchestrator` | For major changes |
| `code-writer` | For large refactors |
| `bdd-writer` | **ALWAYS** |
| `architecture-inspector` | (Reports only) |
| `ddd-aligner` | For updates |
| `bdd-runner` | (Runs tests) |
| `ci-runner` | (Auto-fixes some) |
| `site-keeper` | (Auto-restarts) |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.opencode/agents/*.md` | Agent definitions |
| `.opencode/skills/*/SKILL.md` | Skill definitions |
| `.opencode/logs/*.md` | Execution logs |
| `opencode.json` | Agent registry |
| `docs/roads/ROAD-*.md` | Roadmap items |
| `docs/ROADMAP.mdx` | Roadmap dashboard |

---

## 🔄 Standard Workflows

### Full Feature
```
1. @superpowers-orchestrator start
2. Select ROAD-XXX
3. Approve BDD scenarios
4. Watch delegation
5. Review execution log
```

### Quick Fix
```
1. @code-writer fix [issue]
2. @ci-runner validate
3. @change-manager create entry
```

### Domain Discovery
```
1. use skill tool to load clean-ddd-hexagonal
2. @ddd-domain-mapper
3. Answer questions
4. Check governance UI
```

### Architecture Review
```
1. @architecture-inspector verify
2. If FAIL → @code-writer fix violations
3. @architecture-inspector re-verify
4. Proceed only after PASS
```

---

## 💡 Pro Tips

1. **Default to orchestration** - Use `@superpowers-orchestrator` unless trivial
2. **Load skills first** - Context for better results
3. **Trust quality gates** - They prevent tech debt
4. **Check logs** - Learn from execution history
5. **BDD first** - Always create scenarios before code
6. **Delegate everything** - Let specialists do their job

---

## 🆘 Quick Fixes

| Problem | Solution |
|---------|----------|
| Agent not found | Check `opencode.json` |
| Tests failing | `@bdd-runner identify failures` |
| Server down | `@site-keeper diagnose` |
| Architecture violations | `@architecture-inspector verify` |
| CI failing | `@ci-runner validate` |
| Agent misbehaving | `@agent-manager` → Analyze |

---

## 📞 Help

```
For full documentation:
cat .opencode/AGENT_USAGE_PLAN.md

For agent details:
cat .opencode/agents/[agent-name].md

For skill details:
cat .opencode/skills/[skill-name]/SKILL.md
```

---

**TL;DR:**
```
@superpowers-orchestrator start  ← Start here for 90% of work
```

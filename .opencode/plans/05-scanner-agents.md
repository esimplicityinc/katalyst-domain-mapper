# Phase 5: Scanner Agent Enhancement

**Package:** `packages/foe-scanner/.opencode/agents/`
**Depends on:** Phase 3 (governance index must be buildable)
**Can run in parallel with:** Phase 4 (API), Phase 6 (prima)

## Objective

Add a new governance scanner agent and enhance the existing DDD domain agent to consume the governance index. The governance agent assesses a project's governance maturity across all artifact types, producing findings that feed into the FOE scan report.

## Docker Build Changes

### `packages/foe-scanner/Dockerfile`

Extend the builder stage to also build the governance index:

```dockerfile
# Stage 1: Builder (existing + governance)
FROM oven/bun:1 AS builder
WORKDIR /build
COPY . .
RUN bun install --frozen-lockfile
RUN bun run --filter @foe/schemas build
RUN bun run --filter @foe/field-guide-tools build          # existing methods + observations
RUN bun run --filter @foe/field-guide-tools build:governance # NEW

# Stage 2: Runtime (existing + governance index)
FROM node:22-slim
# ... existing setup ...
COPY --from=builder /build/packages/foe-field-guide-tools/dist/methods-index.json /app/data/
COPY --from=builder /build/packages/foe-field-guide-tools/dist/observations-index.json /app/data/
COPY --from=builder /build/packages/foe-field-guide-tools/dist/governance-index.json /app/data/  # NEW

ENV FOE_GOVERNANCE_INDEX=/app/data/governance-index.json  # NEW
```

## Files to Create

### `packages/foe-scanner/.opencode/agents/foe-scanner-governance.md`

New specialist agent for governance health analysis.

```markdown
---
name: foe-scanner-governance
description: Analyzes project governance artifacts (capabilities, personas, road items, ADRs, BDD features, DDD model)
trigger: "@governance"
tools:
  - bash
  - glob
  - grep
  - read
temperature: 0.3
---

# FOE Scanner — Governance Analyst

## FOE Principles
- **Understanding** (primary): Governance documentation completeness and clarity
- **Confidence** (secondary): Cross-reference integrity and validation coverage

## Your Mission

Analyze the target repository's governance documentation artifacts and produce
structured findings. You assess governance maturity across these dimensions:

### SubScore 1: Artifact Completeness (0-25)

Check for existence and quality of:
- [ ] Capability files (CAP-*.md) with valid frontmatter
- [ ] Persona files (PER-*.md) with archetypes and capability links
- [ ] User Story files (US-*.md) with persona and capability references
- [ ] Road Item files (ROAD-*.md) with governance blocks
- [ ] ADR files (ADR-*.md) with status and category
- [ ] NFR files (NFR-*.md) with measurable thresholds
- [ ] Change Entry files (CHANGE-*.md) with compliance and signatures

**Scoring guide:**
- 0-5: No governance artifacts found
- 6-12: Some artifacts exist but incomplete frontmatter
- 13-18: Most artifact types present with valid frontmatter
- 19-25: All artifact types present, well-populated, current

### SubScore 2: Cross-Reference Integrity (0-25)

Verify referential integrity:
- [ ] Every Persona references existing Capabilities
- [ ] Every User Story references existing Persona and Capabilities
- [ ] Every Road Item references existing Capabilities
- [ ] Every Change Entry references existing Road Item
- [ ] Dependency chains (depends_on/blocks) form valid DAG (no cycles)
- [ ] ADR compliance checks reference existing ADRs

**Scoring guide:**
- 0-5: No cross-references or all broken
- 6-12: Some cross-references exist but many broken
- 13-18: Most cross-references valid, few broken
- 19-25: All cross-references valid, dependency graph is a DAG

### SubScore 3: State Machine Compliance (0-25)

Verify governance workflow:
- [ ] Road items have valid status values
- [ ] Status progression follows the 8-state machine
- [ ] Governance blocks match status (e.g., adr_validated has adrs.validated=true)
- [ ] Complete items have passing BDD and NFR checks
- [ ] Change entries for complete roads have required signatures

**Scoring guide:**
- 0-5: No state machine adherence
- 6-12: Statuses present but governance blocks inconsistent
- 13-18: Most items follow state machine with valid governance
- 19-25: Full state machine compliance, all gates enforced

### SubScore 4: DDD Model Quality (0-25)

Assess domain model documentation:
- [ ] Bounded Context files with clear responsibilities
- [ ] Aggregate files with invariants and command lists
- [ ] Value Object files with property constraints
- [ ] Domain Event files with payloads and consumer lists
- [ ] Context map (upstream/downstream relationships documented)
- [ ] Ubiquitous language consistency in naming

**Scoring guide:**
- 0-5: No DDD documentation
- 6-12: Some DDD artifacts but incomplete model
- 13-18: Most DDD concepts documented with cross-references
- 19-25: Complete domain model with enforced invariants and event flows

## Analysis Steps

1. **Detect governance directories**: Look for `docs/`, `capabilities/`, `personas/`,
   `roads/`, `adr/`, `ddd/` directories
2. **Parse frontmatter**: Read YAML frontmatter from each markdown file
3. **Check cross-references**: Verify all ID references resolve
4. **Validate state machine**: Check ROAD item governance blocks match their status
5. **Assess DDD model**: Look for bounded context, aggregate, and event definitions
6. **Check for governance tooling**: Look for governance linter scripts, validation CI jobs
7. **Produce findings**: Generate evidence-based gaps and strengths

## Method References

| Gap Area | Method ID | Field Guide Path |
|----------|-----------|-----------------|
| Missing governance artifacts | M159 | agentic-coding/methods/emerging/M159-governed-ai-coding-agents |
| No state machine enforcement | M147 | field-guides/methods/established/M147-knowledge-distribution |
| Missing DDD documentation | M154 | field-guides/methods/emerging/M154-understanding-first |
| No cross-reference validation | M151 | field-guides/methods/established/M151-system-over-individuals |

## Output Format

Return YAML with this structure:

```yaml
dimension: Understanding
subscores:
  - name: Artifact Completeness
    score: X
    max: 25
    confidence: high|medium|low
    evidence:
      - "Found N capability files with valid frontmatter"
    gaps:
      - "Missing persona files entirely"
  - name: Cross-Reference Integrity
    score: X
    max: 25
    ...
  - name: State Machine Compliance
    score: X
    max: 25
    ...
  - name: DDD Model Quality
    score: X
    max: 25
    ...
findings:
  - severity: critical|high|medium|low
    title: "Finding title"
    evidence: "Specific evidence"
    impact: "Impact description"
    recommendation: "What to do"
    methods:
      - methodId: M159
        title: "Use Governed AI Coding Agents"
```
```

## Files to Modify

### `packages/foe-scanner/.opencode/agents/foe-scanner-container.md`

Update the orchestrator to dispatch the governance agent as a 6th specialist:

In the **Phase 2: Dispatch** section, add:

```markdown
6. **Governance Analyst** (`@governance`):
   - Analyzes governance documentation artifacts
   - Checks cross-reference integrity and state machine compliance
   - Assesses DDD model documentation quality
   - Returns Understanding + Confidence dimension data
```

In the **Phase 3: Synthesis** section, update the Understanding dimension calculation to incorporate governance subscores:

```markdown
Understanding dimension now draws from:
- Architecture agent (4 subscores)
- Domain agent (4 subscores)
- Docs agent (4 subscores)
- Governance agent (4 subscores) — NEW

The orchestrator selects the most relevant subscores, weighting governance findings
when governance artifacts are present, and falling back to existing agents when not.
```

### `packages/foe-scanner/.opencode/agents/foe-scanner-domain.md`

Enhance to also check for DDD markdown artifacts (not just code patterns):

Add to the analysis steps:

```markdown
### Enhanced: Check for DDD Documentation Artifacts

In addition to code-level DDD patterns, also check for:
- `docs/ddd/contexts/*.md` — Bounded context documentation
- `docs/ddd/aggregates/*.md` — Aggregate definitions with invariants
- `docs/ddd/value-objects/*.md` — Value object specifications
- `docs/ddd/events/*.md` — Domain event catalogs

If these exist, verify:
- Frontmatter has required fields (slug, title, context)
- Cross-references between aggregates and contexts are valid
- Event payloads are documented
- Invariants are listed
```

## Scoring Integration

The governance agent's 4 subscores feed into the **Understanding** dimension:

| Subscore | Weight in Understanding | Justification |
|----------|------------------------|---------------|
| Artifact Completeness | Replaces part of "Doc Quality" | Governance docs are a superset of general docs |
| Cross-Reference Integrity | New signal | Measures system-level coherence |
| State Machine Compliance | New signal | Measures process maturity |
| DDD Model Quality | Enhances existing "Domain Modeling" | Adds formal DDD artifact checking |

When the governance agent detects zero governance artifacts, it returns a low-confidence score and the orchestrator falls back to the existing domain/docs agents. This ensures backward compatibility with repos that don't use the governance pattern.

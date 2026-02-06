# Phase 6: Prima Delivery Demonstrator Integration

**Repo:** `/Users/aaron.west/Documents/prima-delivery-demonstrator/`
**Depends on:** Phase 1-3 (schemas + parsers + CLI must be built and published/linked)
**Can run in parallel with:** Phase 4 (API), Phase 5 (scanner)

## Objective

Replace prima's hand-written JavaScript validation scripts with the canonical `@foe/schemas` and `@foe/field-guide-tools` packages. This eliminates ~1,500 lines of JS validation code and replaces it with Zod-validated, type-safe tooling.

## Current State of Prima

### Scripts to Replace (~1,500 lines total)

| Script | Lines | Purpose | Replaced By |
|--------|-------|---------|-------------|
| `docs/scripts/governance-linter.js` | ~715 | Validate ROAD, ADR, CAP, US, PER frontmatter; state machine transitions | `foe-field-guide validate:governance` |
| `docs/scripts/validate-changes.js` | ~200 | Validate CHANGE file frontmatter, compliance, signatures | `foe-field-guide validate:governance` |
| `docs/scripts/validate-bdd-tags.js` | ~150 | Validate BDD feature file tags | `foe-field-guide validate:governance` |
| `docs/scripts/capability-coverage-report.js` | ~200 | Feature-to-capability test coverage | `foe-field-guide coverage:capabilities` |
| `docs/scripts/persona-coverage-report.js` | ~200 | Persona-to-user-story coverage | `foe-field-guide coverage:personas` |

### Plugins to Update

| Plugin | Purpose | Change |
|--------|---------|--------|
| `docs/plugins/roadmap-data-plugin.js` | Generates `static/roadmap-data.json` from ROAD files | Consume `governance-index.json` instead of hand-parsing |
| `docs/plugins/bdd-data-plugin.js` | Generates `static/bdd-data.json` from CHANGE files | Consume `governance-index.json` |

### Governance Data Currently Hardcoded in JS

These constants from `governance-linter.js` (lines 22-66) are now defined in Zod schemas:

```javascript
// These move to @foe/schemas/governance
const VALID_ROAD_STATUSES = ['proposed', 'adr_validated', ...];     → RoadStatusSchema
const VALID_ADR_STATUSES = ['proposed', 'accepted', ...];           → AdrStatusSchema
const VALID_CAPABILITY_IDS = ['CAP-001', ...];                      → CapabilityIdPattern (dynamic)
const VALID_USER_STORY_IDS = ['US-001', ...];                       → UserStoryIdPattern (dynamic)
const VALID_PERSONA_TYPES = ['human', 'bot', ...];                  → PersonaSchema.type
const VALID_PERSONA_ARCHETYPES = ['creator', ...];                  → PersonaSchema.archetype
const STATE_MACHINE_TRANSITIONS = { proposed: [...], ... };         → STATE_MACHINE_TRANSITIONS
```

## Step-by-Step Migration

### Step 1: Add Dependencies

In `prima-delivery-demonstrator/docs/package.json`:

```json
{
  "dependencies": {
    "@foe/schemas": "link:../../katalyst-domain-mapper/packages/foe-schemas",
    "@foe/field-guide-tools": "link:../../katalyst-domain-mapper/packages/foe-field-guide-tools"
  }
}
```

Or if published to a registry:

```json
{
  "dependencies": {
    "@foe/schemas": "^0.1.0",
    "@foe/field-guide-tools": "^0.1.0"
  }
}
```

### Step 2: Create Missing Artifact Directories

Create the directory structure that the parsers expect:

```bash
mkdir -p docs/capabilities
mkdir -p docs/personas
mkdir -p docs/user-stories
mkdir -p docs/use-cases
mkdir -p docs/ddd/contexts
mkdir -p docs/ddd/aggregates
mkdir -p docs/ddd/value-objects
mkdir -p docs/ddd/events
```

### Step 3: Create Actual Artifact Files

Populate from the domain knowledge currently embedded in agent prompts:

#### From `.opencode/agents/ddd-aligner.md` → DDD markdown files

Create these files with proper frontmatter:

**Bounded Contexts (4 files):**
- `docs/ddd/contexts/bot-identity.md`
- `docs/ddd/contexts/promise-market.md`
- `docs/ddd/contexts/token-management.md`
- `docs/ddd/contexts/settlement-verification.md`

**Aggregates (5 files):**
- `docs/ddd/aggregates/bot-account.md`
- `docs/ddd/aggregates/promise.md`
- `docs/ddd/aggregates/wallet.md`
- `docs/ddd/aggregates/escrow-account.md`
- `docs/ddd/aggregates/settlement-case.md`

**Value Objects (15 files):**
- `docs/ddd/value-objects/bot-id.md`
- `docs/ddd/value-objects/reputation-score.md`
- `docs/ddd/value-objects/api-key.md`
- `docs/ddd/value-objects/promise-id.md`
- `docs/ddd/value-objects/model-name.md`
- `docs/ddd/value-objects/pricing-terms.md`
- `docs/ddd/value-objects/promise-state.md`
- `docs/ddd/value-objects/token-amount.md`
- `docs/ddd/value-objects/transaction-id.md`
- `docs/ddd/value-objects/escrow-state.md`
- `docs/ddd/value-objects/escrow-id.md`
- `docs/ddd/value-objects/locked-funds.md`
- `docs/ddd/value-objects/stake-lock.md`
- `docs/ddd/value-objects/verification-result.md`
- `docs/ddd/value-objects/settlement-decision.md`

**Domain Events (12 files):**
- `docs/ddd/events/bot-registered.md`
- `docs/ddd/events/authentication-succeeded.md`
- `docs/ddd/events/authentication-failed.md`
- `docs/ddd/events/promise-accepted.md`
- `docs/ddd/events/escrow-created.md`
- `docs/ddd/events/tokens-locked.md`
- `docs/ddd/events/tokens-escrowed.md`
- `docs/ddd/events/execution-started.md`
- `docs/ddd/events/execution-completed.md`
- `docs/ddd/events/escrow-released.md`
- `docs/ddd/events/escrow-returned.md`
- `docs/ddd/events/escrow-disputed.md`

#### From `governance-linter.js` constants → Capability files

**Capabilities (8 files):**
- `docs/capabilities/CAP-001.md` — Authentication
- `docs/capabilities/CAP-002.md` — Audit Logging
- `docs/capabilities/CAP-003.md` — Real-time Notifications
- `docs/capabilities/CAP-004.md` — Rate Limiting
- `docs/capabilities/CAP-005.md` — Escrow Management
- `docs/capabilities/CAP-006.md` — Reputation Calculation
- `docs/capabilities/CAP-007.md` — Oracle Verification
- `docs/capabilities/CAP-008.md` — (to be named)

#### From governance-linter constants → Persona files

**Personas (5 files):**
- `docs/personas/PER-001.md`
- `docs/personas/PER-002.md`
- `docs/personas/PER-003.md`
- `docs/personas/PER-004.md`
- `docs/personas/PER-005.md`

#### From BDD writer agent → Road Item files

**Road Items (~12 files):**
- `docs/roads/ROAD-004.md` — Bot Registration
- `docs/roads/ROAD-005.md` — Bot Authentication
- `docs/roads/ROAD-007.md` — Bot Reputation
- `docs/roads/ROAD-008.md` — Wallet Operations
- `docs/roads/ROAD-009.md` — Escrow System
- `docs/roads/ROAD-010.md` — Stake Management
- `docs/roads/ROAD-012.md` — Promise Creation
- `docs/roads/ROAD-013.md` — Promise Listing
- `docs/roads/ROAD-016.md` — Promise Acceptance
- `docs/roads/ROAD-018.md` — Verification
- `docs/roads/ROAD-019.md` — Settlement Process
- `docs/roads/ROAD-020.md` — Dispute Resolution

### Step 4: Update Justfile

Replace script-based recipes with CLI commands:

```just
# Before (prima's current Justfile)
governance-lint:
    node docs/scripts/governance-linter.js --ci

lint-road road:
    node docs/scripts/governance-linter.js {{road}}

capability-coverage:
    node docs/scripts/capability-coverage-report.js

persona-coverage:
    node docs/scripts/persona-coverage-report.js

validate-changes:
    node docs/scripts/validate-changes.js

# After (using @foe/field-guide-tools CLI)
governance-lint:
    bunx foe-field-guide validate:governance

lint-road road:
    bunx foe-field-guide validate:governance docs/roads/{{road}}.md

capability-coverage:
    bunx foe-field-guide coverage:capabilities

persona-coverage:
    bunx foe-field-guide coverage:personas

validate-changes:
    bunx foe-field-guide validate:governance

build-governance:
    bunx foe-field-guide build:governance

validate-transitions:
    bunx foe-field-guide validate:transitions
```

### Step 5: Update Docusaurus Plugins

#### `docs/plugins/roadmap-data-plugin.js`

Before: Hand-parses each ROAD-*.md file with gray-matter and custom validation.

After: Reads the pre-built `governance-index.json`:

```javascript
module.exports = function roadmapDataPlugin(context, options) {
  return {
    name: 'roadmap-data-plugin',
    async loadContent() {
      // Option A: Read pre-built index
      const indexPath = path.join(context.siteDir, '..', 'node_modules',
        '@foe', 'field-guide-tools', 'dist', 'governance-index.json');
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      return Object.values(index.roadItems);

      // Option B: Build on the fly (slower but always fresh)
      // const { buildGovernanceIndex } = require('@foe/field-guide-tools');
      // const index = await buildGovernanceIndex();
      // return Object.values(index.roadItems);
    },
    async contentLoaded({ content, actions }) {
      actions.createData('roadmap-data.json', JSON.stringify(content));
    },
  };
};
```

#### `docs/plugins/bdd-data-plugin.js`

Similarly, extract BDD data from governance index change entries instead of hand-parsing.

### Step 6: Delete Replaced Scripts

```bash
rm docs/scripts/governance-linter.js
rm docs/scripts/validate-changes.js
rm docs/scripts/validate-bdd-tags.js
rm docs/scripts/capability-coverage-report.js
rm docs/scripts/persona-coverage-report.js
```

Keep `docs/scripts/validate-docs.js` (master orchestrator) but update it to call the CLI.

### Step 7: Configure Governance Root

Add to prima's environment or a `.foe-config.json`:

```json
{
  "governanceRoot": "./docs",
  "dddRoot": "./docs/ddd"
}
```

Or set via environment:

```bash
export FOE_GOVERNANCE_ROOT=./docs
```

### Step 8: Update Prima's DDD Docs

Replace the template placeholder content in:
- `docs/docs/ddd/domain-overview.md`
- `docs/docs/ddd/bounded-contexts.md`
- `docs/docs/ddd/ubiquitous-language.md`
- `docs/docs/ddd/aggregates-entities.md`
- `docs/docs/ddd/value-objects.md`
- `docs/docs/ddd/domain-events.md`
- `docs/docs/ddd/use-cases.md`
- `docs/docs/ddd/context-map.md`

These should now link to/embed content from the formal DDD markdown files created in Step 3. Example:

```markdown
# Bounded Contexts

See the formal bounded context definitions:

- [Bot Identity & Reputation](../ddd/contexts/bot-identity.md)
- [Promise Market](../ddd/contexts/promise-market.md)
- [Token Management](../ddd/contexts/token-management.md)
- [Settlement & Verification](../ddd/contexts/settlement-verification.md)
```

## Artifact Count Summary

| Artifact Type | Files Created |
|--------------|--------------|
| Bounded Contexts | 4 |
| Aggregates | 5 |
| Value Objects | 15 |
| Domain Events | 12 |
| Capabilities | 8 |
| Personas | 5 |
| Road Items | ~12 |
| **Total new files** | **~61** |
| **Scripts deleted** | **5** |

## Validation After Migration

Run the full governance validation to ensure everything works:

```bash
# From prima-delivery-demonstrator root:
bunx foe-field-guide validate:governance    # Should pass with 0 errors
bunx foe-field-guide build:governance       # Should produce governance-index.json
bunx foe-field-guide coverage:capabilities  # Should show coverage report
bunx foe-field-guide validate:transitions   # Should validate state machine
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing CI that uses governance-linter.js | Keep old scripts until CLI is validated; run both in parallel during transition |
| Frontmatter schema differences between JS and Zod | Map every field from governance-linter.js to Zod schema explicitly (done in Phase 1) |
| Environment differences (Bun vs Node) | CLI uses Node target build; works in both runtimes |
| Agent prompts reference old validation scripts | Update agent prompts to reference new CLI commands |

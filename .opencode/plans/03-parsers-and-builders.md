# Phase 3: Parsers, Governance Index Builder, and CLI Commands

**Package:** `packages/foe-field-guide-tools/src/`
**Depends on:** Phase 1 + 2 (all Zod schemas)
**Consumed by:** Phase 4 (API), Phase 5 (scanner), Phase 6 (prima)

## Objective

Extend `@foe/field-guide-tools` with 11 new parsers (one per governance/DDD artifact type), a governance index builder that validates cross-references, and 6 new CLI commands. Follows the exact same patterns as the existing `parseMethodFile()` and `buildMethodsIndex()`.

## Pattern Reference

Every new parser follows this existing pattern from `src/parsers/method.ts:35-105`:

1. Read `.md` file with `readFile()`
2. Extract frontmatter with `parseFrontmatter()` (reuse existing `src/parsers/frontmatter.ts`)
3. Map snake_case frontmatter fields to camelCase schema fields
4. Validate with `SchemaName.parse(mapped)` — throws on invalid
5. Return typed object

## Files to Create — Parsers

### `packages/foe-field-guide-tools/src/parsers/capability.ts`

```typescript
import type { Capability } from '@foe/schemas/governance';
import { CapabilitySchema } from '@foe/schemas/governance';
import { readFile } from 'node:fs/promises';
import { parseFrontmatter, makeRelativePath } from './frontmatter.js';

export async function parseCapabilityFile(filePath: string): Promise<Capability> {
  const fileContent = await readFile(filePath, 'utf-8');
  const { data } = parseFrontmatter(fileContent);

  const capability = {
    id: data.id,
    title: data.title,
    tag: data.tag,
    category: data.category,
    status: data.status,
    description: data.description,
    path: makeRelativePath(filePath),
  };

  try {
    return CapabilitySchema.parse(capability);
  } catch (err: any) {
    throw new Error(`Capability ${data.id} validation failed in ${filePath}: ${err.message}`);
  }
}
```

### `packages/foe-field-guide-tools/src/parsers/persona.ts`

Same pattern. Key mapping from snake_case frontmatter to camelCase:
- `typical_capabilities` → `typicalCapabilities`
- `related_stories` → `relatedStories`
- `related_personas` → `relatedPersonas`
- `pain_points` → `painPoints`
- `technical_profile.skill_level` → `technicalProfile.skillLevel`
- `technical_profile.integration_type` → `technicalProfile.integrationType`
- `validated_by` → `validatedBy`

### `packages/foe-field-guide-tools/src/parsers/user-story.ts`

Key mapping:
- `use_cases` → `useCases`
- `acceptance_criteria` → `acceptanceCriteria`

### `packages/foe-field-guide-tools/src/parsers/use-case.ts`

Key mapping:
- `main_flow` → `mainFlow`
- `alternative_flows` → `alternativeFlows`

### `packages/foe-field-guide-tools/src/parsers/road-item.ts`

The most complex parser due to the nested governance block. Key mappings:
- `depends_on` → `dependsOn`
- `blocked_by` → `blockedBy`
- `governance.adrs.validated_by` → `governance.adrs.validatedBy`
- `governance.adrs.validated_at` → `governance.adrs.validatedAt`
- `governance.adrs.compliance_check` → `governance.adrs.complianceCheck`
- `governance.bdd.approved_by` → `governance.bdd.approvedBy`
- `governance.bdd.test_results` → `governance.bdd.testResults`

Additional validation beyond Zod schema:
- If `status` is past `adr_validated`, ensure `governance.adrs.validated === true`
- If `status` is past `bdd_complete`, ensure `governance.bdd.status === 'approved'`
- If `status` is `complete`, ensure `governance.nfrs.status === 'pass'`

These conditional rules mirror `governance-linter.js` lines 108-200.

### `packages/foe-field-guide-tools/src/parsers/adr.ts`

Key mapping:
- `superseded_by` → `supersededBy`

### `packages/foe-field-guide-tools/src/parsers/nfr.ts`

Straightforward mapping. NFR ID pattern includes category prefix: `NFR-PERF-001`.

### `packages/foe-field-guide-tools/src/parsers/change-entry.ts`

Key mappings:
- `road_id` → `roadId`
- `compliance.adr_check` → `compliance.adrCheck`
- `compliance.bdd_check` → `compliance.bddCheck`
- `compliance.nfr_checks` → `compliance.nfrChecks`
- `compliance.adr_check.validated_by` → `compliance.adrCheck.validatedBy`
- `compliance.adr_check.validated_at` → `compliance.adrCheck.validatedAt`

### `packages/foe-field-guide-tools/src/parsers/bounded-context.ts`

Key mappings:
- `source_directory` → `sourceDirectory`
- `communication_pattern` → `communicationPattern`
- `upstream_contexts` → `upstreamContexts`
- `downstream_contexts` → `downstreamContexts`
- `team_ownership` → `teamOwnership`

### `packages/foe-field-guide-tools/src/parsers/aggregate.ts`

Key mappings:
- `root_entity` → `rootEntity`
- `value_objects` → `valueObjects`
- `source_file` → `sourceFile`

### `packages/foe-field-guide-tools/src/parsers/value-object.ts`

Key mappings:
- `validation_rules` → `validationRules`
- `source_file` → `sourceFile`

### `packages/foe-field-guide-tools/src/parsers/domain-event.ts`

Key mappings:
- `consumed_by` → `consumedBy`
- `side_effects` → `sideEffects`
- `source_file` → `sourceFile`

## Files to Create — Builder

### `packages/foe-field-guide-tools/src/builders/governance-index.ts`

This is the core of Phase 3. It:
1. Globs all artifact directories
2. Parses each file through its type-specific parser
3. Builds reverse indices
4. **Validates referential integrity** across all cross-references
5. Outputs a `GovernanceIndex` JSON

```typescript
import { glob } from 'glob';
import { GovernanceIndex } from '@foe/schemas/governance';
import { parseCapabilityFile } from '../parsers/capability.js';
import { parsePersonaFile } from '../parsers/persona.js';
// ... all other parsers

import {
  GOVERNANCE_ROOT,
  DDD_ROOT,
} from '../config.js';

export async function buildGovernanceIndex(): Promise<GovernanceIndex> {
  // 1. Parse all artifacts
  const capabilities = await parseAll('capabilities/*.md', parseCapabilityFile);
  const personas = await parseAll('personas/*.md', parsePersonaFile);
  const userStories = await parseAll('user-stories/*.md', parseUserStoryFile);
  const useCases = await parseAll('use-cases/*.md', parseUseCaseFile);
  const roadItems = await parseAll('roads/ROAD-*.md', parseRoadItemFile);
  const adrs = await parseAll('adr/ADR-*.md', parseAdrFile);
  const nfrs = await parseAll('nfr/NFR-*.md', parseNfrFile);
  const changeEntries = await parseAll('changes/CHANGE-*.md', parseChangeEntryFile);

  // DDD artifacts
  const boundedContexts = await parseAll('ddd/contexts/*.md', parseBoundedContextFile);
  const aggregates = await parseAll('ddd/aggregates/*.md', parseAggregateFile);
  const valueObjects = await parseAll('ddd/value-objects/*.md', parseValueObjectFile);
  const domainEvents = await parseAll('ddd/events/*.md', parseDomainEventFile);

  // 2. Build reverse indices
  const byCapability = buildCapabilityIndex(capabilities, personas, userStories, roadItems);
  const byPersona = buildPersonaIndex(personas, userStories);
  const byRoad = buildRoadIndex(roadItems, adrs, changeEntries);
  const byContext = buildContextIndex(boundedContexts, aggregates, domainEvents, valueObjects);
  const byAggregate = buildAggregateIndex(aggregates, valueObjects, domainEvents);

  // 3. Validate referential integrity
  const integrityErrors = validateReferentialIntegrity({
    capabilities, personas, userStories, useCases, roadItems,
    adrs, nfrs, changeEntries, boundedContexts, aggregates,
    valueObjects, domainEvents,
  });

  // 4. Build stats
  const stats = { /* counts + roadsByStatus + roadsByPhase + referentialIntegrity */ };

  return {
    version: '1.0.0',
    generated: new Date().toISOString(),
    capabilities, personas, userStories, useCases,
    roadItems, adrs, nfrs, changeEntries,
    boundedContexts, aggregates, valueObjects, domainEvents,
    byCapability, byPersona, byRoad, byContext, byAggregate,
    stats,
  };
}
```

### Referential Integrity Validation

```typescript
function validateReferentialIntegrity(artifacts: AllArtifacts): string[] {
  const errors: string[] = [];

  // Persona → Capability references
  for (const [id, persona] of Object.entries(artifacts.personas)) {
    for (const capId of persona.typicalCapabilities) {
      if (!artifacts.capabilities[capId]) {
        errors.push(`Persona ${id} references non-existent capability ${capId}`);
      }
    }
    for (const storyId of persona.relatedStories) {
      if (!artifacts.userStories[storyId]) {
        errors.push(`Persona ${id} references non-existent user story ${storyId}`);
      }
    }
  }

  // User Story → Persona/Capability references
  for (const [id, story] of Object.entries(artifacts.userStories)) {
    if (!artifacts.personas[story.persona]) {
      errors.push(`User story ${id} references non-existent persona ${story.persona}`);
    }
    for (const capId of story.capabilities) {
      if (!artifacts.capabilities[capId]) {
        errors.push(`User story ${id} references non-existent capability ${capId}`);
      }
    }
  }

  // Road Item → dependency references
  for (const [id, road] of Object.entries(artifacts.roadItems)) {
    for (const depId of road.dependsOn) {
      if (!artifacts.roadItems[depId]) {
        errors.push(`Road item ${id} depends on non-existent ${depId}`);
      }
    }
    for (const capId of road.governance.capabilities) {
      if (!artifacts.capabilities[capId]) {
        errors.push(`Road item ${id} references non-existent capability ${capId}`);
      }
    }
  }

  // Change Entry → Road Item reference
  for (const [id, change] of Object.entries(artifacts.changeEntries)) {
    if (!artifacts.roadItems[change.roadId]) {
      errors.push(`Change entry ${id} references non-existent road item ${change.roadId}`);
    }
  }

  // DDD: Aggregate → Context references
  for (const [slug, agg] of Object.entries(artifacts.aggregates)) {
    if (!artifacts.boundedContexts[agg.context]) {
      errors.push(`Aggregate ${slug} references non-existent context ${agg.context}`);
    }
    for (const voSlug of agg.valueObjects) {
      if (!artifacts.valueObjects[voSlug]) {
        errors.push(`Aggregate ${slug} references non-existent value object ${voSlug}`);
      }
    }
    for (const evSlug of agg.events) {
      if (!artifacts.domainEvents[evSlug]) {
        errors.push(`Aggregate ${slug} references non-existent domain event ${evSlug}`);
      }
    }
  }

  // DDD: Domain Event → Context/Aggregate references
  for (const [slug, event] of Object.entries(artifacts.domainEvents)) {
    if (!artifacts.boundedContexts[event.context]) {
      errors.push(`Domain event ${slug} references non-existent context ${event.context}`);
    }
    if (event.aggregate && !artifacts.aggregates[event.aggregate]) {
      errors.push(`Domain event ${slug} references non-existent aggregate ${event.aggregate}`);
    }
  }

  return errors;
}
```

## Files to Modify

### `packages/foe-field-guide-tools/src/config.ts`

Add governance directory paths:

```typescript
// Governance documentation paths (configurable via env or defaults)
export const GOVERNANCE_ROOT = process.env.FOE_GOVERNANCE_ROOT
  || join(DOCS_ROOT, '..'); // defaults to docs/ (sibling to docs/docs/)

// Individual artifact directories (relative to GOVERNANCE_ROOT)
export const CAPABILITIES_DIR = join(GOVERNANCE_ROOT, 'capabilities');
export const PERSONAS_DIR = join(GOVERNANCE_ROOT, 'personas');
export const USER_STORIES_DIR = join(GOVERNANCE_ROOT, 'user-stories');
export const USE_CASES_DIR = join(GOVERNANCE_ROOT, 'use-cases');
export const ROADS_DIR = join(GOVERNANCE_ROOT, 'roads');
export const ADRS_DIR = join(GOVERNANCE_ROOT, 'adr');
export const NFRS_DIR = join(GOVERNANCE_ROOT, 'nfr');
export const CHANGES_DIR = join(GOVERNANCE_ROOT, 'changes');
export const DDD_ROOT = join(GOVERNANCE_ROOT, 'ddd');

// Governance output
export const GOVERNANCE_INDEX_PATH = join(OUTPUT_DIR, 'governance-index.json');
```

### `packages/foe-field-guide-tools/src/parsers/index.ts`

Export all 11 new parsers alongside existing ones:

```typescript
export { parseMethodFile } from './method.js';
export { parseObservationFile } from './observation.js';
// NEW
export { parseCapabilityFile } from './capability.js';
export { parsePersonaFile } from './persona.js';
export { parseUserStoryFile } from './user-story.js';
export { parseUseCaseFile } from './use-case.js';
export { parseRoadItemFile } from './road-item.js';
export { parseAdrFile } from './adr.js';
export { parseNfrFile } from './nfr.js';
export { parseChangeEntryFile } from './change-entry.js';
export { parseBoundedContextFile } from './bounded-context.js';
export { parseAggregateFile } from './aggregate.js';
export { parseValueObjectFile } from './value-object.js';
export { parseDomainEventFile } from './domain-event.js';
```

### `packages/foe-field-guide-tools/src/builders/index.ts`

```typescript
export { buildMethodsIndex } from './methods-index.js';
export { buildObservationsIndex } from './observations-index.js';
export { buildGovernanceIndex } from './governance-index.js'; // NEW
```

### `packages/foe-field-guide-tools/src/cli.ts`

Add 6 new commands (following the exact pattern of existing commands at lines 19-57):

```typescript
// build:governance — mirrors existing 'build' command pattern
program
  .command('build:governance')
  .description('Build governance index from all artifact markdown files')
  .action(async () => {
    console.log(chalk.blue('Building governance index...\n'));
    await mkdir(OUTPUT_DIR, { recursive: true });
    const index = await buildGovernanceIndex();
    const json = JSON.stringify(index, null, 2);
    await writeFile(GOVERNANCE_INDEX_PATH, json);
    const kb = (json.length / 1024).toFixed(1);
    console.log(chalk.green('✓ Built governance index'));
    console.log(`  - ${index.stats.totalCapabilities} capabilities`);
    console.log(`  - ${index.stats.totalPersonas} personas`);
    console.log(`  - ${index.stats.totalRoadItems} road items`);
    console.log(`  - ${index.stats.totalContexts} bounded contexts`);
    console.log(`  - ${index.stats.totalAggregates} aggregates`);
    if (index.stats.referentialIntegrity.errors.length > 0) {
      console.log(chalk.yellow(`  ⚠ ${index.stats.referentialIntegrity.errors.length} referential integrity warnings`));
    }
    console.log(`  - Wrote: ${GOVERNANCE_INDEX_PATH} (${kb} KB)`);
  });

// build:all — builds everything
program
  .command('build:all')
  .description('Build all indices (methods + observations + governance)')
  .action(async () => {
    // Delegates to each individual builder
  });

// validate:governance — like existing 'validate' but for governance files
program
  .command('validate:governance')
  .description('Validate all governance frontmatter and cross-references')
  .argument('[path]', 'Optional specific file to validate')
  .action(async (specificPath?: string) => {
    // Parses all files, reports errors, exits 1 on failure
    // Replaces prima's governance-linter.js
  });

// validate:transitions — state machine validation
program
  .command('validate:transitions')
  .description('Verify ROAD item state machine transitions are valid')
  .action(async () => {
    // Checks each ROAD item's status against its governance data completeness
  });

// coverage:capabilities — replaces prima's capability-coverage-report.js
program
  .command('coverage:capabilities')
  .description('Report capability-to-feature test coverage')
  .option('--format <format>', 'Output format: human or json', 'human')
  .action(async (opts) => {
    // Builds governance index, computes coverage per capability
  });

// coverage:personas — replaces prima's persona-coverage-report.js
program
  .command('coverage:personas')
  .description('Report persona-to-story coverage')
  .option('--format <format>', 'Output format: human or json', 'human')
  .action(async (opts) => {
    // Builds governance index, computes coverage per persona
  });
```

## Output: `governance-index.json`

The built index is a single JSON file (~50-200KB depending on project size) containing:

- All parsed artifacts keyed by ID
- Reverse indices for every cross-reference relationship
- Statistics with referential integrity validation results
- Generated timestamp and version

This file is:
1. Written to `packages/foe-field-guide-tools/dist/governance-index.json`
2. Consumed by `@foe/api` (ingested via POST endpoint)
3. Baked into the scanner Docker container
4. Optionally consumed by Docusaurus plugins (replacing `roadmap-data.json`)

## Testing

### Unit Tests

- `src/parsers/__tests__/capability.test.ts` — valid/invalid frontmatter parsing
- `src/parsers/__tests__/road-item.test.ts` — nested governance block mapping, conditional validation
- `src/parsers/__tests__/change-entry.test.ts` — compliance/signature parsing
- `src/parsers/__tests__/bounded-context.test.ts` — slug validation, communication pattern
- `src/parsers/__tests__/aggregate.test.ts` — invariant parsing

### Integration Tests

- `src/builders/__tests__/governance-index.test.ts` — build index from test fixtures, verify:
  - All artifacts are collected
  - Reverse indices are correct
  - Referential integrity errors are reported for broken refs
  - Stats are accurate

### Test Fixtures

Create `src/__fixtures__/governance/` with minimal markdown files:
- `capabilities/CAP-001.md`
- `personas/PER-001.md`
- `user-stories/US-001.md`
- `roads/ROAD-001.md`
- `adr/ADR-001.md`
- `changes/CHANGE-001.md`
- `ddd/contexts/test-context.md`
- `ddd/aggregates/test-aggregate.md`
- `ddd/value-objects/test-vo.md`
- `ddd/events/test-event.md`

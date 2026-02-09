import { glob } from 'glob';
import { governance } from '@foe/schemas';
import { parseCapabilityFile } from '../parsers/governance/capability.js';
import { parsePersonaFile } from '../parsers/governance/persona.js';
import { parseUserStoryFile } from '../parsers/governance/user-story.js';
import { parseUseCaseFile } from '../parsers/governance/use-case.js';
import { parseRoadItemFile } from '../parsers/governance/road-item.js';
import { parseAdrFile } from '../parsers/governance/adr.js';
import { parseNfrFile } from '../parsers/governance/nfr.js';
import { parseChangeEntryFile } from '../parsers/governance/change-entry.js';
import { parseBoundedContextFile } from '../parsers/governance/bounded-context.js';
import { parseAggregateFile } from '../parsers/governance/aggregate.js';
import { parseValueObjectFile } from '../parsers/governance/value-object.js';
import { parseDomainEventFile } from '../parsers/governance/domain-event.js';
import { GOVERNANCE_ROOT } from '../config.js';

/**
 * Parse all files matching a glob pattern through a parser function.
 * Collects parse errors as warnings instead of throwing.
 */
async function parseAllFiles<T extends Record<string, unknown>>(
  pattern: string,
  cwd: string,
  parser: (filePath: string) => Promise<T>,
  idField: string,
): Promise<{ records: Record<string, T>; errors: string[] }> {
  const files = await glob(pattern, {
    cwd,
    absolute: true,
    ignore: ['**/node_modules/**', '**/index.md'],
  });
  const records: Record<string, T> = {};
  const errors: string[] = [];

  for (const file of files) {
    try {
      const parsed = await parser(file);
      const id = parsed[idField] as string;
      records[id] = parsed;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return { records, errors };
}

/**
 * Build the complete governance index from all artifact markdown files
 * in the delivery-framework package.
 *
 * Follows the same pattern as buildMethodsIndex():
 * 1. Glob all markdown files by artifact type
 * 2. Parse each through its parser (collect errors, don't throw)
 * 3. Build reverse indices for fast lookups
 * 4. Validate referential integrity across cross-references
 * 5. Calculate statistics
 * 6. Return typed GovernanceIndex
 */
export async function buildGovernanceIndex(): Promise<governance.GovernanceIndex> {
  const startTime = Date.now();
  console.log('Building governance index...');

  const allErrors: string[] = [];

  // Parse all artifact types
  const { records: capabilities, errors: capErrors } = await parseAllFiles(
    'capabilities/CAP-*.md',
    GOVERNANCE_ROOT,
    parseCapabilityFile,
    'id',
  );
  allErrors.push(...capErrors);

  const { records: personas, errors: perErrors } = await parseAllFiles(
    'personas/PER-*.md',
    GOVERNANCE_ROOT,
    parsePersonaFile,
    'id',
  );
  allErrors.push(...perErrors);

  const { records: userStories, errors: usErrors } = await parseAllFiles(
    'user-stories/US-*.md',
    GOVERNANCE_ROOT,
    parseUserStoryFile,
    'id',
  );
  allErrors.push(...usErrors);

  // Use-cases may not have individual markdown files yet
  const { records: useCases, errors: ucErrors } = await parseAllFiles(
    'use-cases/UC-*.md',
    GOVERNANCE_ROOT,
    parseUseCaseFile,
    'id',
  );
  allErrors.push(...ucErrors);

  const { records: roadItems, errors: roadErrors } = await parseAllFiles(
    'roads/ROAD-*.md',
    GOVERNANCE_ROOT,
    parseRoadItemFile,
    'id',
  );
  allErrors.push(...roadErrors);

  const { records: adrs, errors: adrErrors } = await parseAllFiles(
    'adr/ADR-*.md',
    GOVERNANCE_ROOT,
    parseAdrFile,
    'id',
  );
  allErrors.push(...adrErrors);

  const { records: nfrs, errors: nfrErrors } = await parseAllFiles(
    'nfr/NFR-*.md',
    GOVERNANCE_ROOT,
    parseNfrFile,
    'id',
  );
  allErrors.push(...nfrErrors);

  // Change entries may not exist yet
  const { records: changeEntries, errors: changeErrors } = await parseAllFiles(
    'changes/CHANGE-*.md',
    GOVERNANCE_ROOT,
    parseChangeEntryFile,
    'id',
  );
  allErrors.push(...changeErrors);

  // DDD artifacts (keyed by slug)
  const { records: boundedContexts, errors: bcErrors } = await parseAllFiles(
    'ddd/contexts/*.md',
    GOVERNANCE_ROOT,
    parseBoundedContextFile,
    'slug',
  );
  allErrors.push(...bcErrors);

  const { records: aggregates, errors: aggErrors } = await parseAllFiles(
    'ddd/aggregates/*.md',
    GOVERNANCE_ROOT,
    parseAggregateFile,
    'slug',
  );
  allErrors.push(...aggErrors);

  const { records: valueObjects, errors: voErrors } = await parseAllFiles(
    'ddd/value-objects/*.md',
    GOVERNANCE_ROOT,
    parseValueObjectFile,
    'slug',
  );
  allErrors.push(...voErrors);

  const { records: domainEvents, errors: deErrors } = await parseAllFiles(
    'ddd/events/*.md',
    GOVERNANCE_ROOT,
    parseDomainEventFile,
    'slug',
  );
  allErrors.push(...deErrors);

  // Log parse errors as warnings
  if (allErrors.length > 0) {
    console.warn(`\nParse warnings (${allErrors.length}):`);
    allErrors.forEach((e) => console.warn(`  - ${e}`));
  }

  // ── Build reverse indices ──────────────────────────────────────

  // byCapability: for each capability, which personas/stories/roads reference it
  const byCapability: Record<string, { personas: string[]; stories: string[]; roads: string[] }> = {};
  for (const capId of Object.keys(capabilities)) {
    byCapability[capId] = { personas: [], stories: [], roads: [] };
  }
  for (const [perId, persona] of Object.entries(personas)) {
    for (const capId of persona.typicalCapabilities) {
      if (byCapability[capId]) byCapability[capId].personas.push(perId);
    }
  }
  for (const [usId, story] of Object.entries(userStories)) {
    for (const capId of story.capabilities) {
      if (byCapability[capId]) byCapability[capId].stories.push(usId);
    }
  }
  for (const [roadId, road] of Object.entries(roadItems)) {
    for (const capId of road.governance.capabilities) {
      if (byCapability[capId]) byCapability[capId].roads.push(roadId);
    }
  }

  // byPersona: for each persona, their stories and capabilities
  const byPersona: Record<string, { stories: string[]; capabilities: string[] }> = {};
  for (const [perId, persona] of Object.entries(personas)) {
    byPersona[perId] = {
      stories: persona.relatedStories,
      capabilities: persona.typicalCapabilities,
    };
  }

  // byRoad: for each road item, its ADRs, changes, capabilities, and NFRs
  const byRoad: Record<string, { adrs: string[]; changes: string[]; capabilities: string[]; nfrs: string[] }> = {};
  for (const [roadId, road] of Object.entries(roadItems)) {
    byRoad[roadId] = {
      adrs: road.governance.adrs.ids,
      changes: [],
      capabilities: road.governance.capabilities,
      nfrs: road.governance.nfrs.applicable,
    };
  }
  for (const [changeId, change] of Object.entries(changeEntries)) {
    if (byRoad[change.roadId]) {
      byRoad[change.roadId].changes.push(changeId);
    }
  }

  // byContext: for each bounded context, its aggregates, events, value objects, and roads
  const byContext: Record<string, { aggregates: string[]; events: string[]; valueObjects: string[]; roads: string[] }> = {};
  for (const slug of Object.keys(boundedContexts)) {
    byContext[slug] = { aggregates: [], events: [], valueObjects: [], roads: [] };
  }
  for (const [slug, agg] of Object.entries(aggregates)) {
    if (byContext[agg.context]) byContext[agg.context].aggregates.push(slug);
  }
  for (const [slug, event] of Object.entries(domainEvents)) {
    if (byContext[event.context]) byContext[event.context].events.push(slug);
  }
  for (const [slug, vo] of Object.entries(valueObjects)) {
    if (byContext[vo.context]) byContext[vo.context].valueObjects.push(slug);
  }

  // byAggregate: for each aggregate, its context, value objects, and events
  const byAggregate: Record<string, { context: string; valueObjects: string[]; events: string[] }> = {};
  for (const [slug, agg] of Object.entries(aggregates)) {
    byAggregate[slug] = {
      context: agg.context,
      valueObjects: agg.valueObjects,
      events: agg.events,
    };
  }

  // ── Validate referential integrity ──────────────────────────────

  const integrityErrors: string[] = [];

  // Persona → Capability, UserStory
  for (const [id, persona] of Object.entries(personas)) {
    for (const capId of persona.typicalCapabilities) {
      if (!capabilities[capId]) {
        integrityErrors.push(`Persona ${id} references non-existent capability ${capId}`);
      }
    }
    for (const storyId of persona.relatedStories) {
      if (!userStories[storyId]) {
        integrityErrors.push(`Persona ${id} references non-existent user story ${storyId}`);
      }
    }
  }

  // UserStory → Persona, Capability
  for (const [id, story] of Object.entries(userStories)) {
    if (!personas[story.persona]) {
      integrityErrors.push(`User story ${id} references non-existent persona ${story.persona}`);
    }
    for (const capId of story.capabilities) {
      if (!capabilities[capId]) {
        integrityErrors.push(`User story ${id} references non-existent capability ${capId}`);
      }
    }
  }

  // RoadItem → dependencies
  for (const [id, road] of Object.entries(roadItems)) {
    for (const depId of road.dependsOn) {
      if (!roadItems[depId]) {
        integrityErrors.push(`Road item ${id} depends on non-existent ${depId}`);
      }
    }
  }

  // ChangeEntry → RoadItem
  for (const [id, change] of Object.entries(changeEntries)) {
    if (!roadItems[change.roadId]) {
      integrityErrors.push(`Change entry ${id} references non-existent road item ${change.roadId}`);
    }
  }

  // DDD referential integrity
  for (const [slug, agg] of Object.entries(aggregates)) {
    if (!boundedContexts[agg.context]) {
      integrityErrors.push(`Aggregate ${slug} references non-existent context ${agg.context}`);
    }
    for (const voSlug of agg.valueObjects) {
      if (!valueObjects[voSlug]) {
        integrityErrors.push(`Aggregate ${slug} references non-existent value object ${voSlug}`);
      }
    }
    for (const evSlug of agg.events) {
      if (!domainEvents[evSlug]) {
        integrityErrors.push(`Aggregate ${slug} references non-existent domain event ${evSlug}`);
      }
    }
  }
  for (const [slug, event] of Object.entries(domainEvents)) {
    if (!boundedContexts[event.context]) {
      integrityErrors.push(`Domain event ${slug} references non-existent context ${event.context}`);
    }
    if (event.aggregate && !aggregates[event.aggregate]) {
      integrityErrors.push(`Domain event ${slug} references non-existent aggregate ${event.aggregate}`);
    }
  }

  // ── Build statistics ───────────────────────────────────────────

  const roadsByStatus: Record<string, number> = {};
  const roadsByPhase: Record<string, number> = {};
  for (const road of Object.values(roadItems)) {
    roadsByStatus[road.status] = (roadsByStatus[road.status] || 0) + 1;
    roadsByPhase[String(road.phase)] = (roadsByPhase[String(road.phase)] || 0) + 1;
  }

  // ── Assemble index ─────────────────────────────────────────────

  const index: governance.GovernanceIndex = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    capabilities,
    personas,
    userStories,
    useCases,
    roadItems,
    adrs,
    nfrs,
    changeEntries,
    boundedContexts,
    aggregates,
    valueObjects,
    domainEvents,
    byCapability,
    byPersona,
    byRoad,
    byContext,
    byAggregate,
    stats: {
      totalCapabilities: Object.keys(capabilities).length,
      totalPersonas: Object.keys(personas).length,
      totalStories: Object.keys(userStories).length,
      totalUseCases: Object.keys(useCases).length,
      totalRoadItems: Object.keys(roadItems).length,
      totalAdrs: Object.keys(adrs).length,
      totalNfrs: Object.keys(nfrs).length,
      totalChanges: Object.keys(changeEntries).length,
      totalContexts: Object.keys(boundedContexts).length,
      totalAggregates: Object.keys(aggregates).length,
      totalValueObjects: Object.keys(valueObjects).length,
      totalDomainEvents: Object.keys(domainEvents).length,
      roadsByStatus,
      roadsByPhase,
      referentialIntegrity: {
        valid: integrityErrors.length === 0,
        errors: integrityErrors,
      },
    },
  };

  const duration = Date.now() - startTime;
  console.log(`\nGovernance index built in ${duration}ms`);
  console.log(
    `Artifacts: ${Object.keys(capabilities).length} capabilities, ` +
    `${Object.keys(personas).length} personas, ` +
    `${Object.keys(userStories).length} stories, ` +
    `${Object.keys(roadItems).length} roads, ` +
    `${Object.keys(adrs).length} ADRs, ` +
    `${Object.keys(nfrs).length} NFRs`,
  );
  if (Object.keys(boundedContexts).length > 0 || Object.keys(aggregates).length > 0) {
    console.log(
      `DDD: ${Object.keys(boundedContexts).length} contexts, ` +
      `${Object.keys(aggregates).length} aggregates, ` +
      `${Object.keys(valueObjects).length} value objects, ` +
      `${Object.keys(domainEvents).length} domain events`,
    );
  }
  if (integrityErrors.length > 0) {
    console.log(`Referential integrity: ${integrityErrors.length} warnings`);
  }

  return index;
}

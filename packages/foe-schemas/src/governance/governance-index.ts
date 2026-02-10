import { z } from "zod";
import {
  CapabilityIdPattern,
  PersonaIdPattern,
  UserStoryIdPattern,
  UseCaseIdPattern,
  RoadItemIdPattern,
  AdrIdPattern,
  NfrIdPattern,
  ChangeIdPattern,
} from "./common.js";
import { CapabilitySchema } from "./capability.js";
import { PersonaSchema } from "./persona.js";
import { UserStorySchema } from "./user-story.js";
import { UseCaseSchema } from "./use-case.js";
import { RoadItemSchema } from "./road-item.js";
import { AdrSchema } from "./adr.js";
import { NfrSchema } from "./nfr.js";
import { ChangeEntrySchema } from "./change-entry.js";
import { BoundedContextSchema } from "./ddd/bounded-context.js";
import { AggregateSchema } from "./ddd/aggregate.js";
import { ValueObjectSchema } from "./ddd/value-object.js";
import { DomainEventSchema } from "./ddd/domain-event.js";

export const GovernanceIndexSchema = z.object({
  version: z.string(),
  generated: z.string(),

  // Primary artifact collections (keyed by ID)
  capabilities: z.record(CapabilitySchema),
  personas: z.record(PersonaSchema),
  userStories: z.record(UserStorySchema),
  useCases: z.record(UseCaseSchema),
  roadItems: z.record(RoadItemSchema),
  adrs: z.record(AdrSchema),
  nfrs: z.record(NfrSchema),
  changeEntries: z.record(ChangeEntrySchema),

  // DDD artifacts (keyed by slug)
  boundedContexts: z.record(BoundedContextSchema),
  aggregates: z.record(AggregateSchema),
  valueObjects: z.record(ValueObjectSchema),
  domainEvents: z.record(DomainEventSchema),

  // Reverse indices for fast lookups
  byCapability: z.record(
    z.object({
      personas: z.array(PersonaIdPattern),
      stories: z.array(UserStoryIdPattern),
      roads: z.array(RoadItemIdPattern),
    }),
  ),
  byPersona: z.record(
    z.object({
      stories: z.array(UserStoryIdPattern),
      capabilities: z.array(CapabilityIdPattern),
    }),
  ),
  byRoad: z.record(
    z.object({
      adrs: z.array(AdrIdPattern),
      changes: z.array(ChangeIdPattern),
      capabilities: z.array(CapabilityIdPattern),
      nfrs: z.array(NfrIdPattern),
    }),
  ),

  // DDD reverse indices
  byContext: z.record(
    z.object({
      aggregates: z.array(z.string()),
      events: z.array(z.string()),
      valueObjects: z.array(z.string()),
      roads: z.array(RoadItemIdPattern),
    }),
  ),
  byAggregate: z.record(
    z.object({
      context: z.string(),
      valueObjects: z.array(z.string()),
      events: z.array(z.string()),
    }),
  ),

  // Statistics
  stats: z.object({
    totalCapabilities: z.number().int(),
    totalPersonas: z.number().int(),
    totalStories: z.number().int(),
    totalUseCases: z.number().int(),
    totalRoadItems: z.number().int(),
    totalAdrs: z.number().int(),
    totalNfrs: z.number().int(),
    totalChanges: z.number().int(),
    totalContexts: z.number().int(),
    totalAggregates: z.number().int(),
    totalValueObjects: z.number().int(),
    totalDomainEvents: z.number().int(),
    roadsByStatus: z.record(z.number().int()),
    roadsByPhase: z.record(z.number().int()),
    referentialIntegrity: z.object({
      valid: z.boolean(),
      errors: z.array(z.string()),
    }),
  }),
});

export type GovernanceIndex = z.infer<typeof GovernanceIndexSchema>;

// Helper functions
export function getRoadsByCapability(
  index: GovernanceIndex,
  capId: string,
): string[] {
  return index.byCapability[capId]?.roads ?? [];
}

export function getPersonasByCapability(
  index: GovernanceIndex,
  capId: string,
): string[] {
  return index.byCapability[capId]?.personas ?? [];
}

export function getCapabilityCoverage(
  index: GovernanceIndex,
): Record<string, number> {
  const coverage: Record<string, number> = {};
  for (const [capId, data] of Object.entries(index.byCapability)) {
    coverage[capId] = data.roads.length;
  }
  return coverage;
}

export function getAggregatesByContext(
  index: GovernanceIndex,
  contextSlug: string,
): string[] {
  return index.byContext[contextSlug]?.aggregates ?? [];
}

export function getEventsByContext(
  index: GovernanceIndex,
  contextSlug: string,
): string[] {
  return index.byContext[contextSlug]?.events ?? [];
}

import { z } from "zod";
import {
  RoadItemIdPattern,
  AdrIdPattern,
  NfrIdPattern,
  CapabilityIdPattern,
  GovernancePhaseSchema,
  PrioritySchema,
} from "./common.js";

// 8-state governance workflow
export const RoadStatusSchema = z.enum([
  "proposed",
  "adr_validated",
  "bdd_pending",
  "bdd_complete",
  "implementing",
  "nfr_validating",
  "nfr_blocked",
  "complete",
]);

export type RoadStatus = z.infer<typeof RoadStatusSchema>;

// Valid state transitions
export const STATE_MACHINE_TRANSITIONS: Record<RoadStatus, RoadStatus[]> = {
  proposed: ["adr_validated"],
  adr_validated: ["bdd_pending"],
  bdd_pending: ["bdd_complete"],
  bdd_complete: ["implementing"],
  implementing: ["nfr_validating"],
  nfr_validating: ["complete", "nfr_blocked"],
  nfr_blocked: ["nfr_validating"],
  complete: [],
};

// Governance sub-schemas
export const AdrGovernanceSchema = z.object({
  validated: z.boolean().default(false),
  ids: z.array(AdrIdPattern).default([]),
  validatedBy: z.string().default(""),
  validatedAt: z.string().default(""),
  complianceCheck: z
    .array(
      z.object({
        adr: AdrIdPattern,
        compliant: z.boolean(),
        notes: z.string().default(""),
      }),
    )
    .default([]),
});

export type AdrGovernance = z.infer<typeof AdrGovernanceSchema>;

export const BddGovernanceSchema = z.object({
  status: z.enum(["draft", "active", "approved"]).default("draft"),
  featureFiles: z.array(z.string()).default([]),
  scenarios: z.number().int().default(0),
  passing: z.number().int().default(0),
  approvedBy: z
    .array(
      z.object({
        agent: z.string(),
        timestamp: z.string(),
      }),
    )
    .default([]),
  testResults: z
    .object({
      total: z.number().int().default(0),
      passed: z.number().int().default(0),
      failed: z.number().int().default(0),
      coverage: z.string().default("0%"),
    })
    .default({}),
});

export type BddGovernance = z.infer<typeof BddGovernanceSchema>;

export const NfrGovernanceSchema = z.object({
  applicable: z.array(NfrIdPattern).default([]),
  status: z.enum(["pending", "validating", "pass", "fail"]).default("pending"),
  results: z
    .record(
      z.object({
        status: z.enum(["pending", "pass", "fail"]),
        evidence: z.string().default(""),
        validatedBy: z.string().default(""),
        timestamp: z.string().default(""),
      }),
    )
    .default({}),
});

export type NfrGovernance = z.infer<typeof NfrGovernanceSchema>;

export const RoadItemSchema = z.object({
  id: RoadItemIdPattern,
  title: z.string(),
  status: RoadStatusSchema,
  phase: GovernancePhaseSchema,
  priority: PrioritySchema,
  created: z.string(),
  updated: z.string(),
  started: z.string().default(""),
  completed: z.string().default(""),
  owner: z.string().default(""),
  tags: z.array(z.string()).default([]),
  dependsOn: z.array(RoadItemIdPattern).default([]),
  blockedBy: z.array(RoadItemIdPattern).default([]),
  blocks: z.array(RoadItemIdPattern).default([]),
  governance: z.object({
    adrs: AdrGovernanceSchema,
    bdd: BddGovernanceSchema,
    nfrs: NfrGovernanceSchema,
    capabilities: z.array(CapabilityIdPattern).default([]),
  }),
  path: z.string(),
});

export type RoadItem = z.infer<typeof RoadItemSchema>;

// Helper: validate a state transition
export function validateTransition(from: RoadStatus, to: RoadStatus): boolean {
  const allowed = STATE_MACHINE_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// Helper: get valid next states
export function getNextStates(current: RoadStatus): RoadStatus[] {
  return STATE_MACHINE_TRANSITIONS[current] ?? [];
}

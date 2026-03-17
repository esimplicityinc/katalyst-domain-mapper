import { z } from "zod";
import {
  AdrIdPattern,
  NfrIdPattern,
  CapabilityIdPattern,
  RoadItemIdPattern,
  GovernancePhaseSchema,
  PrioritySchema,
} from "../common.js";

// ── Road Status (8-state governance workflow) ──────────────────────────────
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

// ── Valid State Transitions ────────────────────────────────────────────────
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

// ── Governance Sub-Schemas ─────────────────────────────────────────────────
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

// ── Road Item Extension ────────────────────────────────────────────────────
// Carries governance lifecycle fields for taxonomy nodes with nodeType:
// "road_item". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels (including governance-id e.g. "ROAD-001"), dependsOn, etc.
export const RoadItemExtSchema = z.object({
  title: z.string(),
  status: RoadStatusSchema,
  phase: GovernancePhaseSchema,
  priority: PrioritySchema,
  started: z.string().default(""),
  completed: z.string().default(""),
  tags: z.array(z.string()).default([]),
  blockedBy: z.array(RoadItemIdPattern).default([]),
  blocks: z.array(RoadItemIdPattern).default([]),
  governance: z.object({
    adrs: AdrGovernanceSchema,
    bdd: BddGovernanceSchema,
    nfrs: NfrGovernanceSchema,
    capabilities: z.array(CapabilityIdPattern).default([]),
  }),
});

export type RoadItemExt = z.infer<typeof RoadItemExtSchema>;

// ── Transition Helpers ─────────────────────────────────────────────────────
/** Validate a state transition */
export function validateTransition(from: RoadStatus, to: RoadStatus): boolean {
  const allowed = STATE_MACHINE_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/** Get valid next states */
export function getNextStates(current: RoadStatus): RoadStatus[] {
  return STATE_MACHINE_TRANSITIONS[current] ?? [];
}

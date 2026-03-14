import { z } from "zod";
import { RoadItemIdPattern } from "../common.js";
import { ContributionSchema } from "../contribution.js";

// ── Change Status ──────────────────────────────────────────────────────────
export const ChangeStatusSchema = z.enum(["draft", "published", "archived"]);
export type ChangeStatus = z.infer<typeof ChangeStatusSchema>;

// ── Change Category ────────────────────────────────────────────────────────
export const ChangeCategorySchema = z.enum([
  "Added",
  "Changed",
  "Deprecated",
  "Removed",
  "Fixed",
  "Security",
]);
export type ChangeCategory = z.infer<typeof ChangeCategorySchema>;

// ── Compliance Check ───────────────────────────────────────────────────────
export const ComplianceCheckSchema = z.object({
  status: z.enum(["pending", "pass", "fail"]),
  validatedBy: z.string().default(""),
  validatedAt: z.string().default(""),
  notes: z.string().default(""),
});
export type ComplianceCheck = z.infer<typeof ComplianceCheckSchema>;

// ── NFR Check ──────────────────────────────────────────────────────────────
export const NfrCheckSchema = z.object({
  status: z.enum(["pending", "pass", "fail", "na"]),
  evidence: z.string().default(""),
  validatedBy: z.string().default(""),
});
export type NfrCheck = z.infer<typeof NfrCheckSchema>;

// ── Agent Signature ────────────────────────────────────────────────────────
export const AgentSignatureSchema = z.object({
  agent: z.string(),
  role: z.string(),
  status: z.enum(["approved", "rejected", "pending"]),
  timestamp: z.string(),
});
export type AgentSignature = z.infer<typeof AgentSignatureSchema>;

// ── Change Entry Extension ─────────────────────────────────────────────────
// Carries governance lifecycle fields for taxonomy nodes with nodeType:
// "change_entry". The base TaxonomyNode provides id, name, fqtn, parentNode,
// labels (including governance-id e.g. "CHANGE-001"), dependsOn, etc.
export const ChangeEntryExtSchema = z.object({
  roadId: RoadItemIdPattern,
  title: z.string(),
  date: z.string(),
  version: z.string(),
  status: ChangeStatusSchema,
  categories: z.array(ChangeCategorySchema).min(1),
  compliance: z.object({
    adrCheck: ComplianceCheckSchema,
    bddCheck: z.object({
      status: z.enum(["pending", "pass", "fail"]),
      scenarios: z.number().int().default(0),
      passed: z.number().int().default(0),
      coverage: z.string().default("0%"),
    }),
    nfrChecks: z.object({
      performance: NfrCheckSchema,
      security: NfrCheckSchema,
      accessibility: NfrCheckSchema,
    }),
  }),
  signatures: z.array(AgentSignatureSchema).default([]),
  contribution: ContributionSchema,
});

export type ChangeEntryExt = z.infer<typeof ChangeEntryExtSchema>;

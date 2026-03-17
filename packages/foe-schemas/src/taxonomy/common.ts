import { z } from "zod";

// ── Taxonomy Node Name Pattern ─────────────────────────────────────────────
// Kubernetes-style kebab-case names (max 63 chars)
export const TaxonomyNodeNamePattern = z
  .string()
  .regex(/^[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$/);

// ── Slug Pattern ───────────────────────────────────────────────────────────
// Alias for DDD artifact slugs (identical to kebab-case)
export const SlugPattern = z.string().regex(/^[a-z0-9-]+$/);

// ── Governance ID Patterns ─────────────────────────────────────────────────
// Structured IDs used as labels on taxonomy nodes for governance lookups.
export const CapabilityIdPattern = z.string().regex(/^CAP-\d{3,}$/);
export const UserTypeIdPattern = z.string().regex(/^UT-\d{3,}$/);
export const UserStoryIdPattern = z.string().regex(/^US-\d{3,}$/);
export const UseCaseIdPattern = z.string().regex(/^UC-\d{3,}$/);
export const RoadItemIdPattern = z.string().regex(/^ROAD-\d{3,}$/);
export const AdrIdPattern = z.string().regex(/^ADR-\d{3,}$/);
export const NfrIdPattern = z.string().regex(/^NFR-[A-Z0-9]+-\d{3,}$/);
export const ChangeIdPattern = z.string().regex(/^CHANGE-\d{3,}$/);
export const PracticeAreaIdPattern = z.string().regex(/^PA-\d{3,}$/);
export const CompetencyIdPattern = z.string().regex(/^COMP-\d{3,}$/);

// ── Shared Enums ───────────────────────────────────────────────────────────
export const PrioritySchema = z.enum(["critical", "high", "medium", "low"]);
export type Priority = z.infer<typeof PrioritySchema>;

export const GovernancePhaseSchema = z.number().int().min(0).max(3);
export type GovernancePhase = z.infer<typeof GovernancePhaseSchema>;

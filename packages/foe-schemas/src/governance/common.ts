import { z } from "zod";

// ID pattern validators
export const CapabilityIdPattern = z.string().regex(/^CAP-\d{3,}$/);
export const PersonaIdPattern = z.string().regex(/^PER-\d{3,}$/);
export const UserStoryIdPattern = z.string().regex(/^US-\d{3,}$/);
export const UseCaseIdPattern = z.string().regex(/^UC-\d{3,}$/);
export const RoadItemIdPattern = z.string().regex(/^ROAD-\d{3,}$/);
export const AdrIdPattern = z.string().regex(/^ADR-\d{3,}$/);
export const NfrIdPattern = z.string().regex(/^NFR-[A-Z0-9]+-\d{3,}$/);
export const ChangeIdPattern = z.string().regex(/^CHANGE-\d{3,}$/);

// Slug pattern for DDD artifacts (ADR-012)
export const SlugPattern = z.string().regex(/^[a-z0-9-]+$/);

// Taxonomy node name pattern (Kubernetes-style kebab-case, max 63 chars)
export const TaxonomyNodeNamePattern = z
  .string()
  .regex(/^[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$/);

// Shared enums
export const PrioritySchema = z.enum(["critical", "high", "medium", "low"]);
export const GovernancePhaseSchema = z.number().int().min(0).max(3);

// Inferred types
export type Priority = z.infer<typeof PrioritySchema>;
export type GovernancePhase = z.infer<typeof GovernancePhaseSchema>;

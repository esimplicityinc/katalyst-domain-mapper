import { GovernanceValidationError } from "./GovernanceErrors.js";

export interface ValidatedSnapshotData {
  version: string;
  project: string;
  generated: string;
  capabilities: Record<string, { id?: string; title: string; status: string }>;
  personas: Record<string, { id?: string; name: string; type: string }>;
  userStories: Record<string, unknown>;
  roadItems: Record<string, { id?: string; title: string; status: string; phase?: number; priority?: string }>;
  stats: {
    capabilities?: number;
    totalCapabilities?: number;
    personas?: number;
    totalPersonas?: number;
    userStories?: number;
    totalStories?: number;
    roadItems?: number;
    totalRoadItems?: number;
    integrityStatus?: string;
    integrityErrors?: number;
    roadsByStatus?: Record<string, number>;
    referentialIntegrity?: { valid: boolean; errors: string[] };
  };
  byCapability?: Record<string, { stories?: string[]; roads?: string[] }>;
  byPersona?: Record<string, { stories?: string[]; capabilities?: string[] }>;
  boundedContexts?: Record<string, { title?: string }>;
  byContext?: Record<string, { aggregates?: string[]; events?: string[] }>;
}

export function validateSnapshotData(data: unknown): ValidatedSnapshotData {
  if (!data || typeof data !== "object") {
    throw new GovernanceValidationError("Payload must be a JSON object");
  }

  const raw = data as Record<string, unknown>;

  if (!raw.version || typeof raw.version !== "string") {
    throw new GovernanceValidationError("Missing required field: version");
  }
  if (!raw.project || typeof raw.project !== "string") {
    throw new GovernanceValidationError("Missing required field: project");
  }
  if (!raw.capabilities || typeof raw.capabilities !== "object") {
    throw new GovernanceValidationError("Missing required field: capabilities");
  }
  if (!raw.roadItems || typeof raw.roadItems !== "object") {
    throw new GovernanceValidationError("Missing required field: roadItems");
  }
  if (!raw.stats || typeof raw.stats !== "object") {
    throw new GovernanceValidationError("Missing required field: stats");
  }

  return data as ValidatedSnapshotData;
}

// ── Governance Capability (full CRUD model) ───────────────────────────────────
export interface ManagedCapability {
  id: string; // CAP-XXX
  title: string;
  status: "planned" | "stable" | "deprecated";
  description: string | null;
  category: "Security" | "Observability" | "Communication" | "Business" | "Technical" | null;
  parentCapability: string | null; // CAP-XXX
  dependsOn: string[]; // CAP-XXX[]
  roadCount: number;
  storyCount: number;
  taxonomyNode: string | null;
}

// ── Persona (full CRUD model) ─────────────────────────────────────────────────
export interface ManagedPersona {
  id: string; // PER-XXX
  name: string;
  type: "human" | "bot" | "system" | "external_api";
  status: "draft" | "approved" | "deprecated";
  archetype: "creator" | "operator" | "administrator" | "consumer" | "integrator";
  description: string | null;
  goals: string[];
  painPoints: string[];
  behaviors: string[];
  typicalCapabilities: string[]; // CAP-XXX[]
  technicalProfile: {
    skillLevel?: "beginner" | "intermediate" | "advanced";
    integrationType?: "web_ui" | "api" | "sdk" | "webhook" | "cli";
    frequency?: "daily" | "weekly" | "occasional";
  } | null;
  relatedStories: string[]; // US-XXX[]
  relatedPersonas: string[]; // PER-XXX[]
  storyCount: number;
  capabilityCount: number;
}

// ── User Story (full CRUD model) ──────────────────────────────────────────────
export interface ManagedUserStory {
  id: string; // US-XXX
  title: string;
  persona: string; // PER-XXX
  status: "draft" | "approved" | "implementing" | "complete" | "deprecated";
  capabilities: string[]; // CAP-XXX[] (min 1)
  useCases: string[]; // UC-XXX[]
  acceptanceCriteria: string[];
  taxonomyNode: string | null;
}

// ── Archetype and type colors/labels ─────────────────────────────────────────
export const ARCHETYPE_COLORS: Record<ManagedPersona["archetype"], string> = {
  creator: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  operator: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  administrator: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  consumer: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  integrator: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
};

export const ARCHETYPE_AVATAR_COLORS: Record<ManagedPersona["archetype"], string> = {
  creator: "bg-emerald-500",
  operator: "bg-blue-500",
  administrator: "bg-purple-500",
  consumer: "bg-amber-500",
  integrator: "bg-cyan-500",
};

export const STORY_STATUS_COLUMNS = [
  "draft",
  "approved",
  "implementing",
  "complete",
  "deprecated",
] as const;

export const STORY_STATUS_COLORS: Record<ManagedUserStory["status"], string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  implementing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  complete: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  deprecated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export const CATEGORY_COLORS: Record<string, string> = {
  Security: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Observability: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Communication: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Business: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Technical: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export const CAPABILITY_STATUS_COLORS: Record<ManagedCapability["status"] | string, string> = {
  planned: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  stable: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  deprecated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

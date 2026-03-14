import { z } from "zod";

// ── Contribution Status ────────────────────────────────────────────────────
// Universal lifecycle states that gate whether an item is visible, editable,
// and canonical. Layered on top of any type-specific status -- the type-
// specific status only activates AFTER contribution.status === "accepted".
export const ContributionStatusSchema = z.enum([
  "draft",
  "proposed",
  "rejected",
  "accepted",
  "deprecated",
  "superseded",
]);

export type ContributionStatus = z.infer<typeof ContributionStatusSchema>;

// ── Contribution Block ─────────────────────────────────────────────────────
// Added to every item's schema to track its contribution lifecycle. Fields
// use camelCase to match the rest of the Zod schema conventions (frontmatter
// uses snake_case and is transformed in the parser layer).
export const ContributionSchema = z.object({
  status: ContributionStatusSchema.default("draft"),
  version: z.number().int().positive().default(1),
  supersedes: z.string().nullable().default(null), // "ITEM-ID@vN"
  supersededBy: z.string().nullable().default(null), // "ITEM-ID@vN"
  submittedAt: z.string().datetime().nullable().default(null),
  submittedBy: z.string().nullable().default(null),
  reviewedAt: z.string().datetime().nullable().default(null),
  reviewedBy: z.string().nullable().default(null),
  reviewFeedback: z.string().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Contribution = z.infer<typeof ContributionSchema>;

// ── State Machine Transitions ──────────────────────────────────────────────
// Maps each contribution status to its valid next states. The "superseded"
// state is terminal -- once an item is superseded, it cannot transition.
export const CONTRIBUTION_TRANSITIONS: Record<
  ContributionStatus,
  ContributionStatus[]
> = {
  draft: ["proposed"],
  proposed: ["accepted", "rejected", "draft"],
  rejected: ["draft"],
  accepted: ["deprecated", "superseded"],
  deprecated: ["draft"],
  superseded: [], // terminal state
};

// ── Transition Validator ───────────────────────────────────────────────────
/** Check whether a status transition is allowed by the state machine. */
export function validateContributionTransition(
  from: ContributionStatus,
  to: ContributionStatus,
): boolean {
  return CONTRIBUTION_TRANSITIONS[from].includes(to);
}

/** Return the list of valid next states for the current status. */
export function getNextContributionStates(
  current: ContributionStatus,
): ContributionStatus[] {
  return CONTRIBUTION_TRANSITIONS[current];
}

// ── Transition Action Names ────────────────────────────────────────────────
// Maps human-friendly action verbs to their from/to pairs for use in APIs
// and permission checks.
export const CONTRIBUTION_ACTIONS: Record<
  string,
  { from: ContributionStatus; to: ContributionStatus }
> = {
  submit: { from: "draft", to: "proposed" },
  accept: { from: "proposed", to: "accepted" },
  reject: { from: "proposed", to: "rejected" },
  withdraw: { from: "proposed", to: "draft" },
  revise: { from: "rejected", to: "draft" },
  deprecate: { from: "accepted", to: "deprecated" },
  reactivate: { from: "deprecated", to: "draft" },
  supersede: { from: "accepted", to: "superseded" },
};

export type ContributionAction = keyof typeof CONTRIBUTION_ACTIONS;

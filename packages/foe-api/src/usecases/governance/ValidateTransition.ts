import { governance } from "@foe/schemas";

type RoadStatus = governance.RoadStatus;

export interface TransitionInput {
  roadId: string;
  currentStatus: string;
  targetStatus: string;
  governance: {
    adrs?: { validated?: boolean };
    bdd?: { status?: string };
    nfrs?: { status?: string };
  };
}

export interface TransitionResult {
  valid: boolean;
  roadId: string;
  transition?: { from: string; to: string };
  error?: string;
  gateErrors?: string[];
  allowedTransitions?: string[];
}

export class ValidateTransition {
  execute(input: TransitionInput): TransitionResult {
    const current = input.currentStatus as RoadStatus;
    const target = input.targetStatus as RoadStatus;

    // Check if the transition is valid per the state machine
    if (!governance.validateTransition(current, target)) {
      return {
        valid: false,
        roadId: input.roadId,
        error: `Invalid transition: ${current} → ${target}`,
        allowedTransitions: governance.STATE_MACHINE_TRANSITIONS[current] ?? [],
      };
    }

    // Check governance gates
    const gateErrors: string[] = [];

    // proposed → adr_validated requires ADR validation
    if (current === "proposed" && target === "adr_validated") {
      if (!input.governance?.adrs?.validated) {
        gateErrors.push("ADR must be validated before advancing to adr_validated");
      }
    }

    // bdd_complete → implementing requires BDD approval
    if (current === "bdd_complete" && target === "implementing") {
      if (input.governance?.bdd?.status !== "approved") {
        gateErrors.push("BDD scenarios must be approved before advancing to implementing");
      }
    }

    // nfr_validating → complete requires NFR pass
    if (current === "nfr_validating" && target === "complete") {
      if (input.governance?.nfrs?.status !== "pass") {
        gateErrors.push("NFRs must pass validation before advancing to complete");
      }
    }

    if (gateErrors.length > 0) {
      return {
        valid: false,
        roadId: input.roadId,
        error: "Governance gate requirements not met",
        gateErrors,
      };
    }

    return {
      valid: true,
      roadId: input.roadId,
      transition: { from: current, to: target },
    };
  }
}

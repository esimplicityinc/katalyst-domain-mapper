export class GovernanceValidationError extends Error {
  public readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "GovernanceValidationError";
    this.details = details;
  }
}

export class GovernanceNotFoundError extends Error {
  constructor(id: string) {
    super(`Governance snapshot not found: ${id}`);
    this.name = "GovernanceNotFoundError";
  }
}

export class GovernanceTransitionError extends Error {
  public readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "GovernanceTransitionError";
    this.details = details;
  }
}

export class ReportNotFoundError extends Error {
  constructor(id: string) {
    super(`Report not found: ${id}`);
    this.name = "ReportNotFoundError";
  }
}

export class ReportValidationError extends Error {
  public readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ReportValidationError";
    this.details = details;
  }
}

export class RepositoryNotFoundError extends Error {
  constructor(id: string) {
    super(`Repository not found: ${id}`);
    this.name = "RepositoryNotFoundError";
  }
}

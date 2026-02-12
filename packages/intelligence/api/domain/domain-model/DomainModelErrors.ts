export class DomainModelNotFoundError extends Error {
  constructor(id: string) {
    super(`Domain model not found: ${id}`);
    this.name = "DomainModelNotFoundError";
  }
}

export class DomainModelValidationError extends Error {
  public readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "DomainModelValidationError";
    this.details = details;
  }
}

export class BoundedContextNotFoundError extends Error {
  constructor(id: string) {
    super(`Bounded context not found: ${id}`);
    this.name = "BoundedContextNotFoundError";
  }
}

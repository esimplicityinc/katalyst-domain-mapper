export class TaxonomyValidationError extends Error {
  public readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "TaxonomyValidationError";
    this.details = details;
  }
}

export class TaxonomyNotFoundError extends Error {
  constructor(id: string) {
    super(`Taxonomy snapshot not found: ${id}`);
    this.name = "TaxonomyNotFoundError";
  }
}

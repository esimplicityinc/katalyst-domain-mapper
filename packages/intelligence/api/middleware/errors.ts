import Elysia from "elysia";
import {
  ReportNotFoundError,
  ReportValidationError,
  RepositoryNotFoundError,
} from "../domain/report/ReportErrors.js";
import {
  ScanJobNotFoundError,
  ScanAlreadyRunningError,
  ScanRunnerError,
} from "../domain/scan/ScanErrors.js";
import {
  GovernanceValidationError,
  GovernanceNotFoundError,
  GovernanceTransitionError,
} from "../domain/governance/GovernanceErrors.js";
import {
  DomainModelNotFoundError,
  DomainModelValidationError,
  BoundedContextNotFoundError,
} from "../domain/domain-model/DomainModelErrors.js";
import {
  TaxonomyValidationError,
  TaxonomyNotFoundError,
} from "../domain/taxonomy/TaxonomyErrors.js";

export const errorMiddleware = new Elysia({ name: "error-handler" }).onError(
  { as: "global" },
  ({ error, set }) => {
    if (
      error instanceof ReportNotFoundError ||
      error instanceof RepositoryNotFoundError ||
      error instanceof ScanJobNotFoundError ||
      error instanceof GovernanceNotFoundError ||
      error instanceof DomainModelNotFoundError ||
      error instanceof BoundedContextNotFoundError ||
      error instanceof TaxonomyNotFoundError
    ) {
      set.status = 404;
      return { error: error.message };
    }

    if (
      error instanceof ReportValidationError ||
      error instanceof GovernanceValidationError ||
      error instanceof DomainModelValidationError ||
      error instanceof TaxonomyValidationError
    ) {
      set.status = 400;
      return {
        error: error.message,
        details: (error as ReportValidationError | GovernanceValidationError | DomainModelValidationError | TaxonomyValidationError)
          .details,
      };
    }

    if (error instanceof GovernanceTransitionError) {
      set.status = 400;
      return { error: error.message, details: error.details };
    }

    if (error instanceof ScanAlreadyRunningError) {
      set.status = 409;
      return { error: error.message };
    }

    if (error instanceof ScanRunnerError) {
      set.status = 502;
      return { error: error.message };
    }

    // Unknown error
    // Surface SQLite constraint violations as 409 Conflict for better diagnostics
    if (
      error instanceof Error &&
      error.message?.includes("UNIQUE constraint failed")
    ) {
      console.warn("Duplicate key conflict:", error.message);
      set.status = 409;
      return { error: "Conflict: resource already exists", detail: error.message };
    }

    console.error("Unhandled error:", error);
    set.status = 500;
    return { error: "Internal server error" };
  },
);

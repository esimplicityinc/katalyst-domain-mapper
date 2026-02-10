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

export const errorMiddleware = new Elysia({ name: "error-handler" }).onError(
  { as: "global" },
  ({ error, set }) => {
    if (
      error instanceof ReportNotFoundError ||
      error instanceof RepositoryNotFoundError ||
      error instanceof ScanJobNotFoundError ||
      error instanceof GovernanceNotFoundError
    ) {
      set.status = 404;
      return { error: error.message };
    }

    if (
      error instanceof ReportValidationError ||
      error instanceof GovernanceValidationError
    ) {
      set.status = 400;
      return {
        error: error.message,
        details: (error as ReportValidationError | GovernanceValidationError)
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
    console.error("Unhandled error:", error);
    set.status = 500;
    return { error: "Internal server error" };
  },
);

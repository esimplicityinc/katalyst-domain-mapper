import Elysia from "elysia";
import type { Logger } from "../ports/Logger.js";

interface ContextWithRequestId {
  requestId?: string;
}

interface ContextWithLog {
  log?: Logger;
}

export function createLoggingMiddleware(logger: Logger) {
  return new Elysia({ name: "logging" })
    .derive({ as: "global" }, (ctx) => {
      const requestId = (ctx as unknown as ContextWithRequestId).requestId ?? "unknown";
      const log = logger.child({ requestId });
      return { log };
    })
    .onBeforeHandle({ as: "global" }, (ctx) => {
      const log = (ctx as unknown as ContextWithLog).log;
      if (log) {
        const url = new URL(ctx.request.url);
        log.info("Request started", {
          method: ctx.request.method,
          path: url.pathname,
        });
      }
    })
    .onAfterHandle({ as: "global" }, (ctx) => {
      const log = (ctx as unknown as ContextWithLog).log;
      if (log) {
        const url = new URL(ctx.request.url);
        log.info("Request completed", {
          method: ctx.request.method,
          path: url.pathname,
          status: ctx.set.status ?? 200,
        });
      }
    });
}

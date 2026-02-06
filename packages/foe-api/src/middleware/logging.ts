import Elysia from "elysia";
import type { Logger } from "../ports/Logger.js";

export function createLoggingMiddleware(logger: Logger) {
  return new Elysia({ name: "logging" })
    .derive({ as: "global" }, (ctx) => {
      const requestId = (ctx as any).requestId ?? "unknown";
      const log = logger.child({ requestId });
      return { log };
    })
    .onBeforeHandle({ as: "global" }, (ctx) => {
      const log = (ctx as any).log as Logger | undefined;
      if (log) {
        const url = new URL(ctx.request.url);
        log.info("Request started", {
          method: ctx.request.method,
          path: url.pathname,
        });
      }
    })
    .onAfterHandle({ as: "global" }, (ctx) => {
      const log = (ctx as any).log as Logger | undefined;
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

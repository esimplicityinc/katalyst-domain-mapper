import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { requestIdMiddleware } from "../middleware/requestId.js";
import { createLoggingMiddleware } from "../middleware/logging.js";
import { errorMiddleware } from "../middleware/errors.js";
import { healthRoute, createReadyRoute } from "./routes/v1/health.js";
import { createReportRoutes } from "./routes/v1/reports.js";
import { createScanRoutes } from "./routes/v1/scans.js";
import { createRepositoryRoutes } from "./routes/v1/repositories.js";
import { createConfigRoutes } from "./routes/v1/config.js";
import { createDomainModelRoutes } from "./routes/v1/domain-models.js";
import type { Container } from "../bootstrap/container.js";

export function createServer(container: Container) {
  const app = new Elysia()
    .use(
      cors({
        origin: process.env.CORS_ORIGINS?.split(",").map((s) => s.trim()) ?? true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "X-Request-ID", "Authorization"],
        maxAge: 86400,
      })
    )
    .use(
      swagger({
        documentation: {
          info: {
            title: "FOE Scanner API",
            version: "0.1.0",
            description:
              "API for managing Flow Optimized Engineering scan reports, triggering scans, and tracking repository health over time.",
          },
          tags: [
            { name: "Reports", description: "FOE report management" },
            { name: "Scans", description: "Scan job orchestration" },
            { name: "Repositories", description: "Repository tracking" },
            { name: "Domain Models", description: "DDD domain modeling" },
          ],
        },
        path: "/swagger",
      })
    )
    .use(requestIdMiddleware)
    .use(createLoggingMiddleware(container.logger))
    .use(errorMiddleware)

    // Health/ready endpoints
    .group("/api/v1", (app) =>
      app
        .use(healthRoute)
        .use(createReadyRoute(container.healthCheck))
    )

    // Main API routes
    .group("/api/v1", (app) =>
      app
        .use(
          createReportRoutes({
            ingestReport: container.ingestReport,
            getReport: container.getReport,
            listReports: container.listReports,
            compareReports: container.compareReports,
            reportRepo: container.reportRepo,
          })
        )
        .use(
          createScanRoutes({
            triggerScan: container.triggerScan,
            getScanStatus: container.getScanStatus,
          })
        )
        .use(
          createRepositoryRoutes({
            reportRepo: container.reportRepo,
          })
        )
        .use(
          createConfigRoutes({
            getAnthropicApiKey: container.getAnthropicApiKey,
            setAnthropicApiKey: container.setAnthropicApiKey,
          })
        )
        .use(
          createDomainModelRoutes({
            db: container.db,
          })
        )
    );

  return app;
}

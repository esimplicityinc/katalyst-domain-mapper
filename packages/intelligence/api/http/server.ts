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
import { createGovernanceRoutes } from "./routes/v1/governance.js";
import { createTaxonomyRoutes } from "./routes/v1/taxonomy.js";
import { createLandscapeRoutes } from "./routes/v1/landscape.js";
import { createLintRoutes } from "./routes/v1/lint.js";
import type { Container } from "../bootstrap/container.js";
import * as path from "node:path";
import * as fs from "node:fs";

// ── Static file MIME types ──────────────────────────────────────────────────
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json",
};

// ── OpenCode proxy target ───────────────────────────────────────────────────
const OPENCODE_URL =
  process.env.OPENCODE_INTERNAL_URL ?? "http://127.0.0.1:4096";

// ── Web UI dist directory ───────────────────────────────────────────────────
const WEB_DIST_DIR =
  process.env.WEB_DIST_DIR ??
  path.resolve(import.meta.dirname ?? ".", "../../web-dist");

export function createServer(container: Container) {
  const app = new Elysia()
    .use(
      cors({
        origin:
          process.env.CORS_ORIGINS?.split(",").map((s) => s.trim()) ?? true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "X-Request-ID", "Authorization"],
        maxAge: 86400,
      }),
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
            { name: "Governance", description: "Governance index management" },
            { name: "Taxonomy", description: "Taxonomy snapshot management" },
          ],
        },
        path: "/swagger",
      }),
    )
    .use(requestIdMiddleware)
    .use(createLoggingMiddleware(container.logger))
    .use(errorMiddleware)

    // Health/ready endpoints
    .group("/api/v1", (app) =>
      app.use(healthRoute).use(createReadyRoute(container.healthCheck)),
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
          }),
        )
        .use(
          createScanRoutes({
            triggerScan: container.triggerScan,
            getScanStatus: container.getScanStatus,
          }),
        )
        .use(
          createRepositoryRoutes({
            reportRepo: container.reportRepo,
          }),
        )
        .use(
          createConfigRoutes({
            getAnthropicApiKey: container.getAnthropicApiKey,
            setAnthropicApiKey: container.setAnthropicApiKey,
            getOpenrouterApiKey: container.getOpenrouterApiKey,
            setOpenrouterApiKey: container.setOpenrouterApiKey,
            getLlmApiKey: container.getLlmApiKey,
            setLlmApiKey: container.setLlmApiKey,
          }),
        )
        .use(
          createDomainModelRoutes({
            createDomainModel: container.createDomainModel,
            getDomainModel: container.getDomainModel,
            listDomainModels: container.listDomainModels,
            deleteDomainModel: container.deleteDomainModel,
            manageBoundedContexts: container.manageBoundedContexts,
            manageArtifacts: container.manageArtifacts,
            manageGlossary: container.manageGlossary,
            manageWorkflows: container.manageWorkflows,
          }),
        )
        .use(
          createGovernanceRoutes({
            ingestGovernanceSnapshot: container.ingestGovernanceSnapshot,
            queryGovernanceState: container.queryGovernanceState,
            getCapabilityCoverage: container.getCapabilityCoverage,
            getGovernanceTrend: container.getGovernanceTrend,
            governanceRepo: container.governanceRepo,
            validateTransition: container.validateTransition,
          }),
        )
        .use(
          createTaxonomyRoutes({
            ingestTaxonomySnapshot: container.ingestTaxonomySnapshot,
            queryTaxonomyState: container.queryTaxonomyState,
            taxonomyRepo: container.taxonomyRepo,
          }),
        )
        .use(
          createLandscapeRoutes({
            queryTaxonomyState: container.queryTaxonomyState,
            queryGovernanceState: container.queryGovernanceState,
            getDomainModel: container.getDomainModel,
            governanceRepo: container.governanceRepo,
            taxonomyRepo: container.taxonomyRepo,
          }),
        )
        .use(
          createLintRoutes({
            lintLandscape: container.lintLandscape,
          }),
        ),
    )

    // ── Static file serving + SPA fallback + OpenCode proxy ────────────────
    .all("/*", async ({ request }) => {
      const url = new URL(request.url);

      // ── OpenCode proxy (/opencode/* → internal :4096) ───────────────────
      if (url.pathname.startsWith("/opencode")) {
        const targetPath = url.pathname.replace(/^\/opencode/, "") || "/";
        const targetUrl = `${OPENCODE_URL}${targetPath}${url.search}`;

        try {
          // Build clean headers for the upstream request (strip hop-by-hop)
          const upstreamHeaders = new Headers();
          upstreamHeaders.set(
            "Content-Type",
            request.headers.get("Content-Type") ?? "application/json",
          );
          upstreamHeaders.set(
            "Accept",
            request.headers.get("Accept") ?? "application/json",
          );

          // Read body for non-GET/HEAD methods
          let body: string | undefined;
          if (request.method !== "GET" && request.method !== "HEAD") {
            body = await request.text();
          }

          const proxyRes = await fetch(targetUrl, {
            method: request.method,
            headers: upstreamHeaders,
            body,
          });

          // Build clean response headers (don't forward internal CORS/hop-by-hop)
          const resHeaders = new Headers();
          const contentType = proxyRes.headers.get("Content-Type");
          if (contentType) resHeaders.set("Content-Type", contentType);
          const contentLength = proxyRes.headers.get("Content-Length");
          if (contentLength) resHeaders.set("Content-Length", contentLength);

          return new Response(proxyRes.body, {
            status: proxyRes.status,
            statusText: proxyRes.statusText,
            headers: resHeaders,
          });
        } catch {
          return new Response(
            JSON.stringify({ error: "OpenCode server not available" }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }
      }

      // ── Guard: never serve HTML for /api paths (return 404 JSON) ────────
      if (url.pathname.startsWith("/api")) {
        return new Response(
          JSON.stringify({ error: "Not Found", path: url.pathname }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      // ── Static file serving + SPA fallback ──────────────────────────────
      let filePath = path.join(WEB_DIST_DIR, url.pathname);

      // Security: prevent directory traversal
      if (!filePath.startsWith(WEB_DIST_DIR)) {
        return new Response("Forbidden", { status: 403 });
      }

      // Try the exact file
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
        const cacheControl =
          ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable";
        return new Response(Bun.file(filePath), {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": cacheControl,
          },
        });
      }

      // SPA fallback — serve index.html for all unmatched routes
      const indexPath = path.join(WEB_DIST_DIR, "index.html");
      if (fs.existsSync(indexPath)) {
        return new Response(Bun.file(indexPath), {
          headers: {
            "Content-Type": "text/html",
            "Cache-Control": "no-cache",
          },
        });
      }

      return new Response("Not Found", { status: 404 });
    });

  return app;
}

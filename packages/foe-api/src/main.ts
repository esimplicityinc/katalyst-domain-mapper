import { loadConfig } from "./config/env.js";
import { createContainer } from "./bootstrap/container.js";
import { createServer } from "./http/server.js";
import { startScanLoop } from "./bootstrap/scanLoop.js";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as fs from "node:fs";
import * as path from "node:path";

const config = loadConfig();

// Ensure data directory exists before creating the database
const dbDir = path.dirname(config.databaseUrl);
if (dbDir !== "." && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const container = createContainer(config);
const { logger } = container;

// Run migrations
try {
  const migrationsFolder = path.resolve(
    import.meta.dirname ?? ".",
    "../drizzle",
  );
  if (fs.existsSync(migrationsFolder)) {
    migrate(container.db, { migrationsFolder });
    logger.info("Database migrations applied");
  } else {
    logger.warn("No migrations folder found, skipping migrations", {
      migrationsFolder,
    });
  }
} catch (err) {
  logger.error("Migration failed", {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
}

// Create HTTP server
const app = createServer(container);

// Start background scan loop
const stopScanLoop = startScanLoop({
  scanJobRepo: container.scanJobRepo,
  scanRunner: container.scanRunner,
  reportRepo: container.reportRepo,
  logger: logger.child({ component: "scan-loop" }),
  pollIntervalMs: config.scanPollIntervalMs,
});

// Start listening
app.listen(
  {
    port: config.port,
    hostname: config.host,
  },
  ({ hostname, port }) => {
    logger.info(`FOE API listening on http://${hostname}:${port}`);
    logger.info(`Swagger docs at http://${hostname}:${port}/swagger`);
  },
);

// Graceful shutdown
function shutdown() {
  logger.info("Received shutdown signal");
  stopScanLoop();
  container.shutdown();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

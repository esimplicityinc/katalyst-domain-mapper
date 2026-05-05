import { createApp, lakebase, server } from '@databricks/appkit';
import { initializeSchema } from './db/init';
import { setupDomainModelRoutes } from './routes/domain-models';
import { setupContributionRoutes } from './routes/contributions';
import { setupHealthRoutes } from './routes/health';
import { setupGovernanceRoutes } from './routes/governance';
import { setupTaxonomyRoutes } from './routes/taxonomy';
import { setupReportRoutes } from './routes/reports';
import { setupLandscapeRoutes } from './routes/landscape';
import { setupConfigRoutes } from './routes/config';
import { setupOpenCodeProxy } from './routes/opencode-proxy';
import { broker } from './services/opencode-broker';
import { setupWorkspace } from './services/opencode-workspace';

createApp({
  plugins: [
    server({ autoStart: false }),
    lakebase(),
  ],
})
  .then(async (appkit) => {
    // Initialize all 41 tables in the katalyst schema
    await initializeSchema(appkit.lakebase.query.bind(appkit.lakebase));

    // ── OpenCode workspace & broker ─────────────────────────────────────
    // Set up workspace first (copies agents, config), then start the broker
    await setupWorkspace();

    // Don't fail startup if opencode is not installed; it will retry
    broker.start().catch((err: unknown) => {
      console.warn('[opencode] Initial start failed (will retry):', err);
    });
    broker.startHealthPoller();

    // Register API routes
    await setupHealthRoutes(appkit);
    await setupDomainModelRoutes(appkit);
    await setupContributionRoutes(appkit);
    await setupGovernanceRoutes(appkit);
    await setupTaxonomyRoutes(appkit);
    await setupReportRoutes(appkit);
    await setupLandscapeRoutes(appkit);
    await setupConfigRoutes(appkit);
    await setupOpenCodeProxy(appkit);

    // ── Graceful shutdown ───────────────────────────────────────────────
    process.on('SIGTERM', () => {
      console.log('[server] SIGTERM received — shutting down');
      broker.stop();
    });
    process.on('SIGINT', () => {
      broker.stop();
    });

    // Start the server
    await appkit.server.start();
    console.log('[server] Katalyst Bard is running');
  })
  .catch(console.error);

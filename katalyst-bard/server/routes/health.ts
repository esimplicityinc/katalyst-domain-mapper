import type { Application } from 'express';

interface AppKit {
  lakebase: {
    query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

export async function setupHealthRoutes(appkit: AppKit) {
  appkit.server.extend((app) => {
    app.get('/api/v1/health', async (_req, res) => {
      try {
        await appkit.lakebase.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
      } catch (err) {
        res.status(503).json({ status: 'error', database: 'disconnected', error: (err as Error).message });
      }
    });

    app.get('/api/v1/ready', async (_req, res) => {
      try {
        const { rows } = await appkit.lakebase.query(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'katalyst'`
        );
        const tableCount = Number(rows[0]?.count ?? 0);
        res.json({ 
          status: tableCount >= 41 ? 'ready' : 'initializing',
          tables: tableCount,
          timestamp: new Date().toISOString(),
          opencode: {
            hasToken: !!process.env.DATABRICKS_TOKEN,
            hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
            hasOpenaiKey: !!process.env.OPENAI_API_KEY,
            hasClientId: !!process.env.DATABRICKS_CLIENT_ID,
            hasClientSecret: !!process.env.DATABRICKS_CLIENT_SECRET,
            hasHost: !!process.env.DATABRICKS_HOST,
            host: process.env.DATABRICKS_HOST?.replace(/^https?:\/\//, '').substring(0, 30),
          },
        });
      } catch (err) {
        res.status(503).json({ status: 'error', error: (err as Error).message });
      }
    });
  });
}

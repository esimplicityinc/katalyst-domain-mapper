import type { Application } from 'express';

interface AppKit {
  lakebase: {
    query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

// In-memory API key store (not persisted across restarts — matches original pattern)
let storedApiKey: string | null = null;

function detectProvider(key: string): string | null {
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('sk-or-')) return 'openrouter';
  if (key.startsWith('sk-')) return 'openai';
  return 'unknown';
}

export async function setupConfigRoutes(appkit: AppKit) {
  // appkit.lakebase is unused here but we keep the signature consistent
  void appkit;

  appkit.server.extend((app) => {
    // ── GET /config/status — Check what's configured ─────────────────────

    app.get('/api/v1/config/status', (_req, res) => {
      try {
        const hasKey = !!storedApiKey;
        const provider = storedApiKey ? detectProvider(storedApiKey) : null;

        res.json({
          anthropicApiKey: hasKey && provider === 'anthropic',
          openrouterApiKey: hasKey && provider === 'openrouter',
          activeProvider: provider,
          scannerEnabled: hasKey,
        });
      } catch (err) {
        console.error('Failed to get config status:', err);
        res.status(500).json({ error: 'Failed to get config status' });
      }
    });

    // ── PUT /config/api-key — Set an LLM API key ────────────────────────

    app.put('/api/v1/config/api-key', (req, res) => {
      try {
        const body = req.body as Record<string, unknown>;
        const apiKey = body?.apiKey as string | undefined;

        if (!apiKey || apiKey.trim().length === 0) {
          res.status(400).json({ error: 'apiKey is required' });
          return;
        }

        const trimmed = apiKey.trim();
        storedApiKey = trimmed;
        const provider = detectProvider(trimmed);

        res.json({
          message: `API key configured (${provider} provider)`,
          provider,
          scannerEnabled: true,
        });
      } catch (err) {
        console.error('Failed to set API key:', err);
        res.status(500).json({ error: 'Failed to set API key' });
      }
    });

    // ── DELETE /config/api-key — Clear API key ───────────────────────────

    app.delete('/api/v1/config/api-key', (_req, res) => {
      try {
        storedApiKey = null;
        res.json({ message: 'API key cleared' });
      } catch (err) {
        console.error('Failed to clear API key:', err);
        res.status(500).json({ error: 'Failed to clear API key' });
      }
    });

    // ── GET /flags — Feature flags (empty for now) ──────────────────────

    app.get('/api/v1/flags', (_req, res) => {
      try {
        res.json({});
      } catch (err) {
        console.error('Failed to get flags:', err);
        res.status(500).json({ error: 'Failed to get flags' });
      }
    });
  });
}

import { existsSync, mkdirSync, writeFileSync, cpSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** The workspace directory where OpenCode runs */
export const WORKSPACE_DIR = join(tmpdir(), 'katalyst-workspace');

/**
 * Resolve the app bundle root.
 * In production (dist/), __dirname is katalyst-bard/dist/server/services/ → go up 3 levels.
 * In development (tsx), __dirname is katalyst-bard/server/services/ → go up 2 levels.
 */
function getAppRoot(): string {
  // Try dist layout first (3 levels up from dist/server/services/)
  const distRoot = resolve(__dirname, '../../..');
  if (existsSync(join(distRoot, 'package.json'))) return distRoot;
  // Dev layout (2 levels up from server/services/)
  const devRoot = resolve(__dirname, '../..');
  if (existsSync(join(devRoot, 'package.json'))) return devRoot;
  return process.cwd();
}

/**
 * Set up the workspace directory for OpenCode:
 * - Create /tmp/katalyst-workspace
 * - Copy .opencode/ agents directory from the app bundle (if present)
 * - Write an opencode.json config
 * - Copy AGENTS.md if it exists in the app root
 */
export async function setupWorkspace(): Promise<void> {
  const appRoot = getAppRoot();
  console.log(`[workspace] Setting up workspace at ${WORKSPACE_DIR} (app root: ${appRoot})`);

  // Create workspace directory
  if (!existsSync(WORKSPACE_DIR)) {
    mkdirSync(WORKSPACE_DIR, { recursive: true });
  }

  // Create a package.json so OpenCode treats this as a project root
  // (OpenCode resolves config from the nearest package.json or .git ancestor)
  const pkgJsonPath = join(WORKSPACE_DIR, 'package.json');
  if (!existsSync(pkgJsonPath)) {
    writeFileSync(pkgJsonPath, JSON.stringify({ name: 'katalyst-workspace', private: true }, null, 2), 'utf8');
  }

  // Copy .opencode/ agents from app bundle if they exist
  const sourceOpencode = join(appRoot, '.opencode');
  const destOpencode = join(WORKSPACE_DIR, '.opencode');
  if (existsSync(sourceOpencode)) {
    try {
      cpSync(sourceOpencode, destOpencode, { recursive: true, force: true });
      const agentsDir = join(destOpencode, 'agents');
      const agentCount = existsSync(agentsDir) ? readdirSync(agentsDir).length : 0;
      console.log(`[workspace] Copied .opencode/ (${agentCount} agents)`);
    } catch (err) {
      console.warn('[workspace] Failed to copy .opencode/:', (err as Error).message);
    }
  } else {
    // Create minimal .opencode structure
    const agentsDir = join(destOpencode, 'agents');
    if (!existsSync(agentsDir)) {
      mkdirSync(agentsDir, { recursive: true });
    }
    console.log('[workspace] No .opencode/ in app bundle — created empty structure');
  }

  // Write opencode.json config
  const databricksHost = process.env.DATABRICKS_HOST?.replace(/\/+$/, '') ?? '';
  const config: Record<string, unknown> = {};

  if (databricksHost) {
    const gatewayBase = databricksHost.startsWith('http') ? databricksHost : `https://${databricksHost}`;
    // Configure Databricks AI Gateway as the ONLY provider
    // The gateway supports OpenAI-compatible chat completions at /serving-endpoints/chat/completions
    config.provider = {
      databricks: {
        name: 'Databricks AI Gateway',
        api: `${gatewayBase}/serving-endpoints/`,
        env: ['DATABRICKS_TOKEN'],
        models: {
          'databricks-claude-sonnet-4-6': {
            name: 'Claude Sonnet 4.6 (Gateway)',
          },
        },
      },
    };
    console.log(`[workspace] Configured AI Gateway at ${gatewayBase}/serving-endpoints`);
  }

  writeFileSync(join(WORKSPACE_DIR, 'opencode.json'), JSON.stringify(config, null, 2), 'utf8');
  console.log('[workspace] Wrote opencode.json');

  // Copy AGENTS.md if it exists
  const agentsMd = join(appRoot, 'AGENTS.md');
  if (existsSync(agentsMd)) {
    cpSync(agentsMd, join(WORKSPACE_DIR, 'AGENTS.md'), { force: true });
    console.log('[workspace] Copied AGENTS.md');
  }

  console.log('[workspace] Setup complete');

  // Resolve DATABRICKS_TOKEN for the AI Gateway.
  // If we have M2M credentials (CLIENT_ID + CLIENT_SECRET), exchange for a token.
  if (!process.env.DATABRICKS_TOKEN && process.env.DATABRICKS_CLIENT_ID && process.env.DATABRICKS_CLIENT_SECRET && databricksHost) {
    try {
      const host = databricksHost.startsWith('http') ? databricksHost : `https://${databricksHost}`;
      // Direct OAuth2 M2M token exchange
      const tokenRes = await fetch(`${host}/oidc/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.DATABRICKS_CLIENT_ID,
          client_secret: process.env.DATABRICKS_CLIENT_SECRET,
          scope: 'all-apis',
        }),
      });
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json() as { access_token?: string };
        if (tokenData.access_token) {
          process.env.DATABRICKS_TOKEN = tokenData.access_token;
          // Set as OPENAI_API_KEY so OpenCode's openai adapter sends it as Bearer token
          // to the Databricks AI Gateway (which uses OpenAI-compatible API)
          process.env.OPENAI_API_KEY = tokenData.access_token;
          // Remove ANTHROPIC_API_KEY so OpenCode doesn't try direct Anthropic
          delete process.env.ANTHROPIC_API_KEY;
          console.log('[workspace] Obtained OAuth2 M2M access token, set as OPENAI_API_KEY for gateway');
        }
      } else {
        const errText = await tokenRes.text();
        console.warn(`[workspace] OAuth2 token exchange failed (${tokenRes.status}):`, errText.substring(0, 200));
      }
    } catch (err) {
      console.warn('[workspace] Could not exchange M2M credentials for token:', (err as Error).message);
    }
  } else if (process.env.DATABRICKS_TOKEN) {
    console.log('[workspace] DATABRICKS_TOKEN already set');
  }
}

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORKSPACE_DIR } from './opencode-workspace.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Resolve the opencode binary path.
 * Priority:
 * 1. OPENCODE_URL env var (skip spawning entirely)
 * 2. OPENCODE_BIN env var (explicit path)
 * 3. node_modules/.bin/opencode relative to this file's location (works on Databricks Apps)
 * 4. 'opencode' in PATH (fallback for local dev where it's installed globally)
 */
function resolveOpenCodeBin(): string {
  if (process.env.OPENCODE_BIN) {
    const bin = process.env.OPENCODE_BIN;
    if (bin.startsWith('.')) {
      return resolve(process.cwd(), bin);
    }
    return bin;
  }
  // Try node_modules/.bin relative to the dist/ output directory
  // __dirname in dist/ is katalyst-bard/dist/server/services/
  // node_modules/.bin is at katalyst-bard/node_modules/.bin
  const localBin = resolve(__dirname, '../../../node_modules/.bin/opencode');
  if (existsSync(localBin)) {
    return localBin;
  }
  return 'opencode'; // fallback to PATH
}

/**
 * Manages the OpenCode server connection.
 *
 * Two modes:
 *   1. EXTERNAL  (OPENCODE_URL env var set): connects to an already-running instance.
 *      Use this on Databricks Apps where the admin runs `opencode serve` as a sidecar.
 *   2. SPAWNED   (no OPENCODE_URL): spawns `opencode serve` as a child process and
 *      keeps it alive by holding an open SSE subscription (prevents idle exit).
 */
export class OpenCodeBroker {
  private process: ChildProcess | null = null;
  private actualPort: number | null = null;
  private ready = false;
  private restartCount = 0;
  private readonly maxRestarts = 5;
  private keepaliveAbort: AbortController | null = null;
  private externalUrl: string | null = null;

  get openCodePort(): number {
    return this.actualPort ?? 4096;
  }

  getBaseUrl(): string {
    if (this.externalUrl) return this.externalUrl;
    if (this.actualPort) return `http://localhost:${this.actualPort}`;
    throw new Error('OpenCode broker not started');
  }

  isReady(): boolean {
    return this.ready;
  }

  async start(): Promise<void> {
    // Mode 1: connect to external instance
    const externalUrl = process.env.OPENCODE_URL?.trim();
    if (externalUrl) {
      this.externalUrl = externalUrl;
      console.log(`[opencode] Connecting to external instance at ${externalUrl}`);
      await this.waitForReady();
      console.log(`[opencode] External instance ready at ${externalUrl}`);
      return;
    }

    // Mode 2: spawn our own instance
    await this.spawnProcess();
  }

  private async spawnProcess(): Promise<void> {
    const bin = resolveOpenCodeBin();
    console.log(`[opencode] Using binary: ${bin}`);

    if (!existsSync(WORKSPACE_DIR)) {
      mkdirSync(WORKSPACE_DIR, { recursive: true });
    }

    // Ensure a minimal opencode.json exists so the CLI doesn't complain
    const configPath = resolve(WORKSPACE_DIR, 'opencode.json');
    if (!existsSync(configPath)) {
      writeFileSync(configPath, JSON.stringify({}), 'utf8');
    }

    console.log(`[opencode] Spawning ${bin} serve in ${WORKSPACE_DIR}`);
    console.log(`[opencode] ANTHROPIC_API_KEY set: ${!!process.env.ANTHROPIC_API_KEY}`);
    console.log(`[opencode] OPENAI_API_KEY set: ${!!process.env.OPENAI_API_KEY}`);
    console.log(`[opencode] DATABRICKS_TOKEN set: ${!!process.env.DATABRICKS_TOKEN}`);

    this.process = spawn(bin, ['serve', '--hostname=localhost', '--port=0'], {
      cwd: WORKSPACE_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CI: '1', NO_COLOR: '1' },
    });

    // Collect all output to find the port
    let outputBuffer = '';
    let portResolved = false;
    const portPromise = new Promise<number>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Timed out waiting for opencode port')),
        15_000,
      );
      const tryResolve = (chunk: Buffer) => {
        if (portResolved) return;
        outputBuffer += chunk.toString();
        const m =
          outputBuffer.match(/listening on\s+http:\/\/[\w.]+:(\d+)/i) ??
          outputBuffer.match(/:(\d{4,5})/);
        if (m) {
          const p = parseInt(m[1], 10);
          if (p > 1000 && p < 65535) {
            portResolved = true;
            clearTimeout(timeout);
            resolve(p);
          }
        }
      };
      this.process!.stdout?.on('data', tryResolve);
      this.process!.stderr?.on('data', tryResolve);
    });

    this.process.stdout?.on('data', (c: Buffer) =>
      process.stdout.write(`[opencode] ${c.toString().trimEnd()}\n`),
    );
    this.process.stderr?.on('data', (c: Buffer) =>
      process.stderr.write(`[opencode:err] ${c.toString().trimEnd()}\n`),
    );

    this.process.on('exit', (code, signal) => {
      console.warn(`[opencode] exited code=${code} signal=${signal}`);
      this.ready = false;
      this.process = null;
      this.actualPort = null;
      this.keepaliveAbort?.abort();
      this.keepaliveAbort = null;

      if (this.restartCount < this.maxRestarts) {
        this.restartCount++;
        const delay = Math.min(2000 * this.restartCount, 15_000);
        console.log(
          `[opencode] Restarting in ${delay}ms (${this.restartCount}/${this.maxRestarts})`,
        );
        setTimeout(() => this.spawnProcess().catch(console.error), delay);
      } else {
        console.error('[opencode] Max restarts reached');
      }
    });

    this.process.on('error', (err) => {
      if (err.message.includes('ENOENT')) {
        console.error(
          '[opencode] Binary not found. Set OPENCODE_URL to use an external instance, or install opencode.',
        );
      } else {
        console.error('[opencode] Process error:', err.message);
      }
    });

    // Resolve port
    try {
      this.actualPort = await portPromise;
    } catch {
      this.actualPort = 4097;
      console.warn('[opencode] Could not parse port — falling back to 4097');
    }

    const baseUrl = `http://localhost:${this.actualPort}`;
    console.log(`[opencode] Connecting at ${baseUrl}`);

    await this.waitForReady();
    this.restartCount = 0;
    console.log(`[opencode] Ready at ${baseUrl}`);

    // Start keepalive: hold an SSE connection so opencode doesn't idle-exit
    this.startKeepalive(baseUrl);
  }

  /**
   * Hold an open SSE connection to the /event endpoint to prevent opencode from
   * exiting due to no connected clients. Reconnects automatically if dropped.
   */
  private startKeepalive(baseUrl: string): void {
    this.keepaliveAbort?.abort();
    this.keepaliveAbort = new AbortController();
    const signal = this.keepaliveAbort.signal;

    const connect = () => {
      if (signal.aborted) return;
      fetch(`${baseUrl}/event`, {
        signal,
        headers: { Accept: 'text/event-stream' },
      })
        .then(async (resp) => {
          if (!resp.body) return;
          const reader = resp.body.getReader();
          // Drain the stream to keep the connection alive
          while (true) {
            const { done } = await reader.read();
            if (done || signal.aborted) break;
          }
        })
        .catch((err) => {
          if (signal.aborted) return;
          const msg = err instanceof Error ? err.message : String(err);
          if (!msg.includes('AbortError')) {
            console.warn(
              `[opencode] Keepalive dropped (${msg}) — reconnecting in 2s`,
            );
            setTimeout(connect, 2000);
          }
        });
    };

    // Small delay to let opencode fully initialize before keepalive connects
    setTimeout(connect, 1000);
    console.log('[opencode] Keepalive started');
  }

  async checkHealth(): Promise<{ ok: boolean; version?: string }> {
    const base = this.externalUrl
      ? this.externalUrl
      : this.actualPort
        ? `http://localhost:${this.actualPort}`
        : null;
    if (!base) return { ok: false };
    try {
      const resp = await fetch(`${base}/global/health`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!resp.ok) return { ok: false };
      const data = (await resp.json()) as Record<string, unknown>;
      return {
        ok: data['healthy'] === true,
        version: data['version'] as string | undefined,
      };
    } catch {
      return { ok: false };
    }
  }

  private async waitForReady(timeoutMs = 20_000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const { ok } = await this.checkHealth();
      if (ok) {
        this.ready = true;
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    // Don't throw — mark as not ready and let health polling recover
    console.warn(
      '[opencode] waitForReady timed out — will retry via periodic health checks',
    );
  }

  stop(): void {
    this.restartCount = this.maxRestarts; // prevent auto-restart
    this.keepaliveAbort?.abort();
    this.keepaliveAbort = null;
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
    this.ready = false;
    this.actualPort = null;
  }

  /**
   * Start a background poller that updates this.ready if waitForReady timed out.
   * Called once by server.ts after broker.start().
   */
  startHealthPoller(): void {
    setInterval(async () => {
      if (this.ready) return;
      const { ok } = await this.checkHealth();
      if (ok && !this.ready) {
        this.ready = true;
        console.log('[opencode] Health poller: now ready');
      }
    }, 5000);
  }
}

export const broker = new OpenCodeBroker();

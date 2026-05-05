import type { Application, Request, Response } from 'express';
import { broker } from '../services/opencode-broker.js';
import { Readable } from 'node:stream';

interface AppKit {
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

/**
 * Register a catch-all proxy route that forwards /opencode/* requests
 * to the OpenCode child process. Strips the /opencode prefix.
 *
 * Examples:
 *   GET  /opencode/global/health  →  GET  http://127.0.0.1:{port}/global/health
 *   POST /opencode/session        →  POST http://127.0.0.1:{port}/session
 *   GET  /opencode/event          →  GET  http://127.0.0.1:{port}/event  (SSE)
 */
export async function setupOpenCodeProxy(appkit: AppKit): Promise<void> {
  appkit.server.extend((app) => {
    app.all('/opencode/*', async (req: Request, res: Response) => {
      if (!broker.isReady()) {
        res.status(503).json({
          error: 'OpenCode is not ready',
          hint: 'The agent engine is still starting up. Try again in a few seconds.',
        });
        return;
      }

      // Strip the /opencode prefix to get the upstream path
      const upstreamPath = req.originalUrl.replace(/^\/opencode/, '') || '/';
      const upstreamUrl = `${broker.getBaseUrl()}${upstreamPath}`;

      try {
        // Build upstream request headers — forward most but strip hop-by-hop
        const forwardHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(req.headers)) {
          const lower = key.toLowerCase();
          if (
            lower === 'host' ||
            lower === 'connection' ||
            lower === 'transfer-encoding' ||
            lower === 'accept-encoding'
          ) {
            continue;
          }
          if (typeof value === 'string') {
            forwardHeaders[key] = value;
          }
        }

        // Build the fetch options
        const fetchOptions: RequestInit = {
          method: req.method,
          headers: forwardHeaders,
          signal: AbortSignal.timeout(120_000), // 2 minute timeout
        };

        // Forward request body for methods that have one
        if (
          req.method !== 'GET' &&
          req.method !== 'HEAD' &&
          req.body !== undefined
        ) {
          fetchOptions.body = JSON.stringify(req.body);
          if (!forwardHeaders['content-type']) {
            forwardHeaders['content-type'] = 'application/json';
          }
        }

        const upstream = await fetch(upstreamUrl, fetchOptions);

        // Copy upstream status and response headers
        res.status(upstream.status);
        for (const [key, value] of upstream.headers.entries()) {
          const lower = key.toLowerCase();
          if (lower === 'transfer-encoding' || lower === 'connection' || lower === 'content-encoding') continue;
          res.setHeader(key, value);
        }

        // Check if this is an SSE stream
        const contentType = upstream.headers.get('content-type') ?? '';
        if (contentType.includes('text/event-stream')) {
          // Stream SSE: pipe the body directly to the client
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.flushHeaders();

          if (upstream.body) {
            const reader = upstream.body.getReader();
            const nodeStream = new Readable({
              async read() {
                try {
                  const { done, value } = await reader.read();
                  if (done) {
                    this.push(null);
                  } else {
                    this.push(Buffer.from(value));
                  }
                } catch {
                  this.push(null);
                }
              },
            });

            // Clean up if client disconnects
            req.on('close', () => {
              reader.cancel().catch(() => {});
              nodeStream.destroy();
            });

            nodeStream.pipe(res);
          } else {
            res.end();
          }
          return;
        }

        // Non-streaming: read body and send
        if (upstream.body) {
          const buffer = Buffer.from(await upstream.arrayBuffer());
          res.send(buffer);
        } else {
          res.end();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[opencode-proxy] ${req.method} ${upstreamPath} failed:`, msg);

        if (!res.headersSent) {
          res.status(502).json({
            error: 'Failed to proxy request to OpenCode',
            detail: msg,
          });
        }
      }
    });

    console.log('[opencode-proxy] Registered /opencode/* proxy route');
  });
}

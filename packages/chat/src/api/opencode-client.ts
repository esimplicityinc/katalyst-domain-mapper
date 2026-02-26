import { createOpencodeClient } from "@opencode-ai/sdk";
import type { QuestionRequest, SSEEvent } from "../types.ts";

export type { Session, Message, Part } from "@opencode-ai/sdk";
export type { QuestionRequest, SSEEvent };

// ── Client factory ──────────────────────────────────────────────────────────
// Each consuming app passes in the base URL so this package has no hard
// dependency on environment variables.

export function createClient(opencodeUrl: string) {
  return createOpencodeClient({ baseUrl: opencodeUrl });
}

// ── Helper: check if OpenCode server is reachable ──────────────────────────

export async function isOpencodeHealthy(opencodeUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${opencodeUrl}/global/health`);
    if (!res.ok) return false;
    const data = (await res.json()) as { healthy?: boolean };
    return data.healthy === true;
  } catch {
    return false;
  }
}

// ── Helper: create a chat session ──────────────────────────────────────────

export async function createChatSession(opencodeUrl: string, title?: string) {
  const client = createClient(opencodeUrl);
  const res = await client.session.create({
    body: { title: title ?? "Chat Session" },
  });
  return res.data;
}

// ── Helper: send a prompt async (fire-and-forget, doesn't wait for response) ─

export async function sendPromptAsync(
  opencodeUrl: string,
  sessionId: string,
  text: string,
  agent?: string,
  model?: { providerID: string; modelID: string },
) {
  const res = await fetch(`${opencodeUrl}/session/${sessionId}/prompt_async`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(agent ? { agent } : {}),
      ...(model ? { model } : {}),
      parts: [{ type: "text", text }],
    }),
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Prompt failed: ${res.status} ${res.statusText}`);
  }
  return true;
}

// ── Helper: reply to a question tool ────────────────────────────────────────

export async function replyToQuestion(
  opencodeUrl: string,
  requestId: string,
  answers: string[][],
): Promise<boolean> {
  const res = await fetch(`${opencodeUrl}/question/${requestId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error(`Question reply failed: ${res.status}`);
  return true;
}

// ── Helper: reject a question tool ──────────────────────────────────────────

export async function rejectQuestion(
  opencodeUrl: string,
  requestId: string,
): Promise<boolean> {
  const res = await fetch(`${opencodeUrl}/question/${requestId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Question reject failed: ${res.status}`);
  return true;
}

// ── Helper: subscribe to SSE event stream ──────────────────────────────────

export function subscribeToEvents(
  opencodeUrl: string,
  onEvent: (event: SSEEvent) => void,
  signal: AbortSignal,
) {
  (async () => {
    try {
      const res = await fetch(`${opencodeUrl}/event`, { signal });
      if (!res.ok || !res.body) return;

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";

      while (!signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += value;
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const lines = chunk.split("\n");
          const dataLines: string[] = [];
          for (const line of lines) {
            if (line.startsWith("data:")) {
              dataLines.push(line.replace(/^data:\s*/, ""));
            }
          }
          if (dataLines.length) {
            try {
              const data = JSON.parse(dataLines.join("\n")) as SSEEvent;
              onEvent(data);
            } catch {
              // ignore non-JSON events
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("SSE stream error:", err);
    }
  })();
}

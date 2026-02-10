import { createOpencodeClient } from "@opencode-ai/sdk";

const OPENCODE_BASE = import.meta.env.VITE_OPENCODE_URL ?? "/opencode";

export const opencode = createOpencodeClient({
  baseUrl: OPENCODE_BASE,
});

// ── Types re-exported for convenience ──────────────────────────────────────

export type { Session, Message, Part } from "@opencode-ai/sdk";

// ── Helper: check if OpenCode server is reachable ──────────────────────────

export async function isOpencodeHealthy(): Promise<boolean> {
  try {
    const res = await fetch(`${OPENCODE_BASE}/global/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.healthy === true;
  } catch {
    return false;
  }
}

// ── Helper: create a DDD domain mapping session ────────────────────────────

export async function createDDDSession(title?: string) {
  const res = await opencode.session.create({
    body: { title: title ?? "Domain Mapping Session" },
  });
  return res.data;
}

// ── Helper: send a prompt async (fire-and-forget, doesn't wait) ────────────

export async function sendPromptAsync(
  sessionId: string,
  text: string,
  agent?: string,
) {
  const res = await opencode.session.promptAsync({
    path: { id: sessionId },
    body: {
      ...(agent ? { agent } : {}),
      parts: [{ type: "text", text }],
    },
  });
  return res.data;
}

// ── Helper: list messages in a session ─────────────────────────────────────

export async function listMessages(sessionId: string) {
  const res = await opencode.session.messages({
    path: { id: sessionId },
  });
  return res.data;
}

// ── Helper: list all sessions ──────────────────────────────────────────────

export async function listSessions() {
  const res = await opencode.session.list();
  return res.data;
}

// ── Helper: delete a session ───────────────────────────────────────────────

export async function deleteSession(sessionId: string) {
  const res = await opencode.session.delete({
    path: { id: sessionId },
  });
  return res.data;
}

// ── Helper: list available agents ──────────────────────────────────────────

export async function listAgents() {
  const res = await opencode.app.agents();
  return res.data;
}

// ── Question tool types ─────────────────────────────────────────────────────

export interface QuestionOption {
  label: string;
  description: string;
}

export interface QuestionInfo {
  question: string;
  header: string;
  options: QuestionOption[];
  multiple?: boolean;
  custom?: boolean; // defaults to true — allow typing a custom answer
}

export interface QuestionRequest {
  id: string;
  sessionID: string;
  questions: QuestionInfo[];
  tool?: {
    messageID: string;
    callID: string;
  };
}

// ── Helper: reply to a question tool ────────────────────────────────────────

export async function replyToQuestion(
  requestId: string,
  answers: string[][],
): Promise<boolean> {
  const res = await fetch(`${OPENCODE_BASE}/question/${requestId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error(`Question reply failed: ${res.status}`);
  return true;
}

// ── Helper: reject a question tool ──────────────────────────────────────────

export async function rejectQuestion(requestId: string): Promise<boolean> {
  const res = await fetch(`${OPENCODE_BASE}/question/${requestId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Question reject failed: ${res.status}`);
  return true;
}

// ── SSE event stream types ─────────────────────────────────────────────────

export interface SSEPartEvent {
  type: "message.part.updated";
  properties: {
    part: {
      id: string;
      sessionID: string;
      messageID: string;
      type: string;
      text?: string;
      tool?: string;
      state?: {
        status: string;
        input?: Record<string, unknown>;
        output?: string;
      };
    };
    delta?: string;
  };
}

export interface SSEQuestionAskedEvent {
  type: "question.asked";
  properties: QuestionRequest;
}

export interface SSESessionIdleEvent {
  type: "session.idle";
  properties: {
    sessionID: string;
  };
}

export interface SSESessionErrorEvent {
  type: "session.error";
  properties: {
    sessionID: string;
    error: string;
  };
}

export type SSEEvent =
  | SSEPartEvent
  | SSEQuestionAskedEvent
  | SSESessionIdleEvent
  | SSESessionErrorEvent
  | { type: string; properties: unknown };

// ── Helper: subscribe to SSE event stream ──────────────────────────────────
// Uses raw EventSource-style fetch to stream events from /event endpoint.

export function subscribeToEvents(
  onEvent: (event: SSEEvent) => void,
  signal: AbortSignal,
) {
  (async () => {
    try {
      const res = await fetch(`${OPENCODE_BASE}/event`, { signal });
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
              const data = JSON.parse(dataLines.join("\n"));
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

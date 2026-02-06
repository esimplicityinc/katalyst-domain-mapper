import { createOpencodeClient } from '@opencode-ai/sdk';

const OPENCODE_BASE = import.meta.env.VITE_OPENCODE_URL ?? 'http://localhost:4096';

export const opencode = createOpencodeClient({
  baseUrl: OPENCODE_BASE,
});

// ── Types re-exported for convenience ──────────────────────────────────────

export type { Session, Message, Part } from '@opencode-ai/sdk';

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
    body: { title: title ?? 'Domain Mapping Session' },
  });
  return res.data;
}

// ── Helper: send a prompt to a session ─────────────────────────────────────

export async function sendPrompt(
  sessionId: string,
  text: string,
  agent?: string,
) {
  const res = await opencode.session.prompt({
    path: { id: sessionId },
    body: {
      ...(agent ? { agent } : {}),
      parts: [{ type: 'text', text }],
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

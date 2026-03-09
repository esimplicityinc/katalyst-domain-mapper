import type {
  ChatOrchestrator,
  ChatStreamEvent,
  SendMessageOptions,
} from "../../ports/ChatOrchestrator.js";
import type { Logger } from "../../ports/Logger.js";

/**
 * OpenCode chat orchestrator — wraps the OpenCode HTTP API (served by `opencode serve`).
 *
 * This adapter implements the ChatOrchestrator port using the OpenCode SDK/HTTP
 * protocol: sessions, prompt_async, SSE event streaming.
 */
export class OpenCodeChatOrchestrator implements ChatOrchestrator {
  readonly runtime = "opencode" as const;

  constructor(
    private opencodeUrl: string,
    private logger: Logger,
  ) {}

  async createSession(agentName?: string, title?: string): Promise<string> {
    const res = await fetch(`${this.opencodeUrl}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title ?? `Chat Session${agentName ? ` (${agentName})` : ""}`,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create session: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as { id: string };
    this.logger.debug("OpenCode session created", {
      sessionId: data.id,
      agentName,
    });
    return data.id;
  }

  async sendMessage(
    sessionId: string,
    text: string,
    onEvent: (event: ChatStreamEvent) => void,
    options?: SendMessageOptions,
  ): Promise<void> {
    // Fire the prompt
    const promptRes = await fetch(
      `${this.opencodeUrl}/session/${sessionId}/prompt_async`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(options?.agent ? { agent: options.agent } : {}),
          ...(options?.model ? { model: options.model } : {}),
          parts: [{ type: "text", text }],
        }),
      },
    );

    if (!promptRes.ok && promptRes.status !== 204) {
      throw new Error(
        `Prompt failed: ${promptRes.status} ${promptRes.statusText}`,
      );
    }

    // Subscribe to SSE event stream
    await this.consumeEvents(onEvent, options?.signal);
  }

  async replyToQuestion(
    requestId: string,
    answers: string[][],
  ): Promise<void> {
    const res = await fetch(
      `${this.opencodeUrl}/question/${requestId}/reply`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      },
    );
    if (!res.ok) {
      throw new Error(`Question reply failed: ${res.status}`);
    }
  }

  async rejectQuestion(requestId: string): Promise<void> {
    const res = await fetch(
      `${this.opencodeUrl}/question/${requestId}/reject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) {
      throw new Error(`Question reject failed: ${res.status}`);
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    const res = await fetch(
      `${this.opencodeUrl}/session/${sessionId}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      this.logger.warn("Failed to destroy OpenCode session", {
        sessionId,
        status: res.status,
      });
    }
  }

  /**
   * Consume the SSE event stream and normalize events to ChatStreamEvent.
   */
  private async consumeEvents(
    onEvent: (event: ChatStreamEvent) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const res = await fetch(`${this.opencodeUrl}/event`, { signal });
    if (!res.ok || !res.body) return;

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";

    try {
      while (!signal?.aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += value;
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const dataLines: string[] = [];
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data:")) {
              dataLines.push(line.replace(/^data:\s*/, ""));
            }
          }
          if (dataLines.length) {
            try {
              const raw = JSON.parse(dataLines.join("\n")) as Record<
                string,
                unknown
              >;
              const normalized = this.normalizeEvent(raw);
              if (normalized) onEvent(normalized);
            } catch {
              // skip non-JSON events
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      this.logger.error("SSE stream error", {
        error: err instanceof Error ? err.message : String(err),
      });
      onEvent({ type: "error", data: { message: String(err) } });
    }
  }

  /**
   * Map raw OpenCode SSE events to our normalized ChatStreamEvent type.
   */
  private normalizeEvent(
    raw: Record<string, unknown>,
  ): ChatStreamEvent | null {
    const type = raw.type as string | undefined;

    if (type === "message.part.updated" || type === "part.updated") {
      const part = raw.part as Record<string, unknown> | undefined;
      if (part?.type === "text") {
        return { type: "text", data: { text: part.text } };
      }
      if (part?.type === "tool-invocation") {
        return { type: "tool-invocation", data: part };
      }
    }

    if (type === "question.asked") {
      return { type: "question", data: raw };
    }

    if (type === "session.idle" || type === "message.completed") {
      return { type: "done", data: raw };
    }

    // Pass through unknown events
    return null;
  }
}

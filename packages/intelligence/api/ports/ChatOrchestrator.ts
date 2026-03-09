/**
 * ChatOrchestrator port — abstracts agent-powered chat sessions.
 *
 * This port enables swapping between different agent runtimes (OpenCode, LangGraph, etc.)
 * for the interactive chat pathway. Consuming code depends on this interface, never on
 * the OpenCode SDK or LangGraph directly.
 */

import type { AgentRuntime } from "./ScanOrchestrator.js";

/** A normalized chat stream event emitted during message processing */
export interface ChatStreamEvent {
  type: "text" | "tool-invocation" | "tool-result" | "question" | "done" | "error";
  /** Event payload — shape depends on type */
  data: unknown;
}

/** Options for sending a message */
export interface SendMessageOptions {
  /** Agent to route the message to */
  agent?: string;
  /** Model override (provider + model ID) */
  model?: { providerID: string; modelID: string };
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

export interface ChatOrchestrator {
  /** Identifies which runtime this orchestrator uses */
  readonly runtime: AgentRuntime;

  /** Create a new chat session, returns session ID */
  createSession(agentName?: string, title?: string): Promise<string>;

  /**
   * Send a message and receive streaming events via callback.
   * Resolves when the agent has finished responding.
   */
  sendMessage(
    sessionId: string,
    text: string,
    onEvent: (event: ChatStreamEvent) => void,
    options?: SendMessageOptions,
  ): Promise<void>;

  /** Reply to a question tool invocation */
  replyToQuestion(requestId: string, answers: string[][]): Promise<void>;

  /** Reject a question tool invocation */
  rejectQuestion(requestId: string): Promise<void>;

  /** Clean up a session and release resources */
  destroySession(sessionId: string): Promise<void>;
}

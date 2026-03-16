// ── Chat message ────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  streaming?: boolean;
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
  /** defaults to true — allow typing a custom answer */
  custom?: boolean;
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

export interface PendingQuestion {
  requestId: string;
  sessionID: string;
  questions: QuestionInfo[];
  answered: boolean;
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

// ── Model configuration ─────────────────────────────────────────────────────

export interface ChatModel {
  providerID: string;
  modelID: string;
}

// ── Accent colors ───────────────────────────────────────────────────────────

export type AccentColor = "purple" | "blue" | "green" | "rose";

// ── useOpenCodeChat options & return types ──────────────────────────────────

export interface UseOpenCodeChatOptions {
  /** The named OpenCode agent to dispatch messages to */
  agentName: string;
  /** Provider and model to use for the session */
  model: ChatModel;
  /**
   * Called before every message is sent to build the context preamble that
   * is prepended to the user's prompt text. The function should return a
   * string (or empty string) — it captures the latest React state via closure.
   * If omitted, no preamble is injected.
   */
  buildContextPreamble?: () => string;
  /**
   * Base URL for the OpenCode proxy (default: "/opencode").
   * Override to point at a custom deployment.
   */
  opencodeUrl?: string;
  /**
   * When this value changes the chat session is torn down and a new one
   * is initialised (same behaviour as a useEffect dependency). Pass
   * `undefined` for a session that is stable for the lifetime of the
   * component.
   */
  reinitTrigger?: unknown;
  /** Optional title for the created OpenCode session */
  sessionTitle?: string;
}

export interface UseOpenCodeChatReturn {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  sending: boolean;
  connected: boolean | null;
  error: string | null;
  pendingQuestion: PendingQuestion | null;
  selectedOptions: Map<number, Set<string>>;
  customInputs: Map<number, string>;
  submittingQuestion: boolean;
  handleSend: () => Promise<void>;
  handleKeyDown: (e: {
    key: string;
    shiftKey: boolean;
    preventDefault: () => void;
  }) => void;
  toggleOption: (questionIdx: number, label: string, multiple: boolean) => void;
  setCustomInput: (questionIdx: number, value: string) => void;
  handleQuestionSubmit: () => Promise<void>;
  handleQuestionSkip: () => Promise<void>;
  retryConnection: () => void;
  messagesEndRef: { current: HTMLDivElement | null };
  inputRef: { current: HTMLTextAreaElement | null };
}

// ── <OpenCodeChat> component props ──────────────────────────────────────────

export interface OpenCodeChatProps {
  /** The named OpenCode agent to dispatch messages to */
  agentName: string;
  /** Provider and model to use for the session */
  model: ChatModel;
  /** Accent colour applied throughout the chat UI (default: "blue") */
  accentColor?: AccentColor;
  /** Title shown in the empty-state header */
  title?: string;
  /** Subtitle shown in the empty-state body */
  subtitle?: string;
  /** Prompt chips shown in the empty state */
  suggestions?: string[];
  /** Placeholder for the text input when idle */
  inputPlaceholder?: string;
  /**
   * Called before every message is sent to build the context preamble
   * prepended to the user's prompt text.
   */
  buildContextPreamble?: () => string;
  /**
   * Base URL for the OpenCode proxy (default: "/opencode").
   */
  opencodeUrl?: string;
  /**
   * When this value changes the chat session is reset.
   */
  reinitTrigger?: unknown;
  /** Optional title for the created OpenCode session */
  sessionTitle?: string;
  /** Additional CSS class applied to the root container */
  className?: string;
}

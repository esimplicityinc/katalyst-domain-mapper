// ── Public API of @katalyst/chat ────────────────────────────────────────────

// Types
export type {
  ChatMessage,
  ChatModel,
  AccentColor,
  QuestionOption,
  QuestionInfo,
  QuestionRequest,
  PendingQuestion,
  SSEEvent,
  UseOpenCodeChatOptions,
  UseOpenCodeChatReturn,
  OpenCodeChatProps,
} from "./types.ts";

// Hook
export { useOpenCodeChat } from "./hooks/useOpenCodeChat.ts";

// Styled component
export { OpenCodeChat } from "./components/OpenCodeChat.tsx";

// Low-level API helpers (for advanced use)
export {
  createClient,
  isOpencodeHealthy,
  createChatSession,
  sendPromptAsync,
  replyToQuestion,
  rejectQuestion,
  subscribeToEvents,
} from "./api/opencode-client.ts";

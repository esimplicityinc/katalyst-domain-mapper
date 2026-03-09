/**
 * LangGraph chat state definition.
 *
 * Uses the built-in MessagesAnnotation from LangGraph for
 * message accumulation, plus custom fields for session management.
 */
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

/**
 * Chat graph state.
 *
 * Extends MessagesAnnotation (which provides `messages` with a built-in
 * reducer that appends new messages) with chat-specific fields.
 */
export const ChatStateAnnotation = Annotation.Root({
  /** Accumulated messages — uses LangGraph's built-in message reducer */
  ...MessagesAnnotation.spec,

  /** Agent name for routing */
  agentName: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "default",
  }),

  /** System prompt for the agent */
  systemPrompt: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "You are a helpful assistant.",
  }),
});

export type ChatState = typeof ChatStateAnnotation.State;

/**
 * LangGraph chat orchestrator — runs interactive chat sessions via LangGraph.
 *
 * Instead of proxying to OpenCode's HTTP API, this adapter builds a
 * LangGraph ReAct-style agent graph and manages sessions in-memory.
 */
import type {
  ChatOrchestrator,
  ChatStreamEvent,
  SendMessageOptions,
} from "../../ports/ChatOrchestrator.js";
import type { Logger } from "../../ports/Logger.js";
import type { LlmProvider } from "../../config/env.js";
import { HumanMessage } from "@langchain/core/messages";
import { buildChatGraph } from "./graphs/chatGraph.js";

export interface LangGraphChatConfig {
  provider: LlmProvider;
  apiKey: string;
  modelId?: string;
}

/**
 * In-memory session state for LangGraph chat.
 */
interface ChatSession {
  id: string;
  agentName: string;
  /** Compiled graph instance */
  graph: ReturnType<typeof buildChatGraph> extends Promise<infer T> ? T : ReturnType<typeof buildChatGraph>;
  /** Accumulated messages for context */
  messageHistory: Array<{ role: string; content: string }>;
  createdAt: Date;
}

export class LangGraphChatOrchestrator implements ChatOrchestrator {
  readonly runtime = "langgraph" as const;
  private sessions = new Map<string, ChatSession>();

  constructor(
    private config: LangGraphChatConfig,
    private logger: Logger,
  ) {}

  async createSession(agentName?: string, title?: string): Promise<string> {
    const sessionId = `lg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const model = await this.createModel();
    const graph = buildChatGraph(model);

    const session: ChatSession = {
      id: sessionId,
      agentName: agentName ?? "default",
      graph,
      messageHistory: [],
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);

    this.logger.debug("LangGraph chat session created", {
      sessionId,
      agentName,
      title,
    });

    return sessionId;
  }

  async sendMessage(
    sessionId: string,
    text: string,
    onEvent: (event: ChatStreamEvent) => void,
    options?: SendMessageOptions,
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      onEvent({
        type: "error",
        data: { message: `Session not found: ${sessionId}` },
      });
      return;
    }

    try {
      // Add user message to history
      session.messageHistory.push({ role: "user", content: text });

      // Invoke the graph
      const result = await session.graph.invoke({
        messages: [new HumanMessage(text)],
        agentName: options?.agent ?? session.agentName,
        systemPrompt: this.getSystemPrompt(options?.agent ?? session.agentName),
      });

      // Extract the assistant's response
      const lastMessage = result.messages[result.messages.length - 1];
      const responseText =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : Array.isArray(lastMessage.content)
            ? lastMessage.content
                .filter(
                  (c: unknown): c is { type: "text"; text: string } =>
                    typeof c === "object" && c !== null && "type" in c && (c as Record<string, unknown>).type === "text",
                )
                .map((c: { text: string }) => c.text)
                .join("")
            : String(lastMessage.content);

      // Emit events
      onEvent({ type: "text", data: { text: responseText } });
      onEvent({ type: "done", data: {} });

      // Store in history
      session.messageHistory.push({
        role: "assistant",
        content: responseText,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error("LangGraph chat error", {
        sessionId,
        error: message,
      });
      onEvent({
        type: "error",
        data: { message },
      });
    }
  }

  async replyToQuestion(
    _requestId: string,
    _answers: string[][],
  ): Promise<void> {
    // LangGraph doesn't use the question tool pattern.
    // This is a no-op for now; future versions could implement
    // human-in-the-loop via LangGraph's interrupt_before mechanism.
    this.logger.warn(
      "replyToQuestion called on LangGraph orchestrator (not supported)",
    );
  }

  async rejectQuestion(_requestId: string): Promise<void> {
    this.logger.warn(
      "rejectQuestion called on LangGraph orchestrator (not supported)",
    );
  }

  async destroySession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    this.logger.debug("LangGraph chat session destroyed", { sessionId });
  }

  /**
   * Get a system prompt for the given agent name.
   * Can be extended to load prompts from the .opencode/agents/ directory.
   */
  private getSystemPrompt(agentName: string): string {
    // Default system prompts for known agents
    const prompts: Record<string, string> = {
      "foe-assessment-coach":
        "You are the FOE Assessment Coach. Help teams understand their FOE scan results, interpret dimension scores, analyze cognitive triangle diagnosis, and provide actionable improvement recommendations.",
      default:
        "You are a helpful assistant with expertise in Flow Optimized Engineering (FOE). Help users with questions about their repository's FOE assessment, architecture, testing, CI/CD, and documentation practices.",
    };

    return prompts[agentName] ?? prompts.default;
  }

  /**
   * Create the appropriate LLM model. Uses dynamic imports.
   */
  private async createModel() {
    switch (this.config.provider) {
      case "anthropic": {
        const { ChatAnthropic } = await import("@langchain/anthropic");
        return new ChatAnthropic({
          model: this.config.modelId ?? "claude-sonnet-4-20250514",
          anthropicApiKey: this.config.apiKey,
          temperature: 0.3,
          maxTokens: 4096,
        });
      }

      case "bedrock": {
        const { ChatAnthropic } = await import("@langchain/anthropic");
        return new ChatAnthropic({
          model: this.config.modelId ?? "claude-sonnet-4-20250514",
          anthropicApiKey: this.config.apiKey,
          temperature: 0.3,
          maxTokens: 4096,
        });
      }

      case "openrouter": {
        const { ChatOpenAI } = await import("@langchain/openai");
        return new ChatOpenAI({
          model: this.config.modelId ?? "anthropic/claude-sonnet-4-20250514",
          openAIApiKey: this.config.apiKey,
          temperature: 0.3,
          maxTokens: 4096,
          configuration: {
            baseURL: "https://openrouter.ai/api/v1",
          },
        });
      }

      default: {
        const _exhaustive: never = this.config.provider;
        throw new Error(`Unsupported LLM provider: ${_exhaustive}`);
      }
    }
  }
}

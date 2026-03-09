/**
 * Chat StateGraph definition.
 *
 * A simple ReAct-style agent graph:
 *   START → agent (LLM call) → [tools | END]
 *                                  ↓
 *                               agent ← (loop)
 *
 * Tools can be extended with custom capabilities (file reading,
 * web search, etc.) by passing them to buildChatGraph().
 */
import { StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { isAIMessage } from "@langchain/core/messages";
import { ChatStateAnnotation } from "./chatState.js";

/**
 * Build the compiled chat graph.
 *
 * @param model - The LLM model (should have tools bound via .bindTools())
 * @param tools - Tools available to the agent
 */
export function buildChatGraph(
  model: BaseChatModel,
  tools: StructuredToolInterface[] = [],
) {
  // Bind tools to the model if any are provided
  const boundModel = tools.length > 0 ? model.bindTools(tools) : model;

  const callModel = async (state: typeof ChatStateAnnotation.State) => {
    const { messages, systemPrompt } = state;

    const response = await boundModel.invoke([
      { role: "system", content: systemPrompt },
      ...messages,
    ]);

    return { messages: [response] };
  };

  const shouldContinue = (state: typeof ChatStateAnnotation.State) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (isAIMessage(lastMessage) && lastMessage.tool_calls?.length) {
      return "tools";
    }
    return END;
  };

  const builder = new StateGraph(ChatStateAnnotation)
    .addNode("agent", callModel)
    .addEdge(START, "agent");

  if (tools.length > 0) {
    builder
      .addNode("tools", new ToolNode(tools))
      .addConditionalEdges("agent", shouldContinue, {
        tools: "tools",
        [END]: END,
      })
      .addEdge("tools", "agent");
  } else {
    builder.addEdge("agent", END);
  }

  return builder.compile();
}

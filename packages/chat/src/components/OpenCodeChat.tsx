import {
  Send,
  Loader2,
  Bot,
  User,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  X,
} from "lucide-react";
import Markdown from "react-markdown";
import { useOpenCodeChat } from "../hooks/useOpenCodeChat.ts";
import type { AccentColor, OpenCodeChatProps } from "../types.ts";

// ── Per-colour Tailwind class maps ──────────────────────────────────────────
// These must be complete strings (not dynamically constructed) so Tailwind's
// JIT scanner can detect them.

const COLOR = {
  purple: {
    spinner: "text-purple-500",
    botAvatar: "bg-purple-100 dark:bg-purple-900/30",
    botIcon: "text-purple-600 dark:text-purple-400",
    userBubble: "bg-purple-600 text-white",
    proseCode: "prose-code:text-purple-600 dark:prose-code:text-purple-400",
    streaming: "text-purple-400",
    questionBorder: "border-purple-300 dark:border-purple-700",
    questionHeader: "text-purple-600 dark:text-purple-400",
    optionSelected:
      "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100",
    optionHover: "hover:border-purple-300 dark:hover:border-purple-600",
    checkboxSelected: "bg-purple-500 border-purple-500",
    customFocus: "focus:ring-purple-500 focus:border-purple-500",
    submitBtn: "bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400",
    retryBtn: "bg-purple-600 hover:bg-purple-700",
    sendBtn: "bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400",
    inputFocus: "focus:ring-purple-500",
    suggestion:
      "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30",
  },
  blue: {
    spinner: "text-blue-500",
    botAvatar: "bg-blue-100 dark:bg-blue-900/30",
    botIcon: "text-blue-600 dark:text-blue-400",
    userBubble: "bg-blue-600 text-white",
    proseCode: "prose-code:text-blue-600 dark:prose-code:text-blue-400",
    streaming: "text-blue-400",
    questionBorder: "border-blue-300 dark:border-blue-700",
    questionHeader: "text-blue-600 dark:text-blue-400",
    optionSelected:
      "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100",
    optionHover: "hover:border-blue-300 dark:hover:border-blue-600",
    checkboxSelected: "bg-blue-500 border-blue-500",
    customFocus: "focus:ring-blue-500 focus:border-blue-500",
    submitBtn: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400",
    retryBtn: "bg-blue-600 hover:bg-blue-700",
    sendBtn: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400",
    inputFocus: "focus:ring-blue-500",
    suggestion:
      "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30",
  },
  green: {
    spinner: "text-green-500",
    botAvatar: "bg-green-100 dark:bg-green-900/30",
    botIcon: "text-green-600 dark:text-green-400",
    userBubble: "bg-green-600 text-white",
    proseCode: "prose-code:text-green-600 dark:prose-code:text-green-400",
    streaming: "text-green-400",
    questionBorder: "border-green-300 dark:border-green-700",
    questionHeader: "text-green-600 dark:text-green-400",
    optionSelected:
      "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100",
    optionHover: "hover:border-green-300 dark:hover:border-green-600",
    checkboxSelected: "bg-green-500 border-green-500",
    customFocus: "focus:ring-green-500 focus:border-green-500",
    submitBtn: "bg-green-600 hover:bg-green-700 disabled:bg-green-400",
    retryBtn: "bg-green-600 hover:bg-green-700",
    sendBtn: "bg-green-600 hover:bg-green-700 disabled:bg-green-400",
    inputFocus: "focus:ring-green-500",
    suggestion:
      "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30",
  },
  rose: {
    spinner: "text-rose-500",
    botAvatar: "bg-rose-100 dark:bg-rose-900/30",
    botIcon: "text-rose-600 dark:text-rose-400",
    userBubble: "bg-rose-600 text-white",
    proseCode: "prose-code:text-rose-600 dark:prose-code:text-rose-400",
    streaming: "text-rose-400",
    questionBorder: "border-rose-300 dark:border-rose-700",
    questionHeader: "text-rose-600 dark:text-rose-400",
    optionSelected:
      "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100",
    optionHover: "hover:border-rose-300 dark:hover:border-rose-600",
    checkboxSelected: "bg-rose-500 border-rose-500",
    customFocus: "focus:ring-rose-500 focus:border-rose-500",
    submitBtn: "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400",
    retryBtn: "bg-rose-600 hover:bg-rose-700",
    sendBtn: "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400",
    inputFocus: "focus:ring-rose-500",
    suggestion:
      "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/30",
  },
} satisfies Record<AccentColor, Record<string, string>>;

// ── Component ───────────────────────────────────────────────────────────────

export function OpenCodeChat({
  agentName,
  model,
  accentColor = "blue",
  title = "AI Chat",
  subtitle = "Start a conversation with the AI agent.",
  suggestions = [],
  inputPlaceholder,
  buildContextPreamble,
  opencodeUrl,
  reinitTrigger,
  sessionTitle,
  className = "",
}: OpenCodeChatProps) {
  const c = COLOR[accentColor];

  const {
    messages,
    input,
    setInput,
    sending,
    connected,
    error,
    pendingQuestion,
    selectedOptions,
    customInputs,
    submittingQuestion,
    handleSend,
    handleKeyDown,
    toggleOption,
    setCustomInput,
    handleQuestionSubmit,
    handleQuestionSkip,
    retryConnection,
    messagesEndRef,
    inputRef,
  } = useOpenCodeChat({
    agentName,
    model,
    buildContextPreamble,
    opencodeUrl,
    reinitTrigger,
    sessionTitle,
  });

  // ── Not connected ──────────────────────────────────────────────────────────

  if (connected === false) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full p-8 text-center ${className}`}
      >
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          AI Agent Not Available
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-4">
          The OpenCode server is not reachable. Make sure it&apos;s running with{" "}
          <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            opencode serve
          </code>{" "}
          or via Docker Compose.
        </p>
        <button
          onClick={retryConnection}
          className={`flex items-center gap-2 px-4 py-2 ${c.retryBtn} text-white text-sm font-medium rounded-lg transition-colors`}
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (connected === null) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <Loader2 className={`w-6 h-6 ${c.spinner} animate-spin`} />
      </div>
    );
  }

  // ── Chat UI ────────────────────────────────────────────────────────────────

  const effectivePlaceholder =
    inputPlaceholder ??
    (pendingQuestion
      ? "Answer the question above, or type here..."
      : "Ask a question...");

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Empty state */}
        {messages.length === 0 && !sending && (
          <div className="text-center py-12">
            <Bot
              className={`w-12 h-12 ${c.botIcon.replace("text-", "text-").replace("600", "400").replace("dark:text-", "dark:text-").replace("400", "400")} mx-auto mb-4`}
            />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {subtitle}
              </p>
            )}
            {suggestions.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      inputRef.current?.focus();
                    }}
                    className={`px-3 py-1.5 text-xs ${c.suggestion} border rounded-full transition-colors`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message list */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div
                className={`w-7 h-7 flex-shrink-0 flex items-center justify-center ${c.botAvatar} rounded-full`}
              >
                <Bot className={`w-4 h-4 ${c.botIcon}`} />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-lg px-4 py-3 text-sm ${
                msg.role === "user"
                  ? c.userBubble
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              {msg.role === "assistant" ? (
                <div
                  className={`prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:my-2 ${c.proseCode} prose-code:before:content-none prose-code:after:content-none`}
                >
                  <Markdown>{msg.content}</Markdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              )}
              {msg.streaming && (
                <div className="mt-1 flex items-center gap-1.5">
                  <Loader2 className={`w-3 h-3 animate-spin ${c.streaming}`} />
                  <span className={`text-xs ${c.streaming}`}>Streaming...</span>
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {/* Pending question card */}
        {pendingQuestion && !pendingQuestion.answered && (
          <div className="flex gap-3">
            <div
              className={`w-7 h-7 flex-shrink-0 flex items-center justify-center ${c.botAvatar} rounded-full`}
            >
              <Bot className={`w-4 h-4 ${c.botIcon}`} />
            </div>
            <div
              className={`max-w-[85%] rounded-lg border-2 ${c.questionBorder} bg-white dark:bg-gray-800 overflow-hidden`}
            >
              {pendingQuestion.questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className={
                    qIdx > 0
                      ? "border-t border-gray-200 dark:border-gray-700"
                      : ""
                  }
                >
                  <div className="px-4 pt-3 pb-2">
                    <div
                      className={`text-xs font-semibold ${c.questionHeader} uppercase tracking-wide mb-1`}
                    >
                      {q.header}
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 mb-3">
                      {q.question}
                    </div>
                    <div className="space-y-1.5">
                      {q.options.map((opt) => {
                        const isSelected =
                          selectedOptions.get(qIdx)?.has(opt.label) ?? false;
                        return (
                          <button
                            key={opt.label}
                            onClick={() =>
                              toggleOption(qIdx, opt.label, q.multiple ?? false)
                            }
                            disabled={submittingQuestion}
                            className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                              isSelected
                                ? c.optionSelected
                                : `border-gray-200 dark:border-gray-600 ${c.optionHover} text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? c.checkboxSelected
                                    : "border-gray-300 dark:border-gray-500"
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{opt.label}</div>
                                {opt.description && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {opt.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {/* Custom free-text input (enabled by default unless custom === false) */}
                    {q.custom !== false && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={customInputs.get(qIdx) ?? ""}
                          onChange={(e) => setCustomInput(qIdx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              void handleQuestionSubmit();
                            }
                          }}
                          placeholder="Or type your own answer..."
                          disabled={submittingQuestion}
                          className={`w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 ${c.customFocus}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => void handleQuestionSubmit()}
                  disabled={submittingQuestion}
                  className={`flex items-center gap-1.5 px-3 py-1.5 ${c.submitBtn} text-white text-sm font-medium rounded-md transition-colors`}
                >
                  {submittingQuestion ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Submit
                </button>
                <button
                  onClick={() => void handleQuestionSkip()}
                  disabled={submittingQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {sending && !messages.some((m) => m.streaming) && !pendingQuestion && (
          <div className="flex gap-3">
            <div
              className={`w-7 h-7 flex-shrink-0 flex items-center justify-center ${c.botAvatar} rounded-full`}
            >
              <Bot className={`w-4 h-4 ${c.botIcon}`} />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={effectivePlaceholder}
            rows={1}
            disabled={!!pendingQuestion}
            className={`flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 ${c.inputFocus} focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{ minHeight: "42px", maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || sending || !!pendingQuestion}
            className={`flex items-center justify-center w-10 h-10 ${c.sendBtn} text-white rounded-lg transition-colors flex-shrink-0`}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
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
import {
  sendPromptAsync,
  isOpencodeHealthy,
  subscribeToEvents,
  replyToQuestion,
  rejectQuestion,
  opencode,
} from "../../api/opencode-client";
import type {
  SSEEvent,
  QuestionRequest,
  QuestionInfo,
} from "../../api/opencode-client";
import type { FOEReport } from "../../types/report";
import type { Project } from "../../types/project";

interface FOEChatProps {
  report: FOEReport;
  project: Project;
  onReportUpdated?: () => void;
}

// A chat message can be text or a question card
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

// An active question from the question tool, rendered inline
interface PendingQuestion {
  requestId: string;
  sessionID: string;
  questions: QuestionInfo[];
  answered: boolean;
}

export function FOEChat({ report, project, onReportUpdated: _onReportUpdated }: FOEChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] =
    useState<PendingQuestion | null>(null);
  // Track selected options per question index: Map<questionIndex, Set<label>>
  const [selectedOptions, setSelectedOptions] = useState<
    Map<number, Set<string>>
  >(new Map());
  const [customInputs, setCustomInputs] = useState<Map<number, string>>(
    new Map(),
  );
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sseAbortRef = useRef<AbortController | null>(null);
  const streamingTextRef = useRef<Map<string, string>>(new Map());
  // Track which message IDs are assistant messages (from message.updated events)
  const assistantMsgIdsRef = useRef<Set<string>>(new Set());
  const isFirstMessageRef = useRef(true);

  // Check OpenCode health and create session on mount
  useEffect(() => {
    initChat();
    return () => {
      sseAbortRef.current?.abort();
    };
  }, [report.generated]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingQuestion]);

  const buildContextPreamble = () => {
    const dims = report.dimensions;
    const triangle = report.triangleDiagnosis;

    return `[Context: You are coaching a team on their Flow Optimized Engineering (FOE) assessment.

PROJECT: ${project.name}
REPOSITORY: ${report.repository.name} (${report.repository.path})
TECH_STACK: ${report.repository.techStack.join(", ")}
MONOREPO: ${report.repository.monorepo ? "Yes" : "No"}

SCAN_DATE: ${report.generated}
OVERALL_SCORE: ${report.overallScore}/100
MATURITY_LEVEL: ${report.maturityLevel}

DIMENSION_SCORES:
- Understanding: ${dims.understanding.score}/${dims.understanding.maxScore} (${((dims.understanding.score / dims.understanding.maxScore) * 100).toFixed(0)}%)
- Feedback: ${dims.feedback.score}/${dims.feedback.maxScore} (${((dims.feedback.score / dims.feedback.maxScore) * 100).toFixed(0)}%)
- Confidence: ${dims.confidence.score}/${dims.confidence.maxScore} (${((dims.confidence.score / dims.confidence.maxScore) * 100).toFixed(0)}%)

COGNITIVE_TRIANGLE_DIAGNOSIS:
- Cycle Health: ${triangle.cycleHealth}
- Weakest Dimension: ${triangle.weakestDimension} (${triangle.weakestScore})
- Pattern: ${triangle.pattern}
- Intervention: ${triangle.intervention}
${triangle.belowMinimum.length > 0 ? `- Below Minimum Thresholds: ${triangle.belowMinimum.join(", ")}` : ""}

TOP_3_STRENGTHS:
${report.topStrengths.map((s) => `- ${s.area} (${s.score}): ${s.reason}`).join("\n")}

TOP_3_GAPS:
${report.topGaps.map((g, i) => `${i + 1}. ${g.area} (Impact: high): ${g.reason}`).join("\n")}

IMPORTANT: Use the FOE Field Guide methods to provide specific, actionable recommendations. Reference specific methods, observations, and maturity levels when relevant.]

`;
  };

  const initChat = async () => {
    setError(null);
    setPendingQuestion(null);
    setSelectedOptions(new Map());
    setCustomInputs(new Map());
    sseAbortRef.current?.abort();
    isFirstMessageRef.current = true;
    assistantMsgIdsRef.current.clear();

    try {
      const healthy = await isOpencodeHealthy();
      setConnected(healthy);
      if (!healthy) return;
    } catch {
      setConnected(false);
      return;
    }

    try {
      const session = await createFOESession(
        `FOE Assessment: ${project.name}`,
      );
      if (session) {
        setSessionId(session.id);
      }
    } catch (err) {
      console.error("Failed to create session:", err);
      setError("Failed to create chat session. Try again.");
    }
  };

  const handleSSEEvent = useCallback(
    (event: SSEEvent, targetSessionId: string) => {
      // ── Track assistant message IDs from message.updated events ─────────
      if (event.type === "message.updated") {
        const info = (
          event.properties as {
            info?: { id: string; sessionID: string; role: string };
          }
        ).info;
        if (info?.sessionID === targetSessionId && info.role === "assistant") {
          assistantMsgIdsRef.current.add(info.id);
        }
        return;
      }

      // ── Text streaming ─────────────────────────────────────────────────
      if (event.type === "message.part.updated") {
        const props = event.properties as Record<string, unknown>;
        const part = props?.part as {
          id: string;
          sessionID: string;
          messageID: string;
          type: string;
          text?: unknown;
        } | undefined;
        const delta = props?.delta;

        if (!part || part.sessionID !== targetSessionId || part.type !== "text") return;

        // Only render text for assistant messages (skip echoed user messages)
        if (!assistantMsgIdsRef.current.has(part.messageID)) return;

        const msgId = part.messageID;

        // Guard: ensure delta and text are actually strings before using them
        if (typeof delta === "string" && delta) {
          const current = streamingTextRef.current.get(msgId) ?? "";
          streamingTextRef.current.set(msgId, current + delta);
        } else if (typeof part.text === "string" && part.text) {
          streamingTextRef.current.set(msgId, part.text);
        }

        const text = streamingTextRef.current.get(msgId) ?? "";
        if (!text.trim()) return;

        setMessages((prev) => {
          const existing = prev.find((m) => m.id === msgId);
          if (existing) {
            return prev.map((m) =>
              m.id === msgId ? { ...m, content: text } : m,
            );
          }
          return [
            ...prev,
            {
              id: msgId,
              role: "assistant" as const,
              content: text,
              timestamp: new Date(),
              streaming: true,
            },
          ];
        });
      }

      // ── Question tool asked ────────────────────────────────────────────
      if (event.type === "question.asked") {
        const req = event.properties as QuestionRequest;
        if (req.sessionID !== targetSessionId) return;

        setPendingQuestion({
          requestId: req.id,
          sessionID: req.sessionID,
          questions: req.questions,
          answered: false,
        });
        setSelectedOptions(new Map());
        setCustomInputs(new Map());
      }

      // ── Session idle ───────────────────────────────────────────────────
      if (event.type === "session.idle") {
        const { sessionID } = event.properties as { sessionID: string };
        if (sessionID !== targetSessionId) return;

        setMessages((prev) =>
          prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
        );
        setSending(false);
        streamingTextRef.current.clear();
        // Don't abort SSE here — keep it open if there's a question pending
        // The question handler will need the SSE to stream the follow-up response
        if (!pendingQuestion || pendingQuestion.answered) {
          sseAbortRef.current?.abort();
        }
        inputRef.current?.focus();
      }

      // ── Session error ──────────────────────────────────────────────────
      if (event.type === "session.error") {
        const props = event.properties as { sessionID: string; error: unknown };
        if (props.sessionID !== targetSessionId) return;
        // Error can be a string or an object like {name, data: {message, statusCode}}
        let errMsg = "An error occurred";
        if (typeof props.error === "string") {
          errMsg = props.error;
        } else if (props.error && typeof props.error === "object") {
          const errObj = props.error as Record<string, unknown>;
          const data = errObj.data as Record<string, unknown> | undefined;
          if (data?.message && typeof data.message === "string") {
            errMsg = data.message;
          } else if (errObj.name && typeof errObj.name === "string") {
            errMsg = errObj.name;
          }
        }
        setError(errMsg);
        setSending(false);
        sseAbortRef.current?.abort();
      }
    },
    [pendingQuestion],
  );

  // ── Toggle option selection ────────────────────────────────────────────
  const toggleOption = (
    questionIdx: number,
    label: string,
    multiple: boolean,
  ) => {
    setSelectedOptions((prev) => {
      const next = new Map(prev);
      const current = next.get(questionIdx) ?? new Set<string>();
      const updated = new Set(current);

      if (updated.has(label)) {
        updated.delete(label);
      } else {
        if (!multiple) updated.clear(); // single-select: clear others
        updated.add(label);
      }
      next.set(questionIdx, updated);
      return next;
    });
  };

  // ── Submit question answer ─────────────────────────────────────────────
  const handleQuestionSubmit = async () => {
    if (!pendingQuestion) return;

    setSubmittingQuestion(true);
    setError(null);

    try {
      // Build answers array: one array of selected labels per question
      const answers: string[][] = pendingQuestion.questions.map((_, idx) => {
        const selected = selectedOptions.get(idx);
        const custom = customInputs.get(idx)?.trim();
        const labels: string[] = [];
        if (selected) labels.push(...Array.from(selected));
        if (custom) labels.push(custom);
        return labels;
      });

      // Validate: each question should have at least one answer
      const hasEmpty = answers.some((a) => a.length === 0);
      if (hasEmpty) {
        setError("Please select or type an answer for each question.");
        setSubmittingQuestion(false);
        return;
      }

      await replyToQuestion(pendingQuestion.requestId, answers);

      // Show what was selected as a user message
      const answerText = pendingQuestion.questions
        .map((q, i) => `**${q.header}**: ${answers[i].join(", ")}`)
        .join("\n");
      setMessages((prev) => [
        ...prev,
        {
          id: `answer-${Date.now()}`,
          role: "user",
          content: answerText,
          timestamp: new Date(),
        },
      ]);

      setPendingQuestion((prev) => (prev ? { ...prev, answered: true } : null));
      setSending(true); // The LLM will continue responding after the answer

      // After replying, the LLM continues — SSE should still be open.
      // If it was closed (e.g. session.idle fired before we replied), re-open it.
      if (!sseAbortRef.current || sseAbortRef.current.signal.aborted) {
        const abortController = new AbortController();
        sseAbortRef.current = abortController;
        const sid = pendingQuestion.sessionID;
        subscribeToEvents(
          (event) => handleSSEEvent(event, sid),
          abortController.signal,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setSubmittingQuestion(false);
      setPendingQuestion(null);
      setSelectedOptions(new Map());
      setCustomInputs(new Map());
    }
  };

  // ── Skip/reject the question ───────────────────────────────────────────
  const handleQuestionSkip = async () => {
    if (!pendingQuestion) return;

    try {
      await rejectQuestion(pendingQuestion.requestId);
    } catch {
      // Ignore — the agent will continue without the answer
    }

    setPendingQuestion(null);
    setSelectedOptions(new Map());
    setCustomInputs(new Map());
  };

  // ── Send a text message ────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !sessionId || sending) return;

    setInput("");
    setError(null);
    setSending(true);
    streamingTextRef.current.clear();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      sseAbortRef.current?.abort();
      const abortController = new AbortController();
      sseAbortRef.current = abortController;

      const sid = sessionId;
      subscribeToEvents(
        (event) => handleSSEEvent(event, sid),
        abortController.signal,
      );

      let promptText = text;
      if (isFirstMessageRef.current) {
        promptText = buildContextPreamble() + text;
        isFirstMessageRef.current = false;
      }

      await sendPromptAsync(sessionId, promptText, "foe-assessment-coach", {
        providerID: "amazon-bedrock",
        modelID: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
      });

      // Safety timeout
      setTimeout(
        () => {
          if (
            sseAbortRef.current === abortController &&
            !abortController.signal.aborted
          ) {
            abortController.abort();
            setSending(false);
          }
        },
        5 * 60 * 1000,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setSending(false);
      sseAbortRef.current?.abort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Not connected state ────────────────────────────────────────────────
  if (connected === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          AI Coach Not Available
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-4">
          The OpenCode server is not reachable. Make sure it&apos;s running with{" "}
          <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            opencode serve
          </code>{" "}
          or via Docker Compose.
        </p>
        <button
          onClick={initChat}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────
  if (connected === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !sending && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              FOE Assessment Coach
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Ask questions about your FOE assessment results, dimension scores,
              cognitive triangle diagnosis, or get guidance on improvement priorities.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Why is my Feedback score low?",
                "What should I improve first?",
                "Explain my cognitive triangle diagnosis",
                "How can I improve test confidence?",
                "What's blocking me from reaching Practicing maturity?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-lg px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:my-2 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:before:content-none prose-code:after:content-none">
                  <Markdown>{msg.content}</Markdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              )}
              {msg.streaming && (
                <div className="mt-1 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                  <span className="text-xs text-blue-400">Streaming...</span>
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
            <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="max-w-[85%] rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 overflow-hidden">
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
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
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
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                                : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? "bg-blue-500 border-blue-500"
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
                    {/* Custom input (enabled by default unless custom === false) */}
                    {q.custom !== false && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={customInputs.get(qIdx) ?? ""}
                          onChange={(e) => {
                            setCustomInputs((prev) => {
                              const next = new Map(prev);
                              next.set(qIdx, e.target.value);
                              return next;
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleQuestionSubmit();
                            }
                          }}
                          placeholder="Or type your own answer..."
                          disabled={submittingQuestion}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleQuestionSubmit}
                  disabled={submittingQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors"
                >
                  {submittingQuestion ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Submit
                </button>
                <button
                  onClick={handleQuestionSkip}
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

        {/* Thinking indicator (only when no streaming message and no question) */}
        {sending && !messages.some((m) => m.streaming) && !pendingQuestion && (
          <div className="flex gap-3">
            <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}

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
            placeholder={
              pendingQuestion
                ? "Answer the question above, or type here..."
                : "Ask about your FOE assessment..."
            }
            rows={1}
            disabled={!!pendingQuestion}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: "42px", maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || !!pendingQuestion}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex-shrink-0"
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

// ── Helper: create a FOE assessment coaching session ───────────────────

async function createFOESession(title?: string) {
  const res = await opencode.session.create({
    body: { title: title ?? "FOE Assessment Coaching Session" },
  });
  return res.data;
}

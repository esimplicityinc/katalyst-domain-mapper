import { useState, useRef, useEffect, useCallback } from "react";
import {
  isOpencodeHealthy,
  createChatSession,
  sendPromptAsync,
  subscribeToEvents,
  replyToQuestion,
  rejectQuestion,
} from "../api/opencode-client.ts";
import type {
  ChatMessage,
  PendingQuestion,
  SSEEvent,
  QuestionRequest,
  UseOpenCodeChatOptions,
  UseOpenCodeChatReturn,
} from "../types.ts";

const DEFAULT_OPENCODE_URL = "/opencode";
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function useOpenCodeChat(
  options: UseOpenCodeChatOptions,
): UseOpenCodeChatReturn {
  const {
    agentName,
    model,
    buildContextPreamble,
    opencodeUrl = DEFAULT_OPENCODE_URL,
    reinitTrigger,
    sessionTitle,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] =
    useState<PendingQuestion | null>(null);
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
  const assistantMsgIdsRef = useRef<Set<string>>(new Set());
  const isFirstMessageRef = useRef(true);

  // ── Initialise (or re-initialise) the chat session ────────────────────────

  const initChat = useCallback(async () => {
    setError(null);
    setPendingQuestion(null);
    setSelectedOptions(new Map());
    setCustomInputs(new Map());
    setMessages([]);
    sseAbortRef.current?.abort();
    isFirstMessageRef.current = true;
    assistantMsgIdsRef.current.clear();
    streamingTextRef.current.clear();

    try {
      const healthy = await isOpencodeHealthy(opencodeUrl);
      setConnected(healthy);
      if (!healthy) return;
    } catch {
      setConnected(false);
      return;
    }

    try {
      const session = await createChatSession(opencodeUrl, sessionTitle);
      if (session) {
        setSessionId(session.id);
      }
    } catch (err) {
      console.error("Failed to create session:", err);
      setError("Failed to create chat session. Try again.");
    }
  }, [opencodeUrl, sessionTitle]);

  // Trigger re-init when reinitTrigger changes (or on first mount).
  // initChat is stable (wrapped in useCallback) so it's safe to omit from the
  // dep array — we only want this to fire when reinitTrigger changes.
  useEffect(() => {
    void initChat();
    return () => {
      sseAbortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reinitTrigger]);

  // Auto-scroll to bottom when messages or pending question change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingQuestion]);

  // ── SSE event handler ─────────────────────────────────────────────────────

  const handleSSEEvent = useCallback(
    (event: SSEEvent, targetSessionId: string) => {
      // Track assistant message IDs from message.updated events
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

      // Text streaming
      if (event.type === "message.part.updated") {
        const props = event.properties as Record<string, unknown>;
        const part = props?.part as
          | {
              id: string;
              sessionID: string;
              messageID: string;
              type: string;
              text?: unknown;
            }
          | undefined;
        const delta = props?.delta;

        if (!part || part.sessionID !== targetSessionId || part.type !== "text")
          return;
        if (!assistantMsgIdsRef.current.has(part.messageID)) return;

        const msgId = part.messageID;

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
            return prev.map((m: ChatMessage) =>
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

      // Question tool asked
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

      // Session idle
      if (event.type === "session.idle") {
        const { sessionID } = event.properties as { sessionID: string };
        if (sessionID !== targetSessionId) return;

        setMessages((prev) =>
          prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
        );
        setSending(false);
        streamingTextRef.current.clear();
        // Keep SSE open if there is an unanswered question pending
        if (!pendingQuestion || pendingQuestion.answered) {
          sseAbortRef.current?.abort();
        }
        inputRef.current?.focus();
      }

      // Session error
      if (event.type === "session.error") {
        const props = event.properties as {
          sessionID: string;
          error: unknown;
        };
        if (props.sessionID !== targetSessionId) return;

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

  // ── Toggle option selection ───────────────────────────────────────────────

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
        if (!multiple) updated.clear();
        updated.add(label);
      }
      next.set(questionIdx, updated);
      return next;
    });
  };

  // ── Update a custom text input ────────────────────────────────────────────

  const setCustomInput = (questionIdx: number, value: string) => {
    setCustomInputs((prev) => {
      const next = new Map(prev);
      next.set(questionIdx, value);
      return next;
    });
  };

  // ── Submit question answer ────────────────────────────────────────────────

  const handleQuestionSubmit = async () => {
    if (!pendingQuestion) return;

    setSubmittingQuestion(true);
    setError(null);

    try {
      const answers: string[][] = pendingQuestion.questions.map((_, idx) => {
        const selected = selectedOptions.get(idx);
        const custom = customInputs.get(idx)?.trim();
        const labels: string[] = [];
        if (selected) labels.push(...Array.from(selected));
        if (custom) labels.push(custom);
        return labels;
      });

      const hasEmpty = answers.some((a) => a.length === 0);
      if (hasEmpty) {
        setError("Please select or type an answer for each question.");
        setSubmittingQuestion(false);
        return;
      }

      await replyToQuestion(opencodeUrl, pendingQuestion.requestId, answers);

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
      setSending(true);

      // Re-open SSE if it was closed before we could reply
      if (!sseAbortRef.current || sseAbortRef.current.signal.aborted) {
        const abortController = new AbortController();
        sseAbortRef.current = abortController;
        const sid = pendingQuestion.sessionID;
        subscribeToEvents(
          opencodeUrl,
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

  // ── Skip / reject the question ────────────────────────────────────────────

  const handleQuestionSkip = async () => {
    if (!pendingQuestion) return;
    try {
      await rejectQuestion(opencodeUrl, pendingQuestion.requestId);
    } catch {
      // Ignore — the agent continues without an answer
    }
    setPendingQuestion(null);
    setSelectedOptions(new Map());
    setCustomInputs(new Map());
  };

  // ── Send a text message ───────────────────────────────────────────────────

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
        opencodeUrl,
        (event) => handleSSEEvent(event, sid),
        abortController.signal,
      );

      let promptText = text;
      if (isFirstMessageRef.current) {
        if (buildContextPreamble) {
          promptText = buildContextPreamble() + text;
        }
        isFirstMessageRef.current = false;
      }

      await sendPromptAsync(
        opencodeUrl,
        sessionId,
        promptText,
        agentName,
        model,
      );

      // Safety timeout — abort if the session never fires session.idle
      setTimeout(() => {
        if (
          sseAbortRef.current === abortController &&
          !abortController.signal.aborted
        ) {
          abortController.abort();
          setSending(false);
        }
      }, TIMEOUT_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setSending(false);
      sseAbortRef.current?.abort();
    }
  };

  // ── Keyboard shortcut: Enter to send ─────────────────────────────────────

  const handleKeyDown = (e: {
    key: string;
    shiftKey: boolean;
    preventDefault: () => void;
  }) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return {
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
    retryConnection: initChat,
    messagesEndRef,
    inputRef,
  };
}

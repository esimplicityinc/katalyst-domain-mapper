import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, AlertCircle, RefreshCw } from 'lucide-react';
import {
  createDDDSession,
  sendPrompt,
  listMessages,
  isOpencodeHealthy,
} from '../../api/opencode-client';
import type { DomainModelFull } from '../../types/domain';

interface DDDChatProps {
  model: DomainModelFull;
  onModelUpdated: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function DDDChat({ model }: DDDChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check OpenCode health and create session on mount
  useEffect(() => {
    initChat();
  }, [model.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initChat = async () => {
    setError(null);
    try {
      const healthy = await isOpencodeHealthy();
      setConnected(healthy);
      if (!healthy) return;

      const session = await createDDDSession(`Domain Mapping: ${model.name}`);
      if (session) {
        setSessionId(session.id);

        // Send initial context as a no-reply message to prime the agent
        const contextPrompt = `You are helping map the domain model "${model.name}"${model.description ? ` - ${model.description}` : ''}. 

Current state:
- Bounded Contexts: ${model.boundedContexts.length} (${model.boundedContexts.map((c) => c.title).join(', ') || 'none yet'})
- Aggregates: ${model.aggregates.length}
- Domain Events: ${model.domainEvents.length}
- Glossary Terms: ${model.glossaryTerms.length}

Help the user discover and refine their domain model. Ask questions to understand the business domain, identify bounded contexts, find aggregates, and build a ubiquitous language. Output structured artifacts when you have enough information.`;

        await sendPrompt(session.id, contextPrompt, 'ddd-domain-mapper');

        // Load messages from the session
        await loadMessages(session.id);
      }
    } catch (err) {
      console.error('Failed to init chat:', err);
      setError('Failed to connect to AI agent');
      setConnected(false);
    }
  };

  const loadMessages = async (sid: string) => {
    try {
      const data = await listMessages(sid);
      if (data && Array.isArray(data)) {
        const chatMsgs: ChatMessage[] = [];
        for (const msg of data) {
          const info = msg.info;
          // Skip the initial context priming message
          if (info.role === 'user' && chatMsgs.length === 0) continue;

          const textParts = (msg.parts || [])
            .filter((p: any) => p.type === 'text')
            .map((p: any) => p.text || p.content || '')
            .join('\n');

          if (textParts.trim()) {
            const created = (info as any).time?.created;
            chatMsgs.push({
              id: info.id,
              role: info.role as 'user' | 'assistant',
              content: textParts,
              timestamp: created ? new Date(created) : new Date(),
            });
          }
        }
        setMessages(chatMsgs);
      }
    } catch {
      // Ignore load errors
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !sessionId || sending) return;

    setInput('');
    setError(null);
    setSending(true);

    // Optimistic: add user message immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await sendPrompt(sessionId, text, 'ddd-domain-mapper');

      // Extract text from response parts
      if (response) {
        const parts = (response as any).parts || [];
        const assistantText = parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text || p.content || '')
          .join('\n');

        if (assistantText.trim()) {
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: assistantText,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Not connected state
  if (connected === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          AI Agent Not Available
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-4">
          The OpenCode server is not reachable. Make sure it's running with{' '}
          <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            opencode serve
          </code>{' '}
          or via Docker Compose.
        </p>
        <button
          onClick={initChat}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  // Loading state
  if (connected === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !sending && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Domain Discovery Chat
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Start a conversation to explore your domain. Ask about bounded contexts,
              aggregates, domain events, or paste code for analysis.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                'What bounded contexts exist in this system?',
                'Help me identify the core domain',
                'What are the key domain events?',
                'Build a ubiquitous language glossary',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
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
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-lg px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
            placeholder="Ask about your domain..."
            rows={1}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            style={{ minHeight: '42px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex items-center justify-center w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors flex-shrink-0"
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

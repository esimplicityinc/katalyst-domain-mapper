/**
 * ContributionPanel — Slide-over panel with Queue and AI Chat tabs.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Inbox,
  Loader2,
  Check,
  XCircle,
  AlertCircle,
  Search,
  MessageSquare,
  Send,
  Bot,
  User,
} from 'lucide-react';
import {
  Button,
  Input,
} from '@databricks/appkit-ui/react';
import { api } from '../api/client';
import type { ContributionItem } from '../types/domain';

type PanelTab = 'queue' | 'chat';
type QueueTab = 'pending' | 'drafts' | 'accepted' | 'all';

const QUEUE_TABS: { key: QueueTab; label: string; statusFilter?: string }[] = [
  { key: 'pending', label: 'Pending', statusFilter: 'proposed' },
  { key: 'drafts', label: 'Drafts', statusFilter: 'draft' },
  { key: 'accepted', label: 'Accepted', statusFilter: 'accepted' },
  { key: 'all', label: 'All' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  proposed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  deprecated: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

interface ContributionPanelProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 'queue' | 'chat';
}

// ── Chat message type ─────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ContributionPanel({ open, onClose, initialTab = 'queue' }: ContributionPanelProps) {
  const [panelTab, setPanelTab] = useState<PanelTab>(initialTab);

  // Sync with initialTab when it changes from parent
  useEffect(() => {
    if (open) setPanelTab(initialTab);
  }, [initialTab, open]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-border shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {panelTab === 'chat' ? (
            <MessageSquare className="w-5 h-5 text-primary" />
          ) : (
            <Inbox className="w-5 h-5 text-primary" />
          )}
          <h2 className="text-base font-semibold text-foreground flex-1">
            {panelTab === 'chat' ? 'AI Chat' : 'Contributions'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel tab switcher */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setPanelTab('queue')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              panelTab === 'queue'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            Queue
          </button>
          <button
            onClick={() => setPanelTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              panelTab === 'chat'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI Chat
          </button>
        </div>

        {/* Tab content */}
        {panelTab === 'queue' ? (
          <QueueContent />
        ) : (
          <ChatContent />
        )}
      </div>
    </>
  );
}

// ── Queue Content ─────────────────────────────────────────────────────────

function QueueContent() {
  const [activeTab, setActiveTab] = useState<QueueTab>('pending');
  const [items, setItems] = useState<ContributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const currentTab = QUEUE_TABS.find((t) => t.key === activeTab) ?? QUEUE_TABS[0];

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { limit: 50 };
      if (currentTab.statusFilter) params.status = currentTab.statusFilter;
      if (search.trim()) params.search = search.trim();
      const result = await api.contributions.list(params as never);
      setItems(result.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contributions');
    } finally {
      setLoading(false);
    }
  }, [currentTab.statusFilter, search]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAccept = async (item: ContributionItem) => {
    setActionLoading(item._id);
    try {
      await api.contributions.accept(item.itemType, item._id);
      loadItems();
    } catch (err) {
      console.error('Failed to accept:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (item: ContributionItem) => {
    const feedback = prompt('Rejection feedback (optional):');
    if (feedback === null) return;
    setActionLoading(item._id);
    try {
      await api.contributions.reject(item.itemType, item._id, feedback);
      loadItems();
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      {/* Sub-tabs */}
      <div className="flex border-b border-border px-4">
        {QUEUE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contributions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={loadItems}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No contributions found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => {
              const status = item.contribution?.status ?? 'draft';
              const isLoading = actionLoading === item._id;
              return (
                <div key={item._id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-muted text-muted-foreground">
                          {item.itemType}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS.draft}`}>
                          {status}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-foreground mt-1 truncate">{item.title}</h4>
                    </div>
                    {status === 'proposed' && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => handleAccept(item)} disabled={isLoading}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors" title="Accept">
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleReject(item)} disabled={isLoading}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ── Chat Content ──────────────────────────────────────────────────────────

function ChatContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check OpenCode health and create session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/opencode/global/health');
        if (!res.ok) { setConnected(false); return; }
        if (cancelled) return;
        setConnected(true);

        // Create a session
        const sessRes = await fetch('/opencode/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
        if (sessRes.ok) {
          const data = await sessRes.json();
          if (!cancelled) setSessionId(data.id);
        } else {
          const errData = await sessRes.json().catch(() => ({}));
          console.error('[chat] Session creation failed:', errData);
          if (!cancelled) setConnected(false);
        }
      } catch {
        if (!cancelled) setConnected(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !sessionId || sending) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      // Send to OpenCode
      const res = await fetch(`/opencode/session/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parts: [{ type: 'text', text }],
          providerID: 'databricks',
          modelID: 'databricks-claude-sonnet-4-6',
        }),
      });

      if (res.ok) {
        // Poll for the response (SSE would be better but this works)
        const data = await res.json();
        const assistantText = data?.parts
          ?.filter((p: { type: string; text?: string }) => p.type === 'text' && p.text)
          .map((p: { text: string }) => p.text)
          .join('\n') ?? 'No response';

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assistantText,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errData = await res.json().catch(() => ({}));
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error: ${(errData as Record<string, string>).error ?? res.statusText}`,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to send message'}`,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (connected === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (connected === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
        <AlertCircle className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          AI Chat is not available. The OpenCode server is not running.
        </p>
        <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Katalyst AI Assistant</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ask me to create domain models, review contributions, or explain DDD patterns.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-lg px-3 py-2">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask the AI assistant..."
            rows={1}
            className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Shift+Enter for new line. Powered by OpenCode.
        </p>
      </div>
    </div>
  );
}

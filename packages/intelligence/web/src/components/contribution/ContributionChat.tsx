// ── Contribution Chat ──────────────────────────────────────────────────────
// AI chat tab inside the contribution panel. Wraps OpenCodeChat with
// contribution-specific configuration and a 3-section dynamic context preamble
// that is prepended to every user message.

import { useState, useCallback } from "react";
import { OpenCodeChat } from "@katalyst/chat";
import { RotateCcw, X, Hexagon } from "lucide-react";
import { usePageContext } from "./PageContextProvider";
import {
  buildContributionPreamble,
  type ItemContext,
} from "./preamble-builder";
import type { ContributionCounts } from "../../types/contribution";
import type { FocusedContextData } from "./ContributionProvider";
import { getChatSuggestions } from "./ChatSuggestions";

interface ContributionChatProps {
  /** Contribution queue badge counts */
  queueCounts: ContributionCounts;
  /** Currently focused contribution item (from queue drill-in) */
  focusedItem?: ItemContext | null;
  /** Called when the AI creates or modifies items (triggers queue refresh) */
  onContributionChanged: () => void;
  /** Bounded context attached as conversation context from a card click */
  focusedContext?: FocusedContextData;
  /** Clear the focused context card */
  onDismissFocusedContext?: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

// ── Subdomain badge styles (matches SubdomainBadge component) ──────────────

const SUBDOMAIN_STYLES: Record<string, string> = {
  core: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  supporting:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  generic: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

function subdomainBadgeClass(type: string | null): string {
  return type ? (SUBDOMAIN_STYLES[type] ?? SUBDOMAIN_STYLES.generic) : "";
}

// ── Component ──────────────────────────────────────────────────────────────

export function ContributionChat({
  queueCounts,
  focusedItem = null,
  onContributionChanged: _onContributionChanged,
  focusedContext,
  onDismissFocusedContext,
}: ContributionChatProps) {
  const pageContext = usePageContext();
  const [reinitTrigger, setReinitTrigger] = useState(0);

  // The preamble builder closes over the latest React state via useCallback.
  // Called on every message send (not just the first) thanks to plan04 hook change.
  const buildPreamble = useCallback(() => {
    const apiBase = API_BASE || "http://localhost:8090";
    return buildContributionPreamble(
      { contributionCounts: queueCounts, apiBase },
      pageContext,
      focusedItem,
    );
  }, [queueCounts, pageContext, focusedItem]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat header with "New Conversation" button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          AI Assistant
        </span>
        <button
          onClick={() => setReinitTrigger((t) => t + 1)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Start new conversation"
        >
          <RotateCcw className="w-3 h-3" />
          New
        </button>
      </div>

      {/* Focused bounded context card */}
      {focusedContext && (
        <div className="mx-3 mt-3 mb-1 flex-shrink-0">
          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <Hexagon className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {focusedContext.title}
                </span>
                {focusedContext.subdomainType && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${subdomainBadgeClass(focusedContext.subdomainType)}`}
                  >
                    {focusedContext.subdomainType.charAt(0).toUpperCase() +
                      focusedContext.subdomainType.slice(1)}
                  </span>
                )}
              </div>
              {focusedContext.responsibility && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                  {focusedContext.responsibility}
                </p>
              )}
            </div>
            {onDismissFocusedContext && (
              <button
                onClick={onDismissFocusedContext}
                className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                aria-label="Dismiss context"
                title="Remove context"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* The chat */}
      <div className="flex-1 min-h-0">
        <OpenCodeChat
          agentName="contribution-assistant"
          model={{
            providerID: "amazon-bedrock",
            modelID: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
          }}
          accentColor="blue"
          title="Contribution Assistant"
          subtitle="Create, review, and manage items with AI. All new items go through the contribution lifecycle for human review."
          opencodeUrl="/opencode"
          sessionTitle="Contribution Assistant"
          reinitTrigger={reinitTrigger}
          buildContextPreamble={buildPreamble}
          suggestions={getChatSuggestions(pageContext.currentPage)}
          inputPlaceholder="Ask me to create items, review contributions, or manage the queue..."
          className="h-full"
        />
      </div>
    </div>
  );
}

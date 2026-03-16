// ── Contribution Chat ──────────────────────────────────────────────────────
// AI chat tab inside the contribution panel. Wraps OpenCodeChat with
// contribution-specific configuration and a 3-section dynamic context preamble
// that is prepended to every user message.

import { useState, useCallback } from "react";
import { OpenCodeChat } from "@katalyst/chat";
import { RotateCcw } from "lucide-react";
import { usePageContext } from "./PageContextProvider";
import {
  buildContributionPreamble,
  type ItemContext,
} from "./preamble-builder";
import type { ContributionCounts } from "../../types/contribution";
import { getChatSuggestions } from "./ChatSuggestions";

interface ContributionChatProps {
  /** Contribution queue badge counts */
  queueCounts: ContributionCounts;
  /** Currently focused contribution item (from queue drill-in) */
  focusedItem?: ItemContext | null;
  /** Called when the AI creates or modifies items (triggers queue refresh) */
  onContributionChanged: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

// ── Component ──────────────────────────────────────────────────────────────

export function ContributionChat({
  queueCounts,
  focusedItem = null,
  onContributionChanged: _onContributionChanged,
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

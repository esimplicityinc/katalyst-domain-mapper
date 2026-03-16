// ── Chat Suggestions ───────────────────────────────────────────────────────
// Context-aware starter suggestions for the ContributionChat, keyed by
// the current page the user is viewing.

import type { PageContext } from "./PageContextProvider";

const COMMON_SUGGESTIONS = [
  "What's pending review?",
  "Show rejected items",
];

const PAGE_SUGGESTIONS: Record<PageContext["currentPage"], string[]> = {
  "business-domain": [
    "Discover bounded contexts for this domain",
    "Add aggregates for a bounded context",
    "Review pending domain items",
  ],
  "architecture": [
    "Map system capabilities",
    "Suggest taxonomy structure",
    "Review proposed capabilities",
  ],
  "user-types": [
    "Identify user types",
    "Write user stories",
    "Review pending stories",
  ],
  "governance": [
    "Summarize the contribution queue",
    "What needs my review?",
    "Bulk accept approved items",
  ],
  "foe-projects": [
    "What needs my review?",
    "Create a new capability",
  ],
  "business-landscape": [
    "Help me explore this landscape",
    "What needs my review?",
  ],
  unknown: [
    "Create a new item",
    "What needs my review?",
  ],
};

/**
 * Returns context-aware suggestion chips for the AI chat based on the
 * current page the user is viewing.
 */
export function getChatSuggestions(currentPage: PageContext["currentPage"]): string[] {
  const pageSuggestions = PAGE_SUGGESTIONS[currentPage] ?? PAGE_SUGGESTIONS.unknown;
  return [...pageSuggestions, ...COMMON_SUGGESTIONS];
}

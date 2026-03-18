// ── Page Context Provider ──────────────────────────────────────────────────
// Lightweight shared context that each page writes to when it loads data.
// The ContributionChat reads this to build dynamic AI context preambles.

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────────────────────────

/** Lightweight summary of a bounded context for preamble injection */
export interface BoundedContextSummary {
  id: string;
  title: string;
  subdomainType: string | null;
}

/** Extended bounded context data for focused-context chat preamble */
export interface FocusedBoundedContextSummary extends BoundedContextSummary {
  responsibility: string;
  description?: string;
}

/** Lightweight summary of a user type for preamble injection */
export interface UserTypeSummary {
  id: string;
  name: string;
  archetype: string;
  status: string;
}

/** Lightweight summary of a top-level taxonomy node for preamble injection */
export interface TaxonomyNodeSummary {
  name: string;
  nodeType: string;
}

export interface PageContext {
  /** Which section the user is currently viewing */
  currentPage:
    | "business-domain"
    | "architecture"
    | "user-types"
    | "governance"
    | "foe-projects"
    | "business-landscape"
    | "unknown";

  // ── Business Domain (DDD) ──────────────────────────────────────────────
  /** Domain model ID if on the domain mapper page */
  domainModelId?: string;
  /** Domain model name */
  domainModelName?: string;
  /** Domain model description */
  domainModelDescription?: string;
  /** Bounded context list for preamble */
  boundedContexts?: BoundedContextSummary[];
  /** Summary counts */
  boundedContextCount?: number;
  aggregateCount?: number;
  domainEventCount?: number;
  glossaryTermCount?: number;
  workflowCount?: number;
  /** A specific bounded context the user wants to discuss in the AI chat */
  focusedBoundedContext?: FocusedBoundedContextSummary;

  // ── Architecture (Taxonomy) ────────────────────────────────────────────
  /** Taxonomy snapshot ID if on the architecture page */
  snapshotId?: string;
  nodeCount?: number;
  capabilityCount?: number;
  /** Top-level taxonomy nodes for preamble */
  topLevelNodes?: TaxonomyNodeSummary[];

  // ── User Types & Stories ───────────────────────────────────────────────
  userTypeCount?: number;
  userStoryCount?: number;
  /** User type list for preamble */
  userTypes?: UserTypeSummary[];

  // ── Governance ─────────────────────────────────────────────────────────
  roadItemCount?: number;
  roadsByStatus?: Record<string, number>;
}

interface PageContextValue {
  pageContext: PageContext;
  setPageContext: (update: Partial<PageContext>) => void;
}

const DEFAULT_PAGE_CONTEXT: PageContext = {
  currentPage: "unknown",
};

const PageContextCtx = createContext<PageContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

interface PageContextProviderProps {
  children: ReactNode;
}

export function PageContextProvider({ children }: PageContextProviderProps) {
  const [pageContext, setPageContextState] = useState<PageContext>(DEFAULT_PAGE_CONTEXT);

  const setPageContext = useCallback((update: Partial<PageContext>) => {
    setPageContextState((prev) => ({ ...prev, ...update }));
  }, []);

  return (
    <PageContextCtx.Provider value={{ pageContext, setPageContext }}>
      {children}
    </PageContextCtx.Provider>
  );
}

// ── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Read the current page context (used by ContributionChat).
 */
export function usePageContext(): PageContext {
  const ctx = useContext(PageContextCtx);
  if (!ctx) {
    throw new Error("usePageContext must be used within a PageContextProvider");
  }
  return ctx.pageContext;
}

/**
 * Write to the page context (used by each page to publish its state).
 */
export function usePageContextWriter() {
  const ctx = useContext(PageContextCtx);
  if (!ctx) {
    throw new Error(
      "usePageContextWriter must be used within a PageContextProvider",
    );
  }
  return { setPageContext: ctx.setPageContext };
}

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { api } from "../../api/client";
import type { ContributionCounts, ContributableItemType } from "../../types/contribution";
import { ContributionPanel } from "./ContributionPanel";

type TabKey = "drafts" | "pending" | "rejected" | "accepted" | "all";

export interface ContributionOpenOptions {
  tab?: TabKey;
  itemId?: string;
  /** Pre-filter the queue to show only items of this type */
  itemType?: ContributableItemType;
}

interface ContributionContextValue {
  /** Whether the slide-out panel is open */
  isOpen: boolean;
  /** Open the panel, optionally targeting a specific tab, item, or type filter */
  open: (options?: ContributionOpenOptions) => void;
  /** Close the panel */
  close: () => void;

  /** Badge counts (fetched on interval) */
  counts: ContributionCounts;
  /** Force a refresh of counts */
  refreshCounts: () => Promise<void>;

  /** Increments on any AI or human contribution action (triggers re-renders) */
  lastChangeTimestamp: number;
  /** Notify that a contribution changed (call after AI create, transition, etc.) */
  notifyChange: () => void;
  /** Subscribe to contribution changes; returns an unsubscribe function */
  subscribe: (callback: () => void) => () => void;
}

const DEFAULT_COUNTS: ContributionCounts = {
  myDrafts: 0,
  pendingReview: 0,
  rejected: 0,
};

const ContributionContext = createContext<ContributionContextValue | null>(null);

const POLL_INTERVAL_MS = 30_000; // 30 seconds

interface ContributionProviderProps {
  children: ReactNode;
}

export function ContributionProvider({ children }: ContributionProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState<ContributionCounts>(DEFAULT_COUNTS);
  const [initialTab, setInitialTab] = useState<TabKey | undefined>();
  const [initialItemId, setInitialItemId] = useState<string | undefined>();
  const [initialItemType, setInitialItemType] = useState<ContributableItemType | undefined>();
  const [lastChangeTimestamp, setLastChangeTimestamp] = useState(Date.now());

  // Subscriber list for change notifications
  const subscribersRef = useRef<Set<() => void>>(new Set());

  const refreshCounts = useCallback(async () => {
    try {
      const result = await api.contributions.counts();
      setCounts(result);
    } catch {
      // Silently fail -- show cached / default counts
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    refreshCounts();
    const interval = setInterval(refreshCounts, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshCounts]);

  const notifyChange = useCallback(() => {
    setLastChangeTimestamp(Date.now());
    refreshCounts();
    // Notify all subscribers
    for (const cb of subscribersRef.current) {
      try {
        cb();
      } catch {
        // Don't let one bad subscriber break others
      }
    }
  }, [refreshCounts]);

  const subscribe = useCallback((callback: () => void): (() => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  const open = useCallback(
    (options?: ContributionOpenOptions) => {
      setInitialTab(options?.tab);
      setInitialItemId(options?.itemId);
      setInitialItemType(options?.itemType);
      setIsOpen(true);
    },
    [],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    // Refresh counts when panel closes (user may have changed things)
    refreshCounts();
  }, [refreshCounts]);

  const value: ContributionContextValue = {
    isOpen,
    open,
    close,
    counts,
    refreshCounts,
    lastChangeTimestamp,
    notifyChange,
    subscribe,
  };

  return (
    <ContributionContext.Provider value={value}>
      {children}
      <ContributionPanel
        open={isOpen}
        onClose={close}
        initialTab={initialTab}
        initialItemId={initialItemId}
        initialItemType={initialItemType}
      />
    </ContributionContext.Provider>
  );
}

/**
 * Hook to access contribution panel state and badge counts.
 * Must be used inside a `<ContributionProvider>`.
 */
export function useContribution(): ContributionContextValue {
  const ctx = useContext(ContributionContext);
  if (!ctx) {
    throw new Error(
      "useContribution must be used within a ContributionProvider",
    );
  }
  return ctx;
}

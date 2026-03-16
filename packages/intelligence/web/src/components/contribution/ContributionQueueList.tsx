import { useState, useCallback, useEffect } from "react";
import { Search, AlertCircle, Inbox } from "lucide-react";
import { api } from "../../api/client";
import type {
  ContributionStatus,
  ContributionAction,
  ContributionItem,
  ContributableItemType,
} from "../../types/contribution";
import { ITEM_TYPE_LABELS } from "../../types/contribution";
import { ContributionQueueItem } from "./ContributionQueueItem";

type TabKey = "drafts" | "pending" | "rejected" | "accepted" | "all";

interface Tab {
  key: TabKey;
  label: string;
  statusFilter?: ContributionStatus;
}

const TABS: Tab[] = [
  { key: "drafts", label: "My Drafts", statusFilter: "draft" },
  { key: "pending", label: "Pending Review", statusFilter: "proposed" },
  { key: "rejected", label: "Rejected", statusFilter: "rejected" },
  { key: "accepted", label: "Accepted", statusFilter: "accepted" },
  { key: "all", label: "All" },
];

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Types" },
  ...Object.entries(ITEM_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

interface ContributionQueueListProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onSelectItem: (item: ContributionItem) => void;
  refreshKey: number;
  /** Pre-set the type filter dropdown when the panel opens */
  initialTypeFilter?: ContributableItemType;
}

export function ContributionQueueList({
  activeTab,
  onTabChange,
  onSelectItem,
  refreshKey,
  initialTypeFilter,
}: ContributionQueueListProps) {
  const [items, setItems] = useState<ContributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>(initialTypeFilter ?? "");
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Sync external type filter when the panel reopens with a new filter
  useEffect(() => {
    setTypeFilter(initialTypeFilter ?? "");
  }, [initialTypeFilter]);

  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (currentTab.statusFilter) params.status = currentTab.statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (searchQuery) params.search = searchQuery;
      params.limit = "50";

      const result = await api.contributions.list(params as never);
      setItems(result.items ?? []);
      setCounts(result.counts ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contributions");
    } finally {
      setLoading(false);
    }
  }, [currentTab.statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshKey]);

  const handleTransition = async (
    itemType: string,
    itemId: string,
    action: ContributionAction,
    feedback?: string,
  ) => {
    try {
      const method = api.contributions[action as keyof typeof api.contributions];
      if (typeof method === "function") {
        if (action === "reject" && feedback) {
          await api.contributions.reject(itemType, itemId, feedback);
        } else {
          await (method as (type: string, id: string) => Promise<unknown>)(
            itemType,
            itemId,
          );
        }
      }
      await loadItems();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Transition failed",
      );
    }
  };

  const getTabCount = (tab: Tab): number | null => {
    if (!tab.statusFilter) return null;
    return counts[tab.statusFilter] ?? 0;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto flex-shrink-0">
        {TABS.map((tab) => {
          const count = getTabCount(tab);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {tab.label}
              {count !== null && count > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search + type filter */}
      <div className="px-4 pb-3 space-y-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          aria-label="Filter by type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button
            onClick={loadItems}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Item list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {loading ? (
          // Skeleton cards
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse"
            >
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeTab === "drafts" &&
                "No drafts. Create a new item from any page to start contributing."}
              {activeTab === "pending" &&
                "No items pending review. All caught up!"}
              {activeTab === "rejected" &&
                "No rejected items. Your submissions are looking great."}
              {activeTab === "accepted" && "No recently accepted items."}
              {activeTab === "all" && "No contribution items found."}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <ContributionQueueItem
              key={`${item.itemType}-${item.itemId}`}
              item={item as never}
              onSelect={() => onSelectItem(item)}
              onTransition={handleTransition}
            />
          ))
        )}
      </div>
    </div>
  );
}

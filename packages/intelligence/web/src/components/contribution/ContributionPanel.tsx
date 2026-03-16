import { useState, useEffect, useCallback } from "react";
import { X, MessageSquare, ListTodo } from "lucide-react";
import type { ContributionItem, ContributableItemType } from "../../types/contribution";
import { ContributionQueueList } from "./ContributionQueueList";
import { ContributionDetail } from "./ContributionDetail";
import { ContributionChat } from "./ContributionChat";
import { useContribution } from "./ContributionProvider";

type PanelMode = "queue" | "chat";
type QueueView = "list" | "detail";
type TabKey = "drafts" | "pending" | "rejected" | "accepted" | "all";

interface ContributionPanelProps {
  open: boolean;
  onClose: () => void;
  initialTab?: TabKey;
  initialItemId?: string;
  /** Pre-filter the queue to only show items of this type */
  initialItemType?: ContributableItemType;
}

export function ContributionPanel({
  open,
  onClose,
  initialTab,
  initialItemId: _initialItemId,
  initialItemType,
}: ContributionPanelProps) {
  const [mode, setMode] = useState<PanelMode>("queue");
  const [queueView, setQueueView] = useState<QueueView>("list");
  const [selectedItem, setSelectedItem] = useState<ContributionItem | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? "pending");
  const [refreshKey, setRefreshKey] = useState(0);
  const { counts, notifyChange } = useContribution();

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (queueView === "detail" && mode === "queue") {
          setQueueView("list");
          setSelectedItem(null);
        } else {
          onClose();
        }
      }
      if (e.key === "Backspace" && queueView === "detail" && mode === "queue") {
        // Only if not in an input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          setQueueView("list");
          setSelectedItem(null);
        }
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, queueView, mode, onClose]);

  // Reset view when panel opens
  useEffect(() => {
    if (open) {
      setQueueView("list");
      setSelectedItem(null);
      if (initialTab) setActiveTab(initialTab);
    }
  }, [open, initialTab, initialItemType]);

  const handleSelectItem = useCallback((item: ContributionItem) => {
    setSelectedItem(item);
    setQueueView("detail");
  }, []);

  const handleBack = useCallback(() => {
    setQueueView("list");
    setSelectedItem(null);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setQueueView("list");
    setSelectedItem(null);
    notifyChange();
  }, [notifyChange]);

  if (!open) return null;

  const totalPendingCount = counts.myDrafts + counts.pendingReview + counts.rejected;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:bg-transparent md:dark:bg-transparent"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Contributions panel"
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl flex flex-col transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Contributions
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close contributions panel"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tab bar */}
        <div role="tablist" className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            role="tab"
            aria-selected={mode === "queue"}
            onClick={() => setMode("queue")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === "queue"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Queue
            {totalPendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {totalPendingCount}
              </span>
            )}
          </button>
          <button
            role="tab"
            aria-selected={mode === "chat"}
            onClick={() => setMode("chat")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === "chat"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {mode === "queue" ? (
            queueView === "list" ? (
              <ContributionQueueList
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSelectItem={handleSelectItem}
                refreshKey={refreshKey}
                initialTypeFilter={initialItemType}
              />
            ) : selectedItem ? (
              <ContributionDetail
                item={selectedItem}
                onBack={handleBack}
                onTransitionComplete={handleTransitionComplete}
              />
            ) : null
          ) : (
            <ContributionChat
              queueCounts={counts}
              onContributionChanged={notifyChange}
            />
          )}
        </div>
      </div>
    </>
  );
}

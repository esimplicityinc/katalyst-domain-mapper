import { ChevronRight } from "lucide-react";
import type { ContributionStatus, ContributionAction, ContributableItemType } from "../../types/contribution";
import { ITEM_TYPE_LABELS } from "../../types/contribution";
import { ContributionBadge } from "./ContributionBadge";
import { TransitionActions } from "./TransitionActions";

interface QueueItemData {
  itemType: ContributableItemType;
  itemId: string;
  title: string;
  contribution: {
    status: ContributionStatus;
    version: number;
    submittedBy: string | null;
    submittedAt: string | null;
    reviewFeedback: string | null;
    supersededBy: string | null;
    updatedAt: string;
  };
  metadata: Record<string, unknown>;
}

interface ContributionQueueItemProps {
  item: QueueItemData;
  onSelect: (item: QueueItemData) => void;
  onTransition: (
    itemType: string,
    itemId: string,
    action: ContributionAction,
    feedback?: string,
  ) => Promise<void>;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ContributionQueueItem({
  item,
  onSelect,
  onTransition,
}: ContributionQueueItemProps) {
  const category = item.metadata.category as string | undefined;

  return (
    <div
      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow cursor-pointer group"
      onClick={() => onSelect(item)}
    >
      {/* Header: ID + version */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
            {item.itemId}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            v{item.contribution.version}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-1">
        {item.title || item.itemId}
      </p>

      {/* Type + category */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {ITEM_TYPE_LABELS[item.itemType] ?? item.itemType}
        </span>
        {category && (
          <>
            <span className="text-gray-300 dark:text-gray-600">&middot;</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {category}
            </span>
          </>
        )}
      </div>

      {/* Status + time */}
      <div className="flex items-center gap-2 mb-2">
        <ContributionBadge
          status={item.contribution.status}
          size="sm"
        />
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {timeAgo(item.contribution.updatedAt)}
        </span>
        {item.contribution.submittedBy && (
          <>
            <span className="text-gray-300 dark:text-gray-600">&middot;</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              by {item.contribution.submittedBy}
            </span>
          </>
        )}
      </div>

      {/* Inline actions */}
      <div onClick={(e) => e.stopPropagation()}>
        <TransitionActions
          item={item}
          onTransition={async (action, feedback) => {
            await onTransition(item.itemType, item.itemId, action, feedback);
          }}
          layout="inline"
        />
      </div>
    </div>
  );
}

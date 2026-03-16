import { CheckCircle, Clock, XCircle, Pencil, Archive, GitBranch } from "lucide-react";
import type { ContributionStatus } from "../../types/contribution";
import { CONTRIBUTION_STATUS_LABELS } from "../../types/contribution";

interface TimelineEntry {
  version: number;
  status: ContributionStatus;
  createdAt: string;
  submittedBy: string | null;
  reviewedBy: string | null;
  reviewFeedback: string | null;
}

interface ContributionTimelineProps {
  itemId: string;
  versions: TimelineEntry[];
}

const STATUS_ICONS: Record<ContributionStatus, typeof CheckCircle> = {
  draft: Pencil,
  proposed: Clock,
  rejected: XCircle,
  accepted: CheckCircle,
  deprecated: Archive,
  superseded: GitBranch,
};

const STATUS_DOT_COLORS: Record<ContributionStatus, string> = {
  draft: "bg-gray-400 dark:bg-gray-500",
  proposed: "bg-blue-500 dark:bg-blue-400",
  rejected: "bg-red-500 dark:bg-red-400",
  accepted: "bg-green-500 dark:bg-green-400",
  deprecated: "bg-amber-500 dark:bg-amber-400",
  superseded: "bg-gray-400 dark:bg-gray-500",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ContributionTimeline({
  itemId: _itemId,
  versions,
}: ContributionTimelineProps) {
  if (versions.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No version history available.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {versions.map((entry, index) => {
        const Icon = STATUS_ICONS[entry.status];
        const dotColor = STATUS_DOT_COLORS[entry.status];
        const isLast = index === versions.length - 1;

        return (
          <div key={`${entry.version}-${entry.status}`} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full ${dotColor} ring-2 ring-white dark:ring-gray-800 flex-shrink-0`}
              />
              {!isLast && (
                <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 min-h-[24px]" />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  v{entry.version}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    entry.status === "accepted"
                      ? "text-green-700 dark:text-green-300"
                      : entry.status === "rejected"
                        ? "text-red-700 dark:text-red-300"
                        : entry.status === "proposed"
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {CONTRIBUTION_STATUS_LABELS[entry.status]}
                </span>
              </div>

              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                {entry.submittedBy && (
                  <p>submitted by {entry.submittedBy}</p>
                )}
                {entry.reviewedBy && (
                  <p>reviewed by {entry.reviewedBy}</p>
                )}
                <p>{formatDate(entry.createdAt)}</p>
              </div>

              {entry.reviewFeedback && (
                <div className="mt-1.5 p-2 text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400">
                  {entry.reviewFeedback}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
